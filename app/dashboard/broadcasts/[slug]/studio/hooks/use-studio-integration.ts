"use client";

import { useEffect, useCallback } from "react";
import { useBroadcast } from "@/contexts/broadcast";
import { useChat } from "@/contexts/chat";
import { toast } from "sonner";
import type { Broadcast } from "../types";

export function useStudioIntegration(
  broadcast: Broadcast | null,
  isLive: boolean
) {
  const broadcastContext = useBroadcast();
  const { state: chatState, joinBroadcast, setBroadcastLive } = useChat();

  // Initialize studio when broadcast is available
  useEffect(() => {
    if (broadcast && broadcastContext) {
      const initStudio = async () => {
        try {
          const srsUrl = process.env.NEXT_PUBLIC_SRS_URL || "http://localhost:1985";
          const streamKey = broadcast.id;
          
          console.log("🎙️ Initializing studio with SRS URL:", srsUrl);
          console.log("🎙️ Using stream key:", streamKey);
          await broadcastContext.studio.initializeStudio(srsUrl, streamKey);
          console.log("✅ Studio initialized successfully for broadcast:", broadcast.id);
        } catch (error) {
          console.error("❌ Failed to initialize studio:", error);
          toast.error(
            "Failed to connect to streaming server. Please check your connection and try again."
          );
          throw error;
        }
      };
      initStudio();
    }
  }, [broadcast?.id, broadcastContext]);

  // Get live status safely and log for debugging
  const contextIsLive = broadcastContext?.studio?.state?.isLive;
  const isStreaming = broadcastContext?.studio?.state?.isLive;
  const isConnected = broadcastContext?.studio?.state ? true : false;
  
  // Debug logging (throttled)
  useEffect(() => {
    if (!broadcast) return;
    
    const logInterval = setInterval(() => {
      console.log('🎯 Studio broadcast status:', {
        broadcastId: broadcast.id,
        isStreaming,
        isConnected,
        chatLive: chatState.isBroadcastLive,
        isLive: contextIsLive
      });
    }, 60000); // Changed from 30000 to 60000 (60 seconds)
    
    return () => clearInterval(logInterval);
  }, [broadcast?.id, isStreaming, isConnected, chatState.isBroadcastLive, contextIsLive]);

  // Sync broadcast context streaming status with chat context AND database
  useEffect(() => {
    if (broadcast && contextIsLive !== undefined) {
      const currentChatLiveStatus = chatState.isBroadcastLive;

      if (currentChatLiveStatus !== contextIsLive) {
        console.log(
          "🔄 Studio: Syncing broadcast streaming status with chat:",
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
        
        // Update broadcast status in database
        const updateBroadcastStatus = async () => {
          try {
            const response = await fetch(`/api/admin/broadcasts/${broadcast.slug}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                status: contextIsLive ? 'LIVE' : 'READY'
              })
            });
            
            if (response.ok) {
              console.log('✅ Broadcast status updated to:', contextIsLive ? 'LIVE' : 'READY');
            } else {
              console.error('❌ Failed to update broadcast status');
            }
          } catch (error) {
            console.error('❌ Error updating broadcast status:', error);
          }
        };
        
        updateBroadcastStatus();
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
            username: `${broadcast.hostUser.firstName} ${broadcast.hostUser.lastName}`,
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
    (newInfo: any) => {
      if (isLive && broadcast) {
        const programInfo = {
          title: newInfo.title || broadcast.title,
          description: newInfo.description || broadcast.description,
          host: `${broadcast.hostUser.firstName} ${broadcast.hostUser.lastName}`,
          currentTrack: newInfo.currentTrack,
          ...newInfo,
        };
        toast.success("📡 Program info updated for listeners");
      }
    },
    [isLive, broadcast]
  );

  return {
    broadcastContext,
    chatState,
    updateProgramInfo,
  };
}
