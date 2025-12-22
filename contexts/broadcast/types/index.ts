export interface AudioChannel {
  id: string;
  name: string;
  type: 'master' | 'guest' | 'music' | 'jingle' | 'ad';
  volume: number;
  isMuted: boolean;
  isActive: boolean;
  eq: {
    high: number;
    mid: number;
    low: number;
  };
  effects: {
    compressor: boolean;
    reverb: number;
    gate: boolean;
  };
}

export interface StudioUser {
  id: string;
  username: string;
  role: 'host' | 'co-host' | 'guest' | 'moderator' | 'producer';
  permissions: {
    canControlMixer: boolean;
    canManageGuests: boolean;
    canPlayMedia: boolean;
    canModerateChat: boolean;
  };
  audioChannel?: AudioChannel;
  isConnected: boolean;
}

export interface BroadcastState {
  isLive: boolean;
  studioUsers: StudioUser[];
  audioChannels: AudioChannel[];
  masterVolume: number;
  currentProgram?: {
    id: string;
    title: string;
    description: string;
    startTime: Date;
  };
  listenerCount: number;
  streamQuality: {
    bitrate: number;
    sampleRate: number;
    channels: number;
  };
}