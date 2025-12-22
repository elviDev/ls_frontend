import { HLSListener } from '@/contexts/broadcast/streaming/hls-listener';
import { SRSListener } from '@/contexts/broadcast/streaming/srs-listener';

export type PlayerState = 'idle' | 'loading' | 'playing' | 'paused' | 'error' | 'buffering';

export interface AudioPlayerOptions {
  onStateChange?: (state: PlayerState) => void;
  onError?: (error: Error) => void;
  onVolumeChange?: (volume: number) => void;
  preferWebRTC?: boolean;
}

export class AudioPlayer {
  private hlsListener: HLSListener | null = null;
  private webrtcListener: SRSListener | null = null;
  private currentState: PlayerState = 'idle';
  private currentVolume = 80;
  private isMuted = false;
  private _currentStreamUrl: string | null = null;
  private options: AudioPlayerOptions;

  constructor(options: AudioPlayerOptions = {}) {
    this.options = options;
  }

  async play(streamUrl: string): Promise<void> {
    try {
      // Prevent playing the same stream URL if already playing
      if (this._currentStreamUrl === streamUrl && this.currentState === 'playing') {
        return;
      }

      this.setState('loading');
      
      // Stop any existing playback
      this.stop();
      
      this._currentStreamUrl = streamUrl;

      if (this.isHLSUrl(streamUrl)) {
        await this.playHLS(streamUrl);
      } else if (this.isWebRTCUrl(streamUrl)) {
        await this.playWebRTC(streamUrl);
      } else {
        throw new Error('Unsupported stream format');
      }

      // Don't set to playing here - let the listener callbacks handle state changes
    } catch (error) {
      this.setState('error');
      this._currentStreamUrl = null;
      this.options.onError?.(error instanceof Error ? error : new Error('Playback failed'));
      throw error;
    }
  }

  private async playHLS(streamUrl: string): Promise<void> {
    this.hlsListener = new HLSListener(streamUrl, {
      onError: (error) => {
        this.setState('error');
        this.options.onError?.(error);
      },
      onStateChange: (state) => {
        const stateMap: Record<string, PlayerState> = {
          loading: 'loading',
          playing: 'playing',
          paused: 'paused',
          error: 'error',
          buffering: 'buffering'
        };
        this.setState(stateMap[state] || 'idle');
      }
    });

    await this.hlsListener.startListening();
    this.applyAudioSettings();
  }

  private async playWebRTC(streamUrl: string): Promise<void> {
    // Extract stream key from WebRTC URL
    const url = new URL(streamUrl);
    const streamKey = url.searchParams.get('stream') || 'default';
    const srsUrl = `${url.protocol}//${url.host}`;

    this.webrtcListener = new SRSListener(srsUrl, streamKey, {
      onError: (error) => {
        this.setState('error');
        this.options.onError?.(error);
      },
      onStateChange: (state) => {
        const stateMap: Record<string, PlayerState> = {
          connecting: 'loading',
          playing: 'playing',
          stopped: 'paused',
          error: 'error'
        };
        this.setState(stateMap[state] || 'idle');
      }
    });

    await this.webrtcListener.startListening();
    this.applyAudioSettings();
  }

  stop(): void {
    if (this.hlsListener) {
      this.hlsListener.destroy();
      this.hlsListener = null;
    }

    if (this.webrtcListener) {
      this.webrtcListener.destroy();
      this.webrtcListener = null;
    }

    this._currentStreamUrl = null;
    this.setState('idle');
  }

  pause(): void {
    // For live streams, pause is essentially stop
    this.stop();
  }

  setVolume(volume: number): void {
    this.currentVolume = Math.max(0, Math.min(100, volume));
    this.applyAudioSettings();
    this.options.onVolumeChange?.(this.currentVolume);
  }

  setMuted(muted: boolean): void {
    this.isMuted = muted;
    this.applyAudioSettings();
  }

  getVolume(): number {
    return this.currentVolume;
  }

  getMuted(): boolean {
    return this.isMuted;
  }

  getState(): PlayerState {
    return this.currentState;
  }

  get currentStreamUrl(): string | null {
    return this._currentStreamUrl;
  }

  isPlaying(): boolean {
    return this.currentState === 'playing';
  }

  getBufferHealth(): number {
    if (this.hlsListener) {
      return this.hlsListener.getBufferHealth();
    }
    return 0;
  }

  getConnectionQuality(): 'excellent' | 'good' | 'fair' | 'poor' {
    if (this.hlsListener) {
      return this.hlsListener.getConnectionQuality();
    }
    return 'good';
  }

  private setState(state: PlayerState): void {
    if (this.currentState !== state) {
      this.currentState = state;
      this.options.onStateChange?.(state);
    }
  }

  private applyAudioSettings(): void {
    if (this.hlsListener) {
      this.hlsListener.setVolume(this.currentVolume);
      this.hlsListener.setMuted(this.isMuted);
    }

    if (this.webrtcListener) {
      this.webrtcListener.setVolume(this.currentVolume);
      this.webrtcListener.mute(this.isMuted);
    }
  }

  private isHLSUrl(url: string): boolean {
    return url.includes('.m3u8') || url.includes('/hls/');
  }

  private isWebRTCUrl(url: string): boolean {
    return url.includes('/whep/') || url.includes('/rtc/');
  }

  destroy(): void {
    this.stop();
  }
}