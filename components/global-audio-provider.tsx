"use client";

import { createContext, useContext, useState, useEffect } from "react";
import LivePlayer from "@/components/live-player";
import { ChatWidget } from "@/components/chat/chat-widget";
import { useAuth } from "@/contexts/auth-context";
import { BroadcastProvider, useBroadcast } from "@/contexts/broadcast-context";
import { ChatProvider } from "@/contexts/chat-context";

interface GlobalAudioContextType {
  isPlaying: boolean;
  currentProgram: any;
  setIsPlaying: (playing: boolean) => void;
  setCurrentProgram: (program: any) => void;
}

const GlobalAudioContext = createContext<GlobalAudioContextType | undefined>(
  undefined
);

export function useGlobalAudio() {
  const context = useContext(GlobalAudioContext);
  if (!context) {
    throw new Error("useGlobalAudio must be used within GlobalAudioProvider");
  }
  return context;
}

export function GlobalAudioProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentProgram, setCurrentProgram] = useState(null);
  const { user } = useAuth();

  return (
    <ChatProvider>
      <BroadcastProvider isBroadcaster={false}>
        <GlobalAudioContext.Provider
          value={{
            isPlaying,
            currentProgram,
            setIsPlaying,
            setCurrentProgram,
          }}
        >
          {children}
          <GlobalAudioComponents />
        </GlobalAudioContext.Provider>
      </BroadcastProvider>
    </ChatProvider>
  );
}

// Separate component to handle broadcast context safely
function GlobalAudioComponents() {
  const { user } = useAuth();
  let currentBroadcast: any = null;
  let isLive = false;

  try {
    const broadcast = useBroadcast();
    currentBroadcast = broadcast;
    isLive = Boolean(broadcast?.isStreaming);
  } catch (error) {
    // BroadcastProvider not available - this is expected in some contexts
  }

  return (
    <>
      <LivePlayer />
      {user && (
        <ChatWidget
          broadcastId={currentBroadcast?.id || "general-chat"}
          currentUser={{
            id: user.id,
            username: user.name || user.email || "User",
            avatar: user.profilePicture || undefined,
            role: user.role === "admin" ? "admin" : "listener",
          }}
          isLive={isLive}
          position="bottom-right"
        />
      )}
    </>
  );
}
