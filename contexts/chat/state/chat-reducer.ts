import { ChatState } from '../types';
import { ChatAction } from './chat-actions';

export const initialState: ChatState = {
  messages: [],
  users: [],
  typingUsers: [],
  currentBroadcast: null,
  isConnected: false,
  unreadCount: 0,
  isChatOpen: false,
  isMinimized: false,
  currentUser: null,
  bannedUsers: new Set(),
  mutedUsers: new Set(),
  isBroadcastLive: false,
  broadcastInfo: {
    id: null,
    title: null,
    startTime: null,
  },
  chatSettings: {
    slowMode: 0,
    autoModeration: true,
    allowEmojis: true,
    maxMessageLength: 500,
  },
};

export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "SET_CONNECTED":
      return { ...state, isConnected: action.payload };

    case "SET_CURRENT_BROADCAST":
      return {
        ...state,
        currentBroadcast: action.payload,
        messages: [],
        users: [],
        typingUsers: [],
      };

    case "SET_CURRENT_USER":
      return { ...state, currentUser: action.payload };

    case "SET_BROADCAST_LIVE":
      return { ...state, isBroadcastLive: action.payload };

    case "SET_BROADCAST_INFO":
      return {
        ...state,
        broadcastInfo: action.payload,
        isBroadcastLive: true,
      };

    case "ADD_MESSAGE":
      const newMessage = action.payload;
      const isDuplicate = state.messages.some(msg => msg.id === newMessage.id);
      if (isDuplicate) return state;

      const updatedMessages = [...state.messages, newMessage].slice(-100);
      const shouldIncrementUnread = !state.isChatOpen && 
        newMessage.userId !== state.currentUser?.id && 
        newMessage.messageType !== "system";

      return {
        ...state,
        messages: updatedMessages,
        unreadCount: shouldIncrementUnread ? state.unreadCount + 1 : state.unreadCount,
      };

    case "UPDATE_MESSAGE":
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg.id === action.payload.messageId ? { ...msg, ...action.payload.updates } : msg
        ),
      };

    case "UPDATE_MESSAGE_LIKES":
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg.id === action.payload.messageId ? { ...msg, likes: action.payload.likes } : msg
        ),
      };

    case "DELETE_MESSAGE":
      return {
        ...state,
        messages: state.messages.filter(msg => msg.id !== action.payload),
      };

    case "ADD_USER":
      const existingUser = state.users.find(user => user.id === action.payload.id);
      if (existingUser) return state;
      return { ...state, users: [...state.users, action.payload] };

    case "UPDATE_USER":
      return {
        ...state,
        users: state.users.map(user =>
          user.id === action.payload.id ? { ...user, ...action.payload.updates } : user
        ),
      };

    case "REMOVE_USER":
      return {
        ...state,
        users: state.users.filter(user => user.id !== action.payload),
        typingUsers: state.typingUsers.filter(typing => typing.userId !== action.payload),
      };

    case "SET_USER_TYPING":
      const { userId, username, isTyping } = action.payload;
      if (isTyping) {
        const existingTyping = state.typingUsers.find(t => t.userId === userId);
        if (existingTyping) return state;

        return {
          ...state,
          typingUsers: [
            ...state.typingUsers,
            {
              userId,
              username,
              broadcastId: state.currentBroadcast || "",
              timestamp: new Date(),
            },
          ],
        };
      } else {
        return {
          ...state,
          typingUsers: state.typingUsers.filter(t => t.userId !== userId),
        };
      }

    case "CLEAR_TYPING":
      return {
        ...state,
        typingUsers: state.typingUsers.filter(t => t.userId !== action.payload),
      };

    case "INCREMENT_UNREAD":
      return { ...state, unreadCount: state.unreadCount + 1 };

    case "CLEAR_UNREAD":
      return { ...state, unreadCount: 0 };

    case "TOGGLE_CHAT":
      return {
        ...state,
        isChatOpen: !state.isChatOpen,
        unreadCount: !state.isChatOpen ? 0 : state.unreadCount,
        isMinimized: false,
      };

    case "MINIMIZE_CHAT":
      return { ...state, isMinimized: true };

    case "MAXIMIZE_CHAT":
      return { ...state, isMinimized: false };

    case "BAN_USER":
      return {
        ...state,
        bannedUsers: new Set([...state.bannedUsers, action.payload]),
      };

    case "UNBAN_USER":
      const newBannedUsers = new Set(state.bannedUsers);
      newBannedUsers.delete(action.payload);
      return { ...state, bannedUsers: newBannedUsers };

    case "MUTE_USER":
      return {
        ...state,
        mutedUsers: new Set([...state.mutedUsers, action.payload]),
      };

    case "UNMUTE_USER":
      const newMutedUsers = new Set(state.mutedUsers);
      newMutedUsers.delete(action.payload);
      return { ...state, mutedUsers: newMutedUsers };

    case "UPDATE_CHAT_SETTINGS":
      return {
        ...state,
        chatSettings: { ...state.chatSettings, ...action.payload },
      };

    case "CLEAR_MESSAGES":
      return { ...state, messages: [] };

    default:
      return state;
  }
}