import { useEffect, useRef, useState } from "react";
import { SRSBroadcaster } from "@/contexts/broadcast/streaming/srs-broadcaster";

export function useAudioStream(broadcastId?: string) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const broadcasterRef = useRef<SRSBroadcaster | null>(null);

  useEffect(() => {
    if (!broadcastId) return;

    broadcasterRef.current = new SRSBroadcaster(
      process.env.NEXT_PUBLIC_SRS_URL || "http://localhost:1985",
      broadcastId,
      {
        onError: (err: Error) => setError(err.message),
        onStateChange: (
          state: "connecting" | "streaming" | "stopped" | "error"
        ) => {
          setIsRecording(state === "streaming");
        },
      }
    );

    return () => {
      if (broadcasterRef.current) {
        broadcasterRef.current.destroy();
      }
    };
  }, [broadcastId]);

  const initializeAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMediaStream(stream);
      setIsInitialized(true);
      setError(null);
    } catch (err) {
      if (err instanceof Error && err.name === "NotAllowedError") {
        setError(
          "Microphone permission denied. Please allow microphone access to broadcast."
        );
      } else {
        setError(
          err instanceof Error ? err.message : "Failed to initialize audio"
        );
      }
      setIsInitialized(false);
    }
  };

  const startRecording = async () => {
    if (!broadcasterRef.current || !isInitialized || !mediaStream) return;

    try {
      await broadcasterRef.current.startBroadcast(mediaStream);
      setIsRecording(true);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to start recording"
      );
    }
  };

  const stopRecording = () => {
    if (broadcasterRef.current) {
      broadcasterRef.current.stopBroadcast();
      setIsRecording(false);
    }
  };

  return {
    isInitialized,
    isRecording,
    mediaStream,
    error,
    initializeAudio,
    startRecording,
    stopRecording,
    broadcaster: broadcasterRef.current,
  };
}
