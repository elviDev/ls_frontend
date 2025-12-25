'use client';

import { useEffect, useState } from 'react';
import { useGlobalLiveKit } from '@/providers/global-livekit-provider';
import { useBroadcastStore } from '@/stores/broadcast-store';

export function useBroadcastDiscovery() {
  const { activeBroadcasts } = useGlobalLiveKit();
  const { setBroadcast, setCurrentShow } = useBroadcastStore();
  const [liveBroadcasts, setLiveBroadcasts] = useState<any[]>([]);

  // Listen for broadcast events
  useEffect(() => {
    const handleBroadcastLive = (event: CustomEvent) => {
      const broadcast = event.detail;
      setLiveBroadcasts([broadcast]);
      setBroadcast(broadcast);
      setCurrentShow(broadcast.title);
    };

    const handleBroadcastEnded = () => {
      setLiveBroadcasts([]);
      setBroadcast(null);
      setCurrentShow('No live broadcast');
    };

    window.addEventListener('broadcast-live', handleBroadcastLive as EventListener);
    window.addEventListener('broadcast-ended', handleBroadcastEnded as EventListener);

    return () => {
      window.removeEventListener('broadcast-live', handleBroadcastLive as EventListener);
      window.removeEventListener('broadcast-ended', handleBroadcastEnded as EventListener);
    };
  }, [setBroadcast, setCurrentShow]);

  useEffect(() => {
    const fetchBroadcastDetails = async () => {
      if (activeBroadcasts.length === 0) {
        setLiveBroadcasts([]);
        return;
      }

      try {
        const response = await fetch('/api/broadcasts/current');
        if (response.ok) {
          const data = await response.json();
          if (data.isLive) {
            setLiveBroadcasts([data]);
          }
        }
      } catch (error) {
        console.warn('Failed to fetch broadcast details:', error);
      }
    };

    fetchBroadcastDetails();
  }, [activeBroadcasts]);

  return { liveBroadcasts, hasLiveBroadcasts: liveBroadcasts.length > 0 };
}