import { apiService } from './api';
import type { 
  ChatMessage, 
  ChatUser, 
  ChatRoom, 
  ChatEmote, 
  ChatSettings
} from '../types/chat';

// Additional types for chat service
type ChatFilter = {
  id: string;
  type: 'word' | 'phrase' | 'regex';
  pattern: string;
  action: 'delete' | 'timeout' | 'warn';
  enabled: boolean;
  createdAt: Date;
};

type SuperChatConfig = {
  enabled: boolean;
  minAmount: number;
  maxAmount: number;
  currency: string;
  highlightDuration: number;
};

export class ChatService {
  private wsConnection: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private messageQueue: unknown[] = [];

  // WebSocket connection for real-time chat
  connectToChatRoom(
    streamId: string, 
    userId: string,
    onMessage: (message: ChatMessage) => void,
    onUserUpdate: (users: ChatUser[]) => void,
    onRoomUpdate: (room: ChatRoom) => void,
    onError: (error: string) => void
  ) {
    const wsUrl = `${process.env.VITE_WS_URL}/ws/chat/${streamId}?userId=${userId}`;
    
    try {
      this.wsConnection = new WebSocket(wsUrl);
      
      this.wsConnection.onopen = () => {
        console.log('Chat WebSocket connected');
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        this.flushMessageQueue();
      };
      
      this.wsConnection.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'message':
              onMessage({
                ...data.message,
                timestamp: new Date(data.message.timestamp)
              });
              break;
            case 'user_update':
              onUserUpdate(data.users.map((user: {
                id: string;
                username: string;
                displayName: string;
                avatar?: string;
                role: string;
                badges: string[];
                joinedAt: string;
              }) => ({
                ...user,
                joinedAt: new Date(user.joinedAt)
              })));
              break;
            case 'room_update':
              onRoomUpdate(data.room);
              break;
            case 'error':
              onError(data.error);
              break;
            case 'pong':
              // Heartbeat response
              break;
          }
        } catch (error) {
          console.error('Error parsing chat message:', error);
        }
      };
      
      this.wsConnection.onclose = () => {
        console.log('Chat WebSocket disconnected');
        this.stopHeartbeat();
        this.handleReconnect(streamId, userId, onMessage, onUserUpdate, onRoomUpdate, onError);
      };
      
      this.wsConnection.onerror = (error) => {
        console.error('Chat WebSocket error:', error);
        onError('Connection error');
      };
    } catch (error) {
      console.error('Failed to connect to chat:', error);
      onError('Failed to connect to chat');
    }
  }

  private handleReconnect(
    streamId: string,
    userId: string,
    onMessage: (message: ChatMessage) => void,
    onUserUpdate: (users: ChatUser[]) => void,
    onRoomUpdate: (room: ChatRoom) => void,
    onError: (error: string) => void
  ) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.pow(2, this.reconnectAttempts) * 1000;
      
      setTimeout(() => {
        console.log(`Reconnecting to chat (attempt ${this.reconnectAttempts})`);
        this.connectToChatRoom(streamId, userId, onMessage, onUserUpdate, onRoomUpdate, onError);
      }, delay);
    }
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.wsConnection?.readyState === WebSocket.OPEN) {
        this.wsConnection.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // Send ping every 30 seconds
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (this.wsConnection?.readyState === WebSocket.OPEN) {
        this.wsConnection.send(JSON.stringify(message));
      }
    }
  }

  disconnectFromChat() {
    this.stopHeartbeat();
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
  }

  // Send a message
  sendMessage(streamId: string, message: string, repliedToId?: string) {
    const messageData = {
      type: 'send_message',
      streamId,
      message: message.trim(),
      repliedToId,
      timestamp: new Date().toISOString()
    };

    if (this.wsConnection?.readyState === WebSocket.OPEN) {
      this.wsConnection.send(JSON.stringify(messageData));
    } else {
      // Queue message if not connected
      this.messageQueue.push(messageData);
    }
  }

  // Send a Super Chat message
  sendSuperChat(streamId: string, message: string, amount: number) {
    const messageData = {
      type: 'super_chat',
      streamId,
      message: message.trim(),
      amount,
      timestamp: new Date().toISOString()
    };

    if (this.wsConnection?.readyState === WebSocket.OPEN) {
      this.wsConnection.send(JSON.stringify(messageData));
    }
  }

  // React to a message
  reactToMessage(messageId: string, emoji: string) {
    const reactionData = {
      type: 'react_message',
      messageId,
      emoji
    };

    if (this.wsConnection?.readyState === WebSocket.OPEN) {
      this.wsConnection.send(JSON.stringify(reactionData));
    }
  }

  // Moderation actions
  deleteMessage(messageId: string, reason?: string) {
    const actionData = {
      type: 'moderate_message',
      action: 'delete',
      messageId,
      reason
    };

    if (this.wsConnection?.readyState === WebSocket.OPEN) {
      this.wsConnection.send(JSON.stringify(actionData));
    }
  }

  timeoutUser(userId: string, duration: number, reason?: string) {
    const actionData = {
      type: 'moderate_user',
      action: 'timeout',
      userId,
      duration, // in minutes
      reason
    };

    if (this.wsConnection?.readyState === WebSocket.OPEN) {
      this.wsConnection.send(JSON.stringify(actionData));
    }
  }

  banUser(userId: string, reason?: string) {
    const actionData = {
      type: 'moderate_user',
      action: 'ban',
      userId,
      reason
    };

    if (this.wsConnection?.readyState === WebSocket.OPEN) {
      this.wsConnection.send(JSON.stringify(actionData));
    }
  }

  // REST API methods for chat management

  // Get chat history
  async getChatHistory(
    streamId: string, 
    page = 1, 
    limit = 50
  ): Promise<{ messages: ChatMessage[]; hasMore: boolean }> {
    const response = await api.get(
      `/chat/${streamId}/messages?page=${page}&limit=${limit}`
    );
    
    return {
      ...response.data,
      messages: response.data.messages.map((msg: {
        id: string;
        content: string;
        userId: string;
        username: string;
        timestamp: string;
        editedAt?: string;
        type: string;
      }) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
        editedAt: msg.editedAt ? new Date(msg.editedAt) : undefined
      }))
    };
  }

  // Get chat room info
  async getChatRoom(streamId: string): Promise<ChatRoom> {
    const response = await api.get(`/chat/${streamId}/room`);
    return response.data;
  }

  // Update chat room settings
  async updateChatRoom(streamId: string, updates: Partial<ChatRoom>): Promise<ChatRoom> {
    const response = await api.patch(`/chat/${streamId}/room`, updates);
    return response.data;
  }

  // Get chat users
  async getChatUsers(streamId: string): Promise<ChatUser[]> {
    const response = await api.get(`/chat/${streamId}/users`);
    return response.data.map((user: {
      id: string;
      username: string;
      displayName: string;
      avatar?: string;
      role: string;
      badges: string[];
      joinedAt: string;
    }) => ({
      ...user,
      joinedAt: new Date(user.joinedAt)
    }));
  }

  // Get chat emotes
  async getChatEmotes(streamId?: string): Promise<ChatEmote[]> {
    const url = streamId ? `/chat/emotes?streamId=${streamId}` : '/chat/emotes';
    const response = await api.get(url);
    return response.data;
  }

  // Upload custom emote
  async uploadEmote(
    file: File, 
    name: string, 
    category: string = 'channel'
  ): Promise<ChatEmote> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    formData.append('category', category);

    const response = await api.post('/chat/emotes', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  }

  // Get user's chat settings
  async getChatSettings(): Promise<ChatSettings> {
    const response = await api.get('/chat/settings');
    return response.data;
  }

  // Update user's chat settings
  async updateChatSettings(settings: Partial<ChatSettings>): Promise<ChatSettings> {
    const response = await api.patch('/chat/settings', settings);
    return response.data;
  }

  // Get chat filters
  async getChatFilters(streamId: string): Promise<ChatFilter[]> {
    const response = await api.get(`/chat/${streamId}/filters`);
    return response.data.map((filter: {
      id: string;
      type: 'word' | 'phrase' | 'regex';
      pattern: string;
      action: 'delete' | 'timeout' | 'warn';
      enabled: boolean;
      createdAt: string;
    }) => ({
      ...filter,
      createdAt: new Date(filter.createdAt)
    }));
  }

  // Add chat filter
  async addChatFilter(streamId: string, filter: Omit<ChatFilter, 'id' | 'createdAt'>): Promise<ChatFilter> {
    const response = await api.post(`/chat/${streamId}/filters`, filter);
    return {
      ...response.data,
      createdAt: new Date(response.data.createdAt)
    };
  }

  // Update chat filter
  async updateChatFilter(streamId: string, filterId: string, updates: Partial<Omit<ChatFilter, 'id' | 'createdAt'>>): Promise<ChatFilter> {
    const response = await api.patch(`/chat/${streamId}/filters/${filterId}`, updates);
    return {
      ...response.data,
      createdAt: new Date(response.data.createdAt)
    };
  }

  // Delete chat filter
  async deleteChatFilter(streamId: string, filterId: string): Promise<void> {
    await api.delete(`/chat/${streamId}/filters/${filterId}`);
  }

  // Get Super Chat configuration
  async getSuperChatConfig(streamId: string): Promise<SuperChatConfig> {
    const response = await api.get(`/chat/${streamId}/superchat`);
    return response.data;
  }

  // Update Super Chat configuration
  async updateSuperChatConfig(streamId: string, config: Partial<SuperChatConfig>): Promise<SuperChatConfig> {
    const response = await api.patch(`/chat/${streamId}/superchat`, config);
    return response.data;
  }

  // Get chat analytics
  async getChatAnalytics(
    streamId: string, 
    period: 'hour' | 'day' | 'week' = 'hour'
  ): Promise<{
    totalMessages: number;
    activeUsers: number;
    messagesByHour: Array<{ hour: string; count: number }>;
    topChatters: Array<{ username: string; messageCount: number }>;
    emotesUsed: Record<string, number>;
    moderationActions: Array<{ action: string; count: number }>;
  }> {
    const response = await api.get(`/chat/${streamId}/analytics?period=${period}`);
    return response.data;
  }

  // Export chat logs
  async exportChatLogs(
    streamId: string,
    format: 'txt' | 'json' | 'csv',
    startDate?: Date,
    endDate?: Date
  ): Promise<Blob> {
    const params = new URLSearchParams();
    params.append('format', format);
    
    if (startDate) {
      params.append('startDate', startDate.toISOString());
    }
    if (endDate) {
      params.append('endDate', endDate.toISOString());
    }

    const response = await api.get(`/chat/${streamId}/export?${params.toString()}`, {
      responseType: 'blob',
    });
    
    return response.data;
  }

  // Search chat messages
  async searchMessages(
    streamId: string,
    query: string,
    filters?: {
      userId?: string;
      startDate?: Date;
      endDate?: Date;
      messageType?: string;
    }
  ): Promise<{ messages: ChatMessage[]; total: number }> {
    const params = new URLSearchParams();
    params.append('q', query);
    
    if (filters) {
      if (filters.userId) params.append('userId', filters.userId);
      if (filters.messageType) params.append('type', filters.messageType);
      if (filters.startDate) params.append('startDate', filters.startDate.toISOString());
      if (filters.endDate) params.append('endDate', filters.endDate.toISOString());
    }

    const response = await api.get(`/chat/${streamId}/search?${params.toString()}`);
    return {
      ...response.data,
      messages: response.data.messages.map((msg: {
        id: string;
        content: string;
        userId: string;
        username: string;
        timestamp: string;
        type: string;
      }) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }))
    };
  }
}

export const chatService = new ChatService();
