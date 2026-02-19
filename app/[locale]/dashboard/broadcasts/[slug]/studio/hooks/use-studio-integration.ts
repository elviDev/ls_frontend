"use client";

import { useEffect, useCallback } from "react";
import { useLiveKitBroadcast } from "@/contexts/broadcast";
import { useChat } from "@/contexts/chat";
import { useBroadcastStore } from "@/stores/broadcast-store";
import { toast } from "sonner";
import type { Broadcast } from "../types";

interface ProgramInfo {
  title?: string;
  description?: string;
  currentTrack?: string;
  [key: string]: any;
}

export function useStudioIntegration(
  broadcast: Broadcast | null,
  isLive: boolean
) {
  const broadcastContext = useLiveKitBroadcast();
  const { state: chatState, joinBroadcast, setBroadcastLive } = useChat();
  const { setBroadcast, setLiveKit, updateBroadcastStatus } = useBroadcastStore();

  // Initialize studio when broadcast is available
  useEffect(() => {
    if (broadcast && broadcastContext) {
      console.log("🎙️ LiveKit studio ready for broadcast:", broadcast.id?.substring(0, 8) + "...");
    }
  }, [broadcast?.id, broadcastContext]);

  // Get live status from LiveKit
  const contextIsLive = broadcastContext?.studio?.state?.isLive;
  const isConnected = !!broadcastContext?.studio?.state;
  
  // Debug logging (throttled)
  useEffect(() => {
    if (!broadcast) return;
    
    const logInterval = setInterval(() => {
      console.log('🎯 LiveKit broadcast status:', {
        broadcastId: broadcast.id?.substring(0, 8) + "...",
        isLive: contextIsLive,
        isConnected,
        chatLive: chatState.isBroadcastLive
      });
    }, 60000); // Changed from 30000 to 60000 (60 seconds)
    
    return () => clearInterval(logInterval);
  }, [broadcast?.id, contextIsLive, isConnected, chatState.isBroadcastLive]);

  // Sync broadcast context streaming status with chat context AND database
  useEffect(() => {
    if (broadcast && contextIsLive !== undefined) {
      const currentChatLiveStatus = chatState.isBroadcastLive;

      if (currentChatLiveStatus !== contextIsLive) {
        console.log(
          "🔄 LiveKit: Syncing broadcast status with chat:",
          contextIsLive
        );
        
        // Update chat state
        setBroadcastLive(
          contextIsLive,
          contextIsLive
            ? {
                id: broadcast.id,
                title: broadcast.title,
                startTime: new Date(),
              }
            : undefined
        );
        
        // Update store and sync with database
        if (contextIsLive) {
          setBroadcast({ ...broadcast, status: 'LIVE' });
          setLiveKit({
            url: broadcastContext?.studio?.getStreamUrl(),
            token: undefined, // Token is managed by LiveKit internally
            roomName: broadcast.id
          });
        } else {
          setBroadcast({ ...broadcast, status: 'SCHEDULED' });
        }
        
        // Update status in database
        updateBroadcastStatus(broadcast.slug, contextIsLive ? 'LIVE' : 'READY');
      }
    }
  }, [
    contextIsLive,
    broadcast?.id,
    broadcast?.title,
    broadcast?.slug,
    chatState.isBroadcastLive,
    setBroadcastLive,
  ]);

  // Auto-manage chat when broadcast status changes
  useEffect(() => {
    if (broadcast && broadcast.hostUser && chatState.isConnected) {
      const actualIsLive = contextIsLive || isLive;

      if (actualIsLive) {
        if (
          !chatState.currentBroadcast ||
          chatState.currentBroadcast !== broadcast.id
        ) {
          console.log(
            "🎤 Broadcast went live - activating chat:",
            broadcast.id
          );
          joinBroadcast(broadcast.id, {
            id: broadcast.hostUser.id,
            username: `${broadcast.hostUser?.firstName || 'Host'} ${broadcast.hostUser?.lastName || ''}`.trim(),
            role: "host",
            isOnline: true,
            isTyping: false,
            lastSeen: new Date(),
            messageCount: 0,
          });

          toast.success("📻 Chat is now live for listeners!");
        }
      }
    }
  }, [
    isLive,
    contextIsLive,
    broadcast?.id,
    broadcast?.hostUser,
    chatState.isConnected,
    chatState.currentBroadcast,
    joinBroadcast,
  ]);

  const updateProgramInfo = useCallback(
    (newInfo: ProgramInfo) => {
      if ((contextIsLive || isLive) && broadcast) {
        console.log("📡 Program info updated:", newInfo.currentTrack || 'No track');
        toast.success("📡 Program info updated for listeners");
      }
    },
    [contextIsLive, isLive, broadcast]
  );

  return {
    broadcastContext,
    chatState,
    updateProgramInfo,
  };
}
