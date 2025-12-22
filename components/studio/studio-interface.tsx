"use client";

import { useState, useEffect } from "react";
import { useBroadcast } from "@/contexts/broadcast";
import { useAuth } from "@/contexts/auth-context";
import { StudioHeader } from "./components/studio-header";
import { AudioMixer } from "./components/audio-mixer";
import { StudioUsers } from "./components/studio-users";
import { StudioChat } from "./components/studio-chat";

interface StudioInterfaceProps {
  broadcastId: string;
  stationName: string;
}

export function StudioInterface({
  broadcastId,
  stationName,
}: StudioInterfaceProps) {
  const { user } = useAuth();
  const broadcast = useBroadcast();
  const [isLoading, setIsLoading] = useState(false);

  // Initialize studio when component mounts
  useEffect(() => {
    const initializeStudio = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        await broadcast.studio.initializeStudio(
          process.env.NEXT_PUBLIC_SRS_URL || "ws://localhost:1985",
          broadcastId
        );

        // Get user's microphone
        const audioStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

        // Add current user as host
        await broadcast.studio.addUser(
          {
            id: user.id,
            username: `${user.name}`,
            role: "host",
            permissions: {
              canControlMixer: true,
              canManageGuests: true,
              canPlayMedia: true,
              canModerateChat: true,
            },
            audioChannel: {
              id: "host-mic",
              name: "Host Mic",
              type: "master",
              volume: 85,
              isMuted: false,
              isActive: true,
              eq: { high: 2, mid: 0, low: -1 },
              effects: { compressor: true, reverb: 0, gate: false },
            },
            isConnected: true,
          },
          audioStream
        );
      } catch (error) {
        console.error("Failed to initialize studio:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeStudio();
  }, [broadcastId, user, broadcast.studio]);

  const handleStartBroadcast = async () => {
    setIsLoading(true);
    try {
      await broadcast.studio.startBroadcast();
    } catch (error) {
      console.error("Failed to start broadcast:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopBroadcast = () => {
    broadcast.studio.stopBroadcast();
  };

  const handleChannelVolumeChange = (channelId: string, volume: number) => {
    broadcast.studio.updateChannel(channelId, { volume });
  };

  const handleChannelMute = (channelId: string, muted: boolean) => {
    broadcast.studio.updateChannel(channelId, { isMuted: muted });
  };

  const handleMasterVolumeChange = (volume: number) => {
    broadcast.studio.setMasterVolume(volume);
  };

  const handleAddUser = async (user: any) => {
    try {
      await broadcast.studio.addUser(user);
    } catch (error) {
      console.error("Failed to add user:", error);
    }
  };

  const handleRemoveUser = (userId: string) => {
    broadcast.studio.removeUser(userId);
  };

  const handleToggleMute = (userId: string, muted: boolean) => {
    const channel = broadcast.studio.state.audioChannels.find(
      (ch) => ch.id === userId
    );
    if (channel) {
      broadcast.studio.updateChannel(userId, { isMuted: muted });
    }
  };

  if (!user) {
    return <div>Please log in to access the studio</div>;
  }

  // Convert broadcast state to component props
  const audioChannels = broadcast.studio.state.audioChannels.map((ch) => ({
    id: ch.id,
    name: ch.name,
    volume: ch.volume,
    isMuted: ch.isMuted,
    isActive: ch.isActive,
  }));

  const studioUsers = broadcast.studio.state.studioUsers.map((user) => ({
    id: user.id,
    username: user.username,
    role: user.role as "host" | "co-host" | "guest",
    isConnected: true,
    isMuted: user.audioChannel?.isMuted || false,
    audioLevel: 0, // TODO: Get actual audio level
  }));

  return (
    <div className="space-y-6 p-6">
      <StudioHeader
        stationName={stationName}
        broadcastId={broadcastId}
        isLive={broadcast.studio.state.isLive}
        listenerCount={broadcast.studio.state.listenerCount}
        onStartBroadcast={handleStartBroadcast}
        onStopBroadcast={handleStopBroadcast}
        isLoading={isLoading}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <AudioMixer
            channels={audioChannels}
            masterVolume={broadcast.studio.state.masterVolume}
            onChannelVolumeChange={handleChannelVolumeChange}
            onChannelMute={handleChannelMute}
            onMasterVolumeChange={handleMasterVolumeChange}
          />

          <StudioUsers
            users={studioUsers}
            onAddUser={handleAddUser}
            onRemoveUser={handleRemoveUser}
            onToggleMute={handleToggleMute}
          />
        </div>

        <StudioChat
          broadcastId={broadcastId}
          currentUser={{
            id: user.id,
            username: `${user.name}`,
            avatar: user.profilePicture || "/placeholder.jpg",
            role: user.role === "ADMIN" ? "admin" : "host",
          }}
          isLive={broadcast.studio.state.isLive}
        />
      </div>
    </div>
  );
}
