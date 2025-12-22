export interface ChatMessage {
  id: string;
  broadcastId: string;
  userId: string;
  username: string;
  userAvatar?: string;
  content: string;
  messageType: "user" | "host" | "moderator" | "system" | "announcement";
  timestamp: Date;
  likes: number;
  dislikes: number;
  isLiked: boolean;
  isDisliked: boolean;
  isPinned: boolean;
  isHighlighted: boolean;
  replyTo?: string;
  emojis: { [emoji: string]: number };
  isModerated: boolean;
  moderationReason?: string;
  isEdited?: boolean;
}

export interface ChatUser {
  id: string;
  username: string;
  avatar?: string;
  role: "listener" | "host" | "moderator" | "admin";
  isOnline: boolean;
  isTyping: boolean;
  lastSeen: Date;
  messageCount: number;
}

export interface TypingIndicator {
  userId: string;
  username: string;
  broadcastId: string;
  timestamp: Date;
}

export interface ChatState {
  messages: ChatMessage[];
  users: ChatUser[];
  typingUsers: TypingIndicator[];
  currentBroadcast: string | null;
  isConnected: boolean;
  unreadCount: number;
  isChatOpen: boolean;
  isMinimized: boolean;
  currentUser: ChatUser | null;
  bannedUsers: Set<string>;
  mutedUsers: Set<string>;
  isBroadcastLive: boolean;
  broadcastInfo: {
    id: string | null;
    title: string | null;
    startTime: Date | null;
  };
  chatSettings: {
    slowMode: number;
    autoModeration: boolean;
    allowEmojis: boolean;
    maxMessageLength: number;
  };
}

export interface ChatContextType {
  state: ChatState;
  sendMessage: (content: string, messageType?: string, replyTo?: string) => void;
  sendTyping: (isTyping: boolean) => void;
  joinBroadcast: (broadcastId: string, user: ChatUser) => void;
  leaveBroadcast: () => void;
  moderateMessage: (messageId: string, action: "delete" | "pin" | "highlight") => void;
  moderateUser: (userId: string, action: "ban" | "unban" | "mute" | "unmute" | "timeout") => void;
  likeMessage: (messageId: string) => void;
  editMessage: (messageId: string, newContent: string) => void;
  deleteMessage: (messageId: string) => void;
  toggleChat: () => void;
  minimizeChat: () => void;
  maximizeChat: () => void;
  clearUnread: () => void;
  updateSettings: (settings: Partial<ChatState["chatSettings"]>) => void;
  setBroadcastLive: (isLive: boolean, broadcastInfo?: { id: string; title: string; startTime: Date }) => void;
}