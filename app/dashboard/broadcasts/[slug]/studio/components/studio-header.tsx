"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Radio, RadioIcon as RadioOff, Users } from "lucide-react"
import type { Broadcast } from "../types"

interface StudioHeaderProps {
  broadcast: Broadcast
  isLive: boolean
  broadcastDuration: string
  currentListenerCount: number
  peakListeners: number
  onBackClick: () => void
}

export function StudioHeader({
  broadcast,
  isLive,
  broadcastDuration,
  currentListenerCount,
  peakListeners,
  onBackClick
}: StudioHeaderProps) {
  const getStatusIndicator = () => {
    if (isLive) {
      return (
        <div className="flex items-center gap-2">
          <div className="relative">
            <Radio className="h-6 w-6 text-red-500" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          </div>
          <div>
            <div className="text-sm font-bold text-red-600">LIVE</div>
            <div className="text-xs text-gray-500">{broadcastDuration}</div>
          </div>
        </div>
      )
    }
    return (
      <div className="flex items-center gap-2">
        <RadioOff className="h-6 w-6 text-gray-400" />
        <div>
          <div className="text-sm font-medium text-gray-600">OFF AIR</div>
          <div className="text-xs text-gray-500">Ready to broadcast</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-8 gap-4">
      <div className="flex items-center gap-3 sm:gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBackClick}
          className="hover:bg-white/80 transition-colors flex-shrink-0"
        >
          <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent truncate">
            {broadcast.title}
          </h1>
          <p className="text-slate-500 mt-1 text-xs sm:text-sm hidden sm:block">
            Professional Broadcasting Studio • Host:{" "}
            {broadcast.hostUser.firstName} {broadcast.hostUser.lastName}
          </p>
          <p className="text-slate-500 mt-1 text-xs sm:hidden">
            Host: {broadcast.hostUser.firstName} {broadcast.hostUser.lastName}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 justify-between sm:justify-end">
        {getStatusIndicator()}
        <Separator orientation="vertical" className="h-6 sm:h-8 hidden sm:block" />
        <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
          <Users className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="whitespace-nowrap">{currentListenerCount} listeners</span>
          {peakListeners > 0 && (
            <Badge variant="outline" className="text-xs hidden sm:inline-flex">
              Peak: {peakListeners}
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}