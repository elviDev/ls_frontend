"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import type { Broadcast } from "../types"

interface BroadcastStatusCardProps {
  broadcast: Broadcast
  isLive: boolean
  broadcastDuration: string
  currentListenerCount: number
  onBackClick: () => void
}

export function BroadcastStatusCard({
  broadcast,
  isLive,
  broadcastDuration,
  currentListenerCount,
  onBackClick
}: BroadcastStatusCardProps) {
  if (isLive) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6 text-center">
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-red-900">
                🔴 You're Live!
              </h3>
              <p className="text-red-700">
                Broadcasting for {broadcastDuration} •{" "}
                {currentListenerCount} listeners
              </p>
              <p className="text-sm text-red-600">
                Use the mixing board controls below to manage your live stream
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (broadcast.status === "READY") {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6 text-center">
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-green-900">
                🎙️ Studio Ready
              </h3>
              <p className="text-green-700">
                Studio is prepared and all systems are ready. Use the
                "Go Live" button on the mixing board below to start
                broadcasting.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (broadcast.status === "SCHEDULED") {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-6 text-center">
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-blue-900">
                📅 Broadcast Scheduled
              </h3>
              <p className="text-blue-700">
                This broadcast is scheduled. Please use "Prepare Studio"
                from the broadcasts page first.
              </p>
            </div>
            <Button
              size="lg"
              onClick={onBackClick}
              variant="outline"
              className="px-8 py-4 text-lg"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Broadcasts
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-gray-200 bg-gray-50">
      <CardContent className="p-6 text-center">
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              ❌ Studio Unavailable
            </h3>
            <p className="text-gray-700">
              This broadcast is not available for studio access.
            </p>
          </div>
          <Button
            size="lg"
            onClick={onBackClick}
            variant="outline"
            className="px-8 py-4 text-lg"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Broadcasts
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}