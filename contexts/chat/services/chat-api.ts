import { ChatMessage } from '../types';

export interface SendMessageRequest {
  broadcastId: string;
  message: string;
  messageType?: string;
  replyTo?: string;
  userAvatar?: string;
}

export interface ChatHistoryResponse {
  messages: any[];
  success: boolean;
}

export class ChatApiService {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
  }

  async sendMessage(data: SendMessageRequest): Promise<Response> {
    return fetch(`${this.baseUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  }

  async getChatHistory(broadcastId: string, limit: number = 100): Promise<ChatHistoryResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/${broadcastId}/history?limit=${limit}`);
      
      if (!response.ok) {
        return { messages: [], success: false };
      }

      const data = await response.json();
      return {
        messages: data.messages || [],
        success: true,
      };
    } catch (error) {
      console.log('Chat history not available:', error);
      return { messages: [], success: false };
    }
  }

  async moderateMessage(messageId: string, action: string, broadcastId: string): Promise<Response> {
    return fetch(`${this.baseUrl}/chat/moderate/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messageId,
        action,
        broadcastId,
      }),
    });
  }

  async moderateUser(userId: string, action: string, broadcastId: string, duration?: number): Promise<Response> {
    return fetch(`${this.baseUrl}/chat/moderate/user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        action,
        broadcastId,
        duration,
      }),
    });
  }
}