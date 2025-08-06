import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { Server as SocketIOServer } from 'socket.io';
import { RateLimiterRedis } from 'rate-limiter-flexible';

import { config } from '@/utils/config';
import { logger } from '@/utils/logger';
import { connectDatabase } from '@/utils/database';
import { redis } from '@/utils/redis';
import { eventService } from '@/services/EventService';
import { eventContainerManager } from '@/services/EventContainerManager';
import { WebSocketService } from '@/services/WebSocketService';

// Import routes
import authRoutes from '@/routes/auth';
import eventRoutes from '@/routes/events';
import userRoutes from '@/routes/users';
import analyticsRoutes from '@/routes/analytics';
import streamingRoutes from '@/routes/streaming';

class Server {
  private app: express.Application;
  private server: http.Server;
  private io: SocketIOServer;
  private wsService: WebSocketService;
  private rateLimiter: RateLimiterRedis;

  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? ['https://bigfootlive.com', 'https://www.bigfootlive.com']
          : ['http://localhost:3000', 'http://127.0.0.1:3000'],
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.wsService = new WebSocketService(this.io);
    this.setupRateLimiting();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupEventListeners();
    this.setupErrorHandling();
  }

  private setupRateLimiting(): void {
    this.rateLimiter = new RateLimiterRedis({
      storeClient: redis,
      keyPrefix: 'rl',
      points: 100, // Number of requests
      duration: 60, // Per 60 seconds
      blockDuration: 60 // Block for 60 seconds if exceeded
    });
  }

  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: false, // Disable for development
      crossOriginEmbedderPolicy: false
    }));

    // CORS
    this.app.use(cors({
      origin: process.env.NODE_ENV === 'production' 
        ? ['https://bigfootlive.com', 'https://www.bigfootlive.com']
        : ['http://localhost:3000', 'http://127.0.0.1:3000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }));

    // Compression
    this.app.use(compression());

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Rate limiting middleware
    this.app.use(async (req, res, next) => {
      try {
        await this.rateLimiter.consume(req.ip);
        next();
      } catch (rateLimiterRes) {
        res.status(429).json({
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests. Please try again later.',
            retryAfter: rateLimiterRes.msBeforeNext
          },
          timestamp: new Date()
        });
      }
    });

    // Request logging
    this.app.use((req, res, next) => {
      logger.info('HTTP Request', {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      next();
    });
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        success: true,
        data: {
          status: 'healthy',
          timestamp: new Date(),
          version: process.env.npm_package_version || '1.0.0',
          uptime: process.uptime(),
          environment: config.server.env
        }
      });
    });

    // API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/events', eventRoutes);
    this.app.use('/api/users', userRoutes);
    this.app.use('/api/analytics', analyticsRoutes);
    this.app.use('/api/streaming', streamingRoutes);

    // Container management endpoint
    this.app.get('/api/containers/stats', async (req, res) => {
      try {
        const stats = await eventContainerManager.getContainerStats();
        res.json({
          success: true,
          data: stats,
          timestamp: new Date()
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: {
            code: 'CONTAINER_STATS_ERROR',
            message: error.message
          },
          timestamp: new Date()
        });
      }
    });

    // Platform statistics
    this.app.get('/api/platform/stats', async (req, res) => {
      try {
        const stats = await eventService.getPlatformStats();
        res.json({
          success: true,
          data: stats,
          timestamp: new Date()
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: {
            code: 'PLATFORM_STATS_ERROR',
            message: error.message
          },
          timestamp: new Date()
        });
      }
    });

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        error: {
          code: 'ROUTE_NOT_FOUND',
          message: `Route ${req.method} ${req.originalUrl} not found`
        },
        timestamp: new Date()
      });
    });
  }

  private setupEventListeners(): void {
    // Listen to event service events and broadcast via WebSocket
    eventService.on('streamStarted', ({ event, container }) => {
      this.wsService.broadcastToEvent(event.id, 'stream:started', {
        event,
        container: {
          id: container.id,
          status: container.status,
          endpoints: container.endpoints
        }
      });

      // Global broadcast for live events discovery
      this.wsService.broadcast('platform:stream_started', {
        eventId: event.id,
        title: event.title,
        category: event.category,
        userId: event.userId
      });
    });

    eventService.on('streamStopped', (event) => {
      this.wsService.broadcastToEvent(event.id, 'stream:stopped', { event });
      
      // Global broadcast
      this.wsService.broadcast('platform:stream_stopped', {
        eventId: event.id
      });
    });

    eventService.on('containerStatus', (data) => {
      this.wsService.broadcastToEvent(data.eventId, 'container:status', data);
    });

    eventService.on('containerHealth', (data) => {
      this.wsService.broadcastToEvent(data.eventId, 'container:health', data);
    });

    // Container manager events
    eventContainerManager.on('healthCheck', ({ container, status, checks }) => {
      this.wsService.broadcastToEvent(container.eventId, 'stream:health', {
        containerId: container.id,
        status,
        checks,
        timestamp: new Date()
      });
    });
  }

  private setupErrorHandling(): void {
    // Global error handler
    this.app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      logger.error('Unhandled error in request', {
        error: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip
      });

      res.status(err.status || 500).json({
        success: false,
        error: {
          code: err.code || 'INTERNAL_SERVER_ERROR',
          message: config.server.env === 'production' 
            ? 'An internal server error occurred' 
            : err.message
        },
        timestamp: new Date()
      });
    });

    // Process error handlers
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
      this.gracefulShutdown();
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection', { reason, promise });
      this.gracefulShutdown();
    });

    // Graceful shutdown handlers
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, starting graceful shutdown');
      this.gracefulShutdown();
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received, starting graceful shutdown');
      this.gracefulShutdown();
    });
  }

  private async gracefulShutdown(): Promise<void> {
    logger.info('Starting graceful shutdown...');

    // Stop accepting new connections
    this.server.close(async () => {
      try {
        // Shutdown event container manager
        await eventContainerManager.shutdown();
        
        // Close WebSocket connections
        this.wsService.shutdown();
        
        // Close database connection
        // await mongoose.connection.close();
        
        // Close Redis connection
        await redis.quit();

        logger.info('Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        logger.error('Error during graceful shutdown', { error: error.message });
        process.exit(1);
      }
    });

    // Force shutdown after 30 seconds
    setTimeout(() => {
      logger.error('Forced shutdown due to timeout');
      process.exit(1);
    }, 30000);
  }

  async start(): Promise<void> {
    try {
      // Connect to databases
      await connectDatabase();
      logger.info('Database connected successfully');

      // Test Redis connection
      await redis.ping();
      logger.info('Redis connected successfully');

      // Start server
      this.server.listen(config.server.port, () => {
        logger.info(`🚀 BigFoot Live Backend started`, {
          port: config.server.port,
          env: config.server.env,
          pid: process.pid,
          nodeVersion: process.version
        });

        logger.info(`📊 Health check available at http://localhost:${config.server.port}/health`);
        logger.info(`🔌 WebSocket server running on ws://localhost:${config.server.port}`);
      });

    } catch (error) {
      logger.error('Failed to start server', { error: error.message });
      process.exit(1);
    }
  }
}

// Start the server
if (require.main === module) {
  const server = new Server();
  server.start().catch((error) => {
    logger.error('Failed to start application', { error: error.message });
    process.exit(1);
  });
}

export default Server;
