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
  MessageSquare,
  Send,
  Heart,
  Pin,
  PinOff,
  Megaphone,
  Crown,
  Shield,
  User,
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
    const SOCKET_SERVER_URL =
      process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') ||
      "https://lsbackend-production-46d9.up.railway.app";
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
      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_URL ||
        "https://lsbackend-production-46d9.up.railway.app/api";
      const response = await fetch(
        `${API_BASE_URL}/chat/${broadcastId}`
      );
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
      username: user?.name || "Anonymous",
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

  const getRoleIcon = (messageType: string) => {
    switch (messageType) {
      case "host":
        return <Crown className="h-3 w-3 text-yellow-500" />;
      case "moderator":
        return <Shield className="h-3 w-3 text-blue-500" />;
      case "announcement":
        return <Megaphone className="h-3 w-3 text-red-500" />;
      default:
        return <User className="h-3 w-3 text-gray-500" />;
    }
  };

  const getRoleBadge = (messageType: string) => {
    switch (messageType) {
      case "host":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 text-xs">Host</Badge>
        );
      case "moderator":
        return <Badge className="bg-blue-100 text-blue-800 text-xs">Mod</Badge>;
      case "announcement":
        return (
          <Badge className="bg-red-100 text-red-800 text-xs">
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
              <span className="text-sm text-gray-500">
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
            <div className="border-b bg-yellow-50 p-2">
              <div className="text-xs font-medium text-yellow-800 mb-1 flex items-center gap-1">
                <Pin className="h-3 w-3" />
                Pinned Messages
              </div>
              {pinnedMessages.map((message) => (
                <div
                  key={`pinned-${message.id}`}
                  className="text-sm p-1 bg-yellow-100 rounded mb-1"
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
                      ? "bg-red-50 p-2 rounded-lg"
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
                      <span className="text-xs text-gray-500">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 break-words">
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
