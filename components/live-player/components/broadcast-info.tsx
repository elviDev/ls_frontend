import { Radio } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BroadcastData } from "../types";

interface BroadcastInfoProps {
  currentBroadcast: BroadcastData | null;
  upcomingBroadcast: BroadcastData | null;
  currentShow: string;
  isLive: boolean;
  size?: 'sm' | 'md';
}

export function BroadcastInfo({ 
  currentBroadcast, 
  upcomingBroadcast, 
  currentShow, 
  isLive,
  size = 'md' 
}: BroadcastInfoProps) {
  const textSize = size === 'sm' ? 'text-sm' : 'text-base';
  const subtextSize = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-1">
        <p className={`font-medium ${textSize} truncate`}>
          {currentBroadcast ? "Live Now" : upcomingBroadcast ? "Coming Up" : "Radio Station"}
        </p>
        {currentBroadcast && isLive && (
          <Badge variant="outline" className="text-xs px-1.5 py-0.5">
            <Radio className="h-3 w-3 mr-1 text-red-500" />
            LIVE
          </Badge>
        )}
        {!isLive && (
          <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
            Music
          </Badge>
        )}
      </div>
      <p className={`${subtextSize} text-muted-foreground truncate`}>{currentShow}</p>
      {currentBroadcast?.hostUser && (
        <p className="text-xs text-muted-foreground">
          with {currentBroadcast.hostUser.firstName} {currentBroadcast.hostUser.lastName}
        </p>
      )}
    </div>
  );
}