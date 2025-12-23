"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useLocalParticipant, useRemoteParticipants, useTracks } from '@livekit/components-react';
import { Track } from 'livekit-client';

export function LiveKitBroadcaster() {
  const { localParticipant } = useLocalParticipant();
  const [isPublishing, setIsPublishing] = useState(false);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);

  const startBroadcast = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
        },
      });

      await localParticipant.publishTrack(stream.getAudioTracks()[0], {
        name: 'microphone',
        source: Track.Source.Microphone,
      });

      setAudioStream(stream);
      setIsPublishing(true);
    } catch (error) {
      console.error('Failed to start broadcast:', error);
    }
  };

  const stopBroadcast = () => {
    if (audioStream) {
      audioStream.getTracks().forEach(track => track.stop());
      setAudioStream(null);
    }
    localParticipant.unpublishTrack(localParticipant.getTrackPublication(Track.Source.Microphone)?.track!);
    setIsPublishing(false);
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${isPublishing ? 'bg-red-500' : 'bg-gray-400'}`} />
        <span>{isPublishing ? 'Broadcasting' : 'Not Broadcasting'}</span>
      </div>
      
      <div className="flex gap-2">
        {!isPublishing ? (
          <button
            onClick={startBroadcast}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Start Broadcast
          </button>
        ) : (
          <button
            onClick={stopBroadcast}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Stop Broadcast
          </button>
        )}
      </div>
    </div>
  );
}

export function LiveKitListener() {
  const remoteParticipants = useRemoteParticipants();
  const tracks = useTracks([Track.Source.Microphone], { onlySubscribed: true });
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (tracks.length > 0 && audioRef.current) {
      const trackRef = tracks[0];
      if (trackRef.publication?.track) {
        audioRef.current.srcObject = new MediaStream([trackRef.publication.track.mediaStreamTrack]);
      }
    }
  }, [tracks]);

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${tracks.length > 0 ? 'bg-green-500' : 'bg-gray-400'}`} />
        <span>{tracks.length > 0 ? 'Receiving Audio' : 'No Audio Stream'}</span>
      </div>
      
      <div className="text-sm text-gray-600">
        Listeners: {remoteParticipants.length}
      </div>
      
      <audio
        ref={audioRef}
        autoPlay
        controls
        className="w-full"
      />
    </div>
  );
}

export function LiveKitAudioMixer() {
  const tracks = useTracks([Track.Source.Microphone], { onlySubscribed: true });
  const [volumes, setVolumes] = useState<Record<string, number>>({});

  const updateVolume = (trackId: string, volume: number) => {
    setVolumes(prev => ({ ...prev, [trackId]: volume }));
    
    const trackRef = tracks.find(t => t.publication?.track?.sid === trackId);
    if (trackRef?.publication?.track) {
      console.log(`Setting volume for track ${trackId} to ${volume}`);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <h3 className="text-lg font-semibold">Audio Mixer</h3>
      
      {tracks.map((trackRef) => (
        <div key={trackRef.publication?.track?.sid} className="flex items-center gap-4 p-2 border rounded">
          <span className="min-w-0 flex-1 truncate">
            {trackRef.participant?.name || trackRef.participant?.identity}
          </span>
          
          <input
            type="range"
            min="0"
            max="100"
            value={volumes[trackRef.publication?.track?.sid || ''] || 100}
            onChange={(e) => updateVolume(trackRef.publication?.track?.sid || '', parseInt(e.target.value))}
            className="w-24"
          />
          
          <span className="text-sm text-gray-600 w-8">
            {volumes[trackRef.publication?.track?.sid || ''] || 100}%
          </span>
        </div>
      ))}
      
      {tracks.length === 0 && (
        <div className="text-gray-500 text-center py-4">
          No audio tracks available
        </div>
      )}
    </div>
  );
}