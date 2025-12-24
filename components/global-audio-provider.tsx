"use client";

import React from "react";
import LivePlayer from "@/components/live-player";

export function GlobalAudioProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <LivePlayer />
    </>
  );
}
