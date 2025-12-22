export class SRSBroadcaster {
  private peerConnection: RTCPeerConnection | null = null;
  private websocket: WebSocket | null = null;
  private isStreaming = false;
  private srsUrl: string;
  private streamKey: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private currentInputStream: MediaStream | null = null;
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
  }

  async startBroadcast(inputStream: MediaStream): Promise<void> {
    if (this.isStreaming) return;

    try {
      console.log('📡 [SRSBroadcaster] Starting broadcast to:', this.srsUrl);
      console.log('📡 [SRSBroadcaster] Stream key:', this.streamKey);
      console.log('📡 [SRSBroadcaster] Input stream tracks:', inputStream.getTracks().length);
      
      this.currentInputStream = inputStream;
      this.onStateChange?.('connecting');
      
      // Create RTCPeerConnection for WebRTC streaming
      this.peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });

      // Add audio tracks to peer connection
      inputStream.getAudioTracks().forEach(track => {
        console.log('📡 [SRSBroadcaster] Adding audio track:', track.label, track.enabled);
        this.peerConnection!.addTrack(track, inputStream);
      });

      // Create offer
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: false,
        offerToReceiveVideo: false
      });
      
      console.log('📡 [SRSBroadcaster] Created offer SDP:', offer.sdp?.substring(0, 200) + '...');
      await this.peerConnection.setLocalDescription(offer);

      // Connect to SRS WebRTC WHIP endpoint
      const whipUrl = `${this.srsUrl}/rtc/v1/whip/?app=live&stream=${this.streamKey}`;
      console.log('📡 [SRSBroadcaster] WHIP URL:', whipUrl);
      
      const response = await fetch(whipUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/sdp'
        },
        body: offer.sdp
      });

      console.log('📡 [SRSBroadcaster] WHIP response:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('📡 [SRSBroadcaster] WHIP error response:', errorText);
        throw new Error(`WHIP request failed: ${response.status} - ${errorText}`);
      }

      const answerSdp = await response.text();
      console.log('📡 [SRSBroadcaster] Received answer SDP:', answerSdp.substring(0, 200) + '...');
      
      const answer = new RTCSessionDescription({
        type: 'answer',
        sdp: answerSdp
      });

      await this.peerConnection.setRemoteDescription(answer);
      console.log('📡 [SRSBroadcaster] Set remote description successfully');

      // Monitor connection state
      this.peerConnection.onconnectionstatechange = () => {
        const state = this.peerConnection?.connectionState;
        console.log('📡 [SRSBroadcaster] Connection state changed:', state);
        if (state === 'connected') {
          this.isStreaming = true;
          this.reconnectAttempts = 0;
          this.onStateChange?.('streaming');
          console.log('📡 [SRSBroadcaster] ✅ Successfully connected and streaming!');
          
          // Wait a bit for SRS to register the stream
          setTimeout(() => {
            console.log('📡 [SRSBroadcaster] Stream should now be available in SRS');
          }, 2000);
        } else if (state === 'failed' || state === 'disconnected') {
          console.log('📡 [SRSBroadcaster] ❌ Connection failed or disconnected');
          this.handleConnectionFailure();
        }
      };

      this.peerConnection.oniceconnectionstatechange = () => {
        const state = this.peerConnection?.iceConnectionState;
        console.log('📡 [SRSBroadcaster] ICE connection state changed:', state);
        if (state === 'failed') {
          this.handleConnectionFailure();
        }
      };
      
    } catch (error) {
      console.error('📡 [SRSBroadcaster] Failed to start broadcast:', error);
      this.handleError(error instanceof Error ? error : new Error('Failed to start broadcast'));
      throw error;
    }
  }

  stopBroadcast(): void {
    try {
      if (this.peerConnection) {
        this.peerConnection.close();
        this.peerConnection = null;
      }

      if (this.websocket) {
        this.websocket.close();
        this.websocket = null;
      }

      this.isStreaming = false;
      this.onStateChange?.('stopped');
    } catch (error) {
      console.warn('Error stopping broadcast:', error);
    }
  }

  getStreamUrl(): string {
    return `${this.srsUrl}/live/${this.streamKey}.m3u8`;
  }

  getWebRTCPlayUrl(): string {
    return `${this.srsUrl}/rtc/v1/whep/?app=live&stream=${this.streamKey}`;
  }

  isLive(): boolean {
    return this.isStreaming && this.peerConnection?.connectionState === 'connected';
  }

  getConnectionStats(): Promise<RTCStatsReport | null> {
    if (!this.peerConnection) return Promise.resolve(null);
    return this.peerConnection.getStats();
  }

  private async handleConnectionFailure(): Promise<void> {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      
      setTimeout(async () => {
        if (this.currentInputStream) {
          try {
            await this.startBroadcast(this.currentInputStream);
          } catch (error) {
            console.warn('Reconnection failed:', error);
          }
        }
      }, 2000 * this.reconnectAttempts);
    } else {
      this.handleError(new Error('Max reconnection attempts reached'));
    }
  }

  private handleError(error: Error): void {
    this.onError?.(error);
    this.onStateChange?.('error');
    this.isStreaming = false;
  }

  destroy(): void {
    this.currentInputStream = null;
    this.stopBroadcast();
  }
}