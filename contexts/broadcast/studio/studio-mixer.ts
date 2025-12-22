import { AudioChannel } from '../types';

export class StudioMixer {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private channels: Map<string, AudioChannelProcessor> = new Map();
  private outputStream: MediaStream | null = null;
  private isInitialized = false;
  private onError?: (error: Error) => void;
  private onMetricsUpdate?: (metrics: { inputLevel: number; outputLevel: number; channels: number }) => void;
  private metricsInterval: NodeJS.Timeout | null = null;

  constructor(options?: {
    sampleRate?: number;
    onError?: (error: Error) => void;
    onMetricsUpdate?: (metrics: { inputLevel: number; outputLevel: number; channels: number }) => void;
  }) {
    this.onError = options?.onError;
    this.onMetricsUpdate = options?.onMetricsUpdate;
    // Don't initialize in constructor - call initialize() explicitly
  }

  async initialize(sampleRate: number = 48000): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Check browser support
      if (!window.AudioContext && !(window as any).webkitAudioContext) {
        throw new Error('Web Audio API not supported in this browser');
      }

      // Create audio context with proper constructor
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioContextClass({
        sampleRate,
        latencyHint: 'interactive'
      });

      // Resume context if suspended (required by some browsers)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Verify context is running
      if (this.audioContext.state !== 'running') {
        throw new Error('Failed to start audio context');
      }

      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      
      // Create output stream for broadcasting
      const destination = this.audioContext.createMediaStreamDestination();
      this.masterGain.connect(destination);
      this.outputStream = destination.stream;
      
      // Verify output stream has audio tracks
      if (this.outputStream.getAudioTracks().length === 0) {
        throw new Error('Failed to create audio output stream');
      }
      
      this.isInitialized = true;
      this.startMetricsCollection();
      
    } catch (error) {
      this.isInitialized = false;
      throw new Error(`Failed to initialize audio mixer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  addChannel(config: AudioChannel, inputStream?: MediaStream): void {
    if (!this.isInitialized || !this.audioContext || !this.masterGain) {
      throw new Error('Mixer not initialized');
    }

    if (!config?.id) {
      throw new Error('Channel configuration must include an ID');
    }

    if (this.channels.has(config.id)) {
      throw new Error(`Channel ${config.id} already exists`);
    }

    try {
      const processor = new AudioChannelProcessor(this.audioContext, config, {
        onError: this.onError
      });
      
      if (inputStream) {
        processor.connectInput(inputStream);
      }
      
      processor.connect(this.masterGain);
      this.channels.set(config.id, processor);
      
    } catch (error) {
      this.handleError(new Error(`Failed to add channel ${config.id}: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  updateChannel(channelId: string, updates: Partial<AudioChannel>): void {
    if (!channelId) {
      throw new Error('Channel ID is required');
    }

    const processor = this.channels.get(channelId);
    if (!processor) {
      throw new Error(`Channel ${channelId} not found`);
    }

    try {
      processor.updateConfig(updates);
    } catch (error) {
      this.handleError(new Error(`Failed to update channel ${channelId}: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  removeChannel(channelId: string): void {
    const processor = this.channels.get(channelId);
    if (processor) {
      try {
        processor.cleanup();
        this.channels.delete(channelId);
      } catch (error) {
        this.handleError(new Error(`Failed to remove channel ${channelId}: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    }
  }

  setMasterVolume(volume: number): void {
    if (!this.masterGain || !this.audioContext) {
      throw new Error('Mixer not initialized');
    }

    try {
      const clampedVolume = Math.max(0, Math.min(100, volume));
      const gainValue = clampedVolume / 100;
      
      // Smooth volume changes to prevent audio pops
      this.masterGain.gain.setTargetAtTime(
        gainValue,
        this.audioContext.currentTime,
        0.01
      );
    } catch (error) {
      this.handleError(new Error(`Failed to set master volume: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  getOutputStream(): MediaStream {
    if (!this.outputStream) {
      throw new Error('Mixer not initialized or no output stream available');
    }
    
    // If no channels are active, create a default audio channel with tone
    if (this.channels.size === 0) {
      console.warn('No audio channels available, creating default tone channel');
      this.createDefaultAudioChannel();
    }
    
    return this.outputStream;
  }
  
  private createDefaultAudioChannel(): void {
    if (!this.audioContext || !this.masterGain) {
      throw new Error('Audio context not available');
    }
    
    // Create a low-volume tone generator as default audio source
    const oscillator = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime); // A4 note
    gain.gain.setValueAtTime(0.01, this.audioContext.currentTime); // Very low volume
    
    oscillator.connect(gain);
    gain.connect(this.masterGain);
    oscillator.start();
    
    // Add as a default channel
    const defaultChannel = {
      id: 'default-tone',
      name: 'Default Audio',
      volume: 1,
      isMuted: false,
      isActive: true,
      eq: { high: 0, mid: 0, low: 0 },
      effects: { compressor: false }
    };
    
    // Create a simple processor for the default channel
    const processor = {
      updateConfig: () => {},
      connect: () => {},
      cleanup: () => { oscillator.stop(); },
      isActive: () => true,
      getInputLevel: () => 10
    };
    
    this.channels.set('default-tone', processor as any);
    console.log('✅ Created default tone channel for streaming');
  }

  getChannels(): string[] {
    return Array.from(this.channels.keys());
  }

  getChannelCount(): number {
    return this.channels.size;
  }

  isChannelActive(channelId: string): boolean {
    const processor = this.channels.get(channelId);
    return processor ? processor.isActive() : false;
  }

  getMasterVolume(): number {
    if (!this.masterGain) return 0;
    return Math.round(this.masterGain.gain.value * 100);
  }

  cleanup(): void {
    try {
      this.stopMetricsCollection();
      
      this.channels.forEach(processor => {
        try {
          processor.cleanup();
        } catch (error) {
          console.warn('Error cleaning up channel:', error);
        }
      });
      this.channels.clear();
      
      if (this.audioContext && this.audioContext.state !== 'closed') {
        this.audioContext.close().catch(error => {
          console.warn('Error closing audio context:', error);
        });
      }
      
      this.audioContext = null;
      this.masterGain = null;
      this.outputStream = null;
      this.isInitialized = false;
      
    } catch (error) {
      console.warn('Error during mixer cleanup:', error);
    }
  }

  private startMetricsCollection(): void {
    this.stopMetricsCollection();
    
    this.metricsInterval = setInterval(() => {
      if (this.onMetricsUpdate && this.isInitialized) {
        try {
          const metrics = {
            inputLevel: this.calculateInputLevel(),
            outputLevel: this.calculateOutputLevel(),
            channels: this.channels.size
          };
          this.onMetricsUpdate(metrics);
        } catch (error) {
          // Ignore metrics errors
        }
      }
    }, 100);
  }

  private stopMetricsCollection(): void {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = null;
    }
  }

  private calculateInputLevel(): number {
    // Simplified input level calculation
    let totalLevel = 0;
    let activeChannels = 0;
    
    this.channels.forEach(processor => {
      if (processor.isActive()) {
        totalLevel += processor.getInputLevel();
        activeChannels++;
      }
    });
    
    return activeChannels > 0 ? totalLevel / activeChannels : 0;
  }

  private calculateOutputLevel(): number {
    return this.masterGain ? this.masterGain.gain.value * 100 : 0;
  }

  private handleError(error: Error): void {
    this.onError?.(error);
  }
}

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

class AudioChannelProcessor {
  private audioContext: AudioContext;
  private config: AudioChannel;
  private inputGain: GainNode;
  private eqNodes: { high: BiquadFilterNode; mid: BiquadFilterNode; low: BiquadFilterNode };
  private compressor: DynamicsCompressorNode;
  private outputGain: GainNode;
  private analyser: AnalyserNode;
  private inputSource: MediaStreamAudioSourceNode | null = null;
  private isConnected = false;
  private onError?: (error: Error) => void;

  constructor(audioContext: AudioContext, config: AudioChannel, options?: {
    onError?: (error: Error) => void;
  }) {
    this.audioContext = audioContext;
    this.config = { ...config };
    this.onError = options?.onError;
    
    try {
      // Create audio processing chain
      this.inputGain = audioContext.createGain();
      this.compressor = audioContext.createDynamicsCompressor();
      this.analyser = audioContext.createAnalyser();
      
      // Configure analyser
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;
      
      // EQ nodes with error handling
      this.eqNodes = {
        high: audioContext.createBiquadFilter(),
        mid: audioContext.createBiquadFilter(), 
        low: audioContext.createBiquadFilter()
      };
      
      // Configure EQ
      this.eqNodes.high.type = 'highshelf';
      this.eqNodes.high.frequency.value = 8000;
      this.eqNodes.high.Q.value = 0.7;
      
      this.eqNodes.mid.type = 'peaking';
      this.eqNodes.mid.frequency.value = 1000;
      this.eqNodes.mid.Q.value = 1.0;
      
      this.eqNodes.low.type = 'lowshelf';
      this.eqNodes.low.frequency.value = 200;
      this.eqNodes.low.Q.value = 0.7;
      
      // Configure compressor
      this.compressor.threshold.value = -24;
      this.compressor.knee.value = 30;
      this.compressor.ratio.value = 12;
      this.compressor.attack.value = 0.003;
      this.compressor.release.value = 0.25;
      
      this.outputGain = audioContext.createGain();
      
      // Connect processing chain
      this.inputGain.connect(this.analyser);
      this.analyser.connect(this.eqNodes.high);
      this.eqNodes.high.connect(this.eqNodes.mid);
      this.eqNodes.mid.connect(this.eqNodes.low);
      this.eqNodes.low.connect(this.compressor);
      this.compressor.connect(this.outputGain);
      
      this.updateConfig(config);
      
    } catch (error) {
      throw new Error(`Failed to create audio channel processor: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  connectInput(inputStream: MediaStream): void {
    if (!inputStream || inputStream.getTracks().length === 0) {
      throw new Error('Invalid input stream');
    }

    try {
      // Disconnect existing source
      if (this.inputSource) {
        this.inputSource.disconnect();
      }
      
      this.inputSource = this.audioContext.createMediaStreamSource(inputStream);
      this.inputSource.connect(this.inputGain);
      this.isConnected = true;
      
      // Monitor stream health
      inputStream.addEventListener('removetrack', () => {
        this.isConnected = false;
      });
      
    } catch (error) {
      throw new Error(`Failed to connect input stream: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  connect(destination: AudioNode): void {
    if (!destination) {
      throw new Error('Destination node is required');
    }
    
    try {
      this.outputGain.connect(destination);
    } catch (error) {
      throw new Error(`Failed to connect to destination: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  updateConfig(updates: Partial<AudioChannel>): void {
    try {
      Object.assign(this.config, updates);
      
      if (updates.volume !== undefined || updates.isMuted !== undefined) {
        const volume = updates.volume ?? this.config.volume;
        const isMuted = updates.isMuted ?? this.config.isMuted;
        const gainValue = isMuted ? 0 : Math.max(0, Math.min(100, volume)) / 100;
        
        // Smooth volume changes
        this.outputGain.gain.setTargetAtTime(
          gainValue,
          this.audioContext.currentTime,
          0.01
        );
      }
      
      if (updates.eq) {
        const currentTime = this.audioContext.currentTime;
        
        if (updates.eq.high !== undefined) {
          const gain = Math.max(-12, Math.min(12, updates.eq.high));
          this.eqNodes.high.gain.setTargetAtTime(gain, currentTime, 0.01);
        }
        
        if (updates.eq.mid !== undefined) {
          const gain = Math.max(-12, Math.min(12, updates.eq.mid));
          this.eqNodes.mid.gain.setTargetAtTime(gain, currentTime, 0.01);
        }
        
        if (updates.eq.low !== undefined) {
          const gain = Math.max(-12, Math.min(12, updates.eq.low));
          this.eqNodes.low.gain.setTargetAtTime(gain, currentTime, 0.01);
        }
      }
      
      if (updates.effects?.compressor !== undefined) {
        // Enable/disable compressor by adjusting ratio
        const ratio = updates.effects.compressor ? 12 : 1;
        this.compressor.ratio.setTargetAtTime(ratio, this.audioContext.currentTime, 0.01);
      }
      
    } catch (error) {
      this.onError?.(new Error(`Failed to update channel config: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  isActive(): boolean {
    return this.isConnected && this.config.isActive && !this.config.isMuted;
  }

  getInputLevel(): number {
    if (!this.analyser) return 0;
    
    try {
      const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      this.analyser.getByteFrequencyData(dataArray);
      
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      
      return (sum / dataArray.length) / 255 * 100;
    } catch {
      return 0;
    }
  }

  cleanup(): void {
    try {
      if (this.inputSource) {
        this.inputSource.disconnect();
        this.inputSource = null;
      }
      
      this.outputGain.disconnect();
      this.compressor.disconnect();
      this.eqNodes.low.disconnect();
      this.eqNodes.mid.disconnect();
      this.eqNodes.high.disconnect();
      this.analyser.disconnect();
      this.inputGain.disconnect();
      
      this.isConnected = false;
      
    } catch (error) {
      console.warn('Error during channel cleanup:', error);
    }
  }
}