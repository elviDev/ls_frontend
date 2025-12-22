import { Signal } from "lucide-react";

interface ConnectionStatusProps {
  connectionState: 'connected' | 'connecting' | 'disconnected';
  isLive: boolean;
}

export function ConnectionStatus({ connectionState, isLive }: ConnectionStatusProps) {
  const getStatusColor = () => {
    switch (connectionState) {
      case 'connected': return 'text-green-500';
      case 'connecting': return 'text-yellow-500';
      default: return 'text-gray-400';
    }
  };

  const getStatusText = () => {
    switch (connectionState) {
      case 'connected': return isLive ? 'Live Connected' : 'Playing Music';
      case 'connecting': return 'Connecting...';
      default: return isLive ? 'Offline' : 'Music Ready';
    }
  };

  return (
    <div className="flex items-center gap-1">
      <Signal className={`h-3 w-3 ${getStatusColor()}`} />
      <span className="text-xs text-muted-foreground">
        {getStatusText()}
      </span>
    </div>
  );
}