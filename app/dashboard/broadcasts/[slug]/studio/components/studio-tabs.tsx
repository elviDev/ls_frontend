"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mic, Music, Zap, BarChart3, MessageSquare, Settings } from "lucide-react"
import { MixingBoard } from "@/components/studio/mixing-board"
import { AudioPlayer } from "@/components/studio/audio-player"
import { Soundboard } from "@/components/studio/soundboard"
import { AnalyticsDashboard } from "@/components/studio/analytics-dashboard"
import { EnhancedChat } from "@/components/studio/enhanced-chat"
import { toast } from "sonner"
import type { Broadcast } from "../types"

interface StudioTabsProps {
  broadcast: Broadcast
  isLive: boolean
  activeTab: string
  onTabChange: (tab: string) => void
  listeners: any[]
  onListenerUpdate: (listeners: any[]) => void
  onTrackChange: (track: any) => void
  chatState: any
}

export function StudioTabs({
  broadcast,
  isLive,
  activeTab,
  onTabChange,
  listeners,
  onListenerUpdate,
  onTrackChange,
  chatState
}: StudioTabsProps) {
  const TestModeBanner = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
    !isLive && (
      <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-2">
          <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
          <span className="text-xs sm:text-sm font-medium text-blue-900">
            {title}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-blue-700 mt-1">
          {description}
        </p>
      </div>
    )
  )

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-4 sm:space-y-6">
      <TabsList className="grid w-full grid-cols-5 bg-white shadow-sm border h-auto p-1">
        <TabsTrigger
          value="console"
          className="data-[state=active]:bg-slate-900 data-[state=active]:text-white flex-col sm:flex-row gap-1 sm:gap-2 py-2 px-1 sm:px-3 text-xs sm:text-sm"
        >
          <Mic className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Console</span>
          <span className="sm:hidden">Mix</span>
        </TabsTrigger>
        <TabsTrigger
          value="player"
          className="data-[state=active]:bg-slate-900 data-[state=active]:text-white flex-col sm:flex-row gap-1 sm:gap-2 py-2 px-1 sm:px-3 text-xs sm:text-sm"
        >
          <Music className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Player</span>
          <span className="sm:hidden">Play</span>
        </TabsTrigger>
        <TabsTrigger
          value="soundboard"
          className="data-[state=active]:bg-slate-900 data-[state=active]:text-white flex-col sm:flex-row gap-1 sm:gap-2 py-2 px-1 sm:px-3 text-xs sm:text-sm"
        >
          <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Soundboard</span>
          <span className="sm:hidden">SFX</span>
        </TabsTrigger>
        <TabsTrigger
          value="analytics"
          className="data-[state=active]:bg-slate-900 data-[state=active]:text-white flex-col sm:flex-row gap-1 sm:gap-2 py-2 px-1 sm:px-3 text-xs sm:text-sm"
        >
          <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Analytics</span>
          <span className="sm:hidden">Stats</span>
        </TabsTrigger>
        <TabsTrigger
          value="chat"
          className="data-[state=active]:bg-slate-900 data-[state=active]:text-white flex-col sm:flex-row gap-1 sm:gap-2 py-2 px-1 sm:px-3 text-xs sm:text-sm"
        >
          <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Chat</span>
          <span className="sm:hidden">Chat</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="console" className="space-y-4 sm:space-y-6">
        <TestModeBanner
          icon={Settings}
          title="Test Mode"
          description="Studio is in test mode. You can configure all settings and test functionality before going live."
        />
        <MixingBoard
          isLive={isLive}
          onChannelChange={() => {}}
          onMasterVolumeChange={() => {}}
          onCueChannel={() => {}}
          broadcastId={broadcast?.id}
        />
      </TabsContent>

      <TabsContent value="player" className="space-y-4 sm:space-y-6">
        <TestModeBanner
          icon={Music}
          title="Audio Player Test Mode"
          description="Test your playlists, crossfade settings, and track selection before going live."
        />
        <AudioPlayer
          isLive={isLive}
          onTrackChange={onTrackChange}
          onPlaylistChange={(playlist) => {
            console.log("Playlist changed:", playlist)
          }}
        />
      </TabsContent>

      <TabsContent value="soundboard" className="space-y-4 sm:space-y-6">
        <TestModeBanner
          icon={Zap}
          title="Soundboard Test Mode"
          description="Test your sound effects, jingles, and audio cues. All sounds will play as tests."
        />
        <Soundboard
          isLive={isLive}
          onSoundPlay={(sound) => {
            console.log("🔊 Sound playing:", sound.name, sound)
            toast.success(`🎵 Playing: ${sound.name}`)
          }}
          onSoundStop={(soundId) => {
            console.log("⏹️ Sound stopped:", soundId)
            toast.info(`⏹️ Sound stopped`)
          }}
        />
      </TabsContent>

      <TabsContent value="analytics" className="space-y-4 sm:space-y-6">
        <TestModeBanner
          icon={BarChart3}
          title="Analytics Preview"
          description="Preview your analytics dashboard. Real data will appear when broadcast goes live."
        />
        <AnalyticsDashboard
          isLive={isLive}
          listeners={listeners}
          onListenerUpdate={onListenerUpdate}
        />
      </TabsContent>

      <TabsContent value="chat" className="space-y-4 sm:space-y-6">
        <TestModeBanner
          icon={MessageSquare}
          title="Chat System Test"
          description="Test your chat moderation tools and practice sending announcements. Messages will be simulated."
        />
        <EnhancedChat
          isLive={chatState.isBroadcastLive}
          isBroadcastLive={chatState.isBroadcastLive}
          hostId={broadcast.hostUser.id}
          broadcastId={broadcast.id}
          broadcastTitle={broadcast.title}
          onMessageSend={async (message, type) => {
            console.log("💬 Message sent:", message, type, "isLive:", isLive)
            
            if (type === "announcement") {
              toast.success(
                isLive
                  ? "📢 Announcement sent to all listeners"
                  : "🧪 Test: Announcement ready"
              )
            }
          }}
          onUserAction={async (userId, action) => {
            console.log("👤 User action:", userId, action)
          }}
        />
      </TabsContent>
    </Tabs>
  )
}