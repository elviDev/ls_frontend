import { useState, useEffect, useRef, useCallback } from "react";
import { AudioPlayer, PlayerState } from "../services/audio-player";
import { SRSDiagnostics } from "../services/srs-diagnostics";

export interface AudioPlayerState {
  isPlaying: boolean;
  isLoading: boolean;
  volume: number;
  isMuted: boolean;
  bufferHealth: number;
  connectionQuality: "excellent" | "good" | "fair" | "poor";
  error: string | null;
}

export function useAudioPlayer() {
  const [state, setState] = useState<AudioPlayerState>({
    isPlaying: false,
    isLoading: false,
    volume: 80,
    isMuted: false,
    bufferHealth: 0,
    connectionQuality: "good",
    error: null,
  });

  const playerRef = useRef<AudioPlayer | null>(null);
  const bufferMonitorRef = useRef<NodeJS.Timeout | null>(null);
  const playTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isPlayingRef = useRef<boolean>(false);

  const handleStateChange = useCallback((playerState: PlayerState) => {
    setState((prev) => ({
      ...prev,
      isPlaying: playerState === "playing",
      isLoading: playerState === "loading" || playerState === "buffering",
      error: playerState === "error" ? "Playback error occurred" : null,
    }));
  }, []);

  const handleError = useCallback((error: Error) => {
    setState((prev) => ({
      ...prev,
      error: error.message,
      isPlaying: false,
      isLoading: false,
    }));
  }, []);

  const handleVolumeChange = useCallback((volume: number) => {
    setState((prev) => ({ ...prev, volume }));
  }, []);

  useEffect(() => {
    playerRef.current = new AudioPlayer({
      onStateChange: handleStateChange,
      onError: handleError,
      onVolumeChange: handleVolumeChange,
    });

    return () => {
      if (bufferMonitorRef.current) {
        clearInterval(bufferMonitorRef.current);
      }
      if (playTimeoutRef.current) {
        clearTimeout(playTimeoutRef.current);
      }
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [handleStateChange, handleError, handleVolumeChange]);

  const startMonitoring = useCallback(() => {
    if (bufferMonitorRef.current) {
      clearInterval(bufferMonitorRef.current);
    }

    bufferMonitorRef.current = setInterval(() => {
      if (playerRef.current) {
        const bufferHealth = playerRef.current.getBufferHealth();
        const connectionQuality = playerRef.current.getConnectionQuality();

        setState((prev) => ({
          ...prev,
          bufferHealth,
          connectionQuality,
        }));
      }
    }, 1000);
  }, []);

  const stopMonitoring = useCallback(() => {
    if (bufferMonitorRef.current) {
      clearInterval(bufferMonitorRef.current);
      bufferMonitorRef.current = null;
    }
  }, []);

  const play = useCallback(
    async (streamUrl: string) => {
      console.log('🎵 [AudioPlayer] Play called with URL:', streamUrl);
      
      if (!playerRef.current || !streamUrl) return;
      
      // Prevent concurrent play requests
      if (isPlayingRef.current) {
        console.log('🎵 [AudioPlayer] Play request already in progress, skipping');
        return;
      }
      
      isPlayingRef.current = true;
      
      try {
        // Extract stream key from URL for diagnostics
        const streamKey = streamUrl.match(/\/live\/(.+)\.m3u8$/)?.[1];
        if (streamKey) {
          const srsUrl = streamUrl.replace(/\/live\/.*$/, '');
          const diagnostics = new SRSDiagnostics(srsUrl);
          const streamCheck = await diagnostics.checkStreamExists(streamKey, 3, 1000);
          
          if (!streamCheck.isLive) {
            console.warn('🎵 [AudioPlayer] Stream not ready yet:', streamCheck.error);
            setState((prev) => ({ 
              ...prev, 
              error: 'Stream is starting, please wait...' 
            }));
            return;
          }
          
          console.log('🎵 [AudioPlayer] ✅ Stream is live and ready!');
        }

        setState((prev) => ({ ...prev, error: null }));
        console.log('🎵 [AudioPlayer] Starting playback...');
        await playerRef.current.play(streamUrl);
        startMonitoring();
        console.log('🎵 [AudioPlayer] Playback started successfully');
      } catch (error) {
        console.error("🎵 [AudioPlayer] Failed to start playback:", error);
      } finally {
        isPlayingRef.current = false;
      }
    },
    [startMonitoring]
  );

  const stop = useCallback(() => {
    if (!playerRef.current) return;

    playerRef.current.stop();
    stopMonitoring();
    setState((prev) => ({
      ...prev,
      isPlaying: false,
      isLoading: false,
      bufferHealth: 0,
      connectionQuality: "good",
    }));
  }, [stopMonitoring]);

  const setVolume = useCallback((volume: number) => {
    if (!playerRef.current) return;

    playerRef.current.setVolume(volume);
  }, []);

  const setMuted = useCallback((muted: boolean) => {
    if (!playerRef.current) return;

    playerRef.current.setMuted(muted);
    setState((prev) => ({ ...prev, isMuted: muted }));
  }, []);

  const togglePlay = useCallback(
    async (streamUrl?: string) => {
      if (state.isPlaying) {
        stop();
      } else if (streamUrl) {
        await play(streamUrl);
      }
    },
    [state.isPlaying, play, stop]
  );

  const toggleMute = useCallback(() => {
    setMuted(!state.isMuted);
  }, [state.isMuted, setMuted]);

  return {
    state,
    play,
    stop,
    togglePlay,
    setVolume,
    setMuted,
    toggleMute,
  };
}
