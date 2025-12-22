"use client"

import { useState, useEffect, useRef } from "react"
import { UnifiedAudioListener } from "@/lib/unified-audio-system"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Users,
  Radio,
  Heart,
  Share2,
  MessageSquare,
  Calendar
} from "lucide-react"

interface Broadcast {
  id: string
  title: string
  description: string
  status: "LIVE" | "SCHEDULED" | "ENDED"
  startTime: string
  hostUser: {
    firstName: string
    lastName: string
    profileImage?: string
  }
  banner?: {
    url: string
  }
  currentListeners: number
  totalListeners: number
}

interface BroadcastPageProps {
  broadcast: Broadcast
  userId?: string
  username?: string
}

export function BroadcastPage({ broadcast, userId, username }: BroadcastPageProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(75)
  const [isMuted, setIsMuted] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const audioListenerRef = useRef<UnifiedAudioListener | null>(null)

  const handlePlayPause = async () => {
    if (!isPlaying) {
      // Start listening
      try {
        if (!audioListenerRef.current) {
          audioListenerRef.current = new UnifiedAudioListener(broadcast.id)
        }
        await audioListenerRef.current.startListening()
        setIsPlaying(true)
      } catch (error) {
        console.error('Failed to start listening:', error)
      }
    } else {
      // Stop listening
      if (audioListenerRef.current) {
        audioListenerRef.current.stopListening()
        setIsPlaying(false)
      }
    }
  }

  const toggleMute = () => {
    const newMuted = !isMuted
    setIsMuted(newMuted)
    if (audioListenerRef.current) {
      audioListenerRef.current.setVolume(newMuted ? 0 : volume)
    }
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const getStatusBadge = () => {
    switch (broadcast.status) {
      case 'LIVE':
        return (
          <Badge variant="destructive" className="animate-pulse">
            <div className="w-2 h-2 bg-white rounded-full mr-2" />
            LIVE
          </Badge>
        )
      case 'SCHEDULED':
        return <Badge variant="outline">Scheduled</Badge>
      case 'ENDED':
        return <Badge variant="secondary">Ended</Badge>
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <Card className="overflow-hidden border-0 shadow-lg">
              <CardContent className="p-0">
                {broadcast.banner && (
                  <div className="relative">
                    <img
                      src={broadcast.banner.url}
                      alt={broadcast.title}
                      className="w-full h-32 sm:h-40 md:h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute top-3 left-3">
                      {getStatusBadge()}
                    </div>
                  </div>
                )}
                
                <div className="p-4 sm:p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                    <div className="flex-1">
                      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                        {broadcast.title}
                      </h1>
                      {!broadcast.banner && (
                        <div className="mt-2">
                          {getStatusBadge()}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    {broadcast.description}
                  </p>

                  <div className="flex items-center gap-3 p-3 sm:p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg">
                    <Avatar className="h-10 w-10 sm:h-12 sm:w-12 ring-2 ring-primary/20">
                      <AvatarImage src={broadcast.hostUser.profileImage} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white font-semibold">
                        {broadcast.hostUser.firstName.charAt(0)}
                        {broadcast.hostUser.lastName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                        {broadcast.hostUser.firstName} {broadcast.hostUser.lastName}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500">Radio Host</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Audio Player */}
            {broadcast.status === 'LIVE' && (
              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                      <Radio className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <span className="text-base sm:text-lg">Live Audio Stream</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                  <div className="flex items-center justify-center">
                    <Button
                      onClick={handlePlayPause}
                      size="lg"
                      className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg transition-all duration-200 hover:scale-105"
                    >
                      {isPlaying ? (
                        <Pause className="h-6 w-6 sm:h-8 sm:w-8" />
                      ) : (
                        <Play className="h-6 w-6 sm:h-8 sm:w-8 ml-0.5" />
                      )}
                    </Button>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-4 bg-slate-50 p-3 sm:p-4 rounded-lg">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleMute}
                      className="h-8 w-8 sm:h-10 sm:w-10 shrink-0"
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeX className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </Button>
                    <div className="flex-1 px-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={isMuted ? 0 : volume}
                        onChange={(e) => {
                          const newVolume = parseInt(e.target.value)
                          setVolume(newVolume)
                          if (audioListenerRef.current && !isMuted) {
                            audioListenerRef.current.setVolume(newVolume)
                          }
                        }}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                        style={{
                          background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${isMuted ? 0 : volume}%, #e2e8f0 ${isMuted ? 0 : volume}%, #e2e8f0 100%)`
                        }}
                      />
                    </div>
                    <span className="text-xs sm:text-sm text-gray-500 w-8 sm:w-12 text-right font-medium">
                      {isMuted ? 0 : volume}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg">Interact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant={isLiked ? "default" : "outline"}
                  className="w-full h-10 sm:h-11 text-sm sm:text-base transition-all duration-200 hover:scale-105"
                  onClick={() => setIsLiked(!isLiked)}
                >
                  <Heart className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                  {isLiked ? 'Liked' : 'Like'}
                </Button>
                
                <Button variant="outline" className="w-full h-10 sm:h-11 text-sm sm:text-base transition-all duration-200 hover:scale-105">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                
                <Button variant="outline" className="w-full h-10 sm:h-11 text-sm sm:text-base transition-all duration-200 hover:scale-105">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Join Chat
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg">Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                  <span className="text-sm text-blue-700 font-medium">Listeners</span>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                    <Users className="h-3 w-3 mr-1" />
                    {broadcast.currentListeners}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                  <span className="text-sm text-green-700 font-medium">Started</span>
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatTime(broadcast.startTime)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}