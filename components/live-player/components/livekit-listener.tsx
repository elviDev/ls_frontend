"use client";

import { useEffect, useState, useRef } from 'react';
import { Room, RoomOptions } from 'livekit-client';

interface LiveKitListenerProps {
  serverUrl: string;
  token: string;
  onConnectionChange: (connected: boolean) => void;
  volume: number;
  muted: boolean;
}

export function LiveKitListener({ 
  serverUrl, 
  token, 
  onConnectionChange, 
  volume, 
  muted 
}: LiveKitListenerProps) {
  const [room, setRoom] = useState<Room | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isConnectingRef = useRef(false);

  useEffect(() => {
    if (!serverUrl || !token || isConnectingRef.current) return;

    const connectRoom = async () => {
      if (isConnectingRef.current) return;
      isConnectingRef.current = true;

      try {
        const newRoom = new Room({
          adaptiveStream: true,
          dynacast: true,
          publishDefaults: {
            simulcast: false,
          },
        } as RoomOptions);
        
        newRoom.on('connected', () => {
          console.log('🎧 Connected to LiveKit room as listener');
          onConnectionChange(true);
          // Clear any reconnection attempts
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
          }
        });

        newRoom.on('disconnected', (reason) => {
          console.log('🎧 Disconnected from LiveKit room:', reason);
          onConnectionChange(false);
          
          // Only attempt reconnection if it wasn't intentional
          if (reason !== 'CLIENT_INITIATED' && !reconnectTimeoutRef.current) {
            reconnectTimeoutRef.current = setTimeout(() => {
              isConnectingRef.current = false;
              connectRoom();
            }, 2000);
          }
        });

        newRoom.on('trackSubscribed', (track, publication, participant) => {
          if (track.kind === 'audio') {
            console.log('🎵 Audio track received from:', participant.identity);
            const audioElement = track.attach();
            audioElement.volume = volume / 100;
            audioElement.muted = muted;
            audioElement.autoplay = true;
            document.body.appendChild(audioElement);
            
            // Clean up when track ends
            track.on('ended', () => {
              if (audioElement.parentNode) {
                audioElement.parentNode.removeChild(audioElement);
              }
            });
          }
        });

        await newRoom.connect(serverUrl, token);
        setRoom(newRoom);
      } catch (error) {
        console.error('Failed to connect to LiveKit:', error);
        onConnectionChange(false);
        isConnectingRef.current = false;
        
        // Retry connection after delay
        if (!reconnectTimeoutRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connectRoom();
          }, 3000);
        }
      }
    };

    connectRoom();

    return () => {
      isConnectingRef.current = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (room) {
        room.disconnect();
      }
    };
  }, [serverUrl, token]);

  useEffect(() => {
    if (!room) return;

    // Update volume for all audio tracks
    room.remoteParticipants.forEach(participant => {
      participant.audioTrackPublications.forEach(publication => {
        if (publication.track) {
          const audioElements = publication.track.getTrackElements();
          audioElements.forEach(element => {
            if (element instanceof HTMLAudioElement) {
              element.volume = volume / 100;
              element.muted = muted;
            }
          });
        }
      });
    });
  }, [room, volume, muted]);

  return null;
}