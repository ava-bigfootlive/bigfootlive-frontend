const express = require('express');
const { authenticateToken, requirePermission } = require('../middleware/auth');
const { Event } = require('../models');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Event Management Routes

/**
 * @route POST /api/streaming/events
 * @desc Create a new streaming event
 * @access Private
 */
router.post('/events', authenticateToken, async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      privacy = 'public',
      scheduledStart,
      settings = {}
    } = req.body;

    const userId = req.user.sub;
    const streamKey = uuidv4();
    const eventId = uuidv4();

    const event = {
      id: eventId,
      userId,
      title,
      description,
      category,
      privacy,
      status: scheduledStart ? 'scheduled' : 'created',
      scheduledStart: scheduledStart ? new Date(scheduledStart) : undefined,
      streamKey,
      rtmpUrl: `rtmp://localhost:1935/live/${streamKey}`,
      settings: {
        chatEnabled: settings.chatEnabled ?? true,
        recordingEnabled: settings.recordingEnabled ?? false,
        donationsEnabled: settings.donationsEnabled ?? false,
        quality: {
          resolution: settings.quality?.resolution ?? '1080p',
          bitrate: settings.quality?.bitrate ?? 4500,
          fps: settings.quality?.fps ?? 30
        },
        moderation: {
          autoMod: settings.moderation?.autoMod ?? true,
          badWordFilter: settings.moderation?.badWordFilter ?? true,
          slowMode: settings.moderation?.slowMode ?? 0,
          subscriberOnly: settings.moderation?.subscriberOnly ?? false
        }
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Save to database (you'll need to implement the Event model)
    // For now, we'll store in Redis for caching
    await req.app.locals.redis.setex(
      `event:${eventId}`,
      3600, // 1 hour TTL
      JSON.stringify(event)
    );

    res.json({
      success: true,
      data: event
    });

  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create event'
    });
  }
});

/**
 * @route GET /api/streaming/events/:eventId
 * @desc Get event details
 * @access Private
 */
router.get('/events/:eventId', authenticateToken, async (req, res) => {
  try {
    const { eventId } = req.params;
    
    // Try Redis first for fast access
    const cachedEvent = await req.app.locals.redis.get(`event:${eventId}`);
    if (cachedEvent) {
      const event = JSON.parse(cachedEvent);
      
      // Check if user has permission to view this event
      if (event.userId !== req.user.sub && event.privacy === 'private') {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }
      
      return res.json({
        success: true,
        data: event
      });
    }

    res.status(404).json({
      success: false,
      error: 'Event not found'
    });

  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get event'
    });
  }
});

/**
 * @route POST /api/streaming/events/:eventId/start
 * @desc Start a live stream
 * @access Private
 */
router.post('/events/:eventId/start', authenticateToken, async (req, res) => {
  try {
    const { eventId } = req.params;
    
    // Get event details
    const cachedEvent = await req.app.locals.redis.get(`event:${eventId}`);
    if (!cachedEvent) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    const event = JSON.parse(cachedEvent);
    
    // Check ownership
    if (event.userId !== req.user.sub) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Check if already live
    if (event.status === 'live') {
      return res.status(400).json({
        success: false,
        error: 'Event is already live'
      });
    }

    // Update event status
    event.status = 'live';
    event.actualStart = new Date();
    event.hlsUrl = `http://localhost:8081/live/${event.streamKey}.m3u8`;
    event.updatedAt = new Date();

    // Save updated event
    await req.app.locals.redis.setex(
      `event:${eventId}`,
      3600,
      JSON.stringify(event)
    );

    // Notify SRS via HTTP API (optional - SRS will handle this via webhooks)
    console.log(`🚀 Stream started for event ${eventId}`);

    res.json({
      success: true,
      data: {
        event,
        rtmpUrl: event.rtmpUrl,
        streamKey: event.streamKey,
        hlsUrl: event.hlsUrl
      }
    });

  } catch (error) {
    console.error('Start stream error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start stream'
    });
  }
});

/**
 * @route POST /api/streaming/events/:eventId/stop
 * @desc Stop a live stream
 * @access Private
 */
router.post('/events/:eventId/stop', authenticateToken, async (req, res) => {
  try {
    const { eventId } = req.params;
    
    // Get event details
    const cachedEvent = await req.app.locals.redis.get(`event:${eventId}`);
    if (!cachedEvent) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    const event = JSON.parse(cachedEvent);
    
    // Check ownership
    if (event.userId !== req.user.sub) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Check if actually live
    if (event.status !== 'live') {
      return res.status(400).json({
        success: false,
        error: 'Event is not live'
      });
    }

    // Update event status
    event.status = 'ended';
    event.actualEnd = new Date();
    event.updatedAt = new Date();

    // Calculate duration
    if (event.actualStart) {
      event.duration = event.actualEnd.getTime() - new Date(event.actualStart).getTime();
    }

    // Save updated event
    await req.app.locals.redis.setex(
      `event:${eventId}`,
      3600,
      JSON.stringify(event)
    );

    console.log(`🛑 Stream stopped for event ${eventId}`);

    res.json({
      success: true,
      data: event
    });

  } catch (error) {
    console.error('Stop stream error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to stop stream'
    });
  }
});

/**
 * @route GET /api/streaming/events/:eventId/config
 * @desc Get streaming configuration for OBS/streaming software
 * @access Private
 */
router.get('/events/:eventId/config', authenticateToken, async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const cachedEvent = await req.app.locals.redis.get(`event:${eventId}`);
    if (!cachedEvent) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    const event = JSON.parse(cachedEvent);
    
    // Check ownership
    if (event.userId !== req.user.sub) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: {
        rtmpUrl: event.rtmpUrl,
        streamKey: event.streamKey,
        hlsUrl: event.hlsUrl,
        settings: {
          recommendedBitrate: event.settings.quality.bitrate,
          resolution: event.settings.quality.resolution,
          fps: event.settings.quality.fps
        }
      }
    });

  } catch (error) {
    console.error('Get streaming config error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get streaming config'
    });
  }
});

/**
 * @route GET /api/streaming/events/:eventId/stats
 * @desc Get live stream statistics
 * @access Private
 */
router.get('/events/:eventId/stats', authenticateToken, async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const cachedEvent = await req.app.locals.redis.get(`event:${eventId}`);
    if (!cachedEvent) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    const event = JSON.parse(cachedEvent);

    // Get real-time stats from SRS API
    try {
      const srsResponse = await fetch('http://localhost:8080/api/v1/streams');
      const srsData = await srsResponse.json();
      
      // Find this stream's stats
      const streamStats = srsData.streams?.find(stream => 
        stream.name === event.streamKey
      );

      const stats = {
        eventId,
        status: event.status,
        viewers: streamStats?.clients || 0,
        bitrate: streamStats?.video?.bitrate || 0,
        fps: streamStats?.video?.fps || 0,
        duration: event.actualStart ? 
          Date.now() - new Date(event.actualStart).getTime() : 0,
        startTime: event.actualStart,
        ...streamStats
      };

      res.json({
        success: true,
        data: stats
      });

    } catch (srsError) {
      console.error('SRS API error:', srsError);
      
      // Fallback stats when SRS is not available
      res.json({
        success: true,
        data: {
          eventId,
          status: event.status,
          viewers: 0,
          bitrate: 0,
          fps: 0,
          duration: event.actualStart ? 
            Date.now() - new Date(event.actualStart).getTime() : 0,
          startTime: event.actualStart
        }
      });
    }

  } catch (error) {
    console.error('Get stream stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get stream stats'
    });
  }
});

// SRS Webhook Routes (called by SRS server)

/**
 * @route POST /api/streaming/srs/on_publish
 * @desc SRS webhook when stream starts publishing
 * @access Public (from SRS)
 */
router.post('/srs/on_publish', async (req, res) => {
  try {
    const { stream, app } = req.body;
    
    console.log(`📡 SRS: Stream published - ${app}/${stream}`);
    
    // Update event status and notify clients via WebSocket
    // This is where you'd update the event status to 'live'
    // and send real-time notifications to viewers
    
    res.json({ code: 0, msg: 'success' });

  } catch (error) {
    console.error('SRS on_publish error:', error);
    res.json({ code: -1, msg: 'error' });
  }
});

/**
 * @route POST /api/streaming/srs/on_unpublish
 * @desc SRS webhook when stream stops publishing
 * @access Public (from SRS)
 */
router.post('/srs/on_unpublish', async (req, res) => {
  try {
    const { stream, app } = req.body;
    
    console.log(`📡 SRS: Stream unpublished - ${app}/${stream}`);
    
    // Update event status to 'ended' and handle cleanup
    
    res.json({ code: 0, msg: 'success' });

  } catch (error) {
    console.error('SRS on_unpublish error:', error);
    res.json({ code: -1, msg: 'error' });
  }
});

/**
 * @route POST /api/streaming/srs/on_play
 * @desc SRS webhook when viewer starts playing
 * @access Public (from SRS)
 */
router.post('/srs/on_play', async (req, res) => {
  try {
    const { stream, app, ip } = req.body;
    
    console.log(`👁️ SRS: Viewer connected - ${app}/${stream} from ${ip}`);
    
    // Track viewer analytics
    
    res.json({ code: 0, msg: 'success' });

  } catch (error) {
    console.error('SRS on_play error:', error);
    res.json({ code: -1, msg: 'error' });
  }
});

/**
 * @route POST /api/streaming/srs/on_stop
 * @desc SRS webhook when viewer stops playing
 * @access Public (from SRS)
 */
router.post('/srs/on_stop', async (req, res) => {
  try {
    const { stream, app, ip } = req.body;
    
    console.log(`👁️ SRS: Viewer disconnected - ${app}/${stream} from ${ip}`);
    
    res.json({ code: 0, msg: 'success' });

  } catch (error) {
    console.error('SRS on_stop error:', error);
    res.json({ code: -1, msg: 'error' });
  }
});

/**
 * @route POST /api/streaming/srs/on_dvr
 * @desc SRS webhook when recording is created
 * @access Public (from SRS)
 */
router.post('/srs/on_dvr', async (req, res) => {
  try {
    const { stream, app, file } = req.body;
    
    console.log(`💾 SRS: Recording created - ${file} for ${app}/${stream}`);
    
    // Process recording and add to content library
    
    res.json({ code: 0, msg: 'success' });

  } catch (error) {
    console.error('SRS on_dvr error:', error);
    res.json({ code: -1, msg: 'error' });
  }
});

/**
 * @route POST /api/streaming/srs/heartbeat
 * @desc SRS heartbeat for monitoring
 * @access Public (from SRS)
 */
router.post('/srs/heartbeat', async (req, res) => {
  try {
    // SRS sends heartbeat data for monitoring
    const heartbeatData = req.body;
    
    // Store metrics in Redis for monitoring dashboard
    await req.app.locals.redis.setex(
      'srs:heartbeat',
      60, // 1 minute TTL
      JSON.stringify({
        ...heartbeatData,
        timestamp: new Date()
      })
    );

    res.json({ code: 0, msg: 'success' });

  } catch (error) {
    console.error('SRS heartbeat error:', error);
    res.json({ code: -1, msg: 'error' });
  }
});

module.exports = router;
