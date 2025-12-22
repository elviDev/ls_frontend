import { StudioMixer } from './studio-mixer';
import { StreamingManager, StreamingState } from '../streaming/streaming-manager';
import { StudioUser, AudioChannel } from '../types';

export class SRSStudio {
  private mixer: StudioMixer;
  private streamingManager: StreamingManager | null = null;
  private isStreaming = false;
  private srsUrl: string;
  private streamKey: string;
  private onError?: (error: Error) => void;
  private onStateChange?: (state: 'connecting' | 'streaming' | 'stopped' | 'error') => void;

  constructor(srsUrl: string, streamKey: string, options?: {
    onError?: (error: Error) => void;
    onStateChange?: (state: 'connecting' | 'streaming' | 'stopped' | 'error') => void;
  }) {
    this.srsUrl = srsUrl;
    this.streamKey = streamKey;
    this.onError = options?.onError;
    this.onStateChange = options?.onStateChange;
    
    this.mixer = new StudioMixer({
      onError: this.onError,
      onMetricsUpdate: (metrics) => {
        // Metrics are available but not logged to avoid spam
      }
    });
  }

  async initialize(): Promise<void> {
    await this.mixer.initialize();
  }

  async addUser(user: StudioUser, audioStream?: MediaStream): Promise<void> {
    if (user.audioChannel && audioStream) {
      this.mixer.addChannel(user.audioChannel, audioStream);
    }
  }

  removeUser(userId: string): void {
    this.mixer.removeChannel(userId);
  }

  updateChannelSettings(channelId: string, settings: Partial<AudioChannel>): void {
    this.mixer.updateChannel(channelId, settings);
  }

  setMasterVolume(volume: number): void {
    this.mixer.setMasterVolume(volume);
  }

  async startStreaming(): Promise<void> {
    if (this.isStreaming) return;

    try {
      this.onStateChange?.('connecting');
      
      const outputStream = this.mixer.getOutputStream();
      
      if (!outputStream || outputStream.getAudioTracks().length === 0) {
        throw new Error('No audio output available from mixer');
      }
      
      this.streamingManager = new StreamingManager({
        srsUrl: this.srsUrl,
        streamKey: this.streamKey,
        protocol: 'webrtc',
        mode: 'broadcast'
      }, {
        onError: this.onError,
        onStateChange: (state: StreamingState) => {
          // Filter states to match SRSStudio's expected states
          if (state === 'connecting' || state === 'streaming' || state === 'stopped' || state === 'error') {
            this.onStateChange?.(state);
          }
        }
      });
      
      await this.streamingManager.startBroadcast(outputStream);
      this.isStreaming = true;
      
    } catch (error) {
      this.onError?.(error instanceof Error ? error : new Error('Failed to start streaming'));
      throw error;
    }
  }

  stopStreaming(): void {
    if (this.streamingManager) {
      this.streamingManager.stop();
      this.streamingManager = null;
    }

    this.isStreaming = false;
    this.onStateChange?.('stopped');
  }

  getStreamUrls(): { webrtc?: string; hls?: string } {
    return this.streamingManager?.getStreamUrls() || {};
  }

  isLive(): boolean {
    return this.streamingManager?.isActive() || false;
  }

  cleanup(): void {
    this.stopStreaming();
    this.mixer.cleanup();
  }
}