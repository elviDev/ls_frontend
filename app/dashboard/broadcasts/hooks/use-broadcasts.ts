import { useState, useEffect } from "react"
import { BroadcastService } from "../services"
import type { Broadcast, StaffMember, Asset, Program, BroadcastFilters } from "../types"

export function useBroadcasts(programIdFromUrl?: string | null) {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([])
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [filters, setFilters] = useState<BroadcastFilters>({
    status: "all",
    program: programIdFromUrl || "all",
    search: ""
  })

  const loadData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const [broadcastsData, staffData, assetsData, programsData] = await Promise.all([
        BroadcastService.fetchBroadcasts(filters.program === "all" ? undefined : filters.program),
        BroadcastService.fetchStaff(),
        BroadcastService.fetchAssets(),
        BroadcastService.fetchPrograms()
      ])

      setBroadcasts(broadcastsData.broadcasts)
      setStaff(staffData.staff || [])
      setAssets(assetsData.assets || [])
      setPrograms(programsData.programs || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredBroadcasts = broadcasts.filter(broadcast => {
    const matchesStatus = filters.status === "all" || broadcast.status === filters.status
    const matchesProgram = filters.program === "all" || 
      (filters.program === "null" && !broadcast.program) ||
      broadcast.program?.id === filters.program
    const matchesSearch = !filters.search || 
      broadcast.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      broadcast.description?.toLowerCase().includes(filters.search.toLowerCase())
    
    return matchesStatus && matchesProgram && matchesSearch
  })

  useEffect(() => {
    loadData()
  }, [filters.program])

  return {
    broadcasts: filteredBroadcasts,
    staff,
    assets,
    programs,
    isLoading,
    error,
    filters,
    setFilters,
    refetch: loadData
  }
}