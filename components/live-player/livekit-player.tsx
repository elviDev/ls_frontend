"use client";

import React, { useState, useEffect } from 'react';
import { LiveKitRoom } from '@livekit/components-react';
import { LiveKitListener } from '@/components/livekit/audio-components';

interface LiveKitPlayerProps {
  broadcastSlug: string;
  className?: string;
}

export function LiveKitPlayer({ broadcastSlug, className }: LiveKitPlayerProps) {
  const [token, setToken] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await fetch('/api/livekit/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: `listener-${Date.now()}`,
            roomName: `broadcast-${broadcastSlug}`,
            userName: 'Listener',
            role: 'listener'
          })
        });
        
        const data = await response.json();
        setToken(data.token);
      } catch (error) {
        console.error('Failed to fetch token:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchToken();
  }, [broadcastSlug]);

  if (loading) {
    return <div className={className}>Connecting...</div>;
  }

  if (!token) {
    return <div className={className}>Connection failed</div>;
  }

  return (
    <div className={className}>
      <LiveKitRoom
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_SERVER_URL || 'ws://localhost:7880'}
        token={token}
        connectOptions={{ autoSubscribe: true }}
      >
        <LiveKitListener />
      </LiveKitRoom>
    </div>
  );
}