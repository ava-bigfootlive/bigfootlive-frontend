import { Server as SocketIOServer, Socket } from 'socket.io';
import { logger, logWebSocket } from '@/utils/logger';
import { authenticate } from '@/middleware/auth';
import { WebSocketConnection, WebSocketMessage } from '@/types';
import { redis } from '@/utils/redis';

interface AuthenticatedSocket extends Socket {
  user?: {
    id: string;
    username: string;
    role: string;
  };
}

export class WebSocketService {
  private connections: Map<string, WebSocketConnection> = new Map();
  private eventRooms: Map<string, Set<string>> = new Map(); // eventId -> socketIds

  constructor(private io: SocketIOServer) {
    this.setupMiddleware();
    this.setupConnectionHandlers();
    this.setupHeartbeat();
  }

  private setupMiddleware(): void {
    // Authentication middleware for WebSocket connections
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization;
        
        if (!token) {
          // Allow anonymous connections for viewing
          return next();
        }

        // Extract token and verify (simplified version of auth middleware)
        const jwt = require('jsonwebtoken');
        const { config } = require('@/utils/config');
        const { UserModel } = require('@/models/User');
        
        const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token;
        const decoded = jwt.verify(cleanToken, config.auth.jwtSecret);
        const user = await UserModel.findById(decoded.userId);
        
        if (user && !user.isLocked) {
          socket.user = {
            id: user.id,
            username: user.username,
            role: user.role
          };
        }
        
        next();
      } catch (error) {
        // Allow connection but mark as anonymous
        next();
      }
    });

    // Rate limiting middleware
    this.io.use((socket, next) => {
      const rateLimitKey = `ws_rate_limit:${socket.handshake.address}`;
      // Simple rate limiting could be implemented here
      next();
    });
  }

  private setupConnectionHandlers(): void {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      this.handleConnection(socket);
    });
  }

  private handleConnection(socket: AuthenticatedSocket): void {
    const connectionId = socket.id;
    const userId = socket.user?.id;
    const userType = socket.user?.role === 'admin' ? 'moderator' : 
                    socket.user?.role === 'streamer' ? 'streamer' : 'viewer';

    // Create connection record
    const connection: WebSocketConnection = {
      id: connectionId,
      userId,
      eventId: undefined,
      type: userType,
      connectedAt: new Date(),
      lastActivity: new Date(),
      subscriptions: []
    };

    this.connections.set(connectionId, connection);

    logWebSocket('CONNECTION_ESTABLISHED', connectionId, {
      userId,
      userType,
      ip: socket.handshake.address
    });

    // Set up event handlers
    this.setupSocketEventHandlers(socket);

    // Handle disconnection
    socket.on('disconnect', () => {
      this.handleDisconnection(socket);
    });

    // Send connection confirmation
    socket.emit('connection:established', {
      connectionId,
      timestamp: new Date(),
      authenticated: !!userId
    });
  }

  private setupSocketEventHandlers(socket: AuthenticatedSocket): void {
    const connectionId = socket.id;

    // Join event room (for viewers and streamers)
    socket.on('event:join', async (data: { eventId: string }) => {
      try {
        await this.handleEventJoin(socket, data.eventId);
      } catch (error) {
        socket.emit('error', {
          code: 'EVENT_JOIN_FAILED',
          message: error.message
        });
      }
    });

    // Leave event room
    socket.on('event:leave', async (data: { eventId: string }) => {
      try {
        await this.handleEventLeave(socket, data.eventId);
      } catch (error) {
        socket.emit('error', {
          code: 'EVENT_LEAVE_FAILED',
          message: error.message
        });
      }
    });

    // Chat message
    socket.on('chat:message', async (data: { eventId: string; message: string }) => {
      try {
        await this.handleChatMessage(socket, data);
      } catch (error) {
        socket.emit('error', {
          code: 'CHAT_MESSAGE_FAILED',
          message: error.message
        });
      }
    });

    // Super chat (donations)
    socket.on('chat:super', async (data: { eventId: string; message: string; amount: number }) => {
      try {
        await this.handleSuperChat(socket, data);
      } catch (error) {
        socket.emit('error', {
          code: 'SUPER_CHAT_FAILED',
          message: error.message
        });
      }
    });

    // Stream interaction (likes, reactions)
    socket.on('stream:interaction', async (data: { eventId: string; type: string; data?: any }) => {
      try {
        await this.handleStreamInteraction(socket, data);
      } catch (error) {
        socket.emit('error', {
          code: 'INTERACTION_FAILED',
          message: error.message
        });
      }
    });

    // Subscribe to specific data streams
    socket.on('subscribe', async (data: { channels: string[] }) => {
      try {
        await this.handleSubscription(socket, data.channels);
      } catch (error) {
        socket.emit('error', {
          code: 'SUBSCRIPTION_FAILED',
          message: error.message
        });
      }
    });

    // Heartbeat/ping
    socket.on('ping', () => {
      this.updateLastActivity(connectionId);
      socket.emit('pong', { timestamp: new Date() });
    });

    // Request stream stats
    socket.on('stats:request', async (data: { eventId: string }) => {
      try {
        const stats = await this.getEventStats(data.eventId);
        socket.emit('stats:update', stats);
      } catch (error) {
        socket.emit('error', {
          code: 'STATS_REQUEST_FAILED',
          message: error.message
        });
      }
    });
  }

  private async handleEventJoin(socket: AuthenticatedSocket, eventId: string): Promise<void> {
    const connection = this.connections.get(socket.id);
    if (!connection) return;

    // Verify event exists and user has permission
    const { eventService } = require('@/services/EventService');
    const event = await eventService.getEvent(eventId);
    
    if (!event) {
      throw new Error('Event not found');
    }

    if (event.privacy === 'private' && (!socket.user || socket.user.id !== event.userId)) {
      throw new Error('Access denied to private event');
    }

    // Join Socket.IO room
    await socket.join(`event:${eventId}`);
    
    // Update connection record
    connection.eventId = eventId;
    connection.lastActivity = new Date();
    this.connections.set(socket.id, connection);

    // Add to event room tracking
    if (!this.eventRooms.has(eventId)) {
      this.eventRooms.set(eventId, new Set());
    }
    this.eventRooms.get(eventId)!.add(socket.id);

    // Update viewer count in Redis
    await this.updateViewerCount(eventId);

    logWebSocket('EVENT_JOINED', socket.id, {
      eventId,
      userId: socket.user?.id,
      eventTitle: event.title
    });

    // Send welcome message with event data
    socket.emit('event:joined', {
      eventId,
      event: {
        id: event.id,
        title: event.title,
        status: event.status,
        currentViewers: this.getEventViewerCount(eventId)
      },
      timestamp: new Date()
    });

    // Broadcast viewer join to other users in the event
    socket.to(`event:${eventId}`).emit('viewer:joined', {
      viewerCount: this.getEventViewerCount(eventId),
      timestamp: new Date()
    });
  }

  private async handleEventLeave(socket: AuthenticatedSocket, eventId: string): Promise<void> {
    const connection = this.connections.get(socket.id);
    if (!connection || connection.eventId !== eventId) return;

    // Leave Socket.IO room
    await socket.leave(`event:${eventId}`);

    // Update connection record
    connection.eventId = undefined;
    this.connections.set(socket.id, connection);

    // Remove from event room tracking
    const eventRoom = this.eventRooms.get(eventId);
    if (eventRoom) {
      eventRoom.delete(socket.id);
      if (eventRoom.size === 0) {
        this.eventRooms.delete(eventId);
      }
    }

    // Update viewer count
    await this.updateViewerCount(eventId);

    logWebSocket('EVENT_LEFT', socket.id, {
      eventId,
      userId: socket.user?.id
    });

    // Broadcast viewer leave
    socket.to(`event:${eventId}`).emit('viewer:left', {
      viewerCount: this.getEventViewerCount(eventId),
      timestamp: new Date()
    });

    socket.emit('event:left', {
      eventId,
      timestamp: new Date()
    });
  }

  private async handleChatMessage(socket: AuthenticatedSocket, data: { eventId: string; message: string }): Promise<void> {
    if (!socket.user) {
      throw new Error('Authentication required for chat');
    }

    const { eventId, message } = data;
    const connection = this.connections.get(socket.id);
    
    if (!connection || connection.eventId !== eventId) {
      throw new Error('Must join event before sending messages');
    }

    // Rate limiting check
    const rateLimitKey = `chat_rate:${socket.user.id}`;
    const messageCount = await redis.get(rateLimitKey);
    
    if (messageCount && parseInt(messageCount) >= 10) { // 10 messages per minute
      throw new Error('Rate limit exceeded');
    }

    // Increment rate limit counter
    await redis.setEx(rateLimitKey, 60, (parseInt(messageCount || '0') + 1).toString());

    // Process chat message through chat service
    const { realTimeChatService } = require('@/services/realTimeChatService');
    const chatMessage = await realTimeChatService.processMessage({
      eventId,
      userId: socket.user.id,
      username: socket.user.username,
      content: message.trim(),
      type: 'message'
    });

    // Broadcast to all users in the event
    this.io.to(`event:${eventId}`).emit('chat:message', chatMessage);

    logWebSocket('CHAT_MESSAGE', socket.id, {
      eventId,
      userId: socket.user.id,
      messageLength: message.length
    });
  }

  private async handleSuperChat(socket: AuthenticatedSocket, data: { eventId: string; message: string; amount: number }): Promise<void> {
    if (!socket.user) {
      throw new Error('Authentication required for super chat');
    }

    const { eventId, message, amount } = data;

    // Validate amount
    if (amount < 1 || amount > 500) {
      throw new Error('Invalid super chat amount');
    }

    // Process super chat (this would integrate with payment processing)
    const superChatMessage = {
      id: require('uuid').v4(),
      eventId,
      userId: socket.user.id,
      username: socket.user.username,
      content: message,
      type: 'super_chat',
      amount,
      timestamp: new Date()
    };

    // Broadcast super chat with special styling
    this.io.to(`event:${eventId}`).emit('chat:super', superChatMessage);

    logWebSocket('SUPER_CHAT', socket.id, {
      eventId,
      userId: socket.user.id,
      amount
    });
  }

  private async handleStreamInteraction(socket: AuthenticatedSocket, data: { eventId: string; type: string; data?: any }): Promise<void> {
    const { eventId, type } = data;
    
    // Process different interaction types
    switch (type) {
      case 'like':
        await this.handleLike(socket, eventId);
        break;
      case 'reaction':
        await this.handleReaction(socket, eventId, data.data);
        break;
      default:
        throw new Error('Unknown interaction type');
    }
  }

  private async handleLike(socket: AuthenticatedSocket, eventId: string): Promise<void> {
    // Increment like count in Redis
    const likeKey = `likes:${eventId}`;
    const newCount = await redis.incr(likeKey);
    
    // Broadcast like update
    this.io.to(`event:${eventId}`).emit('stream:like', {
      eventId,
      totalLikes: newCount,
      timestamp: new Date()
    });

    logWebSocket('STREAM_LIKE', socket.id, {
      eventId,
      userId: socket.user?.id
    });
  }

  private async handleReaction(socket: AuthenticatedSocket, eventId: string, reaction: string): Promise<void> {
    // Broadcast reaction to all viewers
    this.io.to(`event:${eventId}`).emit('stream:reaction', {
      eventId,
      reaction,
      userId: socket.user?.id,
      timestamp: new Date()
    });
  }

  private async handleSubscription(socket: AuthenticatedSocket, channels: string[]): Promise<void> {
    const connection = this.connections.get(socket.id);
    if (!connection) return;

    connection.subscriptions = channels;
    this.connections.set(socket.id, connection);

    // Join subscription rooms
    for (const channel of channels) {
      await socket.join(`channel:${channel}`);
    }

    socket.emit('subscribed', {
      channels,
      timestamp: new Date()
    });
  }

  private handleDisconnection(socket: AuthenticatedSocket): void {
    const connection = this.connections.get(socket.id);
    
    if (connection?.eventId) {
      // Clean up event room
      const eventRoom = this.eventRooms.get(connection.eventId);
      if (eventRoom) {
        eventRoom.delete(socket.id);
        if (eventRoom.size === 0) {
          this.eventRooms.delete(connection.eventId);
        }
      }
      
      // Update viewer count
      this.updateViewerCount(connection.eventId);
      
      // Broadcast viewer left
      socket.to(`event:${connection.eventId}`).emit('viewer:left', {
        viewerCount: this.getEventViewerCount(connection.eventId),
        timestamp: new Date()
      });
    }

    this.connections.delete(socket.id);

    logWebSocket('CONNECTION_CLOSED', socket.id, {
      userId: socket.user?.id,
      duration: Date.now() - connection?.connectedAt.getTime()
    });
  }

  private updateLastActivity(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.lastActivity = new Date();
      this.connections.set(connectionId, connection);
    }
  }

  private async updateViewerCount(eventId: string): Promise<void> {
    const count = this.getEventViewerCount(eventId);
    
    // Update in Redis for persistence
    await redis.hSet(`event:${eventId}`, 'viewerCount', count.toString());
    
    // Broadcast to event room
    this.io.to(`event:${eventId}`).emit('viewers:count', {
      eventId,
      count,
      timestamp: new Date()
    });
  }

  private getEventViewerCount(eventId: string): number {
    const eventRoom = this.eventRooms.get(eventId);
    return eventRoom ? eventRoom.size : 0;
  }

  private async getEventStats(eventId: string): Promise<any> {
    // Get real-time stats from Redis
    const stats = await redis.hGetAll(`metrics:${eventId}`);
    
    return {
      eventId,
      currentViewers: this.getEventViewerCount(eventId),
      totalViews: parseInt(stats.totalViews || '0'),
      likes: parseInt(stats.likes || '0'),
      chatMessages: parseInt(stats.chatMessages || '0'),
      timestamp: new Date()
    };
  }

  private setupHeartbeat(): void {
    // Clean up stale connections every 30 seconds
    setInterval(() => {
      const staleThreshold = Date.now() - 60000; // 1 minute
      const staleConnections: string[] = [];

      for (const [connectionId, connection] of this.connections.entries()) {
        if (connection.lastActivity.getTime() < staleThreshold) {
          staleConnections.push(connectionId);
        }
      }

      // Remove stale connections
      for (const connectionId of staleConnections) {
        const socket = this.io.sockets.sockets.get(connectionId);
        if (socket) {
          socket.disconnect(true);
        }
      }
    }, 30000);
  }

  // Public methods for broadcasting

  public broadcast(event: string, data: any): void {
    this.io.emit(event, {
      ...data,
      timestamp: new Date()
    });
  }

  public broadcastToEvent(eventId: string, event: string, data: any): void {
    this.io.to(`event:${eventId}`).emit(event, {
      ...data,
      timestamp: new Date()
    });
  }

  public broadcastToChannel(channel: string, event: string, data: any): void {
    this.io.to(`channel:${channel}`).emit(event, {
      ...data,
      timestamp: new Date()
    });
  }

  public broadcastToUser(userId: string, event: string, data: any): void {
    // Find user's socket connections
    for (const [socketId, connection] of this.connections.entries()) {
      if (connection.userId === userId) {
        this.io.to(socketId).emit(event, {
          ...data,
          timestamp: new Date()
        });
      }
    }
  }

  public getConnectionStats(): {
    totalConnections: number;
    authenticatedConnections: number;
    eventConnections: Map<string, number>;
    connectionsByType: Record<string, number>;
  } {
    const stats = {
      totalConnections: this.connections.size,
      authenticatedConnections: 0,
      eventConnections: new Map<string, number>(),
      connectionsByType: { viewer: 0, streamer: 0, moderator: 0 }
    };

    for (const connection of this.connections.values()) {
      if (connection.userId) {
        stats.authenticatedConnections++;
      }
      
      if (connection.eventId) {
        const current = stats.eventConnections.get(connection.eventId) || 0;
        stats.eventConnections.set(connection.eventId, current + 1);
      }
      
      stats.connectionsByType[connection.type] = (stats.connectionsByType[connection.type] || 0) + 1;
    }

    return stats;
  }

  public shutdown(): void {
    logger.info('Shutting down WebSocket service');
    
    // Close all connections
    this.io.emit('server:shutdown', {
      message: 'Server is shutting down',
      timestamp: new Date()
    });
    
    this.io.close();
  }
}
