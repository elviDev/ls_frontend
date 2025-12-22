import { ChatMessage, ChatUser, ChatState } from '../types';

export type ChatAction =
  | { type: "SET_CONNECTED"; payload: boolean }
  | { type: "SET_CURRENT_BROADCAST"; payload: string }
  | { type: "SET_CURRENT_USER"; payload: ChatUser }
  | { type: "SET_BROADCAST_LIVE"; payload: boolean }
  | { type: "SET_BROADCAST_INFO"; payload: { id: string; title: string; startTime: Date } }
  | { type: "ADD_MESSAGE"; payload: ChatMessage }
  | { type: "UPDATE_MESSAGE"; payload: { messageId: string; updates: Partial<ChatMessage> } }
  | { type: "UPDATE_MESSAGE_LIKES"; payload: { messageId: string; likes: number } }
  | { type: "DELETE_MESSAGE"; payload: string }
  | { type: "ADD_USER"; payload: ChatUser }
  | { type: "UPDATE_USER"; payload: { id: string; updates: Partial<ChatUser> } }
  | { type: "REMOVE_USER"; payload: string }
  | { type: "SET_USER_TYPING"; payload: { userId: string; username: string; isTyping: boolean } }
  | { type: "CLEAR_TYPING"; payload: string }
  | { type: "INCREMENT_UNREAD" }
  | { type: "CLEAR_UNREAD" }
  | { type: "TOGGLE_CHAT" }
  | { type: "MINIMIZE_CHAT" }
  | { type: "MAXIMIZE_CHAT" }
  | { type: "BAN_USER"; payload: string }
  | { type: "UNBAN_USER"; payload: string }
  | { type: "MUTE_USER"; payload: string }
  | { type: "UNMUTE_USER"; payload: string }
  | { type: "UPDATE_CHAT_SETTINGS"; payload: Partial<ChatState["chatSettings"]> }
  | { type: "CLEAR_MESSAGES" };