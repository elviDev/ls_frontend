import { useEffect, Dispatch } from 'react';
import { SocketService } from '../services/socket-service';
import { ChatAction } from '../state/chat-actions';
import { ChatMessage, ChatUser, ChatState } from '../types';
import { toast } from 'sonner';

export function useSocketEvents(
  socketService: SocketService,
  dispatch: Dispatch<ChatAction>,
  state: ChatState
) {
  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket) return;

    // Connection events
    const handleConnect = () => {
      dispatch({ type: 'SET_CONNECTED', payload: true });
      console.log('🔗 Chat connected to server');
    };

    const handleDisconnect = (reason: string) => {
      dispatch({ type: 'SET_CONNECTED', payload: false });
      console.log(`❌ Chat disconnected from server: ${reason}`);
      if (reason === 'io server disconnect') {
        socket.connect();
      }
    };

    const handleReconnect = (attemptNumber: number) => {
      dispatch({ type: 'SET_CONNECTED', payload: true });
      console.log(`🔄 Chat reconnected after ${attemptNumber} attempts`);
      toast.success('Chat reconnected successfully');
    };

    // Message events
    const handleNewMessage = (data: any) => {
      const message: ChatMessage = {
        id: data.id || Date.now().toString(),
        broadcastId: data.broadcastId,
        userId: data.userId,
        username: data.username,
        userAvatar: data.userAvatar,
        content: data.content,
        messageType: data.messageType || 'user',
        timestamp: new Date(data.timestamp || Date.now()),
        likes: data.likes || 0,
        dislikes: data.dislikes || 0,
        isLiked: false,
        isDisliked: false,
        isPinned: data.isPinned || false,
        isHighlighted: data.isHighlighted || data.messageType === 'announcement',
        replyTo: data.replyTo,
        emojis: data.emojis || {},
        isModerated: data.isModerated || false,
        moderationReason: data.moderationReason,
      };

      dispatch({ type: 'ADD_MESSAGE', payload: message });

      if (message.messageType === 'announcement') {
        toast.info(`📢 ${message.username}: ${message.content}`);
      }
    };

    const handleMessageLiked = (data: any) => {
      dispatch({ 
        type: 'UPDATE_MESSAGE_LIKES', 
        payload: { 
          messageId: data.messageId, 
          likes: data.likes 
        } 
      });
    };

    const handleMessageModerated = (data: any) => {
      dispatch({ 
        type: 'UPDATE_MESSAGE', 
        payload: { 
          messageId: data.messageId, 
          updates: {
            isPinned: data.isPinned,
            isHighlighted: data.isHighlighted,
            isModerated: data.isModerated
          }
        } 
      });
    };

    // User events
    const handleUserJoined = (data: any) => {
      const user: ChatUser = {
        id: data.user.id,
        username: data.user.username,
        avatar: data.user.avatar,
        role: data.user.role || 'listener',
        isOnline: true,
        isTyping: false,
        lastSeen: new Date(),
        messageCount: 0,
      };
      dispatch({ type: 'ADD_USER', payload: user });
    };

    const handleUserLeft = (data: any) => {
      dispatch({ type: 'REMOVE_USER', payload: data.user.id });
    };

    // Typing events
    const handleUserTyping = (data: any) => {
      dispatch({
        type: 'SET_USER_TYPING',
        payload: {
          userId: data.userId,
          username: data.username,
          isTyping: true,
        },
      });

      setTimeout(() => {
        dispatch({ type: 'CLEAR_TYPING', payload: data.userId });
      }, 5000);
    };

    const handleUserStoppedTyping = (data: any) => {
      dispatch({ type: 'CLEAR_TYPING', payload: data.userId });
    };

    // Broadcast events
    const handleBroadcastStatusUpdate = (data: any) => {
      dispatch({ type: 'SET_BROADCAST_LIVE', payload: data.isLive });
      
      if (data.isLive) {
        toast.success('🎤 Broadcast is now LIVE! Chat activated.');
      } else {
        toast.info('📻 Broadcast ended. Chat remains open for discussion.');
      }
    };

    // Error events
    const handleChatError = (error: any) => {
      console.error('🚨 Chat error:', error);
      toast.error(error.error || 'Chat error occurred');
    };

    // Register all event listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('reconnect', handleReconnect);
    socket.on('chat:message', handleNewMessage);
    socket.on('chat:message_liked', handleMessageLiked);
    socket.on('chat:message_moderated', handleMessageModerated);
    socket.on('user-joined', handleUserJoined);
    socket.on('user-left', handleUserLeft);
    socket.on('user-typing', handleUserTyping);
    socket.on('user-stopped-typing', handleUserStoppedTyping);
    socket.on('broadcast-status-updated', handleBroadcastStatusUpdate);
    socket.on('chat-error', handleChatError);
    socket.on('message-error', handleChatError);
    socket.on('moderation-error', handleChatError);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('reconnect', handleReconnect);
      socket.off('chat:message', handleNewMessage);
      socket.off('chat:message_liked', handleMessageLiked);
      socket.off('chat:message_moderated', handleMessageModerated);
      socket.off('user-joined', handleUserJoined);
      socket.off('user-left', handleUserLeft);
      socket.off('user-typing', handleUserTyping);
      socket.off('user-stopped-typing', handleUserStoppedTyping);
      socket.off('broadcast-status-updated', handleBroadcastStatusUpdate);
      socket.off('chat-error', handleChatError);
      socket.off('message-error', handleChatError);
      socket.off('moderation-error', handleChatError);
    };
  }, [socketService, dispatch, state.currentUser?.id]);
}