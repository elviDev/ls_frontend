import { globalAudio } from '@/components/live-player/services/global-audio';

export class HLSListener {
  private audio: HTMLAudioElement;
  private hls: any;
  private streamUrl: string;
  private isListening = false;
  private retryCount = 0;
  private maxRetries = 3;
  private retryTimeout: NodeJS.Timeout | null = null;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private onError?: (error: Error) => void;
  private onStateChange?: (state: 'loading' | 'playing' | 'paused' | 'error' | 'buffering') => void;

  constructor(streamUrl: string, options?: {
    onError?: (error: Error) => void;
    onStateChange?: (state: 'loading' | 'playing' | 'paused' | 'error' | 'buffering') => void;
    maxRetries?: number;
  }) {
    if (!streamUrl?.trim()) {
      throw new Error('Stream URL is required');
    }
    
    this.streamUrl = streamUrl;
    this.onError = options?.onError;
    this.onStateChange = options?.onStateChange;
    this.maxRetries = options?.maxRetries ?? 3;
    
    console.log('🎵 [HLSListener] Using global audio element for URL:', streamUrl);
    this.audio = globalAudio.getAudioElement();
    globalAudio.setCurrentHlsListener(this);
    this.setupAudioEvents();
  }

  private setupAudioEvents(): void {
    // Remove existing listeners first to prevent duplicates
    const events = ['loadstart', 'canplay', 'playing', 'pause', 'error', 'stalled', 'waiting', 'ended', 'abort'];
    events.forEach(event => {
      const oldListeners = (this.audio as any)._listeners?.[event] || [];
      oldListeners.forEach((listener: any) => {
        this.audio.removeEventListener(event, listener);
      });
    });

    this.audio.addEventListener('loadstart', () => {
      this.onStateChange?.('loading');
    });

    this.audio.addEventListener('canplay', () => {
      this.retryCount = 0; // Reset on successful load
    });

    this.audio.addEventListener('playing', () => {
      this.isListening = true;
      this.onStateChange?.('playing');
      this.startHealthCheck();
    });

    this.audio.addEventListener('pause', () => {
      this.isListening = false;
      this.onStateChange?.('paused');
      this.stopHealthCheck();
    });

    this.audio.addEventListener('error', (e) => {
      const error = new Error(`Audio error: ${this.audio.error?.message || 'Unknown error'}`);
      this.handleError(error);
    });

    this.audio.addEventListener('stalled', () => {
      this.handleStall();
    });

    this.audio.addEventListener('waiting', () => {
      this.onStateChange?.('buffering');
    });

    this.audio.addEventListener('ended', () => {
      this.handleStreamEnd();
    });

    this.audio.addEventListener('abort', () => {
      this.isListening = false;
    });
  }

  async startListening(): Promise<void> {
    try {
      if (this.isListening) {
        return; // Already listening
      }

      this.clearRetryTimeout();
      
      // Validate stream URL
      if (!this.isValidStreamUrl(this.streamUrl)) {
        throw new Error('Invalid stream URL format');
      }

      // Load HLS.js if needed
      if (!window.Hls && this.streamUrl.includes('.m3u8')) {
        await this.loadHLSLibrary();
      }

      if (window.Hls?.isSupported()) {
        await this.setupHLSPlayer();
      } else if (this.audio.canPlayType('application/vnd.apple.mpegurl')) {
        this.audio.src = this.streamUrl;
      } else {
        throw new Error('HLS streaming not supported in this browser');
      }

      // Attempt to play with timeout
      await this.playWithTimeout(10000);
      
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to start listening');
      this.handleError(err);
      throw err;
    }
  }

  stopListening(): void {
    try {
      this.clearRetryTimeout();
      this.stopHealthCheck();
      
      if (this.audio) {
        this.audio.pause();
        this.audio.currentTime = 0;
        this.audio.src = '';
      }

      if (this.hls) {
        this.hls.destroy();
        this.hls = null;
      }

      this.isListening = false;
      this.retryCount = 0;
    } catch (error) {
      console.warn('Error during stop:', error);
    }
  }

  setVolume(volume: number): void {
    try {
      const clampedVolume = Math.max(0, Math.min(100, volume));
      this.audio.volume = clampedVolume / 100;
    } catch (error) {
      console.warn('Failed to set volume:', error);
    }
  }

  setMuted(muted: boolean): void {
    try {
      this.audio.muted = muted;
    } catch (error) {
      console.warn('Failed to set mute:', error);
    }
  }

  getVolume(): number {
    try {
      return Math.round(this.audio.volume * 100);
    } catch {
      return 0;
    }
  }

  isMuted(): boolean {
    try {
      return this.audio.muted;
    } catch {
      return false;
    }
  }

  isPlaying(): boolean {
    try {
      return this.isListening && !this.audio.paused && this.audio.readyState >= 2;
    } catch {
      return false;
    }
  }

  getBufferHealth(): number {
    try {
      if (this.audio.buffered.length > 0) {
        const buffered = this.audio.buffered.end(this.audio.buffered.length - 1);
        const current = this.audio.currentTime;
        return Math.max(0, buffered - current);
      }
      return 0;
    } catch {
      return 0;
    }
  }

  getConnectionQuality(): 'excellent' | 'good' | 'fair' | 'poor' {
    const bufferHealth = this.getBufferHealth();
    if (bufferHealth > 10) return 'excellent';
    if (bufferHealth > 5) return 'good';
    if (bufferHealth > 2) return 'fair';
    return 'poor';
  }

  private async setupHLSPlayer(): Promise<void> {
    this.hls = new window.Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90,
      maxBufferLength: 30,
      maxMaxBufferLength: 600,
      startLevel: -1, // Auto quality
      capLevelToPlayerSize: true
    });

    this.hls.loadSource(this.streamUrl);
    this.hls.attachMedia(this.audio);

    this.hls.on(window.Hls.Events.ERROR, (event: any, data: any) => {
      this.handleHLSError(data);
    });
  }

  private handleHLSError(data: any): void {
    if (data.fatal) {
      switch (data.type) {
        case window.Hls.ErrorTypes.NETWORK_ERROR:
          this.retryConnection();
          break;
        case window.Hls.ErrorTypes.MEDIA_ERROR:
          this.hls?.recoverMediaError();
          break;
        default:
          this.handleError(new Error(`HLS fatal error: ${data.details}`));
          break;
      }
    }
  }

  private async playWithTimeout(timeout: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Play timeout'));
      }, timeout);

      this.audio.play()
        .then(() => {
          clearTimeout(timeoutId);
          resolve();
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  }

  private handleError(error: Error): void {
    this.isListening = false;
    this.onStateChange?.('error');
    this.onError?.(error);
    
    if (this.retryCount < this.maxRetries) {
      this.retryConnection();
    }
  }

  private retryConnection(): void {
    if (this.retryCount >= this.maxRetries) {
      this.onError?.(new Error('Max retry attempts reached'));
      return;
    }

    this.retryCount++;
    const delay = Math.min(1000 * Math.pow(2, this.retryCount - 1), 10000);
    
    this.retryTimeout = setTimeout(() => {
      this.startListening().catch(() => {
        // Error already handled in startListening
      });
    }, delay);
  }

  private handleStall(): void {
    if (this.isListening) {
      // Try to recover from stall
      setTimeout(() => {
        if (this.audio.readyState < 3) {
          this.retryConnection();
        }
      }, 5000);
    }
  }

  private handleStreamEnd(): void {
    // Stream ended unexpectedly, try to reconnect
    if (this.isListening) {
      this.retryConnection();
    }
  }

  private startHealthCheck(): void {
    this.stopHealthCheck();
    this.healthCheckInterval = setInterval(() => {
      if (this.isListening && this.audio.readyState < 2) {
        this.handleError(new Error('Stream health check failed'));
      }
    }, 30000);
  }

  private stopHealthCheck(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  private clearRetryTimeout(): void {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }
  }

  private isValidStreamUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }

  private async loadHLSLibrary(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.Hls) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.4.12/dist/hls.min.js';
      script.onload = () => {
        if (window.Hls) {
          resolve();
        } else {
          reject(new Error('HLS.js failed to initialize'));
        }
      };
      script.onerror = () => reject(new Error('Failed to load HLS.js library'));
      
      // Timeout for script loading
      setTimeout(() => reject(new Error('HLS.js load timeout')), 10000);
      
      document.head.appendChild(script);
    });
  }

  destroy(): void {
    this.stopListening();
    this.clearRetryTimeout();
    this.stopHealthCheck();
  }
}

declare global {
  interface Window {
    Hls: any;
  }
}