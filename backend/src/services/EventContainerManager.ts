import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from 'winston';
import { RedisClientType } from 'redis';
import { Event, EventContainer, HealthCheck, EventCleanupJob } from '@/types';
import { logger } from '@/utils/logger';
import { redis } from '@/utils/redis';
import { queueManager } from '@/utils/queue';
import { srsService } from './SRSService';

/**
 * EventContainerManager - Implements the single "unit of compute" architecture
 * 
 * Each live event gets its own containerized environment that handles:
 * - RTMP ingestion and processing
 * - Real-time analytics collection
 * - Live chat processing
 * - Stream health monitoring
 * 
 * Post-event cleanup offloads data to persistent storage and shuts down the container.
 */
export class EventContainerManager extends EventEmitter {
  private containers: Map<string, EventContainer> = new Map();
  private healthCheckInterval: NodeJS.Timeout;
  private cleanupInterval: NodeJS.Timeout;
  
  constructor(
    private logger: Logger = logger,
    private redisClient: RedisClientType = redis
  ) {
    super();
    
    // Health check every 30 seconds
    this.healthCheckInterval = setInterval(() => {
      this.performHealthChecks();
    }, 30000);
    
    // Cleanup check every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanupStoppedContainers();
    }, 300000);
  }

  /**
   * Create and start a new event container
   */
  async createContainer(event: Event): Promise<EventContainer> {
    const containerId = `event-${event.id}-${uuidv4()}`;
    
    this.logger.info('Creating event container', {
      eventId: event.id,
      containerId,
      title: event.title
    });

    const container: EventContainer = {
      id: containerId,
      eventId: event.id,
      status: 'starting',
      createdAt: new Date(),
      resources: {
        cpu: process.env.CONTAINER_CPU_LIMIT || '1000m',
        memory: process.env.CONTAINER_MEMORY_LIMIT || '2Gi',
        storage: '10Gi'
      },
      endpoints: {
        rtmp: `rtmp://container-${containerId}.internal:1935/live`,
        hls: `https://cdn.bigfootlive.com/hls/${event.id}/playlist.m3u8`,
        websocket: `wss://ws-${containerId}.bigfootlive.com/events/${event.id}`,
        api: `https://api-${containerId}.bigfootlive.com/events/${event.id}`
      },
      health: {
        status: 'healthy',
        checks: [],
        lastCheck: new Date()
      }
    };

    try {
      // Store container info in Redis for fast access
      await this.redisClient.setEx(
        `container:${containerId}`,
        3600, // 1 hour TTL
        JSON.stringify(container)
      );

      // Add to local cache
      this.containers.set(containerId, container);

      // Start the container (this would integrate with your orchestration platform)
      await this.startContainerInfrastructure(container, event);

      container.status = 'running';
      await this.updateContainer(container);

      this.logger.info('Event container created successfully', {
        eventId: event.id,
        containerId,
        endpoints: container.endpoints
      });

      this.emit('containerCreated', { container, event });
      return container;

    } catch (error) {
      container.status = 'error';
      await this.updateContainer(container);
      
      this.logger.error('Failed to create event container', {
        eventId: event.id,
        containerId,
        error: error.message
      });
      
      throw error;
    }
  }

  /**
   * Stop and cleanup an event container
   */
  async stopContainer(containerId: string): Promise<void> {
    const container = await this.getContainer(containerId);
    if (!container) {
      throw new Error(`Container ${containerId} not found`);
    }

    this.logger.info('Stopping event container', {
      eventId: container.eventId,
      containerId
    });

    try {
      container.status = 'stopping';
      await this.updateContainer(container);

      // Collect all data before shutdown
      const cleanupData = await this.collectContainerData(container);

      // Queue cleanup job for post-event processing
      await queueManager.addJob('event-cleanup', cleanupData, {
        priority: 5,
        attempts: 3
      });

      // Stop the container infrastructure
      await this.stopContainerInfrastructure(container);

      container.status = 'stopped';
      await this.updateContainer(container);

      this.logger.info('Event container stopped successfully', {
        eventId: container.eventId,
        containerId
      });

      this.emit('containerStopped', { container });

    } catch (error) {
      container.status = 'error';
      await this.updateContainer(container);
      
      this.logger.error('Failed to stop event container', {
        eventId: container.eventId,
        containerId,
        error: error.message
      });
      
      throw error;
    }
  }

  /**
   * Get container by ID
   */
  async getContainer(containerId: string): Promise<EventContainer | null> {
    // Try local cache first
    let container = this.containers.get(containerId);
    if (container) return container;

    // Try Redis cache
    const cached = await this.redisClient.get(`container:${containerId}`);
    if (cached) {
      container = JSON.parse(cached);
      this.containers.set(containerId, container!);
      return container!;
    }

    return null;
  }

  /**
   * Get all containers for an event
   */
  async getEventContainers(eventId: string): Promise<EventContainer[]> {
    const containers: EventContainer[] = [];
    
    // Search Redis for event containers
    const keys = await this.redisClient.keys('container:*');
    
    for (const key of keys) {
      const cached = await this.redisClient.get(key);
      if (cached) {
        const container = JSON.parse(cached);
        if (container.eventId === eventId) {
          containers.push(container);
          this.containers.set(container.id, container);
        }
      }
    }
    
    return containers;
  }

  /**
   * Update container information
   */
  async updateContainer(container: EventContainer): Promise<void> {
    container.updatedAt = new Date();
    
    // Update local cache
    this.containers.set(container.id, container);
    
    // Update Redis cache
    await this.redisClient.setEx(
      `container:${container.id}`,
      3600,
      JSON.stringify(container)
    );
  }

  /**
   * Perform health checks on all running containers
   */
  private async performHealthChecks(): Promise<void> {
    const runningContainers = Array.from(this.containers.values())
      .filter(container => container.status === 'running');

    for (const container of runningContainers) {
      try {
        const healthChecks = await this.runHealthChecks(container);
        
        container.health.checks = healthChecks;
        container.health.lastCheck = new Date();
        
        // Determine overall health status
        const failedChecks = healthChecks.filter(check => check.status === 'fail');
        if (failedChecks.length === 0) {
          container.health.status = 'healthy';
        } else if (failedChecks.length <= 2) {
          container.health.status = 'degraded';
        } else {
          container.health.status = 'unhealthy';
        }

        await this.updateContainer(container);

        // Emit health status changes
        this.emit('healthCheck', {
          container,
          status: container.health.status,
          checks: healthChecks
        });

      } catch (error) {
        this.logger.error('Health check failed', {
          containerId: container.id,
          eventId: container.eventId,
          error: error.message
        });
      }
    }
  }

  /**
   * Run individual health checks for a container
   */
  private async runHealthChecks(container: EventContainer): Promise<HealthCheck[]> {
    const checks: HealthCheck[] = [];
    const timestamp = new Date();

    try {
      // Check RTMP endpoint
      checks.push({
        name: 'rtmp_endpoint',
        status: 'pass', // This would actually ping the RTMP server
        timestamp
      });

      // Check WebSocket endpoint  
      checks.push({
        name: 'websocket_endpoint',
        status: 'pass', // This would test WebSocket connectivity
        timestamp
      });

      // Check container resources
      checks.push({
        name: 'resource_usage',
        status: 'pass', // This would check CPU/memory usage
        timestamp
      });

      // Check streaming health
      checks.push({
        name: 'stream_quality',
        status: 'pass', // This would check for dropped frames, bitrate issues
        timestamp
      });

    } catch (error) {
      checks.push({
        name: 'health_check_error',
        status: 'fail',
        message: error.message,
        timestamp
      });
    }

    return checks;
  }

  /**
   * Start the actual container infrastructure
   * This would integrate with Kubernetes, Docker Swarm, or your orchestration platform
   */
  private async startContainerInfrastructure(
    container: EventContainer, 
    event: Event
  ): Promise<void> {
    // This is where you'd integrate with your container orchestration
    // For now, we'll simulate the container startup
    
    this.logger.info('Starting container infrastructure', {
      containerId: container.id,
      eventId: event.id
    });

    try {
      // Start SRS instance for this event
      const srsInstance = await srsService.startSRSForEvent(event, container);
      
      // Update container endpoints with actual SRS endpoints
      container.endpoints = {
        ...container.endpoints,
        rtmp: srsInstance.endpoints.rtmp,
        hls: srsInstance.endpoints.hls,
        api: srsInstance.endpoints.api
      };
      
      this.logger.info('SRS instance started for container', {
        containerId: container.id,
        eventId: event.id,
        srsInstanceId: srsInstance.id,
        endpoints: container.endpoints
      });
      
    } catch (error) {
      this.logger.error('Failed to start SRS instance for container', {
        containerId: container.id,
        eventId: event.id,
        error: error.message
      });
      throw error;
    }

    // Example integration points:
    // - Create Kubernetes deployment
    // - Configure ingress routes
    // - Set up service discovery
    // - Start analytics collection
    // - Initialize chat service

    // Simulate startup time
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  /**
   * Stop the container infrastructure
   */
  private async stopContainerInfrastructure(container: EventContainer): Promise<void> {
    this.logger.info('Stopping container infrastructure', {
      containerId: container.id,
      eventId: container.eventId
    });

    try {
      // Stop SRS instance for this event
      await srsService.stopSRSForEvent(container.eventId);
      
      this.logger.info('SRS instance stopped for container', {
        containerId: container.id,
        eventId: container.eventId
      });
      
    } catch (error) {
      this.logger.error('Failed to stop SRS instance for container', {
        containerId: container.id,
        eventId: container.eventId,
        error: error.message
      });
      // Continue with shutdown even if SRS stop fails
    }

    // This would:
    // - Scale down Kubernetes deployment
    // - Clean up ingress routes
    // - Flush remaining analytics data
    // - Close chat connections

    // Simulate shutdown time
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  /**
   * Collect all data from a container before shutdown
   */
  private async collectContainerData(container: EventContainer): Promise<EventCleanupJob> {
    this.logger.info('Collecting container data for cleanup', {
      containerId: container.id,
      eventId: container.eventId
    });

    // This would collect:
    // - Final analytics data
    // - Chat message logs
    // - Recording files
    // - Thumbnail images
    // - Performance metrics

    return {
      eventId: container.eventId,
      containerId: container.id,
      artifacts: [], // List of file paths/URLs
      analyticsData: [], // Final analytics data
      chatLogs: [] // Chat message history
    };
  }

  /**
   * Clean up stopped containers from memory and Redis
   */
  private async cleanupStoppedContainers(): Promise<void> {
    const stoppedContainers = Array.from(this.containers.values())
      .filter(container => 
        container.status === 'stopped' && 
        Date.now() - container.createdAt.getTime() > 3600000 // 1 hour old
      );

    for (const container of stoppedContainers) {
      // Remove from local cache
      this.containers.delete(container.id);
      
      // Remove from Redis
      await this.redisClient.del(`container:${container.id}`);
      
      this.logger.info('Cleaned up stopped container', {
        containerId: container.id,
        eventId: container.eventId
      });
    }
  }

  /**
   * Get container statistics
   */
  async getContainerStats(): Promise<{
    total: number;
    running: number;
    stopped: number;
    error: number;
  }> {
    const containers = Array.from(this.containers.values());
    
    return {
      total: containers.length,
      running: containers.filter(c => c.status === 'running').length,
      stopped: containers.filter(c => c.status === 'stopped').length,
      error: containers.filter(c => c.status === 'error').length
    };
  }

  /**
   * Cleanup on shutdown
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down EventContainerManager');
    
    clearInterval(this.healthCheckInterval);
    clearInterval(this.cleanupInterval);
    
    // Stop all running containers
    const runningContainers = Array.from(this.containers.values())
      .filter(container => container.status === 'running');
    
    for (const container of runningContainers) {
      try {
        await this.stopContainer(container.id);
      } catch (error) {
        this.logger.error('Failed to stop container during shutdown', {
          containerId: container.id,
          error: error.message
        });
      }
    }
  }
}

// Singleton instance
export const eventContainerManager = new EventContainerManager();
