// Main exports for the chat module
export { ChatProvider, useChat } from './chat-provider';
export type { 
  ChatMessage, 
  ChatUser, 
  TypingIndicator,
  ChatState,
  ChatContextType 
} from './types';
export { chatReducer, initialState } from './state/chat-reducer';
export { SocketService } from './services/socket-service';
export { ChatApiService } from './services/chat-api';
export { MessageService } from './services/message-service';
export { ModerationService } from './services/moderation-service';