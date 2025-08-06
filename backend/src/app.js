const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const path = require('path');

const config = require('./config/config');
const database = require('./config/database');
const { apiRateLimit } = require('./middleware/auth');

// Import routes
const authRoutes = require('./routes/auth');
const tenantRoutes = require('./routes/tenant');

// Import models to ensure they're registered
require('./models');

class App {
  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  setupMiddleware() {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "https:"],
          scriptSrc: ["'self'"],
          connectSrc: ["'self'", "https:"],
        },
      },
      crossOriginEmbedderPolicy: false
    }));

    // CORS configuration
    this.app.use(cors(config.cors));

    // Compression middleware
    this.app.use(compression());

    // Request parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    this.app.use(cookieParser());

    // Logging middleware
    if (config.server.env !== 'test') {
      this.app.use(morgan(config.logging.format));
    }

    // Global rate limiting
    this.app.use('/api/', apiRateLimit);

    // Trust proxy for accurate IP addresses
    this.app.set('trust proxy', 1);

    // Static file serving
    if (config.server.env === 'production') {
      this.app.use(express.static(path.join(__dirname, '../../frontend/build')));
    }
  }

  setupRoutes() {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: config.server.env,
        database: database.getConnectionState(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.env.npm_package_version || '1.0.0'
      });
    });

    // API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/tenant', tenantRoutes);

    // Serve React app in production
    if (config.server.env === 'production') {
      this.app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../../frontend/build/index.html'));
      });
    }

    // 404 handler for API routes
    this.app.use('/api/*', (req, res) => {
      res.status(404).json({
        error: 'API endpoint not found',
        path: req.path,
        method: req.method
      });
    });
  }

  setupErrorHandling() {
    // Global error handler
    this.app.use((err, req, res, next) => {
      console.error('Global error handler:', err);

      // Handle specific error types
      if (err.name === 'ValidationError') {
        return res.status(400).json({
          error: 'Validation error',
          details: Object.values(err.errors).map(e => e.message)
        });
      }

      if (err.name === 'CastError') {
        return res.status(400).json({
          error: 'Invalid ID format',
          details: err.message
        });
      }

      if (err.code === 11000) {
        return res.status(400).json({
          error: 'Duplicate key error',
          details: 'A record with this value already exists'
        });
      }

      if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
          error: 'Invalid token',
          details: err.message
        });
      }

      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: 'Token expired',
          details: err.message
        });
      }

      // Default error response
      const statusCode = err.statusCode || err.status || 500;
      const message = config.server.env === 'production' 
        ? 'Internal server error' 
        : err.message;

      res.status(statusCode).json({
        error: message,
        ...(config.server.env !== 'production' && { stack: err.stack })
      });
    });

    // Catch 404 and forward to error handler
    this.app.use((req, res) => {
      res.status(404).json({
        error: 'Not found',
        path: req.path,
        method: req.method
      });
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      // Don't exit the process in production
      if (config.server.env !== 'production') {
        process.exit(1);
      }
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      // Don't exit the process in production
      if (config.server.env !== 'production') {
        process.exit(1);
      }
    });
  }

  async start() {
    try {
      // Connect to database
      await database.connect();
      console.log('✅ Database connected successfully');

      // Start server
      const port = config.server.port;
      const host = config.server.host;

      this.server = this.app.listen(port, host, () => {
        console.log(`🚀 Server running on ${host}:${port}`);
        console.log(`📁 Environment: ${config.server.env}`);
        console.log(`🔐 CORS origins: ${config.cors.origin.join(', ')}`);
        
        if (config.server.env === 'development') {
          console.log(`🔗 API docs: http://${host}:${port}/api`);
          console.log(`❤️  Health check: http://${host}:${port}/health`);
        }
      });

      // Graceful shutdown
      process.on('SIGTERM', () => this.gracefulShutdown('SIGTERM'));
      process.on('SIGINT', () => this.gracefulShutdown('SIGINT'));

    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }

  async gracefulShutdown(signal) {
    console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);

    // Stop accepting new connections
    if (this.server) {
      this.server.close(async () => {
        console.log('✅ HTTP server closed');

        try {
          // Close database connection
          await database.disconnect();
          console.log('✅ Database connection closed');

          console.log('✅ Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          console.error('❌ Error during shutdown:', error);
          process.exit(1);
        }
      });

      // Force close after timeout
      setTimeout(() => {
        console.log('⚠️  Forcing shutdown after timeout');
        process.exit(1);
      }, 10000);
    } else {
      process.exit(0);
    }
  }
}

module.exports = App;
