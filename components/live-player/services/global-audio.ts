// Global audio element to prevent recreation and AbortError
class GlobalAudioManager {
  private static instance: GlobalAudioManager;
  private audioElement: HTMLAudioElement | null = null;
  private currentHlsListener: any = null;

  private constructor() {}

  static getInstance(): GlobalAudioManager {
    if (!GlobalAudioManager.instance) {
      GlobalAudioManager.instance = new GlobalAudioManager();
    }
    return GlobalAudioManager.instance;
  }

  getAudioElement(): HTMLAudioElement {
    if (!this.audioElement) {
      console.log('🎵 [GlobalAudio] Creating new audio element');
      this.audioElement = new Audio();
      this.audioElement.preload = 'none';
      this.audioElement.crossOrigin = 'anonymous';
      
      // Add to DOM to prevent garbage collection
      this.audioElement.style.display = 'none';
      document.body.appendChild(this.audioElement);
    }
    return this.audioElement;
  }

  setCurrentHlsListener(listener: any): void {
    // Only destroy previous listener if it's different from the new one
    if (this.currentHlsListener && this.currentHlsListener !== listener) {
      const currentUrl = this.currentHlsListener.streamUrl;
      const newUrl = listener.streamUrl;
      
      if (currentUrl !== newUrl) {
        console.log('🎵 [GlobalAudio] Destroying previous HLS listener for different URL');
        this.currentHlsListener.destroy();
      } else {
        console.log('🎵 [GlobalAudio] Keeping existing HLS listener for same URL');
        return; // Don't replace if same URL
      }
    }
    this.currentHlsListener = listener;
  }

  cleanup(): void {
    if (this.currentHlsListener) {
      this.currentHlsListener.destroy();
      this.currentHlsListener = null;
    }
    if (this.audioElement) {
      console.log('🎵 [GlobalAudio] Cleaning up audio element');
      this.audioElement.pause();
      this.audioElement.src = '';
      if (this.audioElement.parentNode) {
        this.audioElement.parentNode.removeChild(this.audioElement);
      }
      this.audioElement = null;
    }
  }
}

export const globalAudio = GlobalAudioManager.getInstance();