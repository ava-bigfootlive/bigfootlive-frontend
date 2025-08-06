import { createClient, RedisClientType } from 'redis';
import { config } from './config';
import { logger } from './logger';

let redisClient: RedisClientType;

const createRedisClient = (): RedisClientType => {
  const client = createClient({
    url: config.database.redis,
    socket: {
      connectTimeout: 10000,
      commandTimeout: 5000,
      reconnectStrategy: (retries) => {
        if (retries > 10) {
          logger.error('Redis reconnection failed after 10 attempts');
          return new Error('Redis reconnection failed');
        }
        const delay = Math.min(retries * 50, 1000);
        logger.info(`Redis reconnecting in ${delay}ms (attempt ${retries})`);
        return delay;
      }
    }
  });

  // Event listeners
  client.on('connect', () => {
    logger.info('Redis client connected');
  });

  client.on('ready', () => {
    logger.info('Redis client ready');
  });

  client.on('error', (error) => {
    logger.error('Redis client error', { error: error.message });
  });

  client.on('end', () => {
    logger.info('Redis client connection ended');
  });

  client.on('reconnecting', () => {
    logger.info('Redis client reconnecting...');
  });

  return client;
};

// Initialize Redis client
export const initRedis = async (): Promise<RedisClientType> => {
  try {
    redisClient = createRedisClient();
    await redisClient.connect();
    
    // Test connection
    await redisClient.ping();
    logger.info('Redis connection established successfully');
    
    return redisClient;
  } catch (error) {
    logger.error('Failed to connect to Redis', { error: error.message });
    throw error;
  }
};

// Get Redis client instance
export const getRedisClient = (): RedisClientType => {
  if (!redisClient) {
    throw new Error('Redis client not initialized. Call initRedis() first.');
  }
  return redisClient;
};

// Redis utility functions
export class RedisService {
  private client: RedisClientType;

  constructor(client: RedisClientType) {
    this.client = client;
  }

  // Cache operations
  async set(key: string, value: string, ttl?: number): Promise<void> {
    try {
      if (ttl) {
        await this.client.setEx(key, ttl, value);
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      logger.error('Redis SET operation failed', { key, error: error.message });
      throw error;
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      logger.error('Redis GET operation failed', { key, error: error.message });
      throw error;
    }
  }

  async del(key: string): Promise<number> {
    try {
      return await this.client.del(key);
    } catch (error) {
      logger.error('Redis DEL operation failed', { key, error: error.message });
      throw error;
    }
  }

  async exists(key: string): Promise<number> {
    try {
      return await this.client.exists(key);
    } catch (error) {
      logger.error('Redis EXISTS operation failed', { key, error: error.message });
      throw error;
    }
  }

  // Hash operations
  async hSet(key: string, field: string, value: string): Promise<number> {
    try {
      return await this.client.hSet(key, field, value);
    } catch (error) {
      logger.error('Redis HSET operation failed', { key, field, error: error.message });
      throw error;
    }
  }

  async hGet(key: string, field: string): Promise<string | undefined> {
    try {
      return await this.client.hGet(key, field);
    } catch (error) {
      logger.error('Redis HGET operation failed', { key, field, error: error.message });
      throw error;
    }
  }

  async hGetAll(key: string): Promise<Record<string, string>> {
    try {
      return await this.client.hGetAll(key);
    } catch (error) {
      logger.error('Redis HGETALL operation failed', { key, error: error.message });
      throw error;
    }
  }

  // List operations
  async lPush(key: string, ...elements: string[]): Promise<number> {
    try {
      return await this.client.lPush(key, elements);
    } catch (error) {
      logger.error('Redis LPUSH operation failed', { key, error: error.message });
      throw error;
    }
  }

  async rPop(key: string): Promise<string | null> {
    try {
      return await this.client.rPop(key);
    } catch (error) {
      logger.error('Redis RPOP operation failed', { key, error: error.message });
      throw error;
    }
  }

  async lRange(key: string, start: number, stop: number): Promise<string[]> {
    try {
      return await this.client.lRange(key, start, stop);
    } catch (error) {
      logger.error('Redis LRANGE operation failed', { key, start, stop, error: error.message });
      throw error;
    }
  }

  // Set operations
  async sAdd(key: string, ...members: string[]): Promise<number> {
    try {
      return await this.client.sAdd(key, members);
    } catch (error) {
      logger.error('Redis SADD operation failed', { key, error: error.message });
      throw error;
    }
  }

  async sMembers(key: string): Promise<string[]> {
    try {
      return await this.client.sMembers(key);
    } catch (error) {
      logger.error('Redis SMEMBERS operation failed', { key, error: error.message });
      throw error;
    }
  }

  async sRem(key: string, ...members: string[]): Promise<number> {
    try {
      return await this.client.sRem(key, members);
    } catch (error) {
      logger.error('Redis SREM operation failed', { key, error: error.message });
      throw error;
    }
  }

  // Pub/Sub operations
  async publish(channel: string, message: string): Promise<number> {
    try {
      return await this.client.publish(channel, message);
    } catch (error) {
      logger.error('Redis PUBLISH operation failed', { channel, error: error.message });
      throw error;
    }
  }

  // Stream operations for real-time data
  async xAdd(key: string, id: string, data: Record<string, string>): Promise<string> {
    try {
      return await this.client.xAdd(key, id, data);
    } catch (error) {
      logger.error('Redis XADD operation failed', { key, id, error: error.message });
      throw error;
    }
  }

  async xRange(key: string, start: string, end: string, count?: number): Promise<any[]> {
    try {
      const options = count ? { COUNT: count } : undefined;
      return await this.client.xRange(key, start, end, options);
    } catch (error) {
      logger.error('Redis XRANGE operation failed', { key, start, end, error: error.message });
      throw error;
    }
  }

  // Utility methods
  async flushAll(): Promise<string> {
    try {
      return await this.client.flushAll();
    } catch (error) {
      logger.error('Redis FLUSHALL operation failed', { error: error.message });
      throw error;
    }
  }

  async ping(): Promise<string> {
    try {
      return await this.client.ping();
    } catch (error) {
      logger.error('Redis PING operation failed', { error: error.message });
      throw error;
    }
  }

  async keys(pattern: string): Promise<string[]> {
    try {
      return await this.client.keys(pattern);
    } catch (error) {
      logger.error('Redis KEYS operation failed', { pattern, error: error.message });
      throw error;
    }
  }

  async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      logger.error('Redis TTL operation failed', { key, error: error.message });
      throw error;
    }
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    try {
      return await this.client.expire(key, seconds);
    } catch (error) {
      logger.error('Redis EXPIRE operation failed', { key, seconds, error: error.message });
      throw error;
    }
  }
}

// Initialize Redis client variable
let redisServiceInstance: RedisService | null = null;

// Initialize Redis on module load and create service instance
initRedis().then((client) => {
  redisServiceInstance = new RedisService(client);
  logger.info('Redis service initialized successfully');
}).catch((error) => {
  logger.error('Failed to initialize Redis', { error: error.message });
  // Don't exit in development, allow graceful degradation
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

// Export redis instance (will be null initially until Redis connects)
export const redis = new Proxy({} as RedisService, {
  get(target, prop) {
    if (!redisServiceInstance) {
      throw new Error('Redis service not initialized. Ensure Redis is running and connection is established.');
    }
    return (redisServiceInstance as any)[prop];
  }
});

export default redis;
