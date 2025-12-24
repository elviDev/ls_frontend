"use client";

import React, { useState, useEffect } from "react";
import { RoomContext } from "@livekit/components-react";
import { Room } from "livekit-client";

interface LiveKitBroadcastProviderProps {
  children: React.ReactNode;
  roomName: string;
  userId: string;
  userName?: string;
  role?: "broadcaster" | "listener";
}

export function LiveKitBroadcastProvider({
  children,
  roomName,
  userId,
  userName,
  role = "listener",
}: LiveKitBroadcastProviderProps) {
  const [room] = useState(
    () =>
      new Room({
        adaptiveStream: true,
        dynacast: true,
      })
  );
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const fetchTokenAndConnect = async () => {
      try {
        const response = await fetch("/api/livekit/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            roomName,
            userName: userName || userId,
            role,
          }),
        });

        const data = await response.json();
        const serverUrl =
          process.env.NEXT_PUBLIC_LIVEKIT_SERVER_URL || "ws://localhost:7880";

        await room.connect(serverUrl, data.token);
        setConnected(true);
      } catch (error) {
        console.error("Failed to connect to LiveKit:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTokenAndConnect();

    return () => {
      room.disconnect();
    };
  }, [room, roomName, userId, userName, role]);

  if (loading) {
    return <div>Connecting to LiveKit...</div>;
  }

  if (!connected) {
    return <div>Failed to connect to LiveKit</div>;
  }

  return <RoomContext.Provider value={room}>{children}</RoomContext.Provider>;
}

// Simple hook for backward compatibility
export function useLiveKitBroadcast() {
  return {
    studio: {
      state: {
        isLive: false,
        listenerCount: 0,
      },
    },
  };
}
