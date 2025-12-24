"use client";

import { useState, useEffect } from "react";
import {
  RoomAudioRenderer,
  useLocalParticipant,
  ConnectionQualityIndicator,
  BarVisualizer,
  useTracks,
  useRoomContext,
} from "@livekit/components-react";
import { Track, ConnectionState } from "livekit-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Mic,
  MicOff,
  Radio,
  Users,
  MessageCircle,
  Settings,
  Sliders,
  Music,
  Zap,
  BarChart3,
} from "lucide-react";
import { StudioUsers } from "./components/studio-users";
import { EnhancedLiveKitChat } from "./enhanced-livekit-chat";
import { AnalyticsDashboard } from "./analytics-dashboard";
import { useBroadcastStore } from "@/stores/broadcast-store";
import "@livekit/components-styles";

interface StudioInterfaceProps {
  broadcastId: string;
  stationName: string;
}

function BroadcastControls({ broadcastId }: { broadcastId: string }) {
  const { localParticipant } = useLocalParticipant();
  const { updateBroadcastStatus, setBroadcast, currentBroadcast } = useBroadcastStore();
  const [isPublishing, setIsPublishing] = useState(false);
  const tracks = useTracks([Track.Source.Microphone], {
    onlySubscribed: false,
  }).filter((track) => track.participant === localParticipant);

  // Sync local state with global broadcast state and microphone status
  useEffect(() => {
    const isGloballyLive = currentBroadcast?.status === 'LIVE';
    const hasMicTrack = tracks.length > 0 && tracks[0].publication && !tracks[0].publication.isMuted;
    
    if (isGloballyLive && hasMicTrack) {
      setIsPublishing(true);
    } else if (!isGloballyLive) {
      setIsPublishing(false);
    }
  }, [currentBroadcast?.status, tracks.length, tracks[0]?.publication?.isMuted]);

  const startBroadcast = async () => {
    try {
      // Ensure AudioContext is resumed with user gesture
      if (typeof window !== 'undefined' && window.AudioContext) {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }
      }
      
      // Enable microphone with explicit track options to ensure proper track ID
      await localParticipant.setMicrophoneEnabled(true);
      setIsPublishing(true);
      
      // Update global broadcast status
      await updateBroadcastStatus(broadcastId, 'LIVE');
      
      // Set current broadcast in store
      setBroadcast({
        id: broadcastId,
        slug: broadcastId,
        title: 'Live Broadcast',
        status: 'LIVE'
      });
    } catch (error) {
      console.error("Failed to start broadcast:", error);
    }
  };

  const stopBroadcast = async () => {
    try {
      await localParticipant.setMicrophoneEnabled(false);
      setIsPublishing(false);
      
      // Update global broadcast status
      await updateBroadcastStatus(broadcastId, 'ENDED');
      
      // Clear current broadcast from store
      setBroadcast(null);
    } catch (error) {
      console.error("Failed to stop broadcast:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Radio className="h-5 w-5" />
            <span>Broadcast Controls</span>
          </div>
          {/* <ConnectionQualityIndicator /> */}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  isPublishing ? "bg-red-500 animate-pulse" : "bg-gray-400"
                }`}
              />
              <span className="font-medium">
                {isPublishing ? "Live Broadcasting" : "Ready to Broadcast"}
              </span>
            </div>

            <Button
              onClick={isPublishing ? stopBroadcast : startBroadcast}
              variant={isPublishing ? "destructive" : "default"}
            >
              {isPublishing ? (
                <>
                  <MicOff className="h-4 w-4 mr-2" />
                  Stop Broadcast
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4 mr-2" />
                  Go Live
                </>
              )}
            </Button>
          </div>

          {/* Voice visualizer */}
          {tracks.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Voice Level:</label>
              <div className="h-8">
                <BarVisualizer trackRef={tracks[0]} />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ConnectedStudioInterface({
  broadcastId,
  stationName,
}: StudioInterfaceProps) {
  const [isLive, setIsLive] = useState(false);
  const room = useRoomContext();
  const [connectionState, setConnectionState] = useState<ConnectionState>(
    ConnectionState.Disconnected
  );

  useEffect(() => {
    if (!room) return;

    const handleConnectionStateChange = (state: ConnectionState) => {
      setConnectionState(state);
      
      // Handle reconnection for audio issues
      if (state === ConnectionState.Reconnecting) {
        console.log('Room reconnecting, attempting to maintain audio...');
      }
    };

    const handleDisconnected = () => {
      console.log('Room disconnected, attempting to reconnect...');
      // Only attempt reconnection if we're not already trying to reconnect
      if (room.state === ConnectionState.Disconnected) {
        // Wait longer before reconnecting to avoid rapid reconnection loops
        setTimeout(() => {
          if (room.state === ConnectionState.Disconnected) {
            console.log('Attempting room reconnection...');
            // Don't manually reconnect - let LiveKit's built-in reconnection handle it
          }
        }, 5000); // Increased delay to 5 seconds
      }
    };

    setConnectionState(room.state);
    room.on("connectionStateChanged", handleConnectionStateChange);
    room.on("disconnected", handleDisconnected);

    return () => {
      room.off("connectionStateChanged", handleConnectionStateChange);
      room.off("disconnected", handleDisconnected);
    };
  }, [room]);

  if (connectionState !== ConnectionState.Connected) {
    return (
      <div className="space-y-6 p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="text-gray-600">
                {connectionState === ConnectionState.Connecting
                  ? "Connecting to studio..."
                  : "Waiting for connection..."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6" data-lk-theme="default">
      {/* Hidden audio renderer */}
      <RoomAudioRenderer />

      {/* Studio Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{stationName}</h1>
          <p className="text-gray-600">Broadcast ID: {broadcastId}</p>
        </div>
      </div>

      {/* Broadcast Controls */}
      <BroadcastControls broadcastId={broadcastId} />

      {/* Studio Tabs */}
      <Tabs defaultValue="participants" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="participants" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Participants</span>
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Chat</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="participants" className="mt-6">
          <StudioUsers />
        </TabsContent>

        <TabsContent value="chat" className="mt-6">
          <EnhancedLiveKitChat
            broadcastId={broadcastId}
            currentUser={{
              id: "host",
              username: "Host",
              role: "host",
            }}
            isLive={isLive}
          />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <AnalyticsDashboard isLive={isLive} />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Studio Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Studio settings will be available here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export function StudioInterface(props: StudioInterfaceProps) {
  return <ConnectedStudioInterface {...props} />;
}
