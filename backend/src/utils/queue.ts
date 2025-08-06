import Queue from 'bull';
import { redis } from './redis';
import { logger } from './logger';
import { EventCleanupJob, AnalyticsProcessingJob } from '@/types';

export class QueueManager {
  private queues: Map<string, Queue.Queue> = new Map();

  constructor() {
    this.initializeQueues();
    this.setupEventHandlers();
  }

  private initializeQueues(): void {
    // Event cleanup queue - processes post-stream cleanup
    const eventCleanupQueue = new Queue('event-cleanup', {
      redis: {
        port: parseInt(process.env.REDIS_PORT || '6379'),
        host: process.env.REDIS_HOST || 'localhost'
      },
      defaultJobOptions: {
        removeOnComplete: 10,
        removeOnFail: 50,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000
        }
      }
    });

    // Analytics processing queue
    const analyticsQueue = new Queue('analytics-processing', {
      redis: {
        port: parseInt(process.env.REDIS_PORT || '6379'),
        host: process.env.REDIS_HOST || 'localhost'
      },
      defaultJobOptions: {
        removeOnComplete: 20,
        removeOnFail: 100,
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 1000
        }
      }
    });

    // Email notifications queue
    const emailQueue = new Queue('email-notifications', {
      redis: {
        port: parseInt(process.env.REDIS_PORT || '6379'),
        host: process.env.REDIS_HOST || 'localhost'
      },
      defaultJobOptions: {
        removeOnComplete: 5,
        removeOnFail: 20,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000
        }
      }
    });

    this.queues.set('event-cleanup', eventCleanupQueue);
    this.queues.set('analytics-processing', analyticsQueue);
    this.queues.set('email-notifications', emailQueue);

    this.setupProcessors();
  }

  private setupProcessors(): void {
    // Event cleanup processor
    const eventCleanupQueue = this.queues.get('event-cleanup')!;
    eventCleanupQueue.process(5, async (job) => {
      return this.processEventCleanup(job.data as EventCleanupJob);
    });

    // Analytics processing processor
    const analyticsQueue = this.queues.get('analytics-processing')!;
    analyticsQueue.process(10, async (job) => {
      return this.processAnalytics(job.data as AnalyticsProcessingJob);
    });

    // Email notifications processor
    const emailQueue = this.queues.get('email-notifications')!;
    emailQueue.process(3, async (job) => {
      return this.processEmailNotification(job.data);
    });
  }

  private setupEventHandlers(): void {
    this.queues.forEach((queue, name) => {
      queue.on('completed', (job, result) => {
        logger.info('Queue job completed', {
          queue: name,
          jobId: job.id,
          jobType: job.data.type,
          duration: Date.now() - job.timestamp
        });
      });

      queue.on('failed', (job, err) => {
        logger.error('Queue job failed', {
          queue: name,
          jobId: job.id,
          jobType: job.data.type,
          error: err.message,
          attempts: job.attemptsMade,
          maxAttempts: job.opts.attempts
        });
      });

      queue.on('stalled', (job) => {
        logger.warn('Queue job stalled', {
          queue: name,
          jobId: job.id,
          jobType: job.data.type
        });
      });
    });
  }

  /**
   * Add a job to a queue
   */
  async addJob(queueName: string, data: any, options: any = {}): Promise<void> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    await queue.add(data.type || queueName, data, {
      priority: options.priority || 0,
      delay: options.delay || 0,
      attempts: options.attempts || 3,
      ...options
    });

    logger.info('Job added to queue', {
      queue: queueName,
      jobType: data.type || queueName,
      priority: options.priority || 0
    });
  }

  /**
   * Process event cleanup after stream ends
   */
  private async processEventCleanup(job: EventCleanupJob): Promise<void> {
    logger.info('Processing event cleanup', {
      eventId: job.eventId,
      containerId: job.containerId
    });

    try {
      // 1. Archive chat logs to S3
      if (job.chatLogs && job.chatLogs.length > 0) {
        await this.archiveChatLogs(job.eventId, job.chatLogs);
      }

      // 2. Process and archive analytics data
      if (job.analyticsData && job.analyticsData.length > 0) {
        await this.archiveAnalyticsData(job.eventId, job.analyticsData);
      }

      // 3. Move artifacts to cold storage
      if (job.artifacts && job.artifacts.length > 0) {
        await this.archiveArtifacts(job.eventId, job.artifacts);
      }

      // 4. Update event final status
      await this.updateEventFinalStatus(job.eventId);

      logger.info('Event cleanup completed', {
        eventId: job.eventId,
        containerId: job.containerId
      });

    } catch (error) {
      logger.error('Event cleanup failed', {
        eventId: job.eventId,
        containerId: job.containerId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Process real-time analytics data
   */
  private async processAnalytics(job: AnalyticsProcessingJob): Promise<void> {
    logger.info('Processing analytics data', {
      eventId: job.eventId,
      dataPoints: job.rawData.length
    });

    try {
      // 1. Aggregate raw data points
      const aggregated = await this.aggregateAnalyticsData(job.rawData);

      // 2. Store aggregated data in database
      await this.storeAggregatedData(job.eventId, aggregated);

      // 3. Update real-time metrics in Redis
      await this.updateRealTimeMetrics(job.eventId, aggregated);

      logger.info('Analytics processing completed', {
        eventId: job.eventId,
        aggregatedPoints: Object.keys(aggregated).length
      });

    } catch (error) {
      logger.error('Analytics processing failed', {
        eventId: job.eventId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Process email notifications
   */
  private async processEmailNotification(job: any): Promise<void> {
    logger.info('Processing email notification', {
      type: job.type,
      recipient: job.to
    });

    try {
      // This would integrate with your email service (SendGrid, SES, etc.)
      // For now, we'll just log the email
      logger.info('Email notification sent', {
        type: job.type,
        to: job.to,
        subject: job.subject
      });

    } catch (error) {
      logger.error('Email notification failed', {
        type: job.type,
        to: job.to,
        error: error.message
      });
      throw error;
    }
  }

  // Helper methods for cleanup operations
  private async archiveChatLogs(eventId: string, chatLogs: any[]): Promise<void> {
    // Archive chat logs to S3 or cold storage
    logger.info('Archiving chat logs', { eventId, messageCount: chatLogs.length });
    
    // Implementation would upload to S3/cloud storage
    // await s3.upload({
    //   Bucket: 'chat-logs',
    //   Key: `${eventId}/chat-log.json`,
    //   Body: JSON.stringify(chatLogs)
    // });
  }

  private async archiveAnalyticsData(eventId: string, analyticsData: any[]): Promise<void> {
    // Archive analytics data
    logger.info('Archiving analytics data', { eventId, dataPoints: analyticsData.length });
    
    // Implementation would process and store analytics
  }

  private async archiveArtifacts(eventId: string, artifacts: string[]): Promise<void> {
    // Move recordings, thumbnails, etc. to cold storage
    logger.info('Archiving artifacts', { eventId, artifactCount: artifacts.length });
    
    // Implementation would move files to cheaper storage tier
  }

  private async updateEventFinalStatus(eventId: string): Promise<void> {
    // Update event with final statistics and status
    logger.info('Updating event final status', { eventId });
    
    // Implementation would update the event record in database
  }

  private async aggregateAnalyticsData(rawData: any[]): Promise<any> {
    // Aggregate raw analytics data points
    return {
      totalViews: rawData.reduce((sum, d) => sum + (d.views || 0), 0),
      peakViewers: Math.max(...rawData.map(d => d.viewers || 0)),
      averageViewers: rawData.reduce((sum, d) => sum + (d.viewers || 0), 0) / rawData.length,
      totalChatMessages: rawData.reduce((sum, d) => sum + (d.chatMessages || 0), 0),
      engagementRate: 0 // Calculate based on interactions vs views
    };
  }

  private async storeAggregatedData(eventId: string, data: any): Promise<void> {
    // Store aggregated data in database
    logger.info('Storing aggregated analytics', { eventId });
  }

  private async updateRealTimeMetrics(eventId: string, data: any): Promise<void> {
    // Update Redis cache with latest metrics
    const key = `metrics:${eventId}`;
    await redis.hSet(key, 'aggregated', JSON.stringify(data));
    await redis.expire(key, 3600); // 1 hour expiry
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(): Promise<Record<string, any>> {
    const stats: Record<string, any> = {};

    for (const [name, queue] of this.queues.entries()) {
      const waiting = await queue.getWaiting();
      const active = await queue.getActive();
      const completed = await queue.getCompleted();
      const failed = await queue.getFailed();

      stats[name] = {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length
      };
    }

    return stats;
  }

  /**
   * Clean up completed jobs
   */
  async cleanupOldJobs(): Promise<void> {
    for (const [name, queue] of this.queues.entries()) {
      await queue.clean(24 * 60 * 60 * 1000, 'completed'); // Clean completed jobs older than 24 hours
      await queue.clean(7 * 24 * 60 * 60 * 1000, 'failed'); // Clean failed jobs older than 7 days
      
      logger.info('Cleaned up old jobs', { queue: name });
    }
  }

  /**
   * Shutdown all queues gracefully
   */
  async shutdown(): Promise<void> {
    logger.info('Shutting down queue manager');
    
    for (const [name, queue] of this.queues.entries()) {
      await queue.close();
      logger.info('Queue closed', { queue: name });
    }
  }
}

// Singleton instance
export const queueManager = new QueueManager();

// Schedule periodic cleanup
setInterval(() => {
  queueManager.cleanupOldJobs().catch(error => {
    logger.error('Queue cleanup failed', { error: error.message });
  });
}, 60 * 60 * 1000); // Every hour

export default queueManager;
