"use client";

import { useState, useEffect, useContext } from "react";
import { RoomProvider } from "@/providers/global-livekit-provider";
import {
  RoomAudioRenderer,
  ControlBar,
  useAudioPlayback,
  RoomContext,
  useTracks,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { UnifiedBroadcastChat } from "@/components/chat/unified-broadcast-chat";
import { Settings, MessageCircle } from "lucide-react";
import "@livekit/components-styles";

function ListenerControls({
  roomName,
  userId,
  userName,
}: {
  roomName: string;
  userId: string;
  userName: string;
}) {
  const { canPlayAudio, startAudio } = useAudioPlayback();
  const room = useContext(RoomContext);
  const audioTracks = useTracks([Track.Source.Microphone], {
    onlySubscribed: true,
  });
  const allTracks = useTracks([Track.Source.Microphone], {
    onlySubscribed: false,
  });

  useEffect(() => {
    console.log(
      "🎧 [Listener] Room participants:",
      room?.remoteParticipants.size || 0
    );
    console.log(
      "🎧 [Listener] All tracks (subscribed + unsubscribed):",
      allTracks.length
    );
    console.log("🎧 [Listener] Subscribed audio tracks:", audioTracks.length);

    allTracks.forEach((track, index) => {
      console.log(`🎧 [Listener] Track ${index}:`, {
        participant: track.participant.identity,
        isLocal: track.participant.isLocal,
        isMuted: track.publication?.isMuted,
        isSubscribed: track.publication?.isSubscribed,
        trackSid: track.publication?.trackSid,
      });
    });

    // Log remote participants
    room?.remoteParticipants.forEach((participant, identity) => {
      console.log(`👤 [Listener] Remote participant ${identity}:`, {
        audioTracks: participant.audioTrackPublications.size,
        videoTracks: participant.videoTrackPublications.size,
      });
    });
  }, [audioTracks, allTracks, room]);

  return (
    <div data-lk-theme="default" className="h-full flex flex-col">
      <Card className="mb-4">
        <CardContent className="p-4">
          {!canPlayAudio ? (
            <div className="text-center space-y-2">
              <Button onClick={startAudio} variant="default" size="lg">
                🔊 Enable Audio to Join
              </Button>
              <p className="text-sm text-gray-600">
                Remote participants: {room?.remoteParticipants.size || 0}
                <br />
                Audio tracks: {audioTracks.length}/{allTracks.length}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <ControlBar variation="minimal" saveUserChoices={true} />
              <p className="text-xs text-gray-500">
                Listening to {audioTracks.length} audio source(s) from{" "}
                {room?.remoteParticipants.size || 0} participants
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chat Sheet */}
      <div>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className="w-full mb-4 bg-primary hover:bg-primary hover:text-white"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Open Chat
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh]">
            <SheetHeader>
              <SheetTitle>Live Chat</SheetTitle>
            </SheetHeader>
            <div className="mt-4 h-full">
              <UnifiedBroadcastChat
                broadcastId={roomName}
                className="h-full"
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}

// Connection monitor component
function ConnectionMonitor({
  onConnectionChange,
}: {
  onConnectionChange: (connected: boolean) => void;
}) {
  const room = useContext(RoomContext);

  useEffect(() => {
    if (!room) return;

    const handleConnected = () => {
      console.log("✅ [Listener] Connected to room");
      onConnectionChange(true);
    };

    const handleDisconnected = () => {
      console.log("⚠️ [Listener] Disconnected from room");
      onConnectionChange(false);
    };

    // Only check initial state if already connected
    if (room.state === "connected") {
      handleConnected();
    }

    room.on("connected", handleConnected);
    room.on("disconnected", handleDisconnected);

    return () => {
      room.off("connected", handleConnected);
      room.off("disconnected", handleDisconnected);
    };
  }, [room, onConnectionChange]);

  return null;
}

interface LiveKitListenerProps {
  broadcastId: string;
  userId: string;
  userName: string;
  onConnectionChange: (connected: boolean) => void;
  volume: number;
  muted: boolean;
  isPlaying: boolean;
  onPlayingChange: (playing: boolean) => void;
}

export function LiveKitListener({
  broadcastId,
  userId,
  userName,
  onConnectionChange,
  volume,
  muted,
  isPlaying,
  onPlayingChange,
}: LiveKitListenerProps) {
  const [controlsOpen, setControlsOpen] = useState(false);
  const [connectionState, setConnectionState] = useState<
    "connecting" | "connected" | "disconnected"
  >("connecting");

  // Handle connection state changes
  useEffect(() => {
    const handleConnection = (connected: boolean) => {
      setConnectionState(connected ? "connected" : "disconnected");
      onConnectionChange(connected);
    };

    // Initial connection state
    handleConnection(false);

    return () => {
      // Cleanup
      setConnectionState("disconnected");
    };
  }, [onConnectionChange]);

  // Only connect to room when user wants to play
  if (!isPlaying) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-gray-400 rounded-full" />
            Ready to join
          </div>
        </div>
      </div>
    );
  }

  return (
    <RoomProvider
      broadcastId={broadcastId}
      userId={userId}
      userName={userName}
      role="listener"
    >
      <ConnectionMonitor onConnectionChange={onConnectionChange} />
      <RoomAudioRenderer volume={volume / 100} muted={muted} />

      {/* Audio Controls Only */}
      <div className="fixed bottom-4 right-4 z-50">
        <Sheet open={controlsOpen} onOpenChange={setControlsOpen}>
          <SheetTrigger asChild>
            <Button size="lg" className="rounded-full shadow-lg">
              <Settings className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[90vh]">
            <SheetHeader>
              <SheetTitle>Listener Controls</SheetTitle>
            </SheetHeader>
            <div className="mt-4 h-full overflow-hidden">
              <ListenerControls
                roomName={broadcastId}
                userId={userId}
                userName={userName}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </RoomProvider>
  );
}
