'use client'

import React from 'react'
import { BroadcastProvider } from '@/contexts/broadcast'
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
    <BroadcastProvider>
      <StudioInterface 
        broadcastId={broadcastId}
        stationName={stationName}
      />
    </BroadcastProvider>
  )
}