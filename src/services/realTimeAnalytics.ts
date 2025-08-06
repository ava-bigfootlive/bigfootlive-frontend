import { eventService } from './events';
import { analyticsService } from './analytics';
import { authService } from '@/lib/auth';

interface ConnectionConfig {
  maxRetries: number;
  retryDelay: number;
  heartbeatInterval: number;
  debugLogging: boolean;
}

export class RealTimeAnalyticsService {
  private wsConnection: WebSocket | null = null;
  private reconnectAttempts = 0;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private isConnected = false;
  private listeners: Map<string, (data: any) => void> = new Map();
  
  private config: ConnectionConfig = {
    maxRetries: parseInt(import.meta.env.VITE_MAX_RECONNECT_ATTEMPTS || '5'),
    retryDelay: parseInt(import.meta.env.VITE_RECONNECT_DELAY || '5000'),
    heartbeatInterval: parseInt(import.meta.env.VITE_WEBSOCKET_HEARTBEAT_INTERVAL || '25000'),
    debugLogging: import.meta.env.VITE_ENABLE_WEBSOCKET_LOGGING === 'true'
  };

  constructor() {
    // Auto-connect if we have a token
    this.initialize();
  }

  private async initialize() {
    try {
      const token = await authService.getAccessToken();
      if (token) {
        this.connect();
      }
    } catch (error) {
      this.log('Failed to initialize analytics service:', error);
    }
  }

  private log(...args: any[]) {
    if (this.config.debugLogging) {
      console.log('[RealTimeAnalytics]', ...args);
    }
  }

  async connect(): Promise<void> {
    if (this.wsConnection && this.wsConnection.readyState === WebSocket.OPEN) {
      this.log('Already connected');
      return;
    }

    try {
      await this.establishConnection();
    } catch (error) {
      this.log('Connection failed:', error);
      this.scheduleReconnect();
    }
  }

  private async establishConnection(): Promise<void> {
    const token = await authService.getAccessToken();
    if (!token) {
      throw new Error('No authentication token available');
    }

    const baseUrl = import.meta.env.VITE_API_URL || 'https://bigfootlive.io';
    const wsUrl = (import.meta.env.VITE_WS_URL || baseUrl.replace('http://', 'ws://').replace('https://', 'wss://'));
    const fullUrl = `${wsUrl}/api/ws/analytics/realtime?token=${token}`;

    this.log('Connecting to:', fullUrl);

    return new Promise((resolve, reject) => {
      try {
        this.wsConnection = new WebSocket(fullUrl);
        
        this.wsConnection.onopen = () => {
          this.log('WebSocket connected successfully');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.notifyListeners('connection', { status: 'connected' });
          resolve();
        };

        this.wsConnection.onmessage = (event) => {
          this.handleMessage(event);
        };

        this.wsConnection.onclose = (event) => {
          this.log('WebSocket closed:', event.code, event.reason);
          this.cleanup();
          this.notifyListeners('connection', { status: 'disconnected', code: event.code });
          
          if (event.code !== 1000) { // Not a normal closure
            this.scheduleReconnect();
          }
        };

        this.wsConnection.onerror = (error) => {
          this.log('WebSocket error:', error);
          this.cleanup();
          reject(new Error('WebSocket connection failed'));
        };

        // Timeout for connection
        setTimeout(() => {
          if (this.wsConnection?.readyState !== WebSocket.OPEN) {
            this.wsConnection?.close();
            reject(new Error('Connection timeout'));
          }
        }, 10000);

      } catch (error) {
        reject(error);
      }
    });
  }

  private handleMessage(event: MessageEvent) {
    try {
      const data = JSON.parse(event.data);
      this.log('Received message:', data.type);
      
      switch (data.type) {
        case 'analytics':
          this.notifyListeners('analytics', data.data);
          break;
        case 'metrics':
          this.notifyListeners('metrics', data.data);
          break;
        case 'pong':
          // Heartbeat response
          break;
        default:
          this.log('Unknown message type:', data.type);
      }
    } catch (error) {
      this.log('Failed to parse message:', error);
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
    if (this.reconnectAttempts >= this.config.maxRetries) {
      this.log('Max reconnection attempts reached');
      this.notifyListeners('connection', { status: 'failed', reason: 'max_retries' });
      return;
    }

    const delay = Math.min(this.config.retryDelay * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;
    
    this.log(`Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  subscribe(event: string, callback: (data: any) => void): () => void {
    const id = `${event}_${Date.now()}_${Math.random()}`;
    this.listeners.set(id, callback);
    
    return () => {
      this.listeners.delete(id);
    };
  }

  private notifyListeners(event: string, data: any) {
    for (const [id, callback] of this.listeners.entries()) {
      if (id.startsWith(event)) {
        try {
          callback(data);
        } catch (error) {
          this.log('Listener error:', error);
        }
      }
    }
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      readyState: this.wsConnection?.readyState || WebSocket.CLOSED,
      reconnectAttempts: this.reconnectAttempts,
      url: this.wsConnection?.url
    };
  }

  disconnect() {
    this.log('Disconnecting...');
    this.cleanup();
    
    if (this.wsConnection) {
      this.wsConnection.close(1000, 'Manual disconnect');
      this.wsConnection = null;
    }
    
    this.listeners.clear();
  }

  // Fallback methods for when WebSocket is not available
  async fetchAnalyticsData(streamId?: string) {
    try {
      if (streamId) {
        return await analyticsService.getRealTimeAnalytics(streamId);
      } else {
        // Fetch aggregate data
        const overview = await analyticsService.getAnalyticsSummary('today');
        return overview;
      }
    } catch (error) {
      this.log('Failed to fetch analytics data:', error);
      throw error;
    }
  }

  async fetchStreamMetrics(streamId: string) {
    try {
      return await eventService.getEventMetrics(streamId);
    } catch (error) {
      this.log('Failed to fetch stream metrics:', error);
      throw error;
    }
  }

  async getActiveStreams() {
    try {
      const liveStreams = await eventService.getEvents('live');
      return liveStreams.map(stream => ({
        id: stream.id,
        title: stream.title,
        viewers: stream.viewer_count,
        status: stream.status,
        startTime: stream.actual_start ? new Date(stream.actual_start) : null
      }));
    } catch (error) {
      this.log('Failed to fetch active streams:', error);
      return [];
    }
  }
}

// Singleton instance
export const realTimeAnalyticsService = new RealTimeAnalyticsService();
