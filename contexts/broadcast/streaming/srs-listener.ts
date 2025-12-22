export class SRSListener {
  private peerConnection: RTCPeerConnection | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private isListening = false;
  private srsUrl: string;
  private streamKey: string;
  private onError?: (error: Error) => void;
  private onStateChange?: (state: 'connecting' | 'playing' | 'stopped' | 'error') => void;

  constructor(srsUrl: string, streamKey: string, options?: {
    onError?: (error: Error) => void;
    onStateChange?: (state: 'connecting' | 'playing' | 'stopped' | 'error') => void;
  }) {
    this.srsUrl = srsUrl;
    this.streamKey = streamKey;
    this.onError = options?.onError;
    this.onStateChange = options?.onStateChange;
  }

  async startListening(audioElement?: HTMLAudioElement): Promise<void> {
    if (this.isListening) return;

    try {
      this.onStateChange?.('connecting');
      
      // Use provided audio element or create one
      this.audioElement = audioElement || new Audio();
      
      // Create RTCPeerConnection for WebRTC playback
      this.peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });

      // Handle incoming stream
      this.peerConnection.ontrack = (event) => {
        if (this.audioElement && event.streams[0]) {
          this.audioElement.srcObject = event.streams[0];
          this.audioElement.play().then(() => {
            this.isListening = true;
            this.onStateChange?.('playing');
          }).catch(error => {
            this.handleError(new Error(`Failed to play audio: ${error.message}`));
          });
        }
      };

      // Create offer for WHEP
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: false
      });
      
      await this.peerConnection.setLocalDescription(offer);

      // Connect to SRS WebRTC WHEP endpoint
      const whepUrl = `${this.srsUrl}/rtc/v1/whep/?app=live&stream=${this.streamKey}`;
      
      const response = await fetch(whepUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/sdp'
        },
        body: offer.sdp
      });

      if (!response.ok) {
        throw new Error(`WHEP request failed: ${response.status}`);
      }

      const answerSdp = await response.text();
      const answer = new RTCSessionDescription({
        type: 'answer',
        sdp: answerSdp
      });

      await this.peerConnection.setRemoteDescription(answer);

      // Monitor connection state
      this.peerConnection.onconnectionstatechange = () => {
        const state = this.peerConnection?.connectionState;
        if (state === 'failed' || state === 'disconnected') {
          this.handleError(new Error('Connection lost'));
        }
      };
      
    } catch (error) {
      this.handleError(error instanceof Error ? error : new Error('Failed to start listening'));
      throw error;
    }
  }

  stopListening(): void {
    try {
      if (this.audioElement) {
        this.audioElement.pause();
        this.audioElement.srcObject = null;
      }

      if (this.peerConnection) {
        this.peerConnection.close();
        this.peerConnection = null;
      }

      this.isListening = false;
      this.onStateChange?.('stopped');
    } catch (error) {
      console.warn('Error stopping listener:', error);
    }
  }

  setVolume(volume: number): void {
    if (this.audioElement) {
      this.audioElement.volume = Math.max(0, Math.min(1, volume / 100));
    }
  }

  mute(muted: boolean): void {
    if (this.audioElement) {
      this.audioElement.muted = muted;
    }
  }

  isPlaying(): boolean {
    return this.isListening && this.peerConnection?.connectionState === 'connected';
  }

  getConnectionStats(): Promise<RTCStatsReport | null> {
    if (!this.peerConnection) return Promise.resolve(null);
    return this.peerConnection.getStats();
  }

  private handleError(error: Error): void {
    this.onError?.(error);
    this.onStateChange?.('error');
    this.isListening = false;
  }

  destroy(): void {
    this.stopListening();
  }
}