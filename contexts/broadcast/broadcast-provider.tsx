"use client";

import React, { createContext, useContext, useCallback, useRef } from "react";
import { SRSStudio } from "./studio/srs-studio";
import {
  BroadcastState,
  StudioUser,
  AudioChannel,
} from "./types";

interface BroadcastContextType {
  // Studio (SRS) - for staff and guests
  studio: {
    state: BroadcastState;
    initializeStudio: (srsUrl: string, streamKey: string) => Promise<void>;
    addUser: (user: StudioUser, audioStream?: MediaStream) => Promise<void>;
    removeUser: (userId: string) => void;
    updateChannel: (channelId: string, settings: Partial<AudioChannel>) => void;
    setMasterVolume: (volume: number) => void;
    startBroadcast: () => Promise<void>;
    stopBroadcast: () => void;
    getStreamUrl: () => string;
  };
}

const BroadcastContext = createContext<BroadcastContextType | null>(null);

export function useBroadcast() {
  const context = useContext(BroadcastContext);
  if (!context) {
    throw new Error("useBroadcast must be used within a BroadcastProvider");
  }
  return context;
}

interface BroadcastProviderProps {
  children: React.ReactNode;
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

export function BroadcastProvider({ children }: BroadcastProviderProps) {
  const [broadcastState, setBroadcastState] = React.useState(
    initialBroadcastState
  );

  const studioRef = useRef<SRSStudio | null>(null);

  // Studio functions (SRS for reliable streaming)
  const initializeStudio = useCallback(
    async (srsUrl: string, streamKey: string) => {
      try {
        studioRef.current = new SRSStudio(srsUrl, streamKey, {
          onError: (error) => {
            console.error("SRS Studio Error:", error);
            setBroadcastState((prev) => ({ ...prev, isLive: false }));
          },
          onStateChange: (state) => {
            console.log("Studio state changed:", state);
          },
        });

        await studioRef.current.initialize();
      } catch (error) {
        if (studioRef.current) {
          studioRef.current.cleanup();
          studioRef.current = null;
        }
        throw error;
      }
    },
    []
  );

  const addUser = useCallback(
    async (user: StudioUser, audioStream?: MediaStream) => {
      try {
        if (!studioRef.current) {
          throw new Error("Studio not initialized");
        }

        await studioRef.current.addUser(user, audioStream);

        setBroadcastState((prev) => ({
          ...prev,
          studioUsers: [
            ...prev.studioUsers.filter((u) => u.id !== user.id),
            user,
          ],
        }));
      } catch (error) {
        throw error;
      }
    },
    []
  );

  const removeUser = useCallback((userId: string) => {
    try {
      if (studioRef.current) {
        studioRef.current.removeUser(userId);
      }
      
      setBroadcastState((prev) => ({
        ...prev,
        studioUsers: prev.studioUsers.filter((u) => u.id !== userId)
      }));
    } catch (error) {
      console.error("Error removing user:", error);
    }
  }, []);

  const updateChannel = useCallback(
    (channelId: string, settings: Partial<AudioChannel>) => {
      try {
        if (studioRef.current) {
          studioRef.current.updateChannelSettings(channelId, settings);
        }

        setBroadcastState((prev) => ({
          ...prev,
          audioChannels: prev.audioChannels.map((channel) =>
            channel.id === channelId ? { ...channel, ...settings } : channel
          ),
        }));
      } catch (error) {
        console.error("Error updating channel:", error);
      }
    },
    []
  );

  const setMasterVolume = useCallback((volume: number) => {
    try {
      if (studioRef.current) {
        studioRef.current.setMasterVolume(volume);
      }

      setBroadcastState((prev) => ({ ...prev, masterVolume: volume }));
    } catch (error) {
      console.error("Error setting master volume:", error);
    }
  }, []);

  const startBroadcast = useCallback(async () => {
    try {
      if (!studioRef.current) {
        throw new Error("Studio not initialized");
      }

      await studioRef.current.startStreaming();
      setBroadcastState((prev) => ({ ...prev, isLive: true }));
    } catch (error) {
      setBroadcastState((prev) => ({ ...prev, isLive: false }));
      throw error;
    }
  }, []);

  const stopBroadcast = useCallback(() => {
    try {
      if (studioRef.current) {
        studioRef.current.stopStreaming();
      }

      setBroadcastState((prev) => ({ ...prev, isLive: false }));
    } catch (error) {
      console.warn("Error stopping broadcast:", error);
    }
  }, []);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      try {
        if (studioRef.current) {
          studioRef.current.cleanup();
        }
      } catch (error) {
        console.warn("Error during cleanup:", error);
      }
    };
  }, []);

  const getStreamUrl = useCallback(() => {
    const urls = studioRef.current?.getStreamUrls();
    return urls?.hls || urls?.webrtc || "";
  }, []);

  const contextValue: BroadcastContextType = {
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
    <BroadcastContext.Provider value={contextValue}>
      {children}
    </BroadcastContext.Provider>
  );
}
