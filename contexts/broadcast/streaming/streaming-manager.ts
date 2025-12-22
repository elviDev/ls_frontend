import { SRSBroadcaster } from './srs-broadcaster';
import { SRSListener } from './srs-listener';
import { HLSListener } from './hls-listener';

export type StreamingState = 'connecting' | 'streaming' | 'stopped' | 'error' | 'loading' | 'playing' | 'paused' | 'buffering';
export type StreamingProtocol = 'webrtc' | 'hls';
export type StreamingMode = 'broadcast' | 'listen';

export interface StreamingConfig {
  srsUrl: string;
  streamKey: string;
  protocol: StreamingProtocol;
  mode: StreamingMode;
  fallbackToHLS?: boolean;
}

export class StreamingManager {
  private broadcaster: SRSBroadcaster | null = null;
  private listener: SRSListener | HLSListener | null = null;
  private config: StreamingConfig;
  private onError?: (error: Error) => void;
  private onStateChange?: (state: StreamingState) => void;

  constructor(config: StreamingConfig, options?: {
    onError?: (error: Error) => void;
    onStateChange?: (state: StreamingState) => void;
  }) {
    this.config = config;
    this.onError = options?.onError;
    this.onStateChange = options?.onStateChange;
  }

  async startBroadcast(inputStream: MediaStream): Promise<void> {
    if (this.config.mode !== 'broadcast') {
      throw new Error('Manager not configured for broadcasting');
    }

    try {
      this.broadcaster = new SRSBroadcaster(this.config.srsUrl, this.config.streamKey, {
        onError: this.onError,
        onStateChange: this.onStateChange
      });

      await this.broadcaster.startBroadcast(inputStream);
    } catch (error) {
      this.onError?.(error instanceof Error ? error : new Error('Broadcast failed'));
      throw error;
    }
  }

  async startListening(audioElement?: HTMLAudioElement): Promise<void> {
    if (this.config.mode !== 'listen') {
      throw new Error('Manager not configured for listening');
    }

    try {
      if (this.config.protocol === 'webrtc') {
        this.listener = new SRSListener(this.config.srsUrl, this.config.streamKey, {
          onError: this.handleListenerError.bind(this),
          onStateChange: this.onStateChange
        });
        await (this.listener as SRSListener).startListening(audioElement);
      } else {
        const hlsUrl = `${this.config.srsUrl}/live/${this.config.streamKey}.m3u8`;
        this.listener = new HLSListener(hlsUrl, {
          onError: this.onError,
          onStateChange: this.onStateChange
        });
        await (this.listener as HLSListener).startListening();
      }
    } catch (error) {
      if (this.config.fallbackToHLS && this.config.protocol === 'webrtc') {
        await this.fallbackToHLS(audioElement);
      } else {
        throw error;
      }
    }
  }

  private async fallbackToHLS(audioElement?: HTMLAudioElement): Promise<void> {
    try {
      const hlsUrl = `${this.config.srsUrl}/live/${this.config.streamKey}.m3u8`;
      this.listener = new HLSListener(hlsUrl, {
        onError: this.onError,
        onStateChange: this.onStateChange
      });
      await (this.listener as HLSListener).startListening();
    } catch (error) {
      this.onError?.(new Error('Both WebRTC and HLS failed'));
      throw error;
    }
  }

  private handleListenerError(error: Error): void {
    if (this.config.fallbackToHLS && this.config.protocol === 'webrtc') {
      this.fallbackToHLS().catch(() => {
        this.onError?.(error);
      });
    } else {
      this.onError?.(error);
    }
  }

  stop(): void {
    if (this.broadcaster) {
      this.broadcaster.destroy();
      this.broadcaster = null;
    }
    if (this.listener) {
      this.listener.destroy();
      this.listener = null;
    }
  }

  getStreamUrls(): { webrtc?: string; hls?: string } {
    return {
      webrtc: this.broadcaster?.getWebRTCPlayUrl(),
      hls: `${this.config.srsUrl}/live/${this.config.streamKey}.m3u8`
    };
  }

  isActive(): boolean {
    return this.broadcaster?.isLive() || this.listener?.isPlaying() || false;
  }
}