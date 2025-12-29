"use client";

import React, { useEffect, useState } from "react";
import { RoomProvider } from "@/providers/global-livekit-provider";
import { StudioInterface } from "./studio-interface";
import { useAuthStore } from "@/stores/auth-store";

interface BroadcastStudioInterfaceProps {
  broadcastId: string;
  stationName: string;
}

export function BroadcastStudioInterface({
  broadcastId,
  stationName,
}: BroadcastStudioInterfaceProps) {
  const { user } = useAuthStore();
  const [hostUserId, setHostUserId] = useState<string>("");

  useEffect(() => {
    // Use authenticated user ID if available, otherwise create stable session ID
    if (user?.id) {
      setHostUserId(user.id);
    } else {
      // Create stable session ID stored in sessionStorage
      const sessionKey = `host-session-${broadcastId}`;
      let sessionId = sessionStorage.getItem(sessionKey);
      if (!sessionId) {
        sessionId = `host-${Date.now()}`;
        sessionStorage.setItem(sessionKey, sessionId);
      }
      setHostUserId(sessionId);
    }
  }, [user, broadcastId]);

  if (!hostUserId) {
    return <div>Loading...</div>;
  }

  console.log("🎙️ [Studio] Initializing broadcast studio:", {
    broadcastId,
    hostUserId,
    userName: user?.name || user?.email || stationName,
  });

  return (
    <RoomProvider
      broadcastId={broadcastId}
      userId={hostUserId}
      userName={user?.name || user?.email || stationName}
      role="broadcaster"
    >
      <StudioInterface broadcastId={broadcastId} stationName={stationName} />
    </RoomProvider>
  );
}
