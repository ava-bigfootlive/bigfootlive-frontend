import dotenv from 'dotenv';
import { AppConfig } from '@/types';

// Load environment variables
dotenv.config();

const requiredEnvVars = [
  'JWT_SECRET',
  'MONGODB_URI',
  'REDIS_URL'
];

// Validate required environment variables
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Required environment variable ${envVar} is not set`);
  }
}

export const config: AppConfig = {
  server: {
    port: parseInt(process.env.PORT || '3001', 10),
    env: process.env.NODE_ENV || 'development',
    apiUrl: process.env.API_URL || 'http://localhost:3001'
  },
  
  database: {
    mongodb: process.env.MONGODB_URI!,
    redis: process.env.REDIS_URL!
  },
  
  auth: {
    jwtSecret: process.env.JWT_SECRET!,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10)
  },
  
  streaming: {
    rtmpPort: parseInt(process.env.RTMP_PORT || '1935', 10),
    chunkSize: parseInt(process.env.RTMP_CHUNK_SIZE || '60000', 10),
    ping: parseInt(process.env.RTMP_PING || '30', 10),
    pingTimeout: parseInt(process.env.RTMP_PING_TIMEOUT || '60', 10)
  },
  
  storage: {
    aws: {
      region: process.env.AWS_REGION || 'us-west-2',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
    },
    buckets: {
      recordings: process.env.S3_BUCKET_RECORDINGS || 'bigfoot-recordings',
      thumbnails: process.env.S3_BUCKET_THUMBNAILS || 'bigfoot-thumbnails',
      artifacts: process.env.S3_BUCKET_ARTIFACTS || 'bigfoot-artifacts'
    }
  },
  
  cdn: {
    baseUrl: process.env.CDN_BASE_URL || 'https://cdn.bigfootlive.com',
    hlsSegmentDuration: parseInt(process.env.HLS_SEGMENT_DURATION || '6', 10),
    hlsListSize: parseInt(process.env.HLS_LIST_SIZE || '10', 10)
  },
  
  analytics: {
    batchSize: parseInt(process.env.ANALYTICS_BATCH_SIZE || '100', 10),
    flushInterval: parseInt(process.env.ANALYTICS_FLUSH_INTERVAL || '5000', 10),
    retentionDays: parseInt(process.env.ANALYTICS_RETENTION_DAYS || '90', 10)
  },
  
  chat: {
    maxMessageLength: parseInt(process.env.CHAT_MAX_MESSAGE_LENGTH || '500', 10),
    rateLimitMessages: parseInt(process.env.CHAT_RATE_LIMIT_MESSAGES || '10', 10),
    rateLimitWindow: parseInt(process.env.CHAT_RATE_LIMIT_WINDOW || '60', 10),
    moderationEnabled: process.env.CHAT_MODERATION_ENABLED === 'true'
  }
};

// Validate configuration
if (config.server.port < 1 || config.server.port > 65535) {
  throw new Error('Invalid server port configuration');
}

if (config.auth.bcryptRounds < 8 || config.auth.bcryptRounds > 15) {
  throw new Error('Invalid bcrypt rounds configuration (should be 8-15)');
}

export default config;
