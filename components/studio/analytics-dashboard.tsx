"use client";

import { useState, useEffect } from "react";
import {
  useParticipants,
  useRoomContext,
  useChat,
} from "@livekit/components-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  TrendingUp,
  MessageSquare,
  Clock,
  Activity,
  Monitor,
  Signal,
  Wifi,
  Volume2,
} from "lucide-react";

interface ListenerData {
  id: string;
  name: string;
  location: {
    city: string;
    country: string;
    countryCode: string;
  };
  joinedAt: Date;
  device: "desktop" | "mobile" | "tablet";
  browser: string;
  listenDuration: number;
  quality: "high" | "medium" | "low";
  interactions: number;
  isActive: boolean;
}

interface AnalyticsData {
  currentListeners: number;
  peakListeners: number;
  totalListeners: number;
  averageListenTime: number;
  chatMessages: number;
  likes: number;
  shares: number;
  streamQuality: number;
  bandwidth: number;
  locations: { [country: string]: number };
  devices: { [device: string]: number };
  qualityDistribution: { [quality: string]: number };
  hourlyStats: Array<{
    hour: number;
    listeners: number;
    engagement: number;
  }>;
}

interface AnalyticsDashboardProps {
  isLive: boolean;
}

export function AnalyticsDashboard({ isLive }: AnalyticsDashboardProps) {
  const participants = useParticipants();
  const room = useRoomContext();
  const { chatMessages } = useChat();
  const [sessionStats, setSessionStats] = useState({
    peakParticipants: 0,
    totalJoined: 0,
    sessionStart: new Date(),
    totalChatMessages: 0,
  });

  // Track session statistics
  useEffect(() => {
    const currentCount = participants.length;
    
    // Log participant details for debugging
    console.log('📊 Participants Update:', {
      count: currentCount,
      participants: participants.map(p => ({
        identity: p.identity,
        name: p.name,
        sid: p.sid,
        connectionQuality: p.connectionQuality,
        isLocal: p.isLocal
      }))
    });
    
    setSessionStats((prev) => ({
      ...prev,
      peakParticipants: Math.max(prev.peakParticipants, currentCount),
      totalJoined: Math.max(prev.totalJoined, currentCount),
      totalChatMessages: chatMessages.length,
    }));
  }, [participants.length, chatMessages.length, participants]);

  // Calculate session duration
  const [sessionDuration, setSessionDuration] = useState(0);
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      const duration = Math.floor(
        (Date.now() - sessionStats.sessionStart.getTime()) / 1000 / 60
      );
      setSessionDuration(duration);
    }, 60000);

    return () => clearInterval(interval);
  }, [isLive, sessionStats.sessionStart]);

  // Calculate listener count (exclude hosts and moderators)
  const listenerCount = participants.filter(p => 
    !p.identity.includes('host') && !p.identity.includes('moderator')
  ).length;

  // Analyze participant data
  const participantAnalytics = {
    byRole: participants.reduce(
      (acc, p) => {
        const role = p.identity.includes("host")
          ? "host"
          : p.identity.includes("moderator")
            ? "moderator"
            : "listener";
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ),

    withAudio: participants.filter((p) =>
      [...p.audioTrackPublications.values()].some((pub) => !pub.isMuted)
    ).length,

    connectionQuality: participants.reduce(
      (acc, p) => {
        const quality = p.connectionQuality || "unknown";
        acc[quality] = (acc[quality] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ),
  };

  const getConnectionQualityColor = (quality: string) => {
    switch (quality) {
      case "excellent":
        return "text-green-600";
      case "good":
        return "text-blue-600";
      case "poor":
        return "text-yellow-600";
      default:
        return "text-red-600";
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Real-time Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{listenerCount}</div>
                <div className="text-xs text-gray-500">Live Listeners</div>
              </div>
            </div>
            <div className="mt-2 flex items-center text-xs">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-green-500">
                Total: {participants.length} participants
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{sessionDuration}</div>
                <div className="text-xs text-gray-500">
                  Session Duration (min)
                </div>
              </div>
            </div>
            <div className="mt-2 flex items-center text-xs">
              <Activity className="h-3 w-3 text-blue-500 mr-1" />
              <span className="text-blue-500">
                {isLive ? "Live" : "Offline"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-8 w-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">{chatMessages.length}</div>
                <div className="text-xs text-gray-500">Chat Messages</div>
              </div>
            </div>
            <div className="mt-2 flex items-center text-xs">
              <Volume2 className="h-3 w-3 text-purple-500 mr-1" />
              <span className="text-purple-500">
                {participantAnalytics.withAudio} speaking
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Signal className="h-8 w-8 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">
                  {room?.state || "Unknown"}
                </div>
                <div className="text-xs text-gray-500">Room Status</div>
              </div>
            </div>
            <div className="mt-2 flex items-center text-xs">
              <Wifi className="h-3 w-3 text-blue-500 mr-1" />
              <span className="text-blue-500">LiveKit Connected</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="participants" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="participants">Live Participants</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          <TabsTrigger value="quality">Connection Quality</TabsTrigger>
        </TabsList>

        <TabsContent value="participants" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Active Participants</span>
                <Badge variant="outline">{participants.length} connected</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {participants.map((participant) => {
                    const hasAudio = [
                      ...participant.audioTrackPublications.values(),
                    ].some((pub) => !pub.isMuted);
                    const hasVideo = [
                      ...participant.videoTrackPublications.values(),
                    ].some((pub) => !pub.isMuted);

                    return (
                      <div
                        key={participant.identity}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium">
                              {participant.name?.charAt(0) ||
                                participant.identity.charAt(0)}
                            </div>
                            <div
                              className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                                participant.connectionQuality === "excellent"
                                  ? "bg-green-500"
                                  : participant.connectionQuality === "good"
                                    ? "bg-blue-500"
                                    : participant.connectionQuality === "poor"
                                      ? "bg-yellow-500"
                                      : "bg-red-500"
                              }`}
                            />
                          </div>
                          <div>
                            <div className="font-medium text-sm">
                              {participant.name || participant.identity}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-2">
                              {hasAudio && (
                                <Volume2 className="h-3 w-3 text-green-500" />
                              )}
                              {hasVideo && (
                                <Monitor className="h-3 w-3 text-blue-500" />
                              )}
                              <span>
                                {participant.connectionQuality || "unknown"}{" "}
                                connection
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {participant.identity.includes("host")
                              ? "Host"
                              : participant.identity.includes("moderator")
                                ? "Moderator"
                                : "Listener"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {participant.joinedAt
                              ? formatDuration(
                                  Math.floor(
                                    (Date.now() -
                                      participant.joinedAt.getTime()) /
                                      1000 /
                                      60
                                  )
                                )
                              : "Just joined"}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {participants.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No participants connected
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Role Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(participantAnalytics.byRole).map(
                  ([role, count]) => (
                    <div key={role} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              role === "host"
                                ? "bg-purple-500"
                                : role === "moderator"
                                  ? "bg-blue-500"
                                  : "bg-green-500"
                            }`}
                          />
                          <span className="font-medium capitalize">
                            {role}s
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">{count}</span>
                          <span className="text-xs text-gray-500">
                            (
                            {participants.length > 0
                              ? ((count / participants.length) * 100).toFixed(1)
                              : 0}
                            %)
                          </span>
                        </div>
                      </div>
                      <Progress
                        value={
                          participants.length > 0
                            ? (count / participants.length) * 100
                            : 0
                        }
                        className="h-2"
                      />
                    </div>
                  )
                )}
                {Object.keys(participantAnalytics.byRole).length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    No role data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Connection Quality Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">
                    Connection Quality Distribution
                  </h4>
                  {Object.entries(participantAnalytics.connectionQuality).map(
                    ([quality, count]) => (
                      <div key={quality} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Signal
                              className={`h-4 w-4 ${getConnectionQualityColor(quality)}`}
                            />
                            <span className="font-medium capitalize">
                              {quality}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">
                              {count}
                            </span>
                            <span className="text-xs text-gray-500">
                              (
                              {participants.length > 0
                                ? ((count / participants.length) * 100).toFixed(
                                    1
                                  )
                                : 0}
                              %)
                            </span>
                          </div>
                        </div>
                        <Progress
                          value={
                            participants.length > 0
                              ? (count / participants.length) * 100
                              : 0
                          }
                          className="h-2"
                        />
                      </div>
                    )
                  )}
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-sm">Audio Activity</h4>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Participants with Audio</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        {participantAnalytics.withAudio}
                      </span>
                      <span className="text-xs text-gray-500">
                        of {participants.length} total
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={
                      participants.length > 0
                        ? (participantAnalytics.withAudio /
                            participants.length) *
                          100
                        : 0
                    }
                    className="h-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
