import { Router, Request, Response } from 'express';
import { param, body, validationResult } from 'express-validator';
import { authenticate, authorize } from '@/middleware/auth';
import { EventModel } from '@/models/Event';
import { logger } from '@/utils/logger';
import { redis } from '@/utils/redis';

const router = Router();

/**
 * GET /api/streaming/events/:eventId/stream
 * Get streaming URLs and configuration for an event
 */
router.get('/events/:eventId/stream', 
  authenticate,
  param('eventId').isMongoId(),
  async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid event ID'
        },
        timestamp: new Date()
      });
    }

    const event = await EventModel.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'EVENT_NOT_FOUND',
          message: 'Event not found'
        },
        timestamp: new Date()
      });
    }

    // Check if user owns the event
    if (event.userId !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'You can only access streaming info for your own events'
        },
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      data: {
        eventId: event.id,
        status: event.status,
        rtmpUrl: event.rtmpUrl,
        streamKey: event.streamKey,
        hlsUrl: event.hlsUrl,
        settings: {
          resolution: event.settings.quality.resolution,
          bitrate: event.settings.quality.bitrate,
          fps: event.settings.quality.fps
        }
      },
      timestamp: new Date()
    });

  } catch (error) {
    logger.error('Get streaming info error', {
      error: error.message,
      eventId: req.params.eventId,
      userId: req.user?.id
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_STREAMING_INFO_FAILED',
        message: 'Failed to fetch streaming information'
      },
      timestamp: new Date()
    });
  }
});

/**
 * POST /api/streaming/events/:eventId/webhook
 * Handle streaming webhooks from media server
 */
router.post('/events/:eventId/webhook',
  param('eventId').isMongoId(),
  async (req: Request, res: Response) => {
  try {
    const { action, streamKey, clientId, stats } = req.body;

    // Verify webhook authenticity (you'd implement proper HMAC verification here)
    const webhookSecret = process.env.WEBHOOK_SECRET;
    // const signature = req.headers['x-webhook-signature'];
    // if (!verifyWebhookSignature(req.body, signature, webhookSecret)) {
    //   return res.status(401).json({ error: 'Invalid webhook signature' });
    // }

    const event = await EventModel.findById(req.params.eventId);
    if (!event || event.streamKey !== streamKey) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'INVALID_STREAM_KEY',
          message: 'Invalid stream key or event not found'
        }
      });
    }

    logger.info('Streaming webhook received', {
      eventId: event.id,
      action,
      clientId,
      streamKey
    });

    switch (action) {
      case 'publish_start':
        await handlePublishStart(event, clientId, stats);
        break;
      case 'publish_done':
        await handlePublishDone(event, clientId, stats);
        break;
      case 'play_start':
        await handlePlayStart(event, clientId);
        break;
      case 'play_done':
        await handlePlayDone(event, clientId);
        break;
      case 'stats_update':
        await handleStatsUpdate(event, stats);
        break;
      default:
        logger.warn('Unknown webhook action', { action, eventId: event.id });
    }

    res.json({
      success: true,
      data: {
        message: 'Webhook processed successfully'
      },
      timestamp: new Date()
    });

  } catch (error) {
    logger.error('Streaming webhook error', {
      error: error.message,
      eventId: req.params.eventId,
      body: req.body
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'WEBHOOK_PROCESSING_FAILED',
        message: 'Failed to process webhook'
      },
      timestamp: new Date()
    });
  }
});

/**
 * GET /api/streaming/events/:eventId/health
 * Get stream health and technical metrics
 */
router.get('/events/:eventId/health',
  authenticate,
  param('eventId').isMongoId(),
  async (req: Request, res: Response) => {
  try {
    const event = await EventModel.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'EVENT_NOT_FOUND',
          message: 'Event not found'
        },
        timestamp: new Date()
      });
    }

    // Check access
    if (event.userId !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'Access denied'
        },
        timestamp: new Date()
      });
    }

    // Get real-time health metrics from Redis
    const healthData = await redis.hGetAll(`stream_health:${event.id}`);

    res.json({
      success: true,
      data: {
        eventId: event.id,
        status: event.status,
        health: {
          streamHealth: event.technical.streamHealth,
          bitrate: parseInt(healthData.bitrate || '0'),
          fps: parseInt(healthData.fps || '0'),
          droppedFrames: parseInt(healthData.droppedFrames || '0'),
          bandwidth: parseInt(healthData.bandwidth || '0'),
          lastHealthCheck: event.technical.lastHealthCheck,
          uptime: event.status === 'live' ? 
            Math.floor((Date.now() - (event.actualStart?.getTime() || Date.now())) / 1000) : 0
        },
        recommendations: generateHealthRecommendations(event, healthData)
      },
      timestamp: new Date()
    });

  } catch (error) {
    logger.error('Get stream health error', {
      error: error.message,
      eventId: req.params.eventId
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_STREAM_HEALTH_FAILED',
        message: 'Failed to fetch stream health'
      },
      timestamp: new Date()
    });
  }
});

/**
 * POST /api/streaming/events/:eventId/restart
 * Restart a problematic stream
 */
router.post('/events/:eventId/restart',
  authenticate,
  authorize(['streamer', 'admin']),
  param('eventId').isMongoId(),
  async (req: Request, res: Response) => {
  try {
    const event = await EventModel.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'EVENT_NOT_FOUND',
          message: 'Event not found'
        },
        timestamp: new Date()
      });
    }

    // Check ownership
    if (event.userId !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'You can only restart your own streams'
        },
        timestamp: new Date()
      });
    }

    if (event.status !== 'live') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'STREAM_NOT_LIVE',
          message: 'Can only restart live streams'
        },
        timestamp: new Date()
      });
    }

    // Reset stream health metrics
    await Promise.all([
      redis.del(`stream_health:${event.id}`),
      redis.hSet(`stream_health:${event.id}`, {
        restartedAt: Date.now().toString(),
        restartedBy: req.user!.id
      })
    ]);

    // Update technical info
    event.technical.droppedFrames = 0;
    event.technical.lastHealthCheck = new Date();
    await event.save();

    logger.info('Stream restarted', {
      eventId: event.id,
      userId: req.user!.id
    });

    res.json({
      success: true,
      data: {
        message: 'Stream restart initiated successfully'
      },
      timestamp: new Date()
    });

  } catch (error) {
    logger.error('Stream restart error', {
      error: error.message,
      eventId: req.params.eventId,
      userId: req.user?.id
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'STREAM_RESTART_FAILED',
        message: 'Failed to restart stream'
      },
      timestamp: new Date()
    });
  }
});

// Webhook handler functions

async function handlePublishStart(event: any, clientId: string, stats: any) {
  logger.info('Stream publish started', {
    eventId: event.id,
    clientId,
    stats
  });

  // Update event technical info
  if (stats) {
    event.technical.bitrate = stats.bitrate || 0;
    event.technical.fps = stats.fps || 0;
    event.technical.lastHealthCheck = new Date();
    await event.save();

    // Store in Redis for real-time access
    await redis.hSet(`stream_health:${event.id}`, {
      bitrate: (stats.bitrate || 0).toString(),
      fps: (stats.fps || 0).toString(),
      publishStarted: Date.now().toString(),
      clientId
    });
  }
}

async function handlePublishDone(event: any, clientId: string, stats: any) {
  logger.info('Stream publish ended', {
    eventId: event.id,
    clientId,
    stats
  });

  // Clean up Redis data
  await redis.del(`stream_health:${event.id}`);
  
  // Update final stats if provided
  if (stats) {
    event.technical.bitrate = stats.bitrate || event.technical.bitrate;
    event.technical.fps = stats.fps || event.technical.fps;
    event.technical.droppedFrames = stats.droppedFrames || event.technical.droppedFrames;
    await event.save();
  }
}

async function handlePlayStart(event: any, clientId: string) {
  // Increment viewer count
  const currentCount = await redis.hGet(`event:${event.id}`, 'viewerCount');
  await redis.hSet(`event:${event.id}`, 'viewerCount', (parseInt(currentCount || '0') + 1).toString());
  
  logger.debug('Viewer connected', {
    eventId: event.id,
    clientId
  });
}

async function handlePlayDone(event: any, clientId: string) {
  // Decrement viewer count (but don't go below 0)
  const currentCount = await redis.hGet(`event:${event.id}`, 'viewerCount');
  if (currentCount && parseInt(currentCount) > 0) {
    await redis.hSet(`event:${event.id}`, 'viewerCount', (parseInt(currentCount) - 1).toString());
  }
  
  logger.debug('Viewer disconnected', {
    eventId: event.id,
    clientId
  });
}

async function handleStatsUpdate(event: any, stats: any) {
  if (!stats) return;

  // Update Redis with real-time stats
  const updates: any = {};
  
  if (stats.bitrate !== undefined) updates.bitrate = stats.bitrate.toString();
  if (stats.fps !== undefined) updates.fps = stats.fps.toString();
  if (stats.droppedFrames !== undefined) updates.droppedFrames = stats.droppedFrames.toString();
  if (stats.bandwidth !== undefined) updates.bandwidth = stats.bandwidth.toString();
  
  updates.lastStatsUpdate = Date.now().toString();

  await redis.hSet(`stream_health:${event.id}`, updates);

  // Update database periodically (not every stats update to avoid spam)
  const lastDbUpdate = await redis.hGet(`stream_health:${event.id}`, 'lastDbUpdate');
  const now = Date.now();
  
  if (!lastDbUpdate || now - parseInt(lastDbUpdate) > 30000) { // Update DB every 30 seconds
    event.technical.bitrate = stats.bitrate || event.technical.bitrate;
    event.technical.fps = stats.fps || event.technical.fps;
    event.technical.droppedFrames = stats.droppedFrames || event.technical.droppedFrames;
    event.technical.bandwidth = stats.bandwidth || event.technical.bandwidth;
    event.technical.lastHealthCheck = new Date();
    
    // Determine stream health
    event.technical.streamHealth = calculateStreamHealth(stats);
    
    await event.save();
    await redis.hSet(`stream_health:${event.id}`, 'lastDbUpdate', now.toString());
  }
}

function calculateStreamHealth(stats: any): 'excellent' | 'good' | 'warning' | 'error' {
  if (!stats) return 'error';
  
  const { bitrate, fps, droppedFrames } = stats;
  
  // Calculate health based on various metrics
  if (droppedFrames > 100) return 'error';
  if (droppedFrames > 50) return 'warning';
  if (bitrate < 1000) return 'warning';
  if (fps < 24) return 'warning';
  if (bitrate > 8000 && fps >= 30 && droppedFrames < 10) return 'excellent';
  
  return 'good';
}

function generateHealthRecommendations(event: any, healthData: any): string[] {
  const recommendations: string[] = [];
  
  const bitrate = parseInt(healthData.bitrate || '0');
  const fps = parseInt(healthData.fps || '0');
  const droppedFrames = parseInt(healthData.droppedFrames || '0');
  
  if (droppedFrames > 100) {
    recommendations.push('High dropped frame count detected. Check your internet connection and reduce stream quality.');
  }
  
  if (bitrate < 1000) {
    recommendations.push('Low bitrate detected. Increase bitrate for better video quality.');
  }
  
  if (fps < 24) {
    recommendations.push('Low frame rate detected. Check encoding settings and system performance.');
  }
  
  if (bitrate > 10000) {
    recommendations.push('Very high bitrate may cause buffering for viewers. Consider reducing if experiencing issues.');
  }
  
  if (event.technical.streamHealth === 'error') {
    recommendations.push('Stream health is critical. Consider restarting the stream.');
  }
  
  return recommendations;
}

export default router;
