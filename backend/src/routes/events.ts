import { Router, Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { EventModel } from '@/models/Event';
import { eventService } from '@/services/EventService';
import { authenticate, optionalAuth, authorize } from '@/middleware/auth';
import { logger, logStreaming } from '@/utils/logger';

const router = Router();

// Validation rules
const createEventValidation = [
  body('title')
    .isLength({ min: 1, max: 200 })
    .trim()
    .withMessage('Title must be 1-200 characters long'),
  body('description')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Description must be less than 2000 characters'),
  body('category')
    .isIn(['gaming', 'music', 'education', 'technology', 'entertainment', 'sports', 'art', 'cooking', 'travel', 'other'])
    .withMessage('Invalid category'),
  body('privacy')
    .optional()
    .isIn(['public', 'unlisted', 'private'])
    .withMessage('Privacy must be public, unlisted, or private'),
  body('scheduledStart')
    .optional()
    .isISO8601()
    .withMessage('Scheduled start must be a valid date')
];

const updateEventValidation = [
  body('title')
    .optional()
    .isLength({ min: 1, max: 200 })
    .trim()
    .withMessage('Title must be 1-200 characters long'),
  body('description')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Description must be less than 2000 characters'),
  body('category')
    .optional()
    .isIn(['gaming', 'music', 'education', 'technology', 'entertainment', 'sports', 'art', 'cooking', 'travel', 'other'])
    .withMessage('Invalid category'),
  body('privacy')
    .optional()
    .isIn(['public', 'unlisted', 'private'])
    .withMessage('Privacy must be public, unlisted, or private')
];

/**
 * POST /api/events
 * Create a new event
 */
router.post('/', authenticate, authorize(['streamer', 'admin']), createEventValidation, async (req: Request, res: Response) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: errors.array()
        },
        timestamp: new Date()
      });
    }

    const {
      title,
      description,
      category,
      privacy = 'public',
      scheduledStart,
      settings
    } = req.body;

    // Create event
    const event = await eventService.createEvent({
      userId: req.user!.id,
      title,
      description,
      category,
      privacy,
      scheduledStart: scheduledStart ? new Date(scheduledStart) : undefined,
      settings
    });

    logStreaming('EVENT_CREATED', event.id, {
      userId: req.user!.id,
      title,
      category,
      privacy
    });

    res.status(201).json({
      success: true,
      data: { event },
      timestamp: new Date()
    });

  } catch (error) {
    logger.error('Create event error', {
      error: error.message,
      userId: req.user?.id,
      body: req.body
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'EVENT_CREATION_FAILED',
        message: 'Failed to create event'
      },
      timestamp: new Date()
    });
  }
});

/**
 * GET /api/events
 * Get live events with optional filtering
 */
router.get('/', optionalAuth, async (req: Request, res: Response) => {
  try {
    const {
      category,
      search,
      limit = 20,
      offset = 0
    } = req.query;

    let events;
    let total;

    if (search) {
      // Search events
      const results = await EventModel.searchEvents(search as string, {
        category: category as string,
        limit: parseInt(limit as string),
        skip: parseInt(offset as string)
      });
      events = results;
      total = results.length; // Note: This is approximate for search
    } else {
      // Get live events
      const results = await eventService.getLiveEvents({
        category: category as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      });
      events = results.events;
      total = results.total;
    }

    res.json({
      success: true,
      data: {
        events,
        pagination: {
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          total
        }
      },
      timestamp: new Date()
    });

  } catch (error) {
    logger.error('Get events error', {
      error: error.message,
      query: req.query
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_EVENTS_FAILED',
        message: 'Failed to fetch events'
      },
      timestamp: new Date()
    });
  }
});

/**
 * GET /api/events/trending
 * Get trending events
 */
router.get('/trending', async (req: Request, res: Response) => {
  try {
    const { timeframe = 24 } = req.query;

    const events = await EventModel.getTrendingEvents(parseInt(timeframe as string));

    res.json({
      success: true,
      data: { events },
      timestamp: new Date()
    });

  } catch (error) {
    logger.error('Get trending events error', {
      error: error.message
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_TRENDING_FAILED',
        message: 'Failed to fetch trending events'
      },
      timestamp: new Date()
    });
  }
});

/**
 * GET /api/events/my
 * Get current user's events
 */
router.get('/my', authenticate, async (req: Request, res: Response) => {
  try {
    const {
      status,
      limit = 50,
      offset = 0
    } = req.query;

    const results = await eventService.getUserEvents(req.user!.id, {
      status: status as string,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });

    res.json({
      success: true,
      data: {
        events: results.events,
        pagination: {
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          total: results.total
        }
      },
      timestamp: new Date()
    });

  } catch (error) {
    logger.error('Get user events error', {
      error: error.message,
      userId: req.user?.id
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_USER_EVENTS_FAILED',
        message: 'Failed to fetch user events'
      },
      timestamp: new Date()
    });
  }
});

/**
 * GET /api/events/:id
 * Get specific event details
 */
router.get('/:id', param('id').isMongoId(), optionalAuth, async (req: Request, res: Response) => {
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

    const event = await eventService.getEvent(req.params.id);
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

    // Check privacy permissions
    if (event.privacy === 'private') {
      if (!req.user || (req.user.id !== event.userId && req.user.role !== 'admin')) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'ACCESS_DENIED',
            message: 'This event is private'
          },
          timestamp: new Date()
        });
      }
    }

    // Get container info if event is live
    let container = null;
    if (event.status === 'live') {
      container = await eventService.getEventContainer(event.id);
    }

    res.json({
      success: true,
      data: {
        event,
        container
      },
      timestamp: new Date()
    });

  } catch (error) {
    logger.error('Get event error', {
      error: error.message,
      eventId: req.params.id
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_EVENT_FAILED',
        message: 'Failed to fetch event'
      },
      timestamp: new Date()
    });
  }
});

/**
 * PUT /api/events/:id
 * Update event details
 */
router.put('/:id', 
  authenticate, 
  param('id').isMongoId(), 
  updateEventValidation, 
  async (req: Request, res: Response) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: errors.array()
        },
        timestamp: new Date()
      });
    }

    const event = await eventService.getEvent(req.params.id);
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
          message: 'You can only update your own events'
        },
        timestamp: new Date()
      });
    }

    const updatedEvent = await eventService.updateEvent(req.params.id, req.body);

    logStreaming('EVENT_UPDATED', event.id, {
      userId: req.user!.id,
      updates: Object.keys(req.body)
    });

    res.json({
      success: true,
      data: { event: updatedEvent },
      timestamp: new Date()
    });

  } catch (error) {
    logger.error('Update event error', {
      error: error.message,
      eventId: req.params.id,
      userId: req.user?.id
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'EVENT_UPDATE_FAILED',
        message: error.message || 'Failed to update event'
      },
      timestamp: new Date()
    });
  }
});

/**
 * DELETE /api/events/:id
 * Delete an event
 */
router.delete('/:id', authenticate, param('id').isMongoId(), async (req: Request, res: Response) => {
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

    const event = await eventService.getEvent(req.params.id);
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
          message: 'You can only delete your own events'
        },
        timestamp: new Date()
      });
    }

    await eventService.deleteEvent(req.params.id);

    logStreaming('EVENT_DELETED', req.params.id, {
      userId: req.user!.id
    });

    res.json({
      success: true,
      data: {
        message: 'Event deleted successfully'
      },
      timestamp: new Date()
    });

  } catch (error) {
    logger.error('Delete event error', {
      error: error.message,
      eventId: req.params.id,
      userId: req.user?.id
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'EVENT_DELETION_FAILED',
        message: error.message || 'Failed to delete event'
      },
      timestamp: new Date()
    });
  }
});

/**
 * POST /api/events/:id/start
 * Start a live stream for an event
 */
router.post('/:id/start', 
  authenticate, 
  authorize(['streamer', 'admin']), 
  param('id').isMongoId(), 
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

    const event = await eventService.getEvent(req.params.id);
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
          message: 'You can only start your own events'
        },
        timestamp: new Date()
      });
    }

    const result = await eventService.startStream(req.params.id);

    logStreaming('STREAM_STARTED', req.params.id, {
      userId: req.user!.id,
      containerId: result.container.id,
      title: result.event.title
    });

    res.json({
      success: true,
      data: result,
      timestamp: new Date()
    });

  } catch (error) {
    logger.error('Start stream error', {
      error: error.message,
      eventId: req.params.id,
      userId: req.user?.id
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'STREAM_START_FAILED',
        message: error.message || 'Failed to start stream'
      },
      timestamp: new Date()
    });
  }
});

/**
 * POST /api/events/:id/stop
 * Stop a live stream
 */
router.post('/:id/stop', 
  authenticate, 
  authorize(['streamer', 'admin']), 
  param('id').isMongoId(), 
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

    const event = await eventService.getEvent(req.params.id);
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
          message: 'You can only stop your own events'
        },
        timestamp: new Date()
      });
    }

    const updatedEvent = await eventService.stopStream(req.params.id);

    logStreaming('STREAM_STOPPED', req.params.id, {
      userId: req.user!.id,
      duration: updatedEvent.calculateDuration()
    });

    res.json({
      success: true,
      data: { event: updatedEvent },
      timestamp: new Date()
    });

  } catch (error) {
    logger.error('Stop stream error', {
      error: error.message,
      eventId: req.params.id,
      userId: req.user?.id
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'STREAM_STOP_FAILED',
        message: error.message || 'Failed to stop stream'
      },
      timestamp: new Date()
    });
  }
});

/**
 * GET /api/events/:id/stats
 * Get event analytics and statistics
 */
router.get('/:id/stats', 
  authenticate, 
  param('id').isMongoId(), 
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

    const event = await EventModel.findById(req.params.id);
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

    // Check ownership (only event owner or admin can see detailed stats)
    if (event.userId !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'You can only view stats for your own events'
        },
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      data: {
        metrics: event.metrics,
        technical: event.technical,
        engagement: event.engagement,
        geographic: event.geographic,
        duration: event.calculateDuration()
      },
      timestamp: new Date()
    });

  } catch (error) {
    logger.error('Get event stats error', {
      error: error.message,
      eventId: req.params.id,
      userId: req.user?.id
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_STATS_FAILED',
        message: 'Failed to fetch event statistics'
      },
      timestamp: new Date()
    });
  }
});

export default router;
