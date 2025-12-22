import { MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EnhancedChat } from "../enhanced-chat";

interface StudioChatProps {
  broadcastId: string;
  currentUser: {
    id: string;
    username: string;
    avatar?: string;
    role: 'host' | 'co-host' | 'guest' | 'admin';
  };
  isLive: boolean;
}

export function StudioChat({ broadcastId, currentUser, isLive }: StudioChatProps) {
  return (
    <EnhancedChat
      isLive={isLive}
      isBroadcastLive={isLive}
      hostId={currentUser.id}
      broadcastId={broadcastId}
      onMessageSend={(message, type) => console.log('Message sent:', message, 'type:', type)}
      onUserAction={(userId, action) => console.log('User action:', userId, action)}
    />
  );
}