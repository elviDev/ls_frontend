import { Radio, Users, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StudioHeaderProps {
  stationName: string;
  broadcastId: string;
  isLive: boolean;
  listenerCount: number;
  onStartBroadcast: () => void;
  onStopBroadcast: () => void;
  isLoading?: boolean;
}

export function StudioHeader({
  stationName,
  broadcastId,
  isLive,
  listenerCount,
  onStartBroadcast,
  onStopBroadcast,
  isLoading = false
}: StudioHeaderProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Radio className="h-6 w-6" />
            <div>
              <CardTitle>{stationName}</CardTitle>
              <p className="text-sm text-muted-foreground">ID: {broadcastId}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={isLive ? "destructive" : "secondary"}>
              {isLive ? "LIVE" : "OFF AIR"}
            </Badge>
            <Badge variant="outline">
              <Users className="h-3 w-3 mr-1" />
              {listenerCount}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2">
          {!isLive ? (
            <Button onClick={onStartBroadcast} disabled={isLoading}>
              {isLoading ? (
                <Activity className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Radio className="h-4 w-4 mr-2" />
              )}
              Go Live
            </Button>
          ) : (
            <Button onClick={onStopBroadcast} variant="destructive" disabled={isLoading}>
              <Radio className="h-4 w-4 mr-2" />
              End Broadcast
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}