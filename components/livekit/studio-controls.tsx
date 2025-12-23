"use client";

import React from 'react';
import { useLocalParticipant, useTracks } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, MicOff, Radio } from 'lucide-react';

export function LiveKitStudioControls() {
  const { localParticipant } = useLocalParticipant();
  const [isPublishing, setIsPublishing] = React.useState(false);

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

      setIsPublishing(true);
    } catch (error) {
      console.error('Failed to start broadcast:', error);
    }
  };

  const stopBroadcast = () => {
    localParticipant.unpublishTrack(localParticipant.getTrackPublication(Track.Source.Microphone)?.track!);
    setIsPublishing(false);
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isPublishing ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`} />
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4" />
              <span className="font-medium">
                {isPublishing ? 'Live Broadcasting' : 'Ready to Broadcast'}
              </span>
            </div>
          </div>
          
          <Button
            onClick={isPublishing ? stopBroadcast : startBroadcast}
            variant={isPublishing ? "destructive" : "default"}
            size="sm"
          >
            {isPublishing ? (
              <>
                <MicOff className="h-4 w-4 mr-2" />
                Stop
              </>
            ) : (
              <>
                <Mic className="h-4 w-4 mr-2" />
                Go Live
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}