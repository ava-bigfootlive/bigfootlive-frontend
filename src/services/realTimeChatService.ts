import { authService } from '@/lib/auth';
import { realTimeAnalyticsService } from './realTimeAnalytics';

export interface ChatMessage {
  id: string;
  streamId: string;
  userId: string;
  username: string;
  displayName: string;
  content: string;
  timestamp: Date;
  type: 'message' | 'system' | 'superChat' | 'donation' | 'follow';
  metadata?: {
    amount?: number;
    currency?: string;
    highlighted?: boolean;
    badges?: string[];
    emotes?: Array<{ name: string; url: string; positions: number[] }>;
  };
}

export interface ChatUser {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  role: 'viewer' | 'subscriber' | 'moderator' | 'broadcaster';
  badges: string[];
  isOnline: boolean;
  joinedAt: Date;
}

export interface ChatStats {
  totalMessages: number;
  activeUsers: number;
  messagesPerMinute: number;
  topChatters: Array<{ username: string; messageCount: number }>;
  sentiment: { positive: number; neutral: number; negative: number };
}

interface ChatServiceConfig {
  maxMessages: number;
  maxUsers: number;
  heartbeatInterval: number;
  reconnectDelay: number;
  maxReconnectAttempts: number;
}

export class RealTimeChatService {
  private wsConnection: WebSocket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private currentStreamId: string | null = null;
  
  private messages: ChatMessage[] = [];
  private users: Map<string, ChatUser> = new Map();
  private chatStats: ChatStats = {
    totalMessages: 0,
    activeUsers: 0,
    messagesPerMinute: 0,
    topChatters: [],
    sentiment: { positive: 0, neutral: 0, negative: 0 }
  };

  private messageListeners: Set<(message: ChatMessage) => void> = new Set();
  private userListeners: Set<(users: ChatUser[]) => void> = new Set();
  private statsListeners: Set<(stats: ChatStats) => void> = new Set();
  private connectionListeners: Set<(status: { connected: boolean; error?: string }) => void> = new Set();

  private config: ChatServiceConfig = {
    maxMessages: parseInt(import.meta.env.VITE_CHAT_MAX_MESSAGES || '500'),
    maxUsers: parseInt(import.meta.env.VITE_CHAT_MAX_USERS || '1000'),
    heartbeatInterval: parseInt(import.meta.env.VITE_CHAT_HEARTBEAT_INTERVAL || '30000'),
    reconnectDelay: parseInt(import.meta.env.VITE_CHAT_RECONNECT_DELAY || '5000'),
    maxReconnectAttempts: parseInt(import.meta.env.VITE_CHAT_MAX_RECONNECT_ATTEMPTS || '5')
  };

  async connectToStream(streamId: string): Promise<void> {
    if (this.currentStreamId === streamId && this.isConnected) {
      return; // Already connected to this stream
    }

    // Disconnect from current stream if connected
    if (this.wsConnection) {
      this.disconnect();
    }

    this.currentStreamId = streamId;
    await this.establishConnection(streamId);
  }

  private async establishConnection(streamId: string): Promise<void> {
    try {
      const token = await authService.getAccessToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const baseUrl = import.meta.env.VITE_API_URL || 'https://bigfootlive.io';
      const wsUrl = (import.meta.env.VITE_WS_URL || baseUrl.replace('http://', 'ws://').replace('https://', 'wss://'));
      const fullUrl = `${wsUrl}/api/ws/chat/${streamId}?token=${token}`;

      this.log('Connecting to chat:', fullUrl);

      this.wsConnection = new WebSocket(fullUrl);

      this.wsConnection.onopen = () => {
        this.log('Chat WebSocket connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        this.notifyConnectionListeners({ connected: true });
      };

      this.wsConnection.onmessage = (event) => {
        this.handleMessage(event);
      };

      this.wsConnection.onclose = (event) => {
        this.log('Chat WebSocket closed:', event.code, event.reason);
        this.cleanup();
        this.notifyConnectionListeners({ connected: false });
        
        if (event.code !== 1000 && this.reconnectAttempts < this.config.maxReconnectAttempts) {
          this.scheduleReconnect();
        }
      };

      this.wsConnection.onerror = (error) => {
        this.log('Chat WebSocket error:', error);
        this.cleanup();
        this.notifyConnectionListeners({ connected: false, error: 'Connection failed' });
      };

    } catch (error) {
      this.log('Failed to establish chat connection:', error);
      throw error;
    }
  }

  private handleMessage(event: MessageEvent) {
    try {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'message':
          this.handleChatMessage(data.data);
          break;
        case 'user_joined':
          this.handleUserJoined(data.data);
          break;
        case 'user_left':
          this.handleUserLeft(data.data);
          break;
        case 'users_list':
          this.handleUsersList(data.data);
          break;
        case 'chat_stats':
          this.handleChatStats(data.data);
          break;
        case 'system':
          this.handleSystemMessage(data.data);
          break;
        case 'pong':
          // Heartbeat response
          break;
        default:
          this.log('Unknown chat message type:', data.type);
      }
    } catch (error) {
      this.log('Failed to parse chat message:', error);
    }
  }

  private handleChatMessage(messageData: any) {
    const message: ChatMessage = {
      id: messageData.id,
      streamId: messageData.streamId,
      userId: messageData.userId,
      username: messageData.username,
      displayName: messageData.displayName || messageData.username,
      content: messageData.content,
      timestamp: new Date(messageData.timestamp),
      type: messageData.type || 'message',
      metadata: messageData.metadata
    };

    // Add to messages array (keep only recent messages)
    this.messages.unshift(message);
    if (this.messages.length > this.config.maxMessages) {
      this.messages = this.messages.slice(0, this.config.maxMessages);
    }

    // Update chat stats
    this.chatStats.totalMessages++;
    this.updateChatStats();

    // Notify message listeners
    this.messageListeners.forEach(listener => {
      try {
        listener(message);
      } catch (error) {
        this.log('Message listener error:', error);
      }
    });

    // Send chat activity to analytics service
    this.sendChatActivityToAnalytics(message);
  }

  private handleUserJoined(userData: any) {
    const user: ChatUser = {
      id: userData.id,
      username: userData.username,
      displayName: userData.displayName || userData.username,
      avatar: userData.avatar,
      role: userData.role || 'viewer',
      badges: userData.badges || [],
      isOnline: true,
      joinedAt: new Date(userData.joinedAt || Date.now())
    };

    this.users.set(user.id, user);
    this.notifyUserListeners();
    
    // Update active users count
    this.chatStats.activeUsers = this.users.size;
    this.notifyStatsListeners();
  }

  private handleUserLeft(userData: any) {
    this.users.delete(userData.id);
    this.notifyUserListeners();
    
    // Update active users count
    this.chatStats.activeUsers = this.users.size;
    this.notifyStatsListeners();
  }

  private handleUsersList(usersData: any[]) {
    this.users.clear();
    usersData.forEach(userData => {
      const user: ChatUser = {
        id: userData.id,
        username: userData.username,
        displayName: userData.displayName || userData.username,
        avatar: userData.avatar,
        role: userData.role || 'viewer',
        badges: userData.badges || [],
        isOnline: true,
        joinedAt: new Date(userData.joinedAt || Date.now())
      };
      this.users.set(user.id, user);
    });
    
    this.chatStats.activeUsers = this.users.size;
    this.notifyUserListeners();
    this.notifyStatsListeners();
  }

  private handleChatStats(statsData: any) {
    this.chatStats = {
      totalMessages: statsData.totalMessages || this.chatStats.totalMessages,
      activeUsers: statsData.activeUsers || this.users.size,
      messagesPerMinute: statsData.messagesPerMinute || 0,
      topChatters: statsData.topChatters || [],
      sentiment: statsData.sentiment || { positive: 0, neutral: 0, negative: 0 }
    };
    
    this.notifyStatsListeners();
  }

  private handleSystemMessage(messageData: any) {
    const systemMessage: ChatMessage = {
      id: `system-${Date.now()}`,
      streamId: this.currentStreamId || '',
      userId: 'system',
      username: 'System',
      displayName: 'System',
      content: messageData.content,
      timestamp: new Date(),
      type: 'system',
      metadata: messageData.metadata
    };

    this.messages.unshift(systemMessage);
    if (this.messages.length > this.config.maxMessages) {
      this.messages = this.messages.slice(0, this.config.maxMessages);
    }

    this.messageListeners.forEach(listener => {
      try {
        listener(systemMessage);
      } catch (error) {
        this.log('System message listener error:', error);
      }
    });
  }

  private updateChatStats() {
    // Calculate messages per minute
    const oneMinuteAgo = new Date(Date.now() - 60000);
    const recentMessages = this.messages.filter(msg => msg.timestamp > oneMinuteAgo);
    this.chatStats.messagesPerMinute = recentMessages.length;

    // Update top chatters
    const chattersMap = new Map<string, number>();
    this.messages.slice(0, 100).forEach(msg => { // Only consider recent messages
      if (msg.type === 'message') {
        chattersMap.set(msg.username, (chattersMap.get(msg.username) || 0) + 1);
      }
    });

    this.chatStats.topChatters = Array.from(chattersMap.entries())
      .map(([username, messageCount]) => ({ username, messageCount }))
      .sort((a, b) => b.messageCount - a.messageCount)
      .slice(0, 10);

    this.notifyStatsListeners();
  }

  private sendChatActivityToAnalytics(message: ChatMessage) {
    // Send chat activity data to analytics service for correlation
    try {
      realTimeAnalyticsService.subscribe('analytics', (analyticsData) => {
        // This will be used by the analytics service to correlate chat with viewer data
      });
    } catch (error) {
      this.log('Failed to send chat activity to analytics:', error);
    }
  }

  private startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      if (this.wsConnection?.readyState === WebSocket.OPEN) {
        this.wsConnection.send(JSON.stringify({ type: 'ping' }));
      } else {
        this.cleanup();
        this.scheduleReconnect();
      }
    }, this.config.heartbeatInterval);
  }

  private cleanup() {
    this.isConnected = false;
    
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      this.log('Max chat reconnection attempts reached');
      this.notifyConnectionListeners({ 
        connected: false, 
        error: 'Max reconnection attempts reached' 
      });
      return;
    }

    const delay = Math.min(this.config.reconnectDelay * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;
    
    this.log(`Scheduling chat reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);
    
    setTimeout(() => {
      if (this.currentStreamId) {
        this.establishConnection(this.currentStreamId);
      }
    }, delay);
  }

  // Public methods for sending messages
  async sendMessage(content: string): Promise<void> {
    if (!this.wsConnection || this.wsConnection.readyState !== WebSocket.OPEN) {
      throw new Error('Chat connection not available');
    }

    if (!this.currentStreamId) {
      throw new Error('No active stream');
    }

    const messageData = {
      type: 'send_message',
      data: {
        streamId: this.currentStreamId,
        content: content.trim(),
        timestamp: new Date().toISOString()
      }
    };

    this.wsConnection.send(JSON.stringify(messageData));
  }

  async sendSuperChat(content: string, amount: number, currency: string = 'USD'): Promise<void> {
    if (!this.wsConnection || this.wsConnection.readyState !== WebSocket.OPEN) {
      throw new Error('Chat connection not available');
    }

    const messageData = {
      type: 'super_chat',
      data: {
        streamId: this.currentStreamId,
        content: content.trim(),
        amount,
        currency,
        timestamp: new Date().toISOString()
      }
    };

    this.wsConnection.send(JSON.stringify(messageData));
  }

  // Subscription methods
  onMessage(callback: (message: ChatMessage) => void): () => void {
    this.messageListeners.add(callback);
    return () => this.messageListeners.delete(callback);
  }

  onUsersUpdate(callback: (users: ChatUser[]) => void): () => void {
    this.userListeners.add(callback);
    return () => this.userListeners.delete(callback);
  }

  onStatsUpdate(callback: (stats: ChatStats) => void): () => void {
    this.statsListeners.add(callback);
    return () => this.statsListeners.delete(callback);
  }

  onConnectionChange(callback: (status: { connected: boolean; error?: string }) => void): () => void {
    this.connectionListeners.add(callback);
    return () => this.connectionListeners.delete(callback);
  }

  // Getters
  getMessages(): ChatMessage[] {
    return [...this.messages];
  }

  getUsers(): ChatUser[] {
    return Array.from(this.users.values());
  }

  getChatStats(): ChatStats {
    return { ...this.chatStats };
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      streamId: this.currentStreamId,
      reconnectAttempts: this.reconnectAttempts,
      messagesCount: this.messages.length,
      usersCount: this.users.size
    };
  }

  disconnect() {
    this.log('Disconnecting from chat...');
    this.cleanup();
    
    if (this.wsConnection) {
      this.wsConnection.close(1000, 'Manual disconnect');
      this.wsConnection = null;
    }
    
    this.currentStreamId = null;
    this.messages = [];
    this.users.clear();
    this.chatStats = {
      totalMessages: 0,
      activeUsers: 0,
      messagesPerMinute: 0,
      topChatters: [],
      sentiment: { positive: 0, neutral: 0, negative: 0 }
    };
  }

  private notifyMessageListeners() {
    // Already handled in handleChatMessage
  }

  private notifyUserListeners() {
    const users = Array.from(this.users.values());
    this.userListeners.forEach(listener => {
      try {
        listener(users);
      } catch (error) {
        this.log('User listener error:', error);
      }
    });
  }

  private notifyStatsListeners() {
    this.statsListeners.forEach(listener => {
      try {
        listener(this.chatStats);
      } catch (error) {
        this.log('Stats listener error:', error);
      }
    });
  }

  private notifyConnectionListeners(status: { connected: boolean; error?: string }) {
    this.connectionListeners.forEach(listener => {
      try {
        listener(status);
      } catch (error) {
        this.log('Connection listener error:', error);
      }
    });
  }

  private log(...args: any[]) {
    if (import.meta.env.VITE_DEBUG_CHAT === 'true') {
      console.log('[RealTimeChat]', ...args);
    }
  }
}

// Singleton instance
export const realTimeChatService = new RealTimeChatService();
