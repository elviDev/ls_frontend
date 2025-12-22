"use client";

import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/auth-context";
import { useBroadcastData } from "./live-player/hooks/use-broadcast-data";
import { useAudioPlayer } from "./live-player/hooks/use-audio-player";
import { PlayButton } from "./live-player/components/play-button";
import { VolumeControl } from "./live-player/components/volume-control";
import { BroadcastInfo } from "./live-player/components/broadcast-info";
import { AudioVisualizer } from "./live-player/components/audio-visualizer";
import { ConnectionStatus } from "./live-player/components/connection-status";
import { ShareButton } from "./live-player/components/share-button";
import { ScheduleSheet } from "./live-player/components/schedule-sheet";
import { ChatToggle } from "./live-player/components/chat-toggle";

interface LivePlayerProps {
  broadcastId?: string;
}

function LivePlayerInterface({ broadcastId }: LivePlayerProps) {
  const { user } = useAuth();
  const { state: broadcastState } = useBroadcastData(broadcastId);
  const audioPlayer = useAudioPlayer();

  const togglePlay = async () => {
    if (broadcastState.streamUrl) {
      await audioPlayer.togglePlay(broadcastState.streamUrl);
    }
  };

  const isPlaying = audioPlayer.state.isPlaying;
  const isLoading = audioPlayer.state.isLoading;
  const connectionState = audioPlayer.state.isPlaying ? 'connected' : 'disconnected';
  const isLive = !!broadcastState.currentBroadcast;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-lg">
      <div className="container mx-auto px-2 sm:px-4 py-2">
        {audioPlayer.state.error && (
          <Alert className="mb-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{audioPlayer.state.error}</AlertDescription>
          </Alert>
        )}

        {/* Mobile Layout */}
        <div className="md:hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <PlayButton 
                isPlaying={isPlaying} 
                isLoading={isLoading} 
                onToggle={togglePlay} 
                size="sm" 
              />
              <BroadcastInfo 
                currentBroadcast={broadcastState.currentBroadcast}
                upcomingBroadcast={broadcastState.upcomingBroadcast}
                currentShow={broadcastState.currentShow}
                isLive={isLive}
                size="sm"
              />
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              <VolumeControl 
                volume={audioPlayer.state.volume}
                isMuted={audioPlayer.state.isMuted}
                onVolumeChange={audioPlayer.setVolume}
                onMuteToggle={audioPlayer.toggleMute}
                className="w-8 h-8"
              />
              <ShareButton 
                streamUrl={broadcastState.streamUrl}
                currentBroadcast={broadcastState.currentBroadcast}
                size="sm"
              />
              <ChatToggle 
                broadcastId={broadcastState.currentBroadcast?.id}
                size="sm"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2 mb-1">
            <VolumeControl 
              volume={audioPlayer.state.volume}
              isMuted={audioPlayer.state.isMuted}
              onVolumeChange={audioPlayer.setVolume}
              onMuteToggle={audioPlayer.toggleMute}
              className="flex-1"
            />
            <ScheduleSheet schedule={broadcastState.schedule} size="sm" />
          </div>
          
          <div className="flex items-center justify-between">
            <ConnectionStatus connectionState={connectionState} isLive={isLive} />
            <AudioVisualizer 
              isPlaying={isPlaying} 
              audioLevel={audioPlayer.state.bufferHealth} 
              barCount={3} 
              size="sm" 
            />
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <PlayButton 
              isPlaying={isPlaying} 
              isLoading={isLoading} 
              onToggle={togglePlay} 
            />
            <div>
              <BroadcastInfo 
                currentBroadcast={broadcastState.currentBroadcast}
                upcomingBroadcast={broadcastState.upcomingBroadcast}
                currentShow={broadcastState.currentShow}
                isLive={isLive}
              />
              <ConnectionStatus connectionState={connectionState} isLive={isLive} />
            </div>
          </div>

          <VolumeControl 
            volume={audioPlayer.state.volume}
            isMuted={audioPlayer.state.isMuted}
            onVolumeChange={audioPlayer.setVolume}
            onMuteToggle={audioPlayer.toggleMute}
            className="w-1/3"
          />

          <div className="flex items-center">
            <div className="hidden lg:block mr-4">
              <AudioVisualizer 
                isPlaying={isPlaying} 
                audioLevel={audioPlayer.state.bufferHealth} 
              />
            </div>
            <ShareButton 
              streamUrl={broadcastState.streamUrl}
              currentBroadcast={broadcastState.currentBroadcast}
            />
            <ChatToggle 
              broadcastId={broadcastState.currentBroadcast?.id}
            />
            <ScheduleSheet schedule={broadcastState.schedule} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LivePlayer({ broadcastId }: LivePlayerProps) {
  return <LivePlayerInterface broadcastId={broadcastId} />;
}
