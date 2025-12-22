"use client";

import React, { createContext, useContext, useReducer, useRef, useCallback } from 'react';
import { ChatContextType, ChatUser, ChatState } from './types';
import { chatReducer, initialState } from './state/chat-reducer';
import { SocketService } from './services/socket-service';
import { ChatApiService } from './services/chat-api';
import { MessageService } from './services/message-service';
import { ModerationService } from './services/moderation-service';
import { useSocketEvents } from './hooks/use-socket-events';
import { useTypingCleanup } from './hooks/use-typing-cleanup';
import { toast } from 'sonner';

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  
  // Services
  const socketService = useRef(new SocketService()).current;
  const apiService = useRef(new ChatApiService()).current;
  const messageService = useRef(new MessageService(socketService, apiService)).current;
  const moderationService = useRef(new ModerationService(socketService)).current;
  
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize socket connection
  React.useEffect(() => {
    const socket = socketService.connect();
    return () => socketService.disconnect();
  }, [socketService]);

  // Custom hooks for event handling
  useSocketEvents(socketService, dispatch, state);
  useTypingCleanup(state.typingUsers, dispatch);

  const sendMessage = useCallback(async (
    content: string,
    messageType = 'user',
    replyTo?: string
  ) => {
    if (!state.isBroadcastLive && (messageType === 'user' || messageType === 'announcement') && state.currentBroadcast !== 'general-chat') {
      toast.error('Chat is only available during live broadcasts');
      return;
    }

    if (content.length > state.chatSettings.maxMessageLength) {
      toast.error(`Message too long. Max ${state.chatSettings.maxMessageLength} characters.`);
      return;
    }

    await messageService.sendMessage(
      content,
      messageType,
      replyTo,
      state.currentBroadcast || undefined,
      state.currentUser || undefined
    );
  }, [messageService, state.isBroadcastLive, state.currentBroadcast, state.currentUser, state.chatSettings.maxMessageLength]);

  const sendTyping = useCallback((isTyping: boolean) => {
    if (isTyping) {
      messageService.sendTyping(true, state.currentBroadcast || undefined, state.currentUser || undefined);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        messageService.sendTyping(false, state.currentBroadcast || undefined, state.currentUser || undefined);
      }, 3000);
    } else {
      messageService.sendTyping(false, state.currentBroadcast || undefined, state.currentUser || undefined);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    }
  }, [messageService, state.currentBroadcast, state.currentUser]);

  const joinBroadcast = useCallback(async (broadcastId: string, user: ChatUser) => {
    if (!socketService.isConnected()) {
      console.error('❌ No socket connection available');
      return;
    }

    if (state.currentBroadcast && state.currentBroadcast !== broadcastId) {
      dispatch({ type: 'CLEAR_MESSAGES' });
    }

    dispatch({ type: 'SET_CURRENT_BROADCAST', payload: broadcastId });
    dispatch({ type: 'SET_CURRENT_USER', payload: user });

    // Load chat history from backend
    try {
      const historyResult = await apiService.getChatHistory(broadcastId, 100);
      if (historyResult.success) {
        historyResult.messages.forEach((msg: any) => {
          const message = {
            id: msg.id,
            broadcastId: broadcastId,
            userId: msg.userId || 'unknown',
            username: msg.username,
            userAvatar: msg.userAvatar,
            content: msg.content,
            messageType: msg.messageType || 'user',
            timestamp: new Date(msg.timestamp),
            likes: msg.likes || 0,
            dislikes: 0,
            isLiked: false,
            isDisliked: false,
            isPinned: msg.isPinned || false,
            isHighlighted: msg.isHighlighted || false,
            replyTo: msg.replyTo,
            emojis: {},
            isModerated: msg.isModerated || false,
            moderationReason: msg.moderationReason,
          };
          dispatch({ type: 'ADD_MESSAGE', payload: message });
        });
      }
    } catch (error) {
      console.log('Chat history not available, starting fresh');
    }

    // Join via WebSocket for real-time messages
    socketService.emit('join-chat', broadcastId, {
      userId: user.id,
      username: user.username,
      avatar: user.avatar,
      role: user.role,
    });
  }, [socketService, apiService, state.currentBroadcast]);

  const leaveBroadcast = useCallback(() => {
    if (!socketService.isConnected() || !state.currentBroadcast) return;

    socketService.emit('leave-broadcast', state.currentBroadcast, {
      userId: state.currentUser?.id,
    });

    dispatch({ type: 'SET_CURRENT_BROADCAST', payload: '' });
  }, [socketService, state.currentBroadcast, state.currentUser?.id]);

  const moderateMessage = useCallback((
    messageId: string,
    action: 'delete' | 'pin' | 'highlight'
  ) => {
    moderationService.moderateMessage(messageId, action, state.currentBroadcast || undefined);
  }, [moderationService, state.currentBroadcast]);

  const moderateUser = useCallback((
    userId: string,
    action: 'ban' | 'unban' | 'mute' | 'unmute' | 'timeout'
  ) => {
    moderationService.moderateUser(userId, action, state.currentBroadcast || undefined);
  }, [moderationService, state.currentBroadcast]);

  const likeMessage = useCallback((messageId: string) => {
    messageService.likeMessage(messageId, state.currentBroadcast || undefined);
  }, [messageService, state.currentBroadcast]);

  const editMessage = useCallback((messageId: string, newContent: string) => {
    messageService.editMessage(messageId, newContent, state.currentBroadcast || undefined);
  }, [messageService, state.currentBroadcast]);

  const deleteMessage = useCallback((messageId: string) => {
    messageService.deleteMessage(messageId, state.currentBroadcast || undefined);
  }, [messageService, state.currentBroadcast]);

  const toggleChat = useCallback(() => {
    dispatch({ type: 'TOGGLE_CHAT' });
  }, []);

  const minimizeChat = useCallback(() => {
    dispatch({ type: 'MINIMIZE_CHAT' });
  }, []);

  const maximizeChat = useCallback(() => {
    dispatch({ type: 'MAXIMIZE_CHAT' });
  }, []);

  const clearUnread = useCallback(() => {
    dispatch({ type: 'CLEAR_UNREAD' });
  }, []);

  const updateSettings = useCallback((settings: Partial<ChatState['chatSettings']>) => {
    dispatch({ type: 'UPDATE_CHAT_SETTINGS', payload: settings });
  }, []);

  const setBroadcastLive = useCallback((
    isLive: boolean,
    broadcastInfo?: { id: string; title: string; startTime: Date }
  ) => {
    dispatch({ type: 'SET_BROADCAST_LIVE', payload: isLive });
    if (broadcastInfo) {
      dispatch({ type: 'SET_BROADCAST_INFO', payload: broadcastInfo });
    }

    if (socketService.isConnected() && state.currentBroadcast) {
      socketService.emit('broadcast-status-change', {
        broadcastId: state.currentBroadcast,
        isLive,
        timestamp: new Date().toISOString(),
      });
    }
  }, [socketService, state.currentBroadcast]);

  return (
    <ChatContext.Provider
      value={{
        state,
        sendMessage,
        sendTyping,
        joinBroadcast,
        leaveBroadcast,
        moderateMessage,
        moderateUser,
        likeMessage,
        editMessage,
        deleteMessage,
        toggleChat,
        minimizeChat,
        maximizeChat,
        clearUnread,
        updateSettings,
        setBroadcastLive,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}