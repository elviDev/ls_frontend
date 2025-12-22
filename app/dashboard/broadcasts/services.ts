import { toast } from "sonner"
import type { Broadcast, StaffMember, Asset, Program } from "./types"

export class BroadcastService {
  static async fetchBroadcasts(programId?: string | null) {
    try {
      const params = new URLSearchParams({ perPage: '100' })
      if (programId && programId !== "null") {
        params.set('programId', programId)
      } else if (programId === "null") {
        params.set('programId', 'null')
      }
      
      const response = await fetch(`/api/admin/broadcasts?${params}`)
      if (!response.ok) {
        throw new Error(this.getErrorMessage(response.status, 'broadcasts'))
      }
      
      const data = await response.json()
      return { broadcasts: data.broadcasts || [] }
    } catch (error) {
      console.error('Error fetching broadcasts:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to load broadcasts')
      return { broadcasts: [] }
    }
  }

  static async fetchStaff() {
    try {
      const response = await fetch('/api/admin/staff')
      if (!response.ok) {
        throw new Error(this.getErrorMessage(response.status, 'staff'))
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching staff:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to load staff members')
      return { staff: [] }
    }
  }

  static async fetchAssets() {
    try {
      const response = await fetch('/api/admin/assets?type=IMAGE&perPage=50')
      if (!response.ok) {
        throw new Error(this.getErrorMessage(response.status, 'assets'))
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching assets:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to load assets')
      return { assets: [] }
    }
  }

  static async fetchPrograms() {
    try {
      const response = await fetch('/api/admin/programs?perPage=100')
      if (!response.ok) {
        throw new Error(this.getErrorMessage(response.status, 'programs'))
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching programs:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to load programs')
      return { programs: [] }
    }
  }

  private static getErrorMessage(status: number, resource: string): string {
    if (status === 403) {
      return `You do not have permission to view ${resource}`
    } else if (status === 404) {
      return `${resource} endpoint not found`
    } else {
      return `Failed to fetch ${resource} (${status})`
    }
  }
}