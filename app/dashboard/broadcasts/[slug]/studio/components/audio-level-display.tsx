"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mic, Volume2, Signal } from "lucide-react"
import type { StudioMetrics } from "../types"

interface AudioLevelDisplayProps {
  studioMetrics: StudioMetrics
  isLive: boolean
}

export function AudioLevelDisplay({ studioMetrics, isLive }: AudioLevelDisplayProps) {
  const getAudioLevelGradient = (level: number) => {
    if (level < 20) return "bg-gradient-to-r from-gray-400 to-gray-500"
    if (level < 40) return "bg-gradient-to-r from-green-400 to-green-600"
    if (level < 60) return "bg-gradient-to-r from-yellow-400 to-yellow-600"
    if (level < 80) return "bg-gradient-to-r from-orange-400 to-orange-600"
    return "bg-gradient-to-r from-red-400 to-red-600"
  }

  return (
    <Card className="mb-4 sm:mb-6">
      <CardContent className="p-3 sm:p-4">
        <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Mic className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
              <span className="text-xs sm:text-sm font-medium">Audio Input</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2 sm:h-3 overflow-hidden">
                <div
                  className={`h-2 sm:h-3 rounded-full ${getAudioLevelGradient(studioMetrics.audioLevels.input)}`}
                  style={{
                    width: `${studioMetrics.audioLevels.input}%`,
                    boxShadow:
                      studioMetrics.audioLevels.input > 50
                        ? "0 0 8px rgba(255, 165, 0, 0.6)"
                        : "none",
                  }}
                />
              </div>
              <span
                className={`text-xs w-8 sm:w-12 font-mono ${
                  studioMetrics.audioLevels.input > 80
                    ? "text-red-600 font-bold"
                    : studioMetrics.audioLevels.input > 60
                      ? "text-orange-600"
                      : studioMetrics.audioLevels.input > 20
                        ? "text-green-600"
                        : "text-gray-500"
                }`}
              >
                {Math.round(studioMetrics.audioLevels.input)}%
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Volume2 className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500" />
              <span className="text-xs sm:text-sm font-medium">Output</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2 sm:h-3 overflow-hidden">
                <div
                  className={`h-2 sm:h-3 rounded-full transition-all duration-100 ${getAudioLevelGradient(studioMetrics.audioLevels.output)}`}
                  style={{
                    width: `${studioMetrics.audioLevels.output}%`,
                    boxShadow:
                      studioMetrics.audioLevels.output > 50
                        ? "0 0 6px rgba(147, 51, 234, 0.5)"
                        : "none",
                  }}
                />
              </div>
              <span
                className={`text-xs w-8 sm:w-12 font-mono ${
                  studioMetrics.audioLevels.output > 80
                    ? "text-red-600 font-bold"
                    : studioMetrics.audioLevels.output > 60
                      ? "text-orange-600"
                      : studioMetrics.audioLevels.output > 20
                        ? "text-green-600"
                        : "text-gray-500"
                }`}
              >
                {Math.round(studioMetrics.audioLevels.output)}%
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Signal
                className={`h-3 w-3 sm:h-4 sm:w-4 ${isLive ? "text-green-500" : "text-red-500"}`}
              />
              <span className="text-xs sm:text-sm font-medium">Connection</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isLive ? "default" : "secondary"} className="text-xs">
                {isLive ? "connected" : "offline"}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}