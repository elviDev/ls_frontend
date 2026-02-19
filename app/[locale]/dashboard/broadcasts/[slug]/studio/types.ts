export type Broadcast = {
  id: string
  title: string
  slug: string
  description: string
  status: "LIVE" | "SCHEDULED" | "READY" | "ENDED"
  startTime: string
  endTime?: string
  streamUrl?: string
  hostUser: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  banner?: {
    id: string
    url: string
    originalName: string
    type: string
  }
  staff: BroadcastStaff[]
  guests: BroadcastGuest[]
}

export type BroadcastStaff = {
  id: string
  role: "HOST" | "CO_HOST" | "PRODUCER" | "SOUND_ENGINEER" | "GUEST" | "MODERATOR"
  user: {
    id: string
    firstName: string
    lastName: string
    username: string
    email: string
    profileImage?: string
  }
  isActive: boolean
}

export type BroadcastGuest = {
  id: string
  name: string
  title?: string
  role: string
}

export type StreamStatus = {
  isConnected: boolean
  quality: number
  bitrate: number
  latency: number
  dropped: number
  errors: string[]
}

export type StudioMetrics = {
  cpuUsage: number
  memoryUsage: number
  networkStatus: "excellent" | "good" | "poor" | "offline"
  audioLevels: {
    input: number
    output: number
    peak: number
  }
}