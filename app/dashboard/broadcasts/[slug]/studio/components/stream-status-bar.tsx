"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Signal, Activity, Wifi, Clock, Monitor, CheckCircle2 } from "lucide-react"
import type { StreamStatus, StudioMetrics } from "../types"

interface StreamStatusBarProps {
  streamStatus: StreamStatus
  studioMetrics: StudioMetrics
}

export function StreamStatusBar({ streamStatus, studioMetrics }: StreamStatusBarProps) {
  const getNetworkStatusColor = (status: string) => {
    switch (status) {
      case "excellent": return "text-green-600"
      case "good": return "text-blue-600"
      case "poor": return "text-yellow-600"
      default: return "text-red-600"
    }
  }

  return (
    <Card className="mb-4 sm:mb-6">
      <CardContent className="p-3 sm:p-4">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-4">
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="relative">
              <Signal
                className={`h-3 w-3 sm:h-4 sm:w-4 ${streamStatus.isConnected ? "text-green-500" : "text-red-500"}`}
              />
              {streamStatus.isConnected && (
                <div className="absolute -top-1 -right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse" />
              )}
            </div>
            <div>
              <div className="text-xs text-gray-500">Stream</div>
              <div className="text-xs sm:text-sm font-medium">
                {streamStatus.isConnected ? "Connected" : "Offline"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
            <div>
              <div className="text-xs text-gray-500">Quality</div>
              <div className="text-xs sm:text-sm font-medium">
                {streamStatus.quality.toFixed(1)}%
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <Wifi className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500" />
            <div>
              <div className="text-xs text-gray-500">Bitrate</div>
              <div className="text-xs sm:text-sm font-medium">
                {Math.round(streamStatus.bitrate)} kbps
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
            <div>
              <div className="text-xs text-gray-500">Latency</div>
              <div className="text-xs sm:text-sm font-medium">
                {Math.round(streamStatus.latency)}ms
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <Monitor className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500" />
            <div>
              <div className="text-xs text-gray-500">CPU</div>
              <div className="text-xs sm:text-sm font-medium">
                {Math.round(studioMetrics.cpuUsage)}%
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <CheckCircle2
              className={`h-3 w-3 sm:h-4 sm:w-4 ${getNetworkStatusColor(studioMetrics.networkStatus)}`}
            />
            <div>
              <div className="text-xs text-gray-500">Network</div>
              <div
                className={`text-xs sm:text-sm font-medium capitalize ${getNetworkStatusColor(studioMetrics.networkStatus)}`}
              >
                {studioMetrics.networkStatus}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}