import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useChat } from "@/contexts/chat";

interface ChatToggleProps {
  broadcastId?: string;
  size?: 'sm' | 'md';
}

export function ChatToggle({ broadcastId, size = 'md' }: ChatToggleProps) {
  const { state, toggleChat } = useChat();
  
  if (!broadcastId) return null;

  const buttonSize = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';

  return (
    <Button
      onClick={toggleChat}
      variant="ghost"
      size="icon"
      className={`${buttonSize} rounded-full bg-primary/10 hover:bg-primary/20 text-primary relative`}
    >
      <MessageCircle className={iconSize} />
      {state.unreadCount > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs"
        >
          {state.unreadCount > 9 ? '9+' : state.unreadCount}
        </Badge>
      )}
    </Button>
  );
}