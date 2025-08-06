import { Router, Request, Response } from 'express';
import { param, query, validationResult } from 'express-validator';
import { authenticate, authorize, checkOwnership } from '@/middleware/auth';
import { EventModel } from '@/models/Event';
import { redis } from '@/utils/redis';
import { logger } from '@/utils/logger';

const router = Router();

/**
 * GET /api/analytics/events/:eventId
 * Get real-time analytics for a specific event
 */
router.get('/events/:eventId', 
  authenticate,
  param('eventId').isMongoId(),
  async (req: Request, res: Response) => {
  try {
    // Check validation errors
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

    // Check if user can access event analytics
    if (event.userId !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'You can only view analytics for your own events'
        },
        timestamp: new Date()
      });
    }

    // Get real-time metrics from Redis if event is live
    let realTimeData = {};
    if (event.status === 'live') {
      const metrics = await redis.hGetAll(`metrics:${event.id}`);
      const viewerCount = await redis.hGet(`event:${event.id}`, 'viewerCount');
      
      realTimeData = {
        currentViewers: parseInt(viewerCount || '0'),
        totalLikes: parseInt(metrics.likes || '0'),
        chatMessages: parseInt(metrics.chatMessages || '0'),
        lastUpdated: new Date()
      };
    }

    res.json({
      success: true,
      data: {
        eventId: event.id,
        status: event.status,
        duration: event.calculateDuration(),
        metrics: {
          ...event.metrics,
          ...realTimeData
        },
        technical: event.technical,
        engagement: event.engagement,
        geographic: event.geographic
      },
      timestamp: new Date()
    });

  } catch (error) {
    logger.error('Get event analytics error', {
      error: error.message,
      eventId: req.params.eventId,
      userId: req.user?.id
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ANALYTICS_FAILED',
        message: 'Failed to fetch analytics data'
      },
      timestamp: new Date()
    });
  }
});

/**
 * GET /api/analytics/events/:eventId/timeseries
 * Get time-series analytics data for charts
 */
router.get('/events/:eventId/timeseries',
  authenticate,
  param('eventId').isMongoId(),
  async (req: Request, res: Response) => {
  try {
    const { 
      metric = 'viewers',
      interval = '5m',
      start,
      end 
    } = req.query;

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

    // Get time-series data from Redis streams
    const streamKey = `analytics:${event.id}:${metric}`;
    const timeSeriesData = await redis.xRange(
      streamKey,
      start as string || '-',
      end as string || '+',
      { COUNT: 100 }
    );

    // Format data for charting
    const formattedData = timeSeriesData.map((entry: any) => ({
      timestamp: new Date(parseInt(entry.id.split('-')[0])),
      value: parseFloat(entry.message.value || '0')
    }));

    res.json({
      success: true,
      data: {
        eventId: event.id,
        metric,
        interval,
        data: formattedData
      },
      timestamp: new Date()
    });

  } catch (error) {
    logger.error('Get time-series analytics error', {
      error: error.message,
      eventId: req.params.eventId
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_TIMESERIES_FAILED',
        message: 'Failed to fetch time-series data'
      },
      timestamp: new Date()
    });
  }
});

/**
 * GET /api/analytics/dashboard
 * Get dashboard analytics for user's events
 */
router.get('/dashboard', authenticate, async (req: Request, res: Response) => {
  try {
    const {
      period = '7d',
      limit = 10
    } = req.query;

    // Calculate date range
    const periodDays = {
      '1d': 1,
      '7d': 7,
      '30d': 30,
      '90d': 90
    };

    const days = periodDays[period as string] || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get user's events in the period
    const events = await EventModel.find({
      userId: req.user!.id,
      actualStart: { $gte: startDate }
    }).sort({ actualStart: -1 }).limit(parseInt(limit as string));

    // Aggregate stats
    const totalEvents = events.length;
    const totalViews = events.reduce((sum, event) => sum + event.metrics.totalViews, 0);
    const totalStreamTime = events.reduce((sum, event) => sum + event.calculateDuration(), 0);
    const averageViewers = events.length > 0 
      ? events.reduce((sum, event) => sum + event.metrics.peakViewers, 0) / events.length 
      : 0;

    // Top performing events
    const topEvents = events
      .sort((a, b) => b.metrics.peakViewers - a.metrics.peakViewers)
      .slice(0, 5)
      .map(event => ({
        id: event.id,
        title: event.title,
        peakViewers: event.metrics.peakViewers,
        totalViews: event.metrics.totalViews,
        duration: event.calculateDuration(),
        startDate: event.actualStart
      }));

    // Recent activity
    const recentActivity = events.slice(0, 10).map(event => ({
      id: event.id,
      title: event.title,
      status: event.status,
      viewers: event.metrics.currentViewers,
      startDate: event.actualStart,
      endDate: event.actualEnd
    }));

    res.json({
      success: true,
      data: {
        period,
        summary: {
          totalEvents,
          totalViews,
          totalStreamTime: Math.round(totalStreamTime / 60), // Convert to minutes
          averageViewers: Math.round(averageViewers)
        },
        topEvents,
        recentActivity
      },
      timestamp: new Date()
    });

  } catch (error) {
    logger.error('Get dashboard analytics error', {
      error: error.message,
      userId: req.user?.id
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_DASHBOARD_FAILED',
        message: 'Failed to fetch dashboard analytics'
      },
      timestamp: new Date()
    });
  }
});

/**
 * POST /api/analytics/events/:eventId/track
 * Track custom analytics event
 */
router.post('/events/:eventId/track',
  authenticate,
  param('eventId').isMongoId(),
  async (req: Request, res: Response) => {
  try {
    const { event: analyticsEvent, data } = req.body;

    if (!analyticsEvent) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_EVENT',
          message: 'Analytics event name is required'
        },
        timestamp: new Date()
      });
    }

    const event = await EventModel.findById(req.params.eventId);
    if (!event || event.status !== 'live') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'EVENT_NOT_LIVE',
          message: 'Can only track analytics for live events'
        },
        timestamp: new Date()
      });
    }

    // Store in Redis stream for real-time processing
    const streamKey = `analytics:${event.id}:events`;
    await redis.xAdd(streamKey, '*', {
      event: analyticsEvent,
      userId: req.user!.id,
      data: JSON.stringify(data || {}),
      timestamp: Date.now().toString()
    });

    res.json({
      success: true,
      data: {
        message: 'Analytics event tracked successfully'
      },
      timestamp: new Date()
    });

  } catch (error) {
    logger.error('Track analytics event error', {
      error: error.message,
      eventId: req.params.eventId,
      userId: req.user?.id
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'TRACK_EVENT_FAILED',
        message: 'Failed to track analytics event'
      },
      timestamp: new Date()
    });
  }
});

/**
 * GET /api/analytics/platform
 * Get platform-wide analytics (admin only)
 */
router.get('/platform', 
  authenticate, 
  authorize(['admin']), 
  async (req: Request, res: Response) => {
  try {
    const { period = '7d' } = req.query;

    // Calculate date range
    const periodDays = {
      '1d': 1,
      '7d': 7,
      '30d': 30,
      '90d': 90
    };

    const days = periodDays[period as string] || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Aggregate platform statistics
    const [eventStats, userStats] = await Promise.all([
      EventModel.aggregate([
        { $match: { actualStart: { $gte: startDate } } },
        {
          $group: {
            _id: null,
            totalEvents: { $sum: 1 },
            liveEvents: {
              $sum: { $cond: [{ $eq: ['$status', 'live'] }, 1, 0] }
            },
            totalViews: { $sum: '$metrics.totalViews' },
            totalChatMessages: { $sum: '$metrics.chatMessages' },
            totalStreamTime: { $sum: '$duration' },
            averageViewers: { $avg: '$metrics.peakViewers' }
          }
        }
      ]),
      EventModel.aggregate([
        { $match: { actualStart: { $gte: startDate } } },
        { $group: { _id: '$userId' } },
        { $count: 'activeStreamers' }
      ])
    ]);

    const stats = eventStats[0] || {
      totalEvents: 0,
      liveEvents: 0,
      totalViews: 0,
      totalChatMessages: 0,
      totalStreamTime: 0,
      averageViewers: 0
    };

    const activeStreamers = userStats[0]?.activeStreamers || 0;

    // Top categories
    const topCategories = await EventModel.aggregate([
      { $match: { actualStart: { $gte: startDate } } },
      {
        $group: {
          _id: '$category',
          eventCount: { $sum: 1 },
          totalViews: { $sum: '$metrics.totalViews' }
        }
      },
      { $sort: { totalViews: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        period,
        overview: {
          totalEvents: stats.totalEvents,
          liveEvents: stats.liveEvents,
          activeStreamers,
          totalViews: stats.totalViews,
          totalChatMessages: stats.totalChatMessages,
          averageViewers: Math.round(stats.averageViewers || 0),
          totalStreamTime: Math.round(stats.totalStreamTime / 60) // Convert to minutes
        },
        topCategories: topCategories.map(cat => ({
          category: cat._id,
          eventCount: cat.eventCount,
          totalViews: cat.totalViews
        }))
      },
      timestamp: new Date()
    });

  } catch (error) {
    logger.error('Get platform analytics error', {
      error: error.message,
      userId: req.user?.id
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_PLATFORM_ANALYTICS_FAILED',
        message: 'Failed to fetch platform analytics'
      },
      timestamp: new Date()
    });
  }
});

export default router;
