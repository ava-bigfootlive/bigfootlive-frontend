import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';
import { Event, EventSettings, EventContainer, ApiResponse } from '@/types';
import { eventContainerManager } from './EventContainerManager';
import { logger } from '@/utils/logger';
import { EventModel } from '@/models/Event';
import { redis } from '@/utils/redis';

/**
 * EventService - Manages event lifecycle and integrates with container system
 * 
 * Handles:
 * - Event creation and management
 * - Container orchestration via EventContainerManager
 * - Stream lifecycle (start/stop)
 * - Event state management
 */
export class EventService extends EventEmitter {
  constructor() {
    super();
    
    // Listen to container events
    eventContainerManager.on('containerCreated', ({ container, event }) => {
      this.handleContainerCreated(container, event);
    });
    
    eventContainerManager.on('containerStopped', ({ container }) => {
      this.handleContainerStopped(container);
    });
    
    eventContainerManager.on('healthCheck', ({ container, status }) => {
      this.handleContainerHealthCheck(container, status);
    });
  }

  /**
   * Create a new event
   */
  async createEvent(data: {
    userId: string;
    title: string;
    description?: string;
    category: string;
    privacy: 'public' | 'unlisted' | 'private';
    scheduledStart?: Date;
    settings?: Partial<EventSettings>;
  }): Promise<Event> {
    logger.info('Creating new event', {
      userId: data.userId,
      title: data.title,
      category: data.category
    });

    const eventId = uuidv4();
    const streamKey = uuidv4();

    const event: Event = {
      id: eventId,
      userId: data.userId,
      title: data.title,
      description: data.description,
      category: data.category,
      privacy: data.privacy,
      status: data.scheduledStart ? 'scheduled' : 'created',
      scheduledStart: data.scheduledStart,
      streamKey,
      rtmpUrl: `rtmp://ingest.bigfootlive.com:1935/live/${streamKey}`,
      settings: {
        chatEnabled: data.settings?.chatEnabled ?? true,
        recordingEnabled: data.settings?.recordingEnabled ?? false,
        donationsEnabled: data.settings?.donationsEnabled ?? true,
        quality: {
          resolution: data.settings?.quality?.resolution ?? '1080p',
          bitrate: data.settings?.quality?.bitrate ?? 4500,
          fps: data.settings?.quality?.fps ?? 30
        },
        moderation: {
          autoMod: data.settings?.moderation?.autoMod ?? true,
          badWordFilter: data.settings?.moderation?.badWordFilter ?? true,
          slowMode: data.settings?.moderation?.slowMode ?? 0,
          subscriberOnly: data.settings?.moderation?.subscriberOnly ?? false
        }
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Save to database
    const eventDoc = new EventModel(event);
    await eventDoc.save();

    // Cache in Redis for fast access
    await redis.setEx(
      `event:${eventId}`,
      3600, // 1 hour TTL
      JSON.stringify(event)
    );

    logger.info('Event created successfully', {
      eventId,
      userId: data.userId,
      title: data.title,
      streamKey
    });

    this.emit('eventCreated', event);
    return event;
  }

  /**
   * Start a live stream for an event
   */
  async startStream(eventId: string): Promise<{
    event: Event;
    container: EventContainer;
    stream_url: string;
  }> {
    logger.info('Starting stream for event', { eventId });

    const event = await this.getEvent(eventId);
    if (!event) {
      throw new Error(`Event ${eventId} not found`);
    }

    if (event.status === 'live') {
      throw new Error('Event is already live');
    }

    try {
      // Create and start event container
      const container = await eventContainerManager.createContainer(event);

      // Update event status
      event.status = 'live';
      event.actualStart = new Date();
      event.containerId = container.id;
      event.hlsUrl = container.endpoints.hls;
      event.updatedAt = new Date();

      // Update in database
      await EventModel.findByIdAndUpdate(eventId, {
        status: event.status,
        actualStart: event.actualStart,
        containerId: event.containerId,
        hlsUrl: event.hlsUrl,
        updatedAt: event.updatedAt
      });

      // Update cache
      await redis.setEx(
        `event:${eventId}`,
        3600,
        JSON.stringify(event)
      );

      logger.info('Stream started successfully', {
        eventId,
        containerId: container.id,
        rtmpUrl: event.rtmpUrl,
        hlsUrl: event.hlsUrl
      });

      this.emit('streamStarted', { event, container });

      return {
        event,
        container,
        stream_url: event.rtmpUrl
      };

    } catch (error) {
      logger.error('Failed to start stream', {
        eventId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Stop a live stream
   */
  async stopStream(eventId: string): Promise<Event> {
    logger.info('Stopping stream for event', { eventId });

    const event = await this.getEvent(eventId);
    if (!event) {
      throw new Error(`Event ${eventId} not found`);
    }

    if (event.status !== 'live') {
      throw new Error('Event is not live');
    }

    try {
      // Stop the event container
      if (event.containerId) {
        await eventContainerManager.stopContainer(event.containerId);
      }

      // Update event status
      event.status = 'ended';
      event.actualEnd = new Date();
      event.updatedAt = new Date();

      // Update in database
      await EventModel.findByIdAndUpdate(eventId, {
        status: event.status,
        actualEnd: event.actualEnd,
        updatedAt: event.updatedAt
      });

      // Update cache
      await redis.setEx(
        `event:${eventId}`,
        3600,
        JSON.stringify(event)
      );

      logger.info('Stream stopped successfully', {
        eventId,
        containerId: event.containerId,
        duration: event.actualEnd.getTime() - event.actualStart!.getTime()
      });

      this.emit('streamStopped', event);
      return event;

    } catch (error) {
      logger.error('Failed to stop stream', {
        eventId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get event by ID
   */
  async getEvent(eventId: string): Promise<Event | null> {
    // Try cache first
    const cached = await redis.get(`event:${eventId}`);
    if (cached) {
      return JSON.parse(cached);
    }

    // Try database
    const eventDoc = await EventModel.findById(eventId);
    if (!eventDoc) {
      return null;
    }

    const event = eventDoc.toObject() as Event;

    // Update cache
    await redis.setEx(
      `event:${eventId}`,
      3600,
      JSON.stringify(event)
    );

    return event;
  }

  /**
   * Get events for a user
   */
  async getUserEvents(
    userId: string,
    options: {
      status?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{ events: Event[]; total: number }> {
    const query: any = { userId };
    
    if (options.status) {
      query.status = options.status;
    }

    const [events, total] = await Promise.all([
      EventModel.find(query)
        .sort({ createdAt: -1 })
        .limit(options.limit || 50)
        .skip(options.offset || 0)
        .lean(),
      EventModel.countDocuments(query)
    ]);

    return {
      events: events as Event[],
      total
    };
  }

  /**
   * Get live events
   */
  async getLiveEvents(options: {
    category?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ events: Event[]; total: number }> {
    const query: any = { 
      status: 'live',
      privacy: 'public'
    };
    
    if (options.category) {
      query.category = options.category;
    }

    const [events, total] = await Promise.all([
      EventModel.find(query)
        .sort({ actualStart: -1 })
        .limit(options.limit || 20)
        .skip(options.offset || 0)
        .lean(),
      EventModel.countDocuments(query)
    ]);

    return {
      events: events as Event[],
      total
    };
  }

  /**
   * Update event settings
   */
  async updateEvent(
    eventId: string,
    updates: Partial<Pick<Event, 'title' | 'description' | 'category' | 'privacy' | 'settings'>>
  ): Promise<Event> {
    const event = await this.getEvent(eventId);
    if (!event) {
      throw new Error(`Event ${eventId} not found`);
    }

    if (event.status === 'live') {
      // Only allow certain updates during live streams
      const allowedUpdates = ['title', 'description'];
      const updateKeys = Object.keys(updates);
      const hasDisallowedUpdates = updateKeys.some(key => !allowedUpdates.includes(key));
      
      if (hasDisallowedUpdates) {
        throw new Error('Cannot modify settings while stream is live');
      }
    }

    const updatedEvent = {
      ...event,
      ...updates,
      updatedAt: new Date()
    };

    // Update database
    await EventModel.findByIdAndUpdate(eventId, updatedEvent);

    // Update cache
    await redis.setEx(
      `event:${eventId}`,
      3600,
      JSON.stringify(updatedEvent)
    );

    logger.info('Event updated', {
      eventId,
      updates: Object.keys(updates)
    });

    this.emit('eventUpdated', updatedEvent);
    return updatedEvent;
  }

  /**
   * Delete an event
   */
  async deleteEvent(eventId: string): Promise<void> {
    const event = await this.getEvent(eventId);
    if (!event) {
      throw new Error(`Event ${eventId} not found`);
    }

    if (event.status === 'live') {
      throw new Error('Cannot delete a live event');
    }

    // Delete from database
    await EventModel.findByIdAndDelete(eventId);

    // Remove from cache
    await redis.del(`event:${eventId}`);

    logger.info('Event deleted', { eventId });
    this.emit('eventDeleted', eventId);
  }

  /**
   * Get event container information
   */
  async getEventContainer(eventId: string): Promise<EventContainer | null> {
    const event = await this.getEvent(eventId);
    if (!event || !event.containerId) {
      return null;
    }

    return await eventContainerManager.getContainer(event.containerId);
  }

  /**
   * Handle container created event
   */
  private async handleContainerCreated(container: EventContainer, event: Event): Promise<void> {
    logger.info('Container created for event', {
      eventId: event.id,
      containerId: container.id
    });

    // Emit to WebSocket clients
    this.emit('containerStatus', {
      eventId: event.id,
      containerId: container.id,
      status: 'running',
      endpoints: container.endpoints
    });
  }

  /**
   * Handle container stopped event
   */
  private async handleContainerStopped(container: EventContainer): Promise<void> {
    logger.info('Container stopped for event', {
      eventId: container.eventId,
      containerId: container.id
    });

    // Emit to WebSocket clients
    this.emit('containerStatus', {
      eventId: container.eventId,
      containerId: container.id,
      status: 'stopped'
    });
  }

  /**
   * Handle container health check updates
   */
  private async handleContainerHealthCheck(
    container: EventContainer,
    status: string
  ): Promise<void> {
    // Emit health status to WebSocket clients
    this.emit('containerHealth', {
      eventId: container.eventId,
      containerId: container.id,
      health: status,
      checks: container.health.checks
    });
  }

  /**
   * Get platform statistics
   */
  async getPlatformStats(): Promise<{
    totalEvents: number;
    liveEvents: number;
    totalViewers: number;
    containers: {
      total: number;
      running: number;
      stopped: number;
      error: number;
    };
  }> {
    const [totalEvents, liveEvents, containers] = await Promise.all([
      EventModel.countDocuments({}),
      EventModel.countDocuments({ status: 'live' }),
      eventContainerManager.getContainerStats()
    ]);

    // Get current viewer count from all live events
    // This would aggregate from real-time analytics
    const totalViewers = 0; // TODO: Implement viewer aggregation

    return {
      totalEvents,
      liveEvents,
      totalViewers,
      containers
    };
  }
}

// Singleton instance
export const eventService = new EventService();
