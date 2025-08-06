import { io, Socket } from 'socket.io-client';

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 1000;

  connect(): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    console.log('🔌 Connecting to BigfootLive WebSocket...');

    this.socket = io('http://localhost:3000', {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectInterval,
    });

    this.setupEventHandlers();
    return this.socket;
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Connected to BigfootLive WebSocket!');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from WebSocket:', reason);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 Reconnected after ${attemptNumber} attempts`);
      this.reconnectAttempts = 0;
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('🔥 Reconnection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('💥 Max reconnection attempts reached');
      }
    });

    this.socket.on('error', (error) => {
      console.error('🚨 WebSocket error:', error);
    });
  }

  // Event Management
  joinEvent(eventId: string) {
    if (!this.socket) {
      console.error('❌ Socket not connected');
      return;
    }

    console.log(`🚪 Joining event: ${eventId}`);
    this.socket.emit('join:event', { eventId });
  }

  leaveEvent(eventId: string) {
    if (!this.socket) return;

    console.log(`🚪 Leaving event: ${eventId}`);
    this.socket.emit('leave:event', { eventId });
  }

  // Chat Functions
  sendChatMessage(eventId: string, username: string, message: string) {
    if (!this.socket) {
      console.error('❌ Socket not connected');
      return;
    }

    console.log(`💬 Sending chat message: ${message}`);
    this.socket.emit('chat:message', {
      eventId,
      username,
      message,
      timestamp: new Date()
    });
  }

  sendSuperChat(eventId: string, username: string, message: string, amount: number) {
    if (!this.socket) return;

    this.socket.emit('chat:super', {
      eventId,
      username,
      message,
      amount,
      timestamp: new Date()
    });
  }

  // Stream Management
  notifyStreamStart(eventId: string) {
    if (!this.socket) return;

    console.log(`🎬 Notifying stream start: ${eventId}`);
    this.socket.emit('stream:start', { eventId });
  }

  notifyStreamStop(eventId: string) {
    if (!this.socket) return;

    console.log(`⏹️ Notifying stream stop: ${eventId}`);
    this.socket.emit('stream:stop', { eventId });
  }

  // Stream Interactions
  sendStreamInteraction(eventId: string, type: 'like' | 'follow' | 'subscribe', data?: any) {
    if (!this.socket) return;

    this.socket.emit('stream:interaction', {
      eventId,
      type,
      data,
      timestamp: new Date()
    });
  }

  // Event Listeners
  onJoinedEvent(callback: (data: any) => void) {
    if (!this.socket) return;
    this.socket.on('joined:event', callback);
  }

  onChatMessage(callback: (message: any) => void) {
    if (!this.socket) return;
    this.socket.on('chat:message', callback);
  }

  onStreamStarted(callback: (data: any) => void) {
    if (!this.socket) return;
    this.socket.on('stream:started', callback);
  }

  onStreamEnded(callback: (data: any) => void) {
    if (!this.socket) return;
    this.socket.on('stream:ended', callback);
  }

  onViewersUpdate(callback: (data: any) => void) {
    if (!this.socket) return;
    this.socket.on('viewers:update', callback);
  }

  onAnalyticsUpdate(callback: (data: any) => void) {
    if (!this.socket) return;
    this.socket.on('analytics:update', callback);
  }

  // Monetization Event Listeners
  onDonation(callback: (donation: any) => void) {
    if (!this.socket) return;
    this.socket.on('donation', callback);
  }

  onNewSubscriber(callback: (subscriber: any) => void) {
    if (!this.socket) return;
    this.socket.on('new_subscriber', callback);
  }

  // Emit monetization events
  emit(event: string, data: any) {
    if (!this.socket) return;
    this.socket.emit(event, data);
  }

  // Remove listeners
  removeListener(event: string, callback?: any) {
    if (!this.socket) return;
    this.socket.off(event, callback);
  }

  removeAllListeners() {
    if (!this.socket) return;
    this.socket.removeAllListeners();
  }

  // Connection Management
  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting from WebSocket...');
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

// Singleton instance
export const websocketService = new WebSocketService();
export default websocketService;
