// Studio Controller - Main interface for radio broadcasting using SRS
// Handles multiple hosts, guests, and audio mixing with HLS streaming

import { SRSStudio } from '@/contexts/broadcast/studio/srs-studio'
import { SRSBroadcaster } from '@/contexts/broadcast/streaming/srs-broadcaster'

export interface StudioConfig {
  broadcastId: string
  stationName: string
  maxHosts: number
  maxGuests: number
}

export interface HostConfig {
  id: string
  name: string
  role: 'main' | 'co-host'
  volume: number
}

export interface GuestConfig {
  id: string
  name: string
  volume: number
}

export class StudioController {
  private srsStudio: SRSStudio
  private config: StudioConfig
  private hosts = new Map<string, HostConfig>()
  private guests = new Map<string, GuestConfig>()
  private isLive = false

  constructor(config: StudioConfig) {
    this.config = config
    this.srsStudio = new SRSStudio(
      process.env.NEXT_PUBLIC_SRS_URL || 'http://localhost:1985',
      config.broadcastId,
      {
        onStateChange: (state) => {
          this.isLive = state === 'streaming'
          this.onBroadcastStateChange?.(state === 'streaming' ? 'live' : 'stopped')
        },
        onError: (error) => {
          console.error('Studio error:', error)
        }
      }
    )

    this.setupEventHandlers()
  }

  private setupEventHandlers(): void {
    // Event handlers are now set up in the constructor
  }

  // Initialize the studio
  async initialize(): Promise<void> {
    try {
      console.log('🎙️ Initializing studio controller...')
      await this.srsStudio.initialize()
      console.log('🎙️ Studio controller initialized successfully')
    } catch (error) {
      console.error('Failed to initialize studio:', error)
      throw error
    }
  }

  // Add a host to the broadcast
  async addHost(hostConfig: HostConfig): Promise<void> {
    if (this.hosts.size >= this.config.maxHosts) {
      throw new Error('Maximum number of hosts reached')
    }

    try {
      console.log(`🎤 Adding host: ${hostConfig.name} (${hostConfig.role})`)
      
      // SRSStudio uses addUser method
      await this.srsStudio.addUser({
        id: hostConfig.id,
        username: hostConfig.name,
        role: 'host',
        permissions: {
          canControlMixer: true,
          canManageGuests: true,
          canPlayMedia: true,
          canModerateChat: false
        },
        audioChannel: {
          id: hostConfig.id,
          name: hostConfig.name,
          type: 'master',
          volume: hostConfig.volume,
          isMuted: false,
          isActive: true,
          eq: { high: 0, mid: 0, low: 0 },
          effects: { compressor: false, reverb: 0, gate: false }
        },
        isConnected: true
      })
      this.hosts.set(hostConfig.id, hostConfig)
      console.log(`🎤 Successfully added host: ${hostConfig.name} (${hostConfig.role})`)
    } catch (error) {
      console.error(`Failed to add host ${hostConfig.name}:`, error)
      throw error
    }
  }

  // Add a guest to the broadcast
  async addGuest(guestConfig: GuestConfig): Promise<void> {
    if (this.guests.size >= this.config.maxGuests) {
      throw new Error('Maximum number of guests reached')
    }

    try {
      // SRSStudio uses addUser method
      await this.srsStudio.addUser({
        id: guestConfig.id,
        username: guestConfig.name,
        role: 'guest',
        permissions: {
          canControlMixer: false,
          canManageGuests: false,
          canPlayMedia: false,
          canModerateChat: false
        },
        audioChannel: {
          id: guestConfig.id,
          name: guestConfig.name,
          type: 'guest',
          volume: guestConfig.volume,
          isMuted: false,
          isActive: true,
          eq: { high: 0, mid: 0, low: 0 },
          effects: { compressor: false, reverb: 0, gate: false }
        },
        isConnected: true
      })
      this.guests.set(guestConfig.id, guestConfig)
      console.log(`👥 Added guest: ${guestConfig.name}`)
    } catch (error) {
      console.error(`Failed to add guest ${guestConfig.name}:`, error)
      throw error
    }
  }

  // Remove a host
  removeHost(hostId: string): void {
    const host = this.hosts.get(hostId)
    if (host) {
      this.srsStudio.removeUser(hostId)
      this.hosts.delete(hostId)
      console.log(`🔇 Removed host: ${host.name}`)
    }
  }

  // Remove a guest
  removeGuest(guestId: string): void {
    const guest = this.guests.get(guestId)
    if (guest) {
      this.srsStudio.removeUser(guestId)
      this.guests.delete(guestId)
      console.log(`🔇 Removed guest: ${guest.name}`)
    }
  }

  // Set host volume
  setHostVolume(hostId: string, volume: number): void {
    const host = this.hosts.get(hostId)
    if (host) {
      host.volume = volume
      this.srsStudio.updateChannelSettings(hostId, { volume })
      console.log(`🎚️ Set volume for ${host.name}: ${Math.round(volume * 100)}%`)
    }
  }

  // Set guest volume
  setGuestVolume(guestId: string, volume: number): void {
    const guest = this.guests.get(guestId)
    if (guest) {
      guest.volume = volume
      this.srsStudio.updateChannelSettings(guestId, { volume })
      console.log(`🎚️ Set volume for ${guest.name}: ${Math.round(volume * 100)}%`)
    }
  }

  // Mute/unmute a host
  muteHost(hostId: string, muted: boolean): void {
    this.srsStudio.updateChannelSettings(hostId, { isMuted: muted })
    console.log(`${muted ? '🔇' : '🔊'} ${muted ? 'Muted' : 'Unmuted'} host: ${hostId}`)
  }

  // Mute/unmute a guest
  muteGuest(guestId: string, muted: boolean): void {
    this.srsStudio.updateChannelSettings(guestId, { isMuted: muted })
    console.log(`${muted ? '🔇' : '🔊'} ${muted ? 'Muted' : 'Unmuted'} guest: ${guestId}`)
  }

  // Start the live broadcast
  async startBroadcast(): Promise<void> {
    if (this.isLive) {
      throw new Error('Broadcast is already live')
    }

    if (this.hosts.size === 0) {
      throw new Error('At least one host is required to start broadcast')
    }

    try {
      console.log('📻 Starting live broadcast...')
      await this.srsStudio.startStreaming()
      this.isLive = true
      console.log('📻 Live broadcast started successfully')
    } catch (error) {
      console.error('Failed to start broadcast:', error)
      throw error
    }
  }

  // Stop the live broadcast
  stopBroadcast(): void {
    if (!this.isLive) return

    this.srsStudio.stopStreaming()
    this.isLive = false
    console.log('🛑 Live broadcast stopped')
  }

  // Get current studio status
  getStatus() {
    return {
      isLive: this.isLive,
      hosts: Array.from(this.hosts.values()),
      guests: Array.from(this.guests.values()),
      streamUrl: `${process.env.NEXT_PUBLIC_SRS_URL || 'http://localhost:1985'}/live/${this.config.broadcastId}.m3u8`
    }
  }

  // Get available microphones
  async getAvailableMicrophones(): Promise<MediaDeviceInfo[]> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      return devices.filter(device => device.kind === 'audioinput')
    } catch (error) {
      console.error('Failed to get microphones:', error)
      return []
    }
  }

  // Cleanup
  cleanup(): void {
    this.stopBroadcast()
    this.srsStudio.cleanup()
    this.hosts.clear()
    this.guests.clear()
    console.log('🧹 Studio controller cleaned up')
  }

  // Event callbacks
  public onBroadcastStateChange?: (state: 'live' | 'stopped') => void
}

// Helper function to create a studio controller
export function createStudioController(config: StudioConfig): StudioController {
  return new StudioController(config)
}