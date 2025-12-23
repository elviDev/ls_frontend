"use client";

import React, { createContext, useContext, useCallback, useRef, useState } from "react";
import { Room, RoomEvent, Track, RemoteTrack, LocalTrack, LocalTrackPublication, AudioTrack } from "livekit-client";
import { LiveKitRoom, useLocalParticipant, useRemoteParticipants, useRoomContext } from "@livekit/components-react";
import { BroadcastState, StudioUser, AudioChannel } from "./types";

interface LiveKitBroadcastContextType {
  studio: {
    state: BroadcastState;
    initializeStudio: (serverUrl: string, token: string) => Promise<void>;
    addUser: (user: StudioUser, audioStream?: MediaStream) => Promise<void>;
    removeUser: (userId: string) => void;
    updateChannel: (channelId: string, settings: Partial<AudioChannel>) => void;
    setMasterVolume: (volume: number) => void;
    startBroadcast: () => Promise<void>;
    stopBroadcast: () => void;
    getStreamUrl: () => string;
  };
}

const LiveKitBroadcastContext = createContext<LiveKitBroadcastContextType | null>(null);

export function useLiveKitBroadcast() {
  const context = useContext(LiveKitBroadcastContext);
  if (!context) {
    throw new Error("useLiveKitBroadcast must be used within a LiveKitBroadcastProvider");
  }
  return context;
}

interface LiveKitBroadcastProviderProps {
  children: React.ReactNode;
  serverUrl: string;
  token: string;
}

const initialBroadcastState: BroadcastState = {
  isLive: false,
  studioUsers: [],
  audioChannels: [],
  masterVolume: 80,
  listenerCount: 0,
  streamQuality: {
    bitrate: 128000,
    sampleRate: 48000,
    channels: 2,
  },
};

function LiveKitStudioManager({ children, onStateChange, setRoom }: { 
  children: React.ReactNode;
  onStateChange: (state: Partial<BroadcastState>) => void;
  setRoom: (room: Room | null) => void;
}) {
  const { localParticipant } = useLocalParticipant();
  const remoteParticipants = useRemoteParticipants();
  const room = useRoomContext();

  // Set room reference when available
  React.useEffect(() => {
    if (room) {
      setRoom(room);
    }
  }, [room, setRoom]);

  React.useEffect(() => {
    if (!room) return;

    const handleTrackSubscribed = (track: RemoteTrack) => {
      if (track.kind === Track.Kind.Audio) {
        onStateChange({ listenerCount: remoteParticipants.length });
      }
    };

    const handleParticipantConnected = () => {
      onStateChange({ listenerCount: remoteParticipants.length });
    };

    const handleParticipantDisconnected = () => {
      onStateChange({ listenerCount: remoteParticipants.length });
    };

    room.on(RoomEvent.TrackSubscribed, handleTrackSubscribed);
    room.on(RoomEvent.ParticipantConnected, handleParticipantConnected);
    room.on(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);

    return () => {
      room.off(RoomEvent.TrackSubscribed, handleTrackSubscribed);
      room.off(RoomEvent.ParticipantConnected, handleParticipantConnected);
      room.off(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);
    };
  }, [room, remoteParticipants.length, onStateChange]);

  return <>{children}</>;
}

export function LiveKitBroadcastProvider({ children, serverUrl, token }: LiveKitBroadcastProviderProps) {
  const [broadcastState, setBroadcastState] = useState(initialBroadcastState);
  const [isConnected, setIsConnected] = useState(false);
  const roomRef = useRef<Room | null>(null);
  const audioTracksRef = useRef<Map<string, LocalTrackPublication>>(new Map());

  const handleStateChange = useCallback((newState: Partial<BroadcastState>) => {
    setBroadcastState(prev => ({ ...prev, ...newState }));
  }, []);

  const initializeStudio = useCallback(async (serverUrl: string, token: string) => {
    // LiveKit room connection is handled by LiveKitRoom component
    setIsConnected(true);
  }, []);

  const addUser = useCallback(async (user: StudioUser, audioStream?: MediaStream) => {
    if (!roomRef.current || !audioStream) return;

    try {
      const audioTrackPublication = await roomRef.current.localParticipant.publishTrack(
        audioStream.getAudioTracks()[0],
        { name: `user-${user.id}` }
      );
      
      audioTracksRef.current.set(user.id, audioTrackPublication);
      
      setBroadcastState(prev => ({
        ...prev,
        studioUsers: [...prev.studioUsers.filter(u => u.id !== user.id), user],
      }));
    } catch (error) {
      console.error("Error adding user:", error);
      throw error;
    }
  }, []);

  const removeUser = useCallback((userId: string) => {
    const trackPublication = audioTracksRef.current.get(userId);
    if (trackPublication && roomRef.current) {
      roomRef.current.localParticipant.unpublishTrack(trackPublication.track!);
      audioTracksRef.current.delete(userId);
    }
    
    setBroadcastState(prev => ({
      ...prev,
      studioUsers: prev.studioUsers.filter(u => u.id !== userId)
    }));
  }, []);

  const updateChannel = useCallback((channelId: string, settings: Partial<AudioChannel>) => {
    setBroadcastState(prev => ({
      ...prev,
      audioChannels: prev.audioChannels.map(channel =>
        channel.id === channelId ? { ...channel, ...settings } : channel
      ),
    }));
  }, []);

  const setMasterVolume = useCallback((volume: number) => {
    setBroadcastState(prev => ({ ...prev, masterVolume: volume }));
  }, []);

  const startBroadcast = useCallback(async () => {
    if (!roomRef.current) throw new Error("Room not connected");
    
    setBroadcastState(prev => ({ ...prev, isLive: true }));
  }, []);

  const stopBroadcast = useCallback(() => {
    setBroadcastState(prev => ({ ...prev, isLive: false }));
  }, []);

  const getStreamUrl = useCallback(() => {
    return serverUrl; // LiveKit handles streaming URLs internally
  }, [serverUrl]);

  const contextValue: LiveKitBroadcastContextType = {
    studio: {
      state: broadcastState,
      initializeStudio,
      addUser,
      removeUser,
      updateChannel,
      setMasterVolume,
      startBroadcast,
      stopBroadcast,
      getStreamUrl,
    },
  };

  return (
    <LiveKitRoom
      serverUrl={serverUrl}
      token={token}
      connectOptions={{
        autoSubscribe: true,
      }}
      onConnected={() => {
        setIsConnected(true);
      }}
      onDisconnected={() => {
        setIsConnected(false);
        setBroadcastState(prev => ({ ...prev, isLive: false }));
      }}
    >
      <LiveKitBroadcastContext.Provider value={contextValue}>
        <LiveKitStudioManager onStateChange={handleStateChange} setRoom={(room) => { roomRef.current = room; }}>
          {children}
        </LiveKitStudioManager>
      </LiveKitBroadcastContext.Provider>
    </LiveKitRoom>
  );
}