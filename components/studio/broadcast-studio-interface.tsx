'use client'

import React from 'react'
import { RoomProvider } from '@/providers/global-livekit-provider'
import { StudioInterface } from './studio-interface'

interface BroadcastStudioInterfaceProps {
  broadcastId: string
  stationName: string
}

export function BroadcastStudioInterface({ 
  broadcastId, 
  stationName
}: BroadcastStudioInterfaceProps) {
  return (
    <RoomProvider 
      roomId={`studio-${broadcastId}`}
      roomName={`broadcast-${broadcastId}`}
      userId={`host-${Date.now()}`}
      userName={stationName}
      role="broadcaster"
    >
      <StudioInterface 
        broadcastId={broadcastId}
        stationName={stationName}
      />
    </RoomProvider>
  )
}