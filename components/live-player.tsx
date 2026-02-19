"use client";

import { useState, useEffect } from "react";
import { AlertCircle, Play, Pause } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { useBroadcastStore } from "@/stores/broadcast-store";
import { useBroadcastDiscovery } from "@/hooks/use-broadcast-discovery";
import { LiveKitListener } from "./live-player/components/livekit-listener";
import { audioContextManager } from "@/utils/audio-context-manager";
import { useTranslations } from "next-intl";

function LivePlayerInterface() {
  const t = useTranslations('broadcast');
  const { user } = useAuthStore();
  const { currentBroadcast } = useBroadcastStore();
  const { liveBroadcasts, hasLiveBroadcasts } = useBroadcastDiscovery();
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use discovered broadcasts if current broadcast is not set
  const activeBroadcast =
    currentBroadcast || (hasLiveBroadcasts ? liveBroadcasts[0] : null);
  const isLive = activeBroadcast?.status === "LIVE" || activeBroadcast?.isLive;

  const togglePlay = async () => {
    if (!isLive) {
      setError("No live broadcast available");
      return;
    }

    if (!isPlaying) {
      setError(null);
      // Initialize AudioContext with user gesture
      await audioContextManager.initialize();
    }

    setIsPlaying(!isPlaying);
  };

  const handleConnectionChange = (connected: boolean) => {
    console.log("🔌 [LivePlayer] Connection change:", connected);
    if (connected) {
      setError(null);
    }
    // Don't immediately show error on disconnect - let LiveKit try to reconnect first
  };

  if (!isLive) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-lg">
        <div className="container mx-auto px-4 py-4 text-center">
          <p className="text-gray-500">{t('noLiveBroadcast')}</p>
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
              disabled={false}
            >
              {isPlaying ? (
                <>
                  <Pause className="h-4 w-4" />
                  {t('leaveBroadcast')}
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  {t('joinLiveBroadcast')}
                </>
              )}
            </Button>

            {activeBroadcast && (
              <div className="text-sm">
                <span className="font-medium">
                  {activeBroadcast.title || t('liveBroadcast')}
                </span>
                <div className="flex items-center gap-1 text-xs text-red-600">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  {t('live')}
                </div>
              </div>
            )}
          </div>
        </div>

        {isLive && (
          <LiveKitListener
            key={`listener-${activeBroadcast.id}`}
            broadcastId={activeBroadcast.id}
            userId={
              user?.id
                ? `${user.id}-listener`
                : (() => {
                    try {
                      const key = `listener-id:${activeBroadcast.id}`;
                      let id = sessionStorage.getItem(key);
                      if (!id) {
                        id = `listener-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
                        sessionStorage.setItem(key, id);
                      }
                      return id;
                    } catch (e) {
                      return `listener-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
                    }
                  })()
            }
            userName={
              user?.email || user?.name || `${user?.id}` || "Anonymous Listener"
            }
            onConnectionChange={handleConnectionChange}
            volume={80}
            muted={false}
            isPlaying={isPlaying}
            onPlayingChange={setIsPlaying}
          />
        )}
      </div>
    </div>
  );
}

export default function LivePlayer() {
  return <LivePlayerInterface />;
}
