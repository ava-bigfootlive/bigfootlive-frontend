const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const { Server } = require('socket.io');

// Simple BigfootLive Backend Server
console.log('🔥 STARTING BIGFOOTLIVE BACKEND 🔥');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      env: process.env.NODE_ENV
    }
  });
});

// API Routes
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'BigfootLive Backend is running!',
    version: '1.0.0',
    timestamp: new Date()
  });
});

// Auth routes
app.post('/api/auth/register', (req, res) => {
  res.json({
    success: true,
    message: 'Registration endpoint ready',
    data: { userId: 'demo-user-id' }
  });
});

app.post('/api/auth/login', (req, res) => {
  res.json({
    success: true,
    message: 'Login endpoint ready',
    data: { 
      accessToken: 'demo-token',
      refreshToken: 'demo-refresh',
      user: { id: 'demo-user', username: 'demo' }
    }
  });
});

// Events routes
app.get('/api/events', (req, res) => {
  res.json({
    success: true,
    data: [{
      id: 'demo-event-1',
      title: 'Demo Live Stream',
      status: 'scheduled',
      userId: 'demo-user',
      scheduledStart: new Date(),
      streamKey: 'demo-stream-key'
    }]
  });
});

app.post('/api/events', (req, res) => {
  res.json({
    success: true,
    message: 'Event created successfully',
    data: {
      id: 'new-event-id',
      ...req.body,
      streamKey: `sk_${Date.now()}`,
      rtmpUrl: 'rtmp://localhost:1935/live',
      status: 'created'
    }
  });
});

// Streaming routes
app.get('/api/streaming/events/:eventId/stream', (req, res) => {
  res.json({
    success: true,
    data: {
      eventId: req.params.eventId,
      rtmpUrl: 'rtmp://localhost:1935/live',
      streamKey: 'demo-stream-key',
      hlsUrl: 'http://localhost:8081/live/demo.m3u8',
      endpoints: {
        rtmp: 'rtmp://localhost:1935/live',
        hls: 'http://localhost:8081/live/demo.m3u8'
      }
    }
  });
});

app.post('/api/streaming/events/:eventId/webhook', (req, res) => {
  console.log(`🎥 Streaming webhook received for event ${req.params.eventId}:`, req.body);
  res.json({ success: true });
});

// Users routes
app.get('/api/users/:id', (req, res) => {
  res.json({
    success: true,
    data: {
      id: req.params.id,
      username: 'demo-user',
      displayName: 'Demo User',
      followers: 1234,
      following: 56,
      isVerified: false
    }
  });
});

// Analytics routes
app.get('/api/analytics/events/:eventId', (req, res) => {
  res.json({
    success: true,
    data: {
      viewers: 0,
      peakViewers: 0,
      totalViews: 0,
      chatMessages: 0,
      duration: 0,
      engagement: 0.0
    }
  });
});

// WebSocket connections
io.on('connection', (socket) => {
  console.log(`🔌 WebSocket client connected: ${socket.id}`);

  socket.on('join:event', (data) => {
    console.log(`🚪 User joining event: ${data.eventId}`);
    socket.join(`event:${data.eventId}`);
    socket.emit('joined:event', { eventId: data.eventId });
  });

  socket.on('chat:message', (data) => {
    console.log(`💬 Chat message: ${data.message}`);
    io.to(`event:${data.eventId}`).emit('chat:message', {
      id: Date.now(),
      username: data.username || 'Anonymous',
      message: data.message,
      timestamp: new Date()
    });
  });

  socket.on('stream:start', (data) => {
    console.log(`🎬 Stream started: ${data.eventId}`);
    io.to(`event:${data.eventId}`).emit('stream:started', {
      eventId: data.eventId,
      timestamp: new Date()
    });
  });

  socket.on('stream:stop', (data) => {
    console.log(`⏹️ Stream stopped: ${data.eventId}`);
    io.to(`event:${data.eventId}`).emit('stream:stopped', {
      eventId: data.eventId,
      timestamp: new Date()
    });
  });

  socket.on('disconnect', () => {
    console.log(`❌ WebSocket client disconnected: ${socket.id}`);
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('💥 Error:', err);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Something went wrong!'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} not found`
    }
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`
🚀 BIGFOOTLIVE BACKEND IS LIVE! 🚀

🌍 Server: http://localhost:${PORT}
🔗 Health: http://localhost:${PORT}/health
📡 API: http://localhost:${PORT}/api
🔌 WebSocket: ws://localhost:${PORT}

📊 Available Endpoints:
  • GET  /health - Health check
  • POST /api/auth/register - User registration
  • POST /api/auth/login - User login
  • GET  /api/events - List events
  • POST /api/events - Create event
  • GET  /api/streaming/events/:id/stream - Stream config
  • POST /api/streaming/events/:id/webhook - SRS webhooks
  • GET  /api/users/:id - User profile
  • GET  /api/analytics/events/:id - Event analytics

🎮 WebSocket Events:
  • join:event - Join event room
  • chat:message - Send/receive chat
  • stream:start - Stream started
  • stream:stop - Stream stopped

Environment: ${process.env.NODE_ENV || 'development'}
MongoDB: ${process.env.MONGODB_URI || 'Not configured'}
Redis: ${process.env.REDIS_URL || 'Not configured'}

🔥 READY TO CAPTURE USERS! 🔥
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

module.exports = { app, server, io };
