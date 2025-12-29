"use client"

import { useState, useEffect, useCallback } from "react"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"
import { useBroadcastStore } from "@/stores/broadcast-store"
import type { Broadcast } from "../types"

export function useStudioData(broadcastSlug: string) {
  const [broadcast, setBroadcast] = useState<Broadcast | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { setBroadcast: setStoreBroadcast } = useBroadcastStore()

  const fetchBroadcast = useCallback(async () => {
    try {
      const response = await apiClient.request(`/broadcasts/${broadcastSlug}`)
      if (response.ok) {
        const data = await response.json()
        setBroadcast(data)
        // Update the Zustand store with the broadcast data
        setStoreBroadcast(data)
      } else {
        toast.error("Failed to load broadcast")
      }
    } catch (error) {
      console.error("Error fetching broadcast:", error)
      toast.error("Error loading broadcast")
    } finally {
      setIsLoading(false)
    }
  }, [broadcastSlug, setStoreBroadcast])

  useEffect(() => {
    if (broadcastSlug) {
      fetchBroadcast()
    }
  }, [broadcastSlug, fetchBroadcast])

  const updateBroadcastStatus = useCallback(async (status: string) => {
    try {
      const response = await apiClient.request(`/broadcasts/${broadcastSlug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        const updatedBroadcast = await response.json()
        setBroadcast(updatedBroadcast)
        // Update the Zustand store with the updated broadcast
        setStoreBroadcast(updatedBroadcast)
        return updatedBroadcast
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update broadcast status")
      }
    } catch (error) {
      console.error("Error updating broadcast:", error)
      throw error
    }
  }, [broadcastSlug, setStoreBroadcast])

  return {
    broadcast,
    isLoading,
    updateBroadcastStatus,
    refetch: fetchBroadcast
  }
}