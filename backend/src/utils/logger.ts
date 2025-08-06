import winston from 'winston';
import { config } from './config';

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// Create logger instance
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: {
    service: 'bigfoot-backend',
    environment: config.server.env
  },
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
        winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
          const metaString = Object.keys(meta).length ? 
            `\n${JSON.stringify(meta, null, 2)}` : '';
          return `${timestamp} [${service}] ${level}: ${message}${metaString}`;
        })
      )
    }),
    
    // File transport for all logs
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ],
  
  // Handle exceptions and rejections
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/exceptions.log' })
  ],
  
  rejectionHandlers: [
    new winston.transports.File({ filename: 'logs/rejections.log' })
  ]
});

// Create logs directory if it doesn't exist
import fs from 'fs';
import path from 'path';

const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Add request ID to logger context
export const createChildLogger = (requestId: string) => {
  return logger.child({ requestId });
};

// Log performance metrics
export const logPerformance = (operation: string, startTime: number, metadata?: any) => {
  const duration = Date.now() - startTime;
  logger.info(`Performance: ${operation}`, {
    operation,
    duration: `${duration}ms`,
    ...metadata
  });
};

// Log database operations
export const logDatabase = (operation: string, collection: string, metadata?: any) => {
  logger.debug('Database operation', {
    type: 'database',
    operation,
    collection,
    ...metadata
  });
};

// Log WebSocket events
export const logWebSocket = (event: string, socketId: string, metadata?: any) => {
  logger.debug('WebSocket event', {
    type: 'websocket',
    event,
    socketId,
    ...metadata
  });
};

// Log container events
export const logContainer = (operation: string, containerId: string, metadata?: any) => {
  logger.info('Container operation', {
    type: 'container',
    operation,
    containerId,
    ...metadata
  });
};

// Log streaming events
export const logStreaming = (operation: string, eventId: string, metadata?: any) => {
  logger.info('Streaming operation', {
    type: 'streaming',
    operation,
    eventId,
    ...metadata
  });
};

// Structured error logging
export const logError = (error: Error, context?: any) => {
  logger.error('Application Error', {
    message: error.message,
    stack: error.stack,
    name: error.name,
    context
  });
};

// Security event logging
export const logSecurity = (event: string, userId?: string, metadata?: any) => {
  logger.warn('Security Event', {
    type: 'security',
    event,
    userId,
    timestamp: new Date().toISOString(),
    ...metadata
  });
};

// Business metrics logging
export const logBusinessMetric = (metric: string, value: number, metadata?: any) => {
  logger.info('Business Metric', {
    type: 'metric',
    metric,
    value,
    timestamp: new Date().toISOString(),
    ...metadata
  });
};

export default logger;
