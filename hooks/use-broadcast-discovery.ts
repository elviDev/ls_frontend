'use client';

import { useEffect, useState } from 'react';
import { useBroadcastStore } from '@/stores/broadcast-store';
import { apiClient } from '@/lib/api-client';

export function useBroadcastDiscovery() {
  const { setBroadcast, setCurrentShow } = useBroadcastStore();
  const [liveBroadcasts, setLiveBroadcasts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkForLiveBroadcast = async () => {
      try {
        const data = await apiClient.broadcasts.getCurrent();
        
        if (data && data.id) {
          console.log('📻 [Discovery] Found live broadcast:', data.title);
          setLiveBroadcasts([data]);
          setBroadcast(data);
          setCurrentShow(data.title);
        } else {
          console.log('📻 [Discovery] No live broadcast found');
          setLiveBroadcasts([]);
          setBroadcast(null);
          setCurrentShow('No live broadcast');
        }
      } catch (error) {
        console.warn('Failed to check for live broadcast:', error);
        setLiveBroadcasts([]);
        setBroadcast(null);
        setCurrentShow('No live broadcast');
      } finally {
        setIsLoading(false);
      }
    };

    // Check immediately
    checkForLiveBroadcast();

    // Poll every 30 seconds
    const interval = setInterval(checkForLiveBroadcast, 30000);

    return () => clearInterval(interval);
  }, [setBroadcast, setCurrentShow]);

  return { 
    liveBroadcasts, 
    hasLiveBroadcasts: liveBroadcasts.length > 0,
    isLoading 
  };
}