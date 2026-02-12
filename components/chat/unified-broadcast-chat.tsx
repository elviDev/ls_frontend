"use client";

import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MessageSquare,
  Send,
  Heart,
  Pin,
  PinOff,
  Megaphone,
  Crown,
  Shield,
  User,
  MoreVertical,
  UserX,
  Ban,
  Volume2,
  VolumeX,
} from "lucide-react";
import { io, Socket } from "socket.io-client";
import { getAuthToken } from "@/lib/auth-token";

interface ChatMessage {
  id: string;
  broadcastId: string;
  userId: string;
  username: string;
  userAvatar?: string;
  content: string;
  messageType: "user" | "host" | "moderator" | "announcement";
  isPinned: boolean;
  likes: number;
  likedBy: string[];
  timestamp: Date;
}

interface UnifiedBroadcastChatProps {
  broadcastId: string;
  className?: string;
}

export function UnifiedBroadcastChat({
  broadcastId,
  className = "",
}: UnifiedBroadcastChatProps) {
  const { user } = useAuthStore();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<number>(0);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isStaff = user?.userType === "staff";
  const isHost = isStaff && (user?.role === "ADMIN" || user?.role === "HOST");
  const isModerator =
    isStaff &&
    (user?.role === "ADMIN" ||
      user?.role === "HOST" ||
      user?.role === "PRODUCER");

  // Initialize Socket.IO connection
  useEffect(() => {
    let SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    // Remove /api suffix if present
    if (SOCKET_SERVER_URL.endsWith("/api")) {
      SOCKET_SERVER_URL = SOCKET_SERVER_URL.slice(0, -4);
    }
    const token = getAuthToken();

    console.log("[Chat] 🔐 Initializing socket connection");
    console.log("[Chat] Auth token present:", !!token);
    console.log("[Chat] User from useAuth():", user);

    const socketConnection = io(SOCKET_SERVER_URL, {
      transports: ["polling", "websocket"],
      upgrade: true,
      rememberUpgrade: false,
      auth: {
        token: token, // Send JWT token for authentication
      },
    });
    setSocket(socketConnection);

    socketConnection.on("connect", () => {
      console.log("[Chat] ✅ Connected to chat server");
      console.log("[Chat] Socket ID:", socketConnection.id);
      setIsConnected(true);

      // Join the broadcast room
      socketConnection.emit("join-broadcast", broadcastId);
      console.log("[Chat] 🏠 Joined broadcast room:", broadcastId);
    });

    socketConnection.on("disconnect", () => {
      console.log("[Chat] Disconnected from chat server");
      setIsConnected(false);
    });

    socketConnection.on("connect_error", (error) => {
      console.error("[Chat] Connection error:", error);
      setIsConnected(false);
    });

    // Listen for chat history when joining a room
    socketConnection.on("chat-history", (messages: ChatMessage[]) => {
      console.log(
        "[Chat] 📜 Received chat history:",
        messages.length,
        "messages"
      );
      setMessages(
        messages.map((msg) => ({
          ...msg,
          likedBy: msg.likedBy || [],
          timestamp: new Date(msg.timestamp),
        }))
      );
    });

    socketConnection.on("chat-message", (message: ChatMessage) => {
      console.log("[Chat] New message received:", message);

      setMessages((prev) => {
        // Remove any temporary message with same content and replace with real message
        const withoutTemp = prev.filter(
          (m) =>
            !(
              m.id.startsWith("temp-") &&
              m.content === message.content &&
              m.userId === message.userId
            )
        );

        // Avoid duplicates of real messages
        if (withoutTemp.some((m) => m.id === message.id)) {
          console.log("[Chat] Duplicate message, skipping");
          return prev;
        }

        console.log("[Chat] Adding new message to list");
        return [
          ...withoutTemp,
          {
            ...message,
            likedBy: message.likedBy || [],
            timestamp: new Date(message.timestamp),
          },
        ];
      });
    });

    socketConnection.on("message-liked", ({ messageId, likes, likedBy }) => {
      console.log("[Chat] Message liked:", messageId, likes);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, likes, likedBy } : msg
        )
      );
    });

    socketConnection.on("message-pinned", ({ messageId, isPinned }) => {
      console.log("[Chat] Message pinned:", messageId, isPinned);
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, isPinned } : msg))
      );
    });

    socketConnection.on("online-users", (count: number) => {
      console.log("[Chat] Online users:", count);
      setOnlineUsers(count);
    });

    // Listen for moderation events
    socketConnection.on("user-kicked", ({ userId, reason }) => {
      console.log("[Chat] User kicked event:", userId, reason);
      if (userId === user?.id) {
        toast.error(`You have been kicked from the chat${reason ? `: ${reason}` : ""}`);
        socketConnection.disconnect();
      }
    });

    socketConnection.on("user-banned", ({ userId, reason, duration }) => {
      console.log("[Chat] User banned event:", userId, reason, duration);
      if (userId === user?.id) {
        toast.error(`You have been banned from the chat${duration ? ` for ${duration} minutes` : ""}${reason ? `: ${reason}` : ""}`);
        socketConnection.disconnect();
      }
    });

    socketConnection.on("user-muted", ({ userId, reason, duration }) => {
      console.log("[Chat] User muted event:", userId, reason, duration);
      if (userId === user?.id) {
        toast.error(`You have been muted${duration ? ` for ${duration} minutes` : ""}${reason ? `: ${reason}` : ""}`);
      }
    });

    socketConnection.on("error", (error) => {
      console.error("[Chat] Socket error:", error);
      toast.error(error.message || "An error occurred");
    });

    // Load existing messages
    loadMessages();

    return () => {
      if (socketConnection) {
        console.log("[Chat] 🚪 Leaving broadcast room:", broadcastId);
        socketConnection.emit("leave-broadcast", broadcastId);
        console.log("[Chat] Cleaning up socket connection");
        socketConnection.disconnect();
      }
    };
  }, [broadcastId, user]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    // Method 1: Use messagesEndRef to scroll into view
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }

    // Method 2: Fallback - directly scroll the viewport
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (viewport) {
        setTimeout(() => {
          viewport.scrollTop = viewport.scrollHeight;
        }, 100);
      }
    }
  }, [messages]);

  const loadMessages = async () => {
    try {
      let API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
      // Ensure /api suffix is present
      if (!API_BASE_URL.endsWith("/api")) {
        API_BASE_URL = `${API_BASE_URL}/api`;
      }
      const response = await fetch(`${API_BASE_URL}/chat/${broadcastId}`);
      if (response.ok) {
        const data = await response.json();
        console.log("[Chat] Loaded messages:", data.messages?.length || 0);
        setMessages(
          data.messages.map((msg: any) => ({
            ...msg,
            likedBy: msg.likedBy || [],
            timestamp: new Date(msg.timestamp || msg.createdAt),
          }))
        );
      }
    } catch (error) {
      console.error("[Chat] Failed to load messages:", error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    const messageType = isHost ? "host" : isModerator ? "moderator" : "user";
    const tempId = `temp-${Date.now()}`;

    const messageData = {
      broadcastId,
      content: newMessage,
      messageType,
    };

    // Optimistic update - add message immediately
    const optimisticMessage: ChatMessage = {
      id: tempId,
      broadcastId,
      userId: user?.id || "anonymous",
      username: user?.username || user?.name || "Anonymous",
      content: newMessage,
      messageType: messageType as any,
      isPinned: false,
      likes: 0,
      likedBy: [],
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setNewMessage("");

    console.log("[Chat] 📤 Sending message to backend");
    console.log("[Chat] Message data:", messageData);
    console.log("[Chat] Socket connected:", socket.connected);
    console.log("[Chat] Socket ID:", socket.id);

    socket.emit("send-message", messageData);
  };

  const sendAnnouncement = async () => {
    if (!newMessage.trim() || !socket || !isModerator) return;

    socket.emit("send-message", {
      broadcastId,
      content: newMessage,
      messageType: "announcement",
    });

    setNewMessage("");
  };

  const toggleLike = async (messageId: string) => {
    if (!socket) return;

    socket.emit("toggle-like", {
      messageId,
      broadcastId,
    });
  };

  const togglePin = async (messageId: string) => {
    if (!socket || !isModerator) return;

    socket.emit("toggle-pin", {
      messageId,
      broadcastId,
    });
  };

  const kickUser = async (userId: string, reason?: string) => {
    if (!socket || !isModerator) {
      console.log("[Chat] Cannot kick - socket:", !!socket, "isModerator:", isModerator);
      return;
    }

    console.log("[Chat] Kicking user:", userId, "reason:", reason);
    
    // Kick from chat
    socket.emit("kick-user", {
      broadcastId,
      targetUserId: userId,
      reason,
    });

    // Also try to remove from LiveKit if they're in the studio
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/livekit/remove-participant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
        },
        body: JSON.stringify({
          roomName: broadcastId,
          participantIdentity: userId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.notInRoom) {
          console.log("[Chat] User not in LiveKit studio");
          toast.success(`User kicked from chat`);
        } else {
          console.log("[Chat] User also removed from LiveKit studio");
          toast.success(`User kicked from chat and studio`);
        }
      } else {
        // LiveKit removal failed, but chat kick succeeded
        toast.success(`User kicked from chat`);
      }
    } catch (error) {
      console.log("[Chat] Error removing from LiveKit:", error);
      toast.success(`User kicked from chat`);
    }
  };

  const banUser = async (userId: string, reason?: string, duration?: number) => {
    if (!socket || !isModerator) {
      console.log("[Chat] Cannot ban - socket:", !!socket, "isModerator:", isModerator);
      return;
    }

    console.log("[Chat] Banning user:", userId, "duration:", duration, "reason:", reason);
    
    // Ban from chat
    socket.emit("ban-user", {
      broadcastId,
      targetUserId: userId,
      reason,
      duration,
    });

    // Also try to remove from LiveKit if they're in the studio
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/livekit/remove-participant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
        },
        body: JSON.stringify({
          roomName: broadcastId,
          participantIdentity: userId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.notInRoom) {
          console.log("[Chat] User not in LiveKit studio");
          toast.success(`User banned from chat${duration ? ` for ${duration} minutes` : ""}`);
        } else {
          console.log("[Chat] User also removed from LiveKit studio");
          toast.success(`User banned from chat and studio${duration ? ` for ${duration} minutes` : ""}`);
        }
      } else {
        // LiveKit removal failed, but chat ban succeeded
        toast.success(`User banned from chat${duration ? ` for ${duration} minutes` : ""}`);
      }
    } catch (error) {
      console.log("[Chat] Error removing from LiveKit:", error);
      toast.success(`User banned from chat${duration ? ` for ${duration} minutes` : ""}`);
    }
  };

  const muteUser = async (userId: string, reason?: string, duration?: number) => {
    if (!socket || !isModerator) {
      console.log("[Chat] Cannot mute - socket:", !!socket, "isModerator:", isModerator);
      return;
    }

    console.log("[Chat] Muting user:", userId, "duration:", duration, "reason:", reason);
    socket.emit("mute-user", {
      broadcastId,
      targetUserId: userId,
      reason,
      duration,
    });

    toast.success(`User muted${duration ? ` for ${duration} minutes` : ""}`);
  };

  const getRoleIcon = (messageType: string) => {
    switch (messageType) {
      case "host":
        return (
          <Crown className="h-3 w-3 text-yellow-500 dark:text-yellow-400" />
        );
      case "moderator":
        return <Shield className="h-3 w-3 text-blue-500 dark:text-blue-400" />;
      case "announcement":
        return <Megaphone className="h-3 w-3 text-red-500 dark:text-red-400" />;
      default:
        return <User className="h-3 w-3 text-gray-500 dark:text-gray-400" />;
    }
  };

  const getRoleBadge = (messageType: string) => {
    switch (messageType) {
      case "host":
        return (
          <Badge className="bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 text-xs">
            Host
          </Badge>
        );
      case "moderator":
        return (
          <Badge className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 text-xs">
            Mod
          </Badge>
        );
      case "announcement":
        return (
          <Badge className="bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 text-xs">
            Announcement
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const pinnedMessages = messages.filter((msg) => msg.isPinned);
  const regularMessages = messages.filter((msg) => !msg.isPinned);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            <span>Live Chat</span>
            <div className="flex items-center gap-1">
              <div
                className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}
              />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {onlineUsers} online
              </span>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex flex-col h-96">
          {/* Pinned Messages */}
          {pinnedMessages.length > 0 && (
            <div className="border-b bg-yellow-50 dark:bg-yellow-900/20 p-2">
              <div className="text-xs font-medium text-yellow-800 dark:text-yellow-200 mb-1 flex items-center gap-1">
                <Pin className="h-3 w-3" />
                Pinned Messages
              </div>
              {pinnedMessages.map((message) => (
                <div
                  key={`pinned-${message.id}`}
                  className="text-sm p-1 bg-yellow-100 dark:bg-yellow-800/30 text-yellow-900 dark:text-yellow-100 rounded mb-1"
                >
                  <span className="font-medium">{message.username}:</span>{" "}
                  {message.content}
                </div>
              ))}
            </div>
          )}

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-3">
              {regularMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.messageType === "announcement"
                      ? "bg-red-50 dark:bg-red-900/20 p-2 rounded-lg"
                      : ""
                  }`}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={message.userAvatar} />
                    <AvatarFallback className="text-xs">
                      {message.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {message.username}
                      </span>
                      {getRoleIcon(message.messageType)}
                      {getRoleBadge(message.messageType)}
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 break-words">
                      {message.content}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => toggleLike(message.id)}
                        disabled={false}
                      >
                        <Heart
                          className={`h-3 w-3 mr-1 ${
                            (message.likedBy || []).includes(user?.id || "")
                              ? "fill-red-500 text-red-500"
                              : ""
                          }`}
                        />
                        {message.likes}
                      </Button>
                      {isModerator && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => togglePin(message.id)}
                          >
                            {message.isPinned ? (
                              <PinOff className="h-3 w-3" />
                            ) : (
                              <Pin className="h-3 w-3" />
                            )}
                          </Button>
                      {isModerator && message.userId !== user?.id && message.messageType !== "host" && message.messageType !== "moderator" && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs hover:bg-red-50"
                              title="Moderate user"
                            >
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Moderate {message.username}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => muteUser(message.userId, undefined, 5)}
                            >
                              <VolumeX className="h-4 w-4 mr-2" />
                              Mute (5 min)
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => kickUser(message.userId)}
                              className="text-orange-600 focus:text-orange-600"
                            >
                              <UserX className="h-4 w-4 mr-2" />
                              Kick from Chat
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => banUser(message.userId, undefined, 30)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Ban className="h-4 w-4 mr-2" />
                              Ban (30 min)
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => banUser(message.userId)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Ban className="h-4 w-4 mr-2" />
                              Ban Permanently
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {/* Invisible div to scroll to */}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="border-t p-4">
            <form onSubmit={sendMessage} className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={
                    user
                      ? "Type a message..."
                      : "Type a message as Anonymous..."
                  }
                  className="flex-1"
                  disabled={false}
                />
                <Button type="submit" disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              {isModerator && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={sendAnnouncement}
                  disabled={!newMessage.trim()}
                  className="w-full"
                >
                  <Megaphone className="h-4 w-4 mr-2" />
                  Send as Announcement
                </Button>
              )}
            </form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
