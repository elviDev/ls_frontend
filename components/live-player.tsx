"use client";

import { useState } from "react";
import { AlertCircle, Play, Pause } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useBroadcastStore } from "@/stores/broadcast-store";
import { useBroadcastDiscovery } from "@/hooks/use-broadcast-discovery";
import { LiveKitListener } from "./live-player/components/livekit-listener";

function LivePlayerInterface() {
  const { user } = useAuth();
  const { currentBroadcast } = useBroadcastStore();
  const { liveBroadcasts, hasLiveBroadcasts } = useBroadcastDiscovery();
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [isReconnecting, setIsReconnecting] = useState(false);

  // Use discovered broadcasts if current broadcast is not set
  const activeBroadcast = currentBroadcast || (hasLiveBroadcasts ? liveBroadcasts[0] : null);
  const isLive = activeBroadcast?.status === "LIVE" || activeBroadcast?.isLive;
  const maxRetries = 3;

  const togglePlay = async () => {
    if (!isLive) {
      setError("No live broadcast available");
      return;
    }

    if (!isPlaying) {
      // Reset connection attempts when starting fresh
      setConnectionAttempts(0);
      setError(null);

      // Initialize AudioContext with user gesture before connecting
      try {
        if (typeof window !== "undefined" && window.AudioContext) {
          const audioContext = new (
            window.AudioContext || (window as any).webkitAudioContext
          )();
          if (audioContext.state === "suspended") {
            await audioContext.resume();
            console.log("✅ AudioContext resumed for live player");
          }
        }
      } catch (error) {
        console.warn("⚠️ AudioContext initialization failed:", error);
      }
    }

    setIsPlaying(!isPlaying);
  };

  const handleConnectionChange = (connected: boolean) => {
    if (!connected && isPlaying) {
      setConnectionAttempts((prev) => prev + 1);

      if (connectionAttempts < maxRetries) {
        setIsReconnecting(true);
        setError(
          `Connection lost. Retrying... (${connectionAttempts + 1}/${maxRetries})`
        );

        // Auto-retry after a delay
        setTimeout(
          () => {
            setIsReconnecting(false);
            // Force re-render of LiveKitListener by toggling state
            setIsPlaying(false);
            setTimeout(() => setIsPlaying(true), 100);
          },
          2000 + connectionAttempts * 1000
        ); // Increasing delay
      } else {
        setError(
          "Connection failed after multiple attempts. Please try again."
        );
        setIsPlaying(false);
        setConnectionAttempts(0);
      }
    } else if (connected) {
      setError(null);
      setConnectionAttempts(0);
      setIsReconnecting(false);
    }
  };

  if (!isLive) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-lg">
        <div className="container mx-auto px-4 py-4 text-center">
          <p className="text-gray-500">No live broadcast available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-lg">
      <div className="container mx-auto px-4 py-2">
        {error && (
          <Alert className="mb-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              onClick={togglePlay}
              variant={isPlaying ? "secondary" : "default"}
              size="sm"
              className="flex items-center gap-2"
              disabled={isReconnecting}
            >
              {isReconnecting ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                  Reconnecting...
                </>
              ) : isPlaying ? (
                <>
                  <Pause className="h-4 w-4" />
                  Leave Broadcast
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Join Live Broadcast
                </>
              )}
            </Button>

            {activeBroadcast && (
              <div className="text-sm">
                <span className="font-medium">
                  {activeBroadcast.title || "Live Broadcast"}
                </span>
                <div className="flex items-center gap-1 text-xs text-red-600">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  LIVE
                </div>
              </div>
            )}
          </div>
        </div>

        {isLive && isPlaying && !isReconnecting && (
          <LiveKitListener
            key={`listener-${connectionAttempts}`} // Force re-mount on retry
            roomName={`broadcast-${activeBroadcast.slug || activeBroadcast.id}`}
            userId={`listener-${Date.now()}`}
            userName={user?.email || "Anonymous Listener"}
            onConnectionChange={handleConnectionChange}
            volume={80}
            muted={false}
          />
        )}
      </div>
    </div>
  );
}

export default function LivePlayer() {
  return <LivePlayerInterface />;
}
