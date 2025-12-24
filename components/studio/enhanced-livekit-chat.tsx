"use client";

import { useState, useRef, useEffect } from "react";
import {
  Chat,
  ChatEntry,
  useChat,
  useLocalParticipant,
  useRoomContext,
} from "@livekit/components-react";
import { DataPacket_Kind, RemoteParticipant } from "livekit-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  MessageSquare,
  Send,
  Pin,
  PinOff,
  Megaphone,
  Ban,
  Volume2,
  VolumeX,
  Trash2,
  Crown,
  Shield,
  AlertTriangle,
} from "lucide-react";
import "@livekit/components-styles";

interface EnhancedLiveKitChatProps {
  broadcastId: string;
  currentUser: {
    id: string;
    username: string;
    role: "host" | "moderator" | "user";
  };
  isLive: boolean;
  showModerationFeatures?: boolean;
  showAnnouncements?: boolean;
  className?: string;
}

interface ModerationAction {
  type: "pin" | "unpin" | "delete" | "mute" | "ban" | "announcement";
  messageId?: string;
  userId?: string;
  content?: string;
}

export function EnhancedLiveKitChat({
  broadcastId,
  currentUser,
  isLive,
  showModerationFeatures = true,
  showAnnouncements = true,
  className = "",
}: EnhancedLiveKitChatProps) {
  const { localParticipant } = useLocalParticipant();
  const room = useRoomContext();
  const { chatMessages, send } = useChat();
  const [announcementText, setAnnouncementText] = useState("");
  const [pinnedMessage, setPinnedMessage] = useState<string | null>(null);
  const [mutedUsers, setMutedUsers] = useState<Set<string>>(new Set());
  const [bannedUsers, setBannedUsers] = useState<Set<string>>(new Set());
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const isHost = currentUser.role === "host";
  const isModerator = currentUser.role === "moderator" || isHost;

  // Send moderation action to all participants
  const sendModerationAction = async (action: ModerationAction) => {
    if (!room || !isModerator) return;

    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(
        JSON.stringify({
          type: "moderation",
          action,
          moderator: currentUser.username,
          timestamp: Date.now(),
        })
      );

      await room.localParticipant.publishData(data);
    } catch (error) {
      console.error("Failed to send moderation action:", error);
    }
  };

  // Handle incoming moderation actions
  useEffect(() => {
    if (!room) return;

    const handleDataReceived = (
      payload: Uint8Array,
      participant?: RemoteParticipant
    ) => {
      try {
        const decoder = new TextDecoder();
        const data = JSON.parse(decoder.decode(payload));

        if (data.type === "moderation") {
          const action = data.action as ModerationAction;

          switch (action.type) {
            case "pin":
              setPinnedMessage(action.messageId || null);
              break;
            case "unpin":
              setPinnedMessage(null);
              break;
            case "mute":
              if (action.userId) {
                setMutedUsers((prev) => new Set(prev).add(action.userId!));
              }
              break;
            case "ban":
              if (action.userId) {
                setBannedUsers((prev) => new Set(prev).add(action.userId!));
              }
              break;
          }
        }
      } catch (error) {
        console.error("Failed to parse moderation data:", error);
      }
    };

    room.on("dataReceived", handleDataReceived);
    return () => {
      room.off("dataReceived", handleDataReceived);
    };
  }, [room]);

  const handlePinMessage = async (messageId: string) => {
    if (!isModerator) return;

    const newPinnedId = pinnedMessage === messageId ? null : messageId;
    setPinnedMessage(newPinnedId);

    await sendModerationAction({
      type: newPinnedId ? "pin" : "unpin",
      messageId: newPinnedId || messageId,
    });

    toast.success(newPinnedId ? "Message pinned" : "Message unpinned");
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!isModerator) return;

    await sendModerationAction({
      type: "delete",
      messageId,
    });

    toast.success("Message deleted");
  };

  const handleMuteUser = async (userId: string) => {
    if (!isModerator) return;

    const isMuted = mutedUsers.has(userId);
    if (isMuted) {
      setMutedUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    } else {
      setMutedUsers((prev) => new Set(prev).add(userId));
    }

    await sendModerationAction({
      type: "mute",
      userId,
    });

    toast.success(isMuted ? "User unmuted" : "User muted");
  };

  const handleBanUser = async (userId: string) => {
    if (!isHost) return;

    setBannedUsers((prev) => new Set(prev).add(userId));

    await sendModerationAction({
      type: "ban",
      userId,
    });

    toast.success("User banned");
  };

  const sendAnnouncement = async () => {
    if (!announcementText.trim() || !isModerator) return;

    await sendModerationAction({
      type: "announcement",
      content: announcementText,
    });

    // Send as regular chat message with special formatting
    if (localParticipant) {
      await localParticipant.publishData(
        new TextEncoder().encode(
          JSON.stringify({
            type: "announcement",
            message: `📢 ANNOUNCEMENT: ${announcementText}`,
            from: currentUser.username,
          })
        )
      );
    }

    setAnnouncementText("");
    toast.success("Announcement sent");
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "host":
        return Crown;
      case "moderator":
        return Shield;
      default:
        return null;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "host":
        return "text-purple-600";
      case "moderator":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  const pinnedChatMessage = pinnedMessage
    ? chatMessages.find((msg) => msg.id === pinnedMessage)
    : null;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Pinned Message */}
      {pinnedChatMessage && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2 min-w-0 flex-1">
                <Pin className="h-4 w-4 text-yellow-600 mt-1 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">
                      {pinnedChatMessage.from?.name || "Unknown"}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      Pinned
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700 break-words">
                    {pinnedChatMessage.message}
                  </p>
                </div>
              </div>
              {isModerator && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handlePinMessage(pinnedChatMessage.id)}
                >
                  <PinOff className="h-3 w-3" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Announcement Input (Host/Moderator only) */}
      {isModerator && showAnnouncements && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-3">
            <div className="flex gap-2">
              <Input
                placeholder="Send announcement to all listeners..."
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendAnnouncement()}
                className="flex-1"
              />
              <Button
                onClick={sendAnnouncement}
                disabled={!announcementText.trim()}
                size="sm"
              >
                <Megaphone className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Chat */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              <span>Studio Chat</span>
            </div>
            <div className="flex items-center gap-2">
              {isLive && (
                <Badge variant="destructive" className="animate-pulse">
                  LIVE
                </Badge>
              )}
              <Badge variant="outline">{chatMessages.length} messages</Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-64 sm:h-80 md:h-96 flex flex-col">
            {/* Custom Chat Messages with Moderation */}
            <ScrollArea className="flex-1 p-2 sm:p-4" ref={scrollAreaRef}>
              <div className="space-y-3">
                {chatMessages.map((msg) => {
                  const isFromMutedUser = mutedUsers.has(
                    msg.from?.identity || ""
                  );
                  const isFromBannedUser = bannedUsers.has(
                    msg.from?.identity || ""
                  );

                  if (isFromBannedUser) return null;

                  return (
                    <div
                      key={msg.id}
                      className={`group relative p-2 sm:p-3 rounded-lg border transition-colors ${
                        msg.id === pinnedMessage
                          ? "border-yellow-300 bg-yellow-50"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      } ${isFromMutedUser ? "opacity-50" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 min-w-0 flex-1">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">
                                {msg.from?.name || "Unknown"}
                              </span>
                              {msg.from?.identity && (
                                <>
                                  {(() => {
                                    const RoleIcon = getRoleIcon(
                                      currentUser.role
                                    );
                                    return RoleIcon ? (
                                      <div
                                        className={getRoleColor(
                                          currentUser.role
                                        )}
                                      >
                                        <RoleIcon className="h-3 w-3" />
                                      </div>
                                    ) : null;
                                  })()}
                                </>
                              )}
                              <span className="text-xs text-gray-500">
                                {new Date(msg.timestamp).toLocaleTimeString()}
                              </span>
                              {isFromMutedUser && (
                                <Badge variant="secondary" className="text-xs">
                                  <VolumeX className="h-3 w-3 mr-1" />
                                  Muted
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-700 break-words">
                              {msg.message}
                            </p>
                          </div>
                        </div>

                        {/* Moderation Actions */}
                        {isModerator && showModerationFeatures && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 flex-wrap sm:flex-nowrap">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handlePinMessage(msg.id)}
                              title={
                                msg.id === pinnedMessage
                                  ? "Unpin message"
                                  : "Pin message"
                              }
                            >
                              {msg.id === pinnedMessage ? (
                                <PinOff className="h-3 w-3" />
                              ) : (
                                <Pin className="h-3 w-3" />
                              )}
                            </Button>

                            {msg.from?.identity && (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() =>
                                    handleMuteUser(msg.from!.identity!)
                                  }
                                  title={
                                    isFromMutedUser
                                      ? "Unmute user"
                                      : "Mute user"
                                  }
                                >
                                  {isFromMutedUser ? (
                                    <Volume2 className="h-3 w-3" />
                                  ) : (
                                    <VolumeX className="h-3 w-3" />
                                  )}
                                </Button>

                                {isHost && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() =>
                                      handleBanUser(msg.from!.identity!)
                                    }
                                    title="Ban user"
                                  >
                                    <Ban className="h-3 w-3" />
                                  </Button>
                                )}
                              </>
                            )}

                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteMessage(msg.id)}
                              title="Delete message"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            {/* Custom Chat Input */}
            <div className="p-2 sm:p-4 border-t bg-white">
              <div className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.currentTarget.value.trim()) {
                      send(e.currentTarget.value);
                      e.currentTarget.value = "";
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    if (input?.value.trim()) {
                      send(input.value);
                      input.value = "";
                    }
                  }}
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
