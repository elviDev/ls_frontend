export type Broadcast = {
  id: string
  title: string
  slug: string
  description: string
  status: "LIVE" | "SCHEDULED" | "READY" | "ENDED"
  hostUser?: {
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
  program?: {
    id: string
    title: string
    slug: string
  }
  staff?: BroadcastStaff[]
  guests?: BroadcastGuest[]
  startTime: string
  endTime?: string
  streamUrl?: string
  createdAt: string
  updatedAt: string
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

export type StaffMember = {
  id: string
  firstName: string
  lastName: string
  username: string
  email: string
  role: "HOST" | "CO_HOST" | "PRODUCER" | "SOUND_ENGINEER" | "ADMIN"
  profileImage?: string
}

export type Asset = {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  type: "IMAGE" | "AUDIO" | "VIDEO" | "DOCUMENT"
  url: string
  description?: string
  tags?: string
  uploadedBy: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  createdAt: string
}

export type Program = {
  id: string
  title: string
  slug: string
  category: string
  status: string
}

export type BroadcastFilters = {
  status: "all" | "LIVE" | "SCHEDULED" | "READY" | "ENDED"
  program: string
  search: string
}