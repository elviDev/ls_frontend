"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { ChannelAudioMonitor } from "./channel-audio-monitor"
import { useAudioProcessor } from "@/hooks/use-audio-processor"
import { useBroadcast } from "@/contexts/broadcast"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Music,
  Headphones,
  Radio,
  Settings,
  Sliders,
  PlayCircle,
  PauseCircle,
  RotateCcw,
  RotateCw,
  Zap,
  Activity,
  AlertTriangle
} from "lucide-react"

interface AudioChannel {
  id: string
  name: string
  type: "mic" | "music" | "effects" | "line"
  volume: number
  gain: number
  muted: boolean
  solo: boolean
  recording: boolean
  peak: number
  eq: {
    low: number
    mid: number
    high: number
  }
  compressor: {
    enabled: boolean
    threshold: number
    ratio: number
  }
  effects: {
    reverb: number
    echo: number
    chorus: number
  }
}

interface MixingBoardProps {
  isLive: boolean
  onChannelChange: (channelId: string, changes: Partial<AudioChannel>) => void
  onMasterVolumeChange: (volume: number) => void
  onCueChannel: (channelId: string) => void
  broadcastId: string
}

export function MixingBoard({ 
  isLive, 
  onChannelChange, 
  onMasterVolumeChange,
  onCueChannel,
  broadcastId
}: MixingBoardProps) {
  const [headphoneVolume, setHeadphoneVolume] = useState(60)
  const [recordingEnabled, setRecordingEnabled] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(false)
  
  // Use isLive prop from broadcast context instead of local state
  const [listenerCount, setListenerCount] = useState(0)
  const [broadcastError, setBroadcastError] = useState<string | null>(null)
  
  // Local state for music control
  const [globalMusicVolume, setGlobalMusicVolume] = useState(60)
  const [globalMusicMuted, setGlobalMusicMuted] = useState(false)
  const [globalMusicGain, setGlobalMusicGain] = useState(45)
  const [globalMusicEQ, setGlobalMusicEQ] = useState({ low: 55, mid: 50, high: 48 })
  const [globalMusicPeak, setGlobalMusicPeak] = useState(0)
  
  const toggleGlobalMusicMute = () => setGlobalMusicMuted(!globalMusicMuted)
  const updateGlobalMusicEQ = (eq: any) => setGlobalMusicEQ(eq)
  // Get broadcast context
  const { studio } = useBroadcast()
  
  const startBroadcast = async () => {
    try {
      await studio.startBroadcast()
      console.log('📻 Broadcast started successfully')
    } catch (error) {
      console.error('Failed to start broadcast:', error)
      throw error
    }
  }
  
  const stopBroadcast = async () => {
    try {
      studio.stopBroadcast()
      console.log('📻 Broadcast stopped successfully')
    } catch (error) {
      console.error('Failed to stop broadcast:', error)
      throw error
    }
  }

  // Initialize audio processor
  const audioProcessor = useAudioProcessor({
    masterVolume: 75,
    limiterThreshold: 85,
    noiseGate: 15,
    channels: [
      {
        id: "mic1",
        type: "mic",
        volume: 75,
        gain: 50,
        muted: false,
        solo: false,
        eq: { low: 50, mid: 50, high: 50 },
        effects: { reverb: 10, echo: 0, chorus: 0 }
      },
      {
        id: "mic2",
        type: "mic",
        volume: 0,
        gain: 50,
        muted: true,
        solo: false,
        eq: { low: 50, mid: 50, high: 50 },
        effects: { reverb: 5, echo: 0, chorus: 0 }
      },
      {
        id: "music",
        type: "music",
        volume: 60,
        gain: 45,
        muted: false,
        solo: false,
        eq: { low: 55, mid: 50, high: 48 },
        effects: { reverb: 0, echo: 0, chorus: 0 }
      },
      {
        id: "effects",
        type: "effects",
        volume: 45,
        gain: 40,
        muted: false,
        solo: false,
        eq: { low: 45, mid: 55, high: 60 },
        effects: { reverb: 15, echo: 5, chorus: 0 }
      }
    ]
  })
  const [channels, setChannels] = useState<AudioChannel[]>([
    {
      id: "mic1",
      name: "Main Mic",
      type: "mic",
      volume: 75,
      gain: 50,
      muted: false,
      solo: false,
      recording: true,
      peak: 0,
      eq: { low: 50, mid: 50, high: 50 },
      compressor: { enabled: true, threshold: 70, ratio: 3 },
      effects: { reverb: 10, echo: 0, chorus: 0 }
    },
    {
      id: "mic2",
      name: "Guest Mic",
      type: "mic",
      volume: 0,
      gain: 50,
      muted: true,
      solo: false,
      recording: false,
      peak: 0,
      eq: { low: 50, mid: 50, high: 50 },
      compressor: { enabled: true, threshold: 70, ratio: 3 },
      effects: { reverb: 5, echo: 0, chorus: 0 }
    },
    {
      id: "music",
      name: "Music",
      type: "music",
      volume: globalMusicVolume,
      gain: globalMusicGain,
      muted: globalMusicMuted,
      solo: false,
      recording: true,
      peak: globalMusicPeak,
      eq: globalMusicEQ,
      compressor: { enabled: false, threshold: 80, ratio: 2 },
      effects: { reverb: 0, echo: 0, chorus: 0 }
    },
    {
      id: "effects",
      name: "SFX/Jingles",
      type: "effects",
      volume: 45,
      gain: 40,
      muted: false,
      solo: false,
      recording: true,
      peak: 0,
      eq: { low: 45, mid: 55, high: 60 },
      compressor: { enabled: true, threshold: 75, ratio: 4 },
      effects: { reverb: 15, echo: 5, chorus: 0 }
    }
  ])

  // Sync music channel with global audio state
  useEffect(() => {
    setChannels(prev => prev.map(ch => 
      ch.id === "music" 
        ? { 
            ...ch, 
            volume: globalMusicVolume, 
            muted: globalMusicMuted,
            gain: globalMusicGain,
            eq: globalMusicEQ,
            peak: globalMusicPeak
          }
        : ch
    ))
  }, [globalMusicVolume, globalMusicMuted, globalMusicGain, globalMusicEQ, globalMusicPeak])

  // Update peak for a specific channel
  const updateChannelPeak = useCallback((channelId: string, peak: number) => {
    setChannels(prev => prev.map(ch => 
      ch.id === channelId ? { ...ch, peak } : ch
    ))
  }, [])



  // Enable audio processing
  const enableAudio = async () => {
    const success = await audioProcessor.initializeAudio()
    setAudioEnabled(success)
  }

  // Start/stop broadcasting
  const toggleBroadcast = async () => {
    if (!audioEnabled) return
    
    try {
      setBroadcastError(null)
      if (isLive) {
        await stopBroadcast()
      } else {
        await startBroadcast()
      }
    } catch (error) {
      setBroadcastError(error instanceof Error ? error.message : 'Broadcast failed')
    }
  }

  const updateChannel = (channelId: string, changes: Partial<AudioChannel>) => {
    setChannels(prev => prev.map(ch => 
      ch.id === channelId ? { ...ch, ...changes } : ch
    ))
    
    // Handle music channel controls through global audio context
    if (channelId === "music") {
      if (changes.volume !== undefined) {
        setGlobalMusicVolume(changes.volume)
      }
      if (changes.muted !== undefined && changes.muted !== globalMusicMuted) {
        toggleGlobalMusicMute()
      }
      if (changes.gain !== undefined) {
        setGlobalMusicGain(changes.gain)
      }
      if (changes.eq !== undefined) {
        updateGlobalMusicEQ(changes.eq)
      }
    }
    
    if (audioEnabled) {
      audioProcessor.updateChannel(channelId, changes)
    }
    
    onChannelChange(channelId, changes)
  }

  const handleMasterVolumeChange = (volume: number[]) => {
    if (audioEnabled) {
      audioProcessor.updateMasterVolume(volume[0])
    }
    onMasterVolumeChange(volume[0])
  }

  const getChannelIcon = (type: string) => {
    switch (type) {
      case "mic": return Mic
      case "music": return Music
      case "effects": return Zap
      case "line": return Radio
      default: return Volume2
    }
  }

  const getPeakColor = (peak: number) => {
    if (peak > 90) return "bg-red-500"
    if (peak > 75) return "bg-yellow-500"
    if (peak > 50) return "bg-green-500"
    return "bg-blue-500"
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-sm sm:text-base">Professional Mixing Board</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Switch
                checked={recordingEnabled}
                onCheckedChange={setRecordingEnabled}
                disabled={false} // Always enabled for testing
              />
              <span className="text-xs sm:text-sm">Recording</span>
            </div>
            {recordingEnabled && (
              <Badge variant="destructive" className="animate-pulse text-xs">
                <div className="w-2 h-2 bg-white rounded-full mr-1" />
                REC
              </Badge>
            )}
            {isLive && (
              <Badge variant="default" className="animate-pulse bg-red-600 text-xs">
                <Radio className="w-3 h-3 mr-1" />
                LIVE
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6 p-3 sm:p-6">
        {/* Master Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {/* Individual Channels */}
          {channels.map((channel) => {
            const Icon = getChannelIcon(channel.type)
            return (
              <div key={channel.id} className="space-y-3 sm:space-y-4 p-3 sm:p-4 border rounded-lg bg-slate-50">
                <ChannelAudioMonitor 
                  channel={channel} 
                  onPeakUpdate={updateChannelPeak}
                />
                {/* Channel Header */}
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="font-medium text-xs sm:text-sm">{channel.name}</span>
                  </div>
                    
                  {/* Peak Meter */}
                  <div className="relative h-1.5 sm:h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className={`absolute left-0 top-0 h-full transition-all duration-100 ${getPeakColor(channel.peak)}`}
                      style={{ width: `${channel.peak}%` }}
                    />
                    {channel.peak > 95 && (
                      <AlertTriangle className="absolute -top-5 sm:-top-6 right-0 h-3 w-3 sm:h-4 sm:w-4 text-red-500 animate-bounce" />
                    )}
                  </div>
                  <div className="text-xs text-slate-500">
                    Peak: {Math.round(channel.peak)}dB
                  </div>
                </div>

                {/* Channel Controls */}
                <div className="space-y-2 sm:space-y-3">
                  {/* Gain */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Gain</label>
                    <Slider
                      value={[channel.gain]}
                      onValueChange={(value) => updateChannel(channel.id, { gain: value[0] })}
                      max={100}
                      step={1}
                      className="h-1.5 sm:h-2"
                      disabled={false} // Always enabled for testing
                    />
                    <div className="text-xs text-center text-slate-500">{channel.gain}%</div>
                  </div>

                  {/* EQ */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium">EQ</label>
                    <div className="grid grid-cols-3 gap-1">
                      <div className="flex flex-col items-center space-y-1">
                        <Slider
                          value={[channel.eq.high]}
                          onValueChange={(value) => updateChannel(channel.id, { 
                            eq: { ...channel.eq, high: value[0] }
                          })}
                          max={100}
                          step={1}
                          orientation="vertical"
                          className="h-12 sm:h-16"
                          disabled={false} // Always enabled for testing
                        />
                        <div className="text-xs text-center">HI</div>
                      </div>
                      <div className="flex flex-col items-center space-y-1">
                        <Slider
                          value={[channel.eq.mid]}
                          onValueChange={(value) => updateChannel(channel.id, { 
                            eq: { ...channel.eq, mid: value[0] }
                          })}
                          max={100}
                          step={1}
                          orientation="vertical"
                          className="h-12 sm:h-16"
                          disabled={false} // Always enabled for testing
                        />
                        <div className="text-xs text-center">MID</div>
                      </div>
                      <div className="flex flex-col items-center space-y-1">
                        <Slider
                          value={[channel.eq.low]}
                          onValueChange={(value) => updateChannel(channel.id, { 
                            eq: { ...channel.eq, low: value[0] }
                          })}
                          max={100}
                          step={1}
                          orientation="vertical"
                          className="h-12 sm:h-16"
                          disabled={false} // Always enabled for testing
                        />
                        <div className="text-xs text-center">LOW</div>
                      </div>
                    </div>
                  </div>

                  {/* Volume Fader */}
                  <div className="space-y-1 flex flex-col items-center">
                    <label className="text-xs font-medium">Volume</label>
                    <Slider
                      value={[channel.volume]}
                      onValueChange={(value) => updateChannel(channel.id, { volume: value[0] })}
                      max={100}
                      step={1}
                      orientation="vertical"
                      className="h-16 sm:h-24"
                      disabled={false} // Always enabled for testing
                    />
                    <div className="text-xs text-center text-slate-500">{channel.volume}%</div>
                  </div>

                  {/* Channel Buttons */}
                  <div className="space-y-1 sm:space-y-2">
                    <div className="grid grid-cols-2 gap-1">
                      <Button
                        size="sm"
                        variant={channel.muted ? "destructive" : "outline"}
                        onClick={() => updateChannel(channel.id, { muted: !channel.muted })}
                        disabled={false} // Always enabled for testing
                        className="text-xs h-5 sm:h-6"
                      >
                        MUTE
                      </Button>
                      <Button
                        size="sm"
                        variant={channel.solo ? "default" : "outline"}
                        onClick={() => updateChannel(channel.id, { solo: !channel.solo })}
                        disabled={false} // Always enabled for testing
                        className="text-xs h-5 sm:h-6"
                      >
                        SOLO
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onCueChannel(channel.id)}
                      disabled={false} // Always enabled for testing
                      className="w-full text-xs h-5 sm:h-6"
                    >
                      CUE
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <Separator />

        {/* Master Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {/* Master Volume */}
          <div className="space-y-3 sm:space-y-4 flex flex-col items-center">
            <div className="text-center">
              <h4 className="font-medium text-sm sm:text-base">Master Output</h4>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Slider
                value={[audioProcessor.audioState.masterVolume]}
                onValueChange={handleMasterVolumeChange}
                max={100}
                step={1}
                orientation="vertical"
                className="h-24 sm:h-32 w-4 sm:w-6"
                disabled={!audioEnabled}
              />
              <div className="text-xs sm:text-sm text-center text-slate-600">{audioProcessor.audioState.masterVolume}%</div>
              <Badge variant="outline" className="justify-center text-xs">
                <Volume2 className="h-3 w-3 mr-1" />
                MAIN
              </Badge>
            </div>
          </div>

          {/* Headphone Monitor */}
          <div className="space-y-3 sm:space-y-4 flex flex-col items-center">
            <div className="text-center">
              <h4 className="font-medium text-sm sm:text-base">Headphone Monitor</h4>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Slider
                value={[headphoneVolume]}
                onValueChange={(value) => setHeadphoneVolume(value[0])}
                max={100}
                step={1}
                orientation="vertical"
                className="h-24 sm:h-32 w-4 sm:w-6"
                disabled={false} // Always enabled for testing
              />
              <div className="text-xs sm:text-sm text-center text-slate-600">{headphoneVolume}%</div>
              <Badge variant="outline" className="justify-center text-xs">
                <Headphones className="h-3 w-3 mr-1" />
                CUE
              </Badge>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="space-y-3 sm:space-y-4 flex flex-col items-center">
            <div className="text-center">
              <h4 className="font-medium text-sm sm:text-base">Master Controls</h4>
            </div>
            <div className="space-y-2 sm:space-y-3 w-full max-w-xs">
              {!audioEnabled && (
                <Button 
                  variant="default" 
                  className="w-full h-8 sm:h-10 text-sm"
                  onClick={enableAudio}
                >
                  🎤 Enable Audio
                </Button>
              )}
              
              <Button 
                variant={recordingEnabled ? "destructive" : "outline"} 
                className="w-full h-8 sm:h-10 text-sm"
                onClick={() => setRecordingEnabled(!recordingEnabled)}
                disabled={!audioEnabled}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${recordingEnabled ? 'bg-white' : 'bg-red-500'}`} />
                  <span className="hidden sm:inline">{recordingEnabled ? 'Stop Recording' : 'Start Recording'}</span>
                  <span className="sm:hidden">{recordingEnabled ? 'Stop Rec' : 'Record'}</span>
                </div>
              </Button>
              
              <Button 
                variant={isLive ? "destructive" : "default"} 
                className="w-full h-8 sm:h-10 text-sm"
                onClick={toggleBroadcast}
                disabled={!audioEnabled}
              >
                <div className="flex items-center gap-2">
                  <Radio className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">{isLive ? 'Stop Live Stream' : 'Go Live'}</span>
                  <span className="sm:hidden">{isLive ? 'Stop' : 'Go Live'}</span>
                </div>
              </Button>
              
              {broadcastError && (
                <div className="text-xs text-red-600 text-center">
                  {broadcastError}
                </div>
              )}
              
              {listenerCount > 0 && (
                <div className="text-xs text-center text-gray-600">
                  {listenerCount} listeners
                </div>
              )}
              
              <Button 
                variant={showAdvanced ? "default" : "outline"} 
                className="w-full h-8 sm:h-10 text-sm" 
                onClick={() => setShowAdvanced(!showAdvanced)}
                disabled={!audioEnabled}
              >
                <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                Advanced
              </Button>
              

            </div>
          </div>
        </div>

        {/* Advanced Settings Panel */}
        {showAdvanced && (
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 border rounded-lg bg-slate-50">
            <h4 className="font-medium mb-3 text-sm sm:text-base">Advanced Settings</h4>
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-medium">Limiter Threshold: {audioProcessor.audioState.limiterThreshold}%</label>
                <Slider 
                  value={[audioProcessor.audioState.limiterThreshold]} 
                  onValueChange={(value) => audioProcessor.updateLimiterThreshold(value[0])}
                  max={100} 
                  step={1} 
                  className="h-1.5 sm:h-2" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-medium">Noise Gate: {audioProcessor.audioState.noiseGate}%</label>
                <Slider 
                  value={[audioProcessor.audioState.noiseGate]} 
                  onValueChange={(value) => audioProcessor.updateNoiseGate(value[0])}
                  max={50} 
                  step={1} 
                  className="h-1.5 sm:h-2" 
                />
              </div>
            </div>
          </div>
        )}


      </CardContent>
    </Card>
  )
}