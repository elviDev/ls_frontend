"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { AlertTriangle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LiveKitBroadcastProvider, useLiveKitBroadcast } from "@/contexts/broadcast"
import { ChatProvider } from "@/contexts/chat"
import { LiveKitStudioControls } from "@/components/livekit/studio-controls"
import { StudioHeader } from "./components/studio-header"
import { StreamStatusBar } from "./components/stream-status-bar"
import { BroadcastStatusCard } from "./components/broadcast-status-card"
import { StudioTabs } from "./components/studio-tabs"
import { BroadcastTeamCard } from "./components/broadcast-team-card"
import { AudioLevelDisplay } from "./components/audio-level-display"
import { useStudioData } from "./hooks/use-studio-data"
import { useStudioIntegration } from "./hooks/use-studio-integration"
import type { Broadcast } from "./types"

function StudioInterface() {
  const router = useRouter()
  const params = useParams()
  const broadcastSlug = params.slug as string

  const [activeTab, setActiveTab] = useState("console")
  const [listeners, setListeners] = useState<any[]>([])
  const [broadcastStartTime, setBroadcastStartTime] = useState<Date | null>(null)
  const [broadcastDuration, setBroadcastDuration] = useState("00:00:00")

  // Use custom hooks for data and integration
  const { broadcast, isLoading } = useStudioData(broadcastSlug)
  const { broadcastContext, chatState, updateProgramInfo } = useStudioIntegration(broadcast, false)
  
  // Get LiveKit broadcast context
  const liveKitBroadcast = useLiveKitBroadcast()

  // Get live status from LiveKit broadcast context
  const isLive = liveKitBroadcast?.studio?.state?.isLive || false
  
  // Track broadcast start time
  useEffect(() => {
    if (isLive && !broadcastStartTime) {
      setBroadcastStartTime(new Date())
    } else if (!isLive && broadcastStartTime) {
      setBroadcastStartTime(null)
      setBroadcastDuration("00:00:00")
    }
  }, [isLive, broadcastStartTime])
  
  // Update duration timer
  useEffect(() => {
    if (!isLive || !broadcastStartTime) return
    
    const interval = setInterval(() => {
      const now = new Date()
      const diff = now.getTime() - broadcastStartTime.getTime()
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      
      setBroadcastDuration(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      )
    }, 1000)
    
    return () => clearInterval(interval)
  }, [isLive, broadcastStartTime])
  // Get listener count from LiveKit
  const currentListenerCount = liveKitBroadcast?.studio?.state?.listenerCount || 0
  const peakListeners = 0
  const studioMetrics = {
    cpuUsage: isLive ? 45 : 15,
    memoryUsage: isLive ? 65 : 25,
    networkStatus: isLive ? "excellent" as const : "good" as const,
    audioLevels: { 
      input: isLive ? 35 : 0, 
      output: isLive ? 32 : 0, 
      peak: isLive ? 45 : 0 
    }
  }
  const streamStatus = {
    isConnected: isLive,
    quality: isLive ? 95 : 0,
    bitrate: isLive ? 128 : 0,
    latency: isLive ? 50 : 0,
    dropped: 0,
    errors: []
  }













  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-slate-900 mx-auto"></div>
          <p className="text-slate-500">Loading broadcast studio...</p>
        </div>
      </div>
    )
  }

  if (!broadcast) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-16 w-16 text-red-300 mb-6" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Broadcast Not Found
            </h2>
            <p className="text-slate-500 text-center mb-6">
              The broadcast you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => router.push("/dashboard/broadcasts")}>
              Back to Broadcasts
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="container mx-auto px-3 sm:px-6 py-4 sm:py-8">
        <StudioHeader
          broadcast={broadcast}
          isLive={isLive}
          broadcastDuration={broadcastDuration}
          currentListenerCount={currentListenerCount}
          peakListeners={peakListeners}
          onBackClick={() => router.push("/dashboard/broadcasts")}
        />

        {!isLive && broadcast && (
          <Card className="mb-6 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                  <div>
                    <h3 className="font-semibold text-blue-900">
                      Studio Test Mode Active
                    </h3>
                    <p className="text-sm text-blue-700">
                      All studio controls are enabled for testing. Configure
                      your setup and test functionality before going live.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <StreamStatusBar
          streamStatus={streamStatus}
          studioMetrics={studioMetrics}
        />

        <div className="space-y-4 sm:space-y-6">
          <LiveKitStudioControls />
          
          <BroadcastStatusCard
            broadcast={broadcast}
            isLive={isLive}
            broadcastDuration={broadcastDuration}
            currentListenerCount={currentListenerCount}
            onBackClick={() => router.push("/dashboard/broadcasts")}
          />

          <BroadcastTeamCard broadcast={broadcast} />

          <AudioLevelDisplay
            studioMetrics={studioMetrics}
            isLive={isLive}
          />

          {broadcast && (
            <StudioTabs
              broadcast={broadcast}
              isLive={isLive}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              listeners={listeners}
              onListenerUpdate={setListeners}
              onTrackChange={(track) => {
                console.log("Track changed:", track)
                if (isLive) {
                  updateProgramInfo({ currentTrack: track })
                }
              }}
              chatState={chatState}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default function StudioPage() {
  const [liveKitToken, setLiveKitToken] = useState<string>('');
  const [tokenLoading, setTokenLoading] = useState(true);
  const params = useParams();
  const broadcastSlug = params.slug as string;

  useEffect(() => {
    const fetchLiveKitToken = async () => {
      try {
        const response = await fetch('/api/livekit/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: `broadcaster-${Date.now()}`,
            roomName: `broadcast-${broadcastSlug}`,
            userName: 'Studio Host',
            role: 'broadcaster'
          })
        });
        
        const data = await response.json();
        setLiveKitToken(data.token);
      } catch (error) {
        console.error('Failed to fetch LiveKit token:', error);
      } finally {
        setTokenLoading(false);
      }
    };

    fetchLiveKitToken();
  }, [broadcastSlug]);

  if (tokenLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-slate-900 mx-auto"></div>
          <p className="text-slate-500">Connecting to LiveKit...</p>
        </div>
      </div>
    );
  }

  if (!liveKitToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-16 w-16 text-red-300 mb-6" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Connection Failed
            </h2>
            <p className="text-slate-500 text-center mb-6">
              Unable to connect to LiveKit streaming service.
            </p>
            <Button onClick={() => window.location.reload()}>
              Retry Connection
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ChatProvider>
      <LiveKitBroadcastProvider 
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_SERVER_URL || 'ws://localhost:7880'}
        token={liveKitToken}
      >
        <StudioInterface />
      </LiveKitBroadcastProvider>
    </ChatProvider>
  );
}
