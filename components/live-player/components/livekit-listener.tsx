"use client";

import { useState, useEffect } from "react";
import { RoomProvider } from "@/providers/global-livekit-provider";
import {
  RoomAudioRenderer,
  ControlBar,
  useAudioPlayback,
} from "@livekit/components-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { EnhancedLiveKitChat } from "@/components/studio/enhanced-livekit-chat";
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

  return (
    <div data-lk-theme="default" className="h-full flex flex-col">
      <Card className="mb-4">
        <CardContent className="p-4">
          {!canPlayAudio ? (
            <div className="text-center">
              <Button onClick={startAudio} variant="default" size="lg">
                🔊 Enable Audio to Join
              </Button>
            </div>
          ) : (
            <ControlBar variation="minimal" saveUserChoices={true} />
          )}
        </CardContent>
      </Card>

      {/* Chat Sheet */}
      <div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full mb-4">
              <MessageCircle className="h-4 w-4 mr-2" />
              Open Chat
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh]">
            <SheetHeader>
              <SheetTitle>Live Chat</SheetTitle>
            </SheetHeader>
            <div className="mt-4 h-full">
              <EnhancedLiveKitChat
                broadcastId={roomName}
                currentUser={{
                  id: userId,
                  username: userName,
                  role: "user",
                }}
                isLive={true}
                showModerationFeatures={false}
                showAnnouncements={false}
                className="h-full"
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}

interface LiveKitListenerProps {
  roomName: string;
  userId: string;
  userName: string;
  onConnectionChange: (connected: boolean) => void;
  volume: number;
  muted: boolean;
}

export function LiveKitListener({
  roomName,
  userId,
  userName,
  onConnectionChange,
  volume,
  muted,
}: LiveKitListenerProps) {
  const [controlsOpen, setControlsOpen] = useState(false);

  return (
    <RoomProvider
      roomId={`listener-${roomName}`}
      roomName={roomName}
      userId={userId}
      userName={userName}
      role="listener"
    >
      <RoomAudioRenderer />
      
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
                roomName={roomName}
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
