"use client";

import React from "react";
import LivePlayer from "@/components/live-player";
import { ChatProvider } from "@/contexts/chat";

export function GlobalAudioProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ChatProvider>
      {children}
      <LivePlayer />
    </ChatProvider>
  );
}
