"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, Volume2, VolumeX, Music } from "lucide-react"

interface Track {
  id: string
  title: string
  artist: string
  duration: number
  assetUrl?: string
}



interface AudioPlayerProps {
  isLive: boolean
  onTrackChange: (track: Track | null) => void
}

export function AudioPlayer({ isLive, onTrackChange }: AudioPlayerProps) {

  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(50)
  const [isMuted, setIsMuted] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100
    }
  }

  const handleToggleMute = () => {
    const muted = !isMuted
    setIsMuted(muted)
    if (audioRef.current) {
      audioRef.current.muted = muted
    }
  }

  // Connect audio to broadcast mixer when playing
  useEffect(() => {
    if (audioRef.current && isPlaying && currentTrack) {
      try {
        const audioContext = new AudioContext()
        const source = audioContext.createMediaElementSource(audioRef.current)
        const destination = audioContext.createMediaStreamDestination()
        
        source.connect(destination)
        source.connect(audioContext.destination)
        
        console.log('Audio connected to mixer:', currentTrack.title)
      } catch (error) {
        console.error('Failed to connect audio to mixer:', error)
      }
    }
  }, [isPlaying, currentTrack, volume, isMuted])

  useEffect(() => {
    if (currentTrack) {
      onTrackChange(currentTrack)
    }
  }, [currentTrack, onTrackChange])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5" />
          Audio Player
          {isLive && <Badge variant="destructive">LIVE</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentTrack ? (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="font-medium">{currentTrack.title}</h3>
              <p className="text-sm text-muted-foreground">{currentTrack.artist}</p>
            </div>
            
            <div className="flex items-center justify-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={isPlaying ? handlePause : handlePlay}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleToggleMute}
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              <Slider
                value={[volume]}
                onValueChange={handleVolumeChange}
                max={100}
                step={1}
                className="flex-1"
              />
              <span className="text-sm w-12">{volume}%</span>
            </div>
            
            <audio
              ref={audioRef}
              src={currentTrack.assetUrl}
              onEnded={() => setIsPlaying(false)}
            />
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            No track selected
          </div>
        )}
      </CardContent>
    </Card>
  )
}