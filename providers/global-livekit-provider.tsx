"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { RoomContext } from '@livekit/components-react';
import { Room } from 'livekit-client';

interface LiveKitRoom {
  id: string;
  room: Room;
  connected: boolean;
}

interface GlobalLiveKitContextType {
  rooms: Map<string, LiveKitRoom>;
  activeBroadcasts: string[];
  createRoom: (roomId: string, roomName: string, userId: string, userName?: string, role?: 'broadcaster' | 'listener') => Promise<Room>;
  disconnectRoom: (roomId: string) => void;
  getRoom: (roomId: string) => Room | null;
  onBroadcastStarted?: (broadcastId: string) => void;
  onBroadcastEnded?: (broadcastId: string) => void;
}

const GlobalLiveKitContext = createContext<GlobalLiveKitContextType | null>(null);

export function useGlobalLiveKit() {
  const context = useContext(GlobalLiveKitContext);
  if (!context) {
    throw new Error('useGlobalLiveKit must be used within GlobalLiveKitProvider');
  }
  return context;
}

interface GlobalLiveKitProviderProps {
  children: React.ReactNode;
}

export function GlobalLiveKitProvider({ children }: GlobalLiveKitProviderProps) {
  const [rooms] = useState(() => new Map<string, LiveKitRoom>());
  const [activeBroadcasts, setActiveBroadcasts] = useState<string[]>([]);
  const [audioContextInitialized, setAudioContextInitialized] = useState(false);

  // Listen for broadcast events instead of polling
  useEffect(() => {
    const handleBroadcastLive = (event: CustomEvent) => {
      const broadcast = event.detail;
      setActiveBroadcasts(prev => 
        prev.includes(broadcast.id) ? prev : [...prev, broadcast.id]
      );
    };

    const handleBroadcastEnded = (event: CustomEvent) => {
      const { broadcastId } = event.detail;
      setActiveBroadcasts(prev => prev.filter(id => id !== broadcastId));
    };

    window.addEventListener('broadcast-live', handleBroadcastLive as EventListener);
    window.addEventListener('broadcast-ended', handleBroadcastEnded as EventListener);

    // Initial check for existing live broadcasts
    const checkInitialBroadcasts = async () => {
      try {
        const response = await fetch('/api/broadcasts/current');
        if (response.ok) {
          const data = await response.json();
          if (data.isLive && data.id) {
            setActiveBroadcasts([data.id]);
          }
        }
      } catch (error) {
        console.warn('Failed to check initial broadcasts:', error);
      }
    };
    checkInitialBroadcasts();

    return () => {
      window.removeEventListener('broadcast-live', handleBroadcastLive as EventListener);
      window.removeEventListener('broadcast-ended', handleBroadcastEnded as EventListener);
    };
  }, []);

  // Initialize AudioContext on first user interaction
  useEffect(() => {
    if (audioContextInitialized) return;

    const initializeAudioContext = async () => {
      try {
        if (typeof window !== 'undefined' && window.AudioContext) {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          if (audioContext.state === 'suspended') {
            await audioContext.resume();
            console.log('✅ Global AudioContext initialized');
            setAudioContextInitialized(true);
          }
        }
      } catch (error) {
        console.warn('⚠️ Global AudioContext initialization failed:', error);
      }
    };

    const handleUserInteraction = () => {
      initializeAudioContext();
      // Remove listeners after first interaction
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };

    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
  }, [audioContextInitialized]);

  const createRoom = useCallback(async (
    roomId: string, 
    roomName: string, 
    userId: string, 
    userName?: string, 
    role: 'broadcaster' | 'listener' = 'listener'
  ): Promise<Room> => {
    // Check if room already exists
    const existingRoom = rooms.get(roomId);
    if (existingRoom && existingRoom.connected) {
      return existingRoom.room;
    }

    // Initialize AudioContext with user gesture before creating room (only if not already initialized)
    if (!audioContextInitialized) {
      try {
        if (typeof window !== 'undefined' && window.AudioContext) {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          if (audioContext.state === 'suspended') {
            await audioContext.resume();
            console.log('✅ AudioContext resumed for room creation');
            setAudioContextInitialized(true);
          }
        }
      } catch (error) {
        console.warn('⚠️ AudioContext initialization failed during room creation:', error);
      }
    }

    // Create new room with better connection options
    const room = new Room({
      adaptiveStream: true,
      dynacast: true,
      reconnectPolicy: {
        nextRetryDelayInMs: (context) => {
          return Math.min(1000 * Math.pow(2, context.retryCount), 10000);
        },
      },
      disconnectOnPageLeave: false,
    });

    // Get token and connect
    try {
      const response = await fetch('/api/livekit/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          roomName,
          userName: userName || userId,
          role,
        }),
      });

      const data = await response.json();
      const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_SERVER_URL || 'ws://localhost:7880';

      await room.connect(serverUrl, data.token);

      // Store room
      rooms.set(roomId, {
        id: roomId,
        room,
        connected: true,
      });

      // Handle disconnection
      room.on('disconnected', () => {
        const roomData = rooms.get(roomId);
        if (roomData) {
          roomData.connected = false;
        }
      });

      return room;
    } catch (error) {
      console.error('Failed to create LiveKit room:', error);
      throw error;
    }
  }, [rooms]);

  const disconnectRoom = useCallback((roomId: string) => {
    const roomData = rooms.get(roomId);
    if (roomData) {
      roomData.room.disconnect();
      rooms.delete(roomId);
    }
  }, [rooms]);

  const getRoom = useCallback((roomId: string): Room | null => {
    const roomData = rooms.get(roomId);
    return roomData?.connected ? roomData.room : null;
  }, [rooms]);

  const contextValue: GlobalLiveKitContextType = {
    rooms,
    activeBroadcasts,
    createRoom,
    disconnectRoom,
    getRoom,
  };

  return (
    <GlobalLiveKitContext.Provider value={contextValue}>
      {children}
    </GlobalLiveKitContext.Provider>
  );
}

// Room-specific provider for components that need room context
interface RoomProviderProps {
  children: React.ReactNode;
  roomId: string;
  roomName: string;
  userId: string;
  userName?: string;
  role?: 'broadcaster' | 'listener';
}

export function RoomProvider({ 
  children, 
  roomId, 
  roomName, 
  userId, 
  userName, 
  role 
}: RoomProviderProps) {
  const { createRoom } = useGlobalLiveKit();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    const initRoom = async () => {
      try {
        const roomInstance = await createRoom(roomId, roomName, userId, userName, role);
        setRoom(roomInstance);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to connect');
      } finally {
        setLoading(false);
      }
    };

    initRoom();
  }, [createRoom, roomId, roomName, userId, userName, role]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p>Connecting to LiveKit...</p>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-2">
          <p className="text-red-600">Connection Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <RoomContext.Provider value={room}>
      {children}
    </RoomContext.Provider>
  );
}