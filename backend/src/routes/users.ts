import { Router, Request, Response } from 'express';
import { param, body, query, validationResult } from 'express-validator';
import { UserModel } from '@/models/User';
import { EventModel } from '@/models/Event';
import { authenticate, optionalAuth, checkOwnership, authorize } from '@/middleware/auth';
import { logger } from '@/utils/logger';

const router = Router();

// Validation rules
const updateProfileValidation = [
  body('displayName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .trim()
    .withMessage('Display name must be 1-50 characters long'),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio must be less than 500 characters'),
  body('profile.socialLinks.twitter')
    .optional()
    .isURL()
    .withMessage('Twitter URL must be valid'),
  body('profile.socialLinks.youtube')
    .optional()
    .isURL()
    .withMessage('YouTube URL must be valid'),
  body('profile.socialLinks.instagram')
    .optional()
    .isURL()
    .withMessage('Instagram URL must be valid'),
  body('profile.socialLinks.website')
    .optional()
    .isURL()
    .withMessage('Website URL must be valid')
];

/**
 * GET /api/users/:userId
 * Get user profile by ID
 */
router.get('/:userId', param('userId').isMongoId(), optionalAuth, async (req: Request, res: Response) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid user ID'
        },
        timestamp: new Date()
      });
    }

    const user = await UserModel.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        },
        timestamp: new Date()
      });
    }

    // Public profile data
    const publicProfile = {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      avatar: user.avatar,
      role: user.role,
      isVerified: user.isVerified,
      followers: user.followers,
      following: user.following,
      totalViews: user.totalViews,
      createdAt: user.createdAt,
      profile: {
        bio: user.profile?.bio || '',
        socialLinks: user.profile?.socialLinks || {}
      },
      stats: {
        totalStreams: user.stats?.totalStreams || 0,
        averageViewers: user.stats?.averageViewers || 0,
        peakViewers: user.stats?.peakViewers || 0,
        lastStreamDate: user.stats?.lastStreamDate
      }
    };

    // Add private data if user is viewing their own profile
    let privateData = {};
    if (req.user && req.user.id === user.id) {
      privateData = {
        email: user.email,
        subscription: user.subscription,
        profile: {
          ...publicProfile.profile,
          preferences: user.profile?.preferences || {}
        }
      };
    }

    res.json({
      success: true,
      data: {
        user: {
          ...publicProfile,
          ...privateData
        }
      },
      timestamp: new Date()
    });

  } catch (error) {
    logger.error('Get user profile error', {
      error: error.message,
      userId: req.params.userId
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_USER_FAILED',
        message: 'Failed to fetch user profile'
      },
      timestamp: new Date()
    });
  }
});

/**
 * PUT /api/users/:userId
 * Update user profile
 */
router.put('/:userId', 
  authenticate, 
  param('userId').isMongoId(), 
  checkOwnership,
  updateProfileValidation, 
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

    const user = await UserModel.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        },
        timestamp: new Date()
      });
    }

    const {
      displayName,
      avatar,
      profile
    } = req.body;

    // Update basic profile fields
    if (displayName !== undefined) user.displayName = displayName;
    if (avatar !== undefined) user.avatar = avatar;

    // Update profile object
    if (profile) {
      if (profile.bio !== undefined) {
        if (!user.profile) user.profile = {};
        user.profile.bio = profile.bio;
      }
      
      if (profile.socialLinks) {
        if (!user.profile) user.profile = {};
        if (!user.profile.socialLinks) user.profile.socialLinks = {};
        
        Object.assign(user.profile.socialLinks, profile.socialLinks);
      }
      
      if (profile.preferences) {
        if (!user.profile) user.profile = {};
        if (!user.profile.preferences) user.profile.preferences = {};
        
        Object.assign(user.profile.preferences, profile.preferences);
      }
    }

    await user.save();

    logger.info('User profile updated', {
      userId: user.id,
      updatedFields: Object.keys(req.body)
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          avatar: user.avatar,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          followers: user.followers,
          following: user.following,
          totalViews: user.totalViews,
          profile: user.profile,
          stats: user.stats,
          subscription: user.subscription,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      },
      timestamp: new Date()
    });

  } catch (error) {
    logger.error('Update user profile error', {
      error: error.message,
      userId: req.params.userId
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_PROFILE_FAILED',
        message: 'Failed to update profile'
      },
      timestamp: new Date()
    });
  }
});

/**
 * GET /api/users/:userId/events
 * Get user's public events
 */
router.get('/:userId/events', 
  param('userId').isMongoId(), 
  optionalAuth, 
  async (req: Request, res: Response) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid user ID'
        },
        timestamp: new Date()
      });
    }

    const {
      status = 'ended',
      limit = 20,
      offset = 0
    } = req.query;

    // Build query - only show public events unless user is viewing their own
    let query: any = { 
      userId: req.params.userId,
      status: status as string
    };

    // Show private events only if user is viewing their own profile
    if (!req.user || req.user.id !== req.params.userId) {
      query.privacy = { $ne: 'private' };
    }

    const [events, total] = await Promise.all([
      EventModel.find(query)
        .sort({ actualStart: -1, createdAt: -1 })
        .limit(parseInt(limit as string))
        .skip(parseInt(offset as string))
        .lean(),
      EventModel.countDocuments(query)
    ]);

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
    logger.error('Get user events error', {
      error: error.message,
      userId: req.params.userId
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
 * GET /api/users
 * Search/browse users
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      search,
      role,
      verified,
      limit = 20,
      offset = 0,
      sortBy = 'followers',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    let query: any = {};

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { displayName: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) {
      query.role = role;
    }

    if (verified === 'true') {
      query.isVerified = true;
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    const [users, total] = await Promise.all([
      UserModel.find(query)
        .select('username displayName avatar role isVerified followers totalViews createdAt')
        .sort(sort)
        .limit(parseInt(limit as string))
        .skip(parseInt(offset as string))
        .lean(),
      UserModel.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          total
        }
      },
      timestamp: new Date()
    });

  } catch (error) {
    logger.error('Search users error', {
      error: error.message,
      query: req.query
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'SEARCH_USERS_FAILED',
        message: 'Failed to search users'
      },
      timestamp: new Date()
    });
  }
});

/**
 * POST /api/users/:userId/follow
 * Follow a user
 */
router.post('/:userId/follow', 
  authenticate, 
  param('userId').isMongoId(), 
  async (req: Request, res: Response) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid user ID'
        },
        timestamp: new Date()
      });
    }

    const targetUserId = req.params.userId;
    const currentUserId = req.user!.id;

    if (targetUserId === currentUserId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CANNOT_FOLLOW_SELF',
          message: 'Cannot follow yourself'
        },
        timestamp: new Date()
      });
    }

    // Check if target user exists
    const targetUser = await UserModel.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        },
        timestamp: new Date()
      });
    }

    // Update follower/following counts
    // This is simplified - in production you'd have a separate Follows collection
    await Promise.all([
      UserModel.findByIdAndUpdate(targetUserId, { $inc: { followers: 1 } }),
      UserModel.findByIdAndUpdate(currentUserId, { $inc: { following: 1 } })
    ]);

    logger.info('User followed', {
      followerId: currentUserId,
      targetUserId
    });

    res.json({
      success: true,
      data: {
        message: 'User followed successfully'
      },
      timestamp: new Date()
    });

  } catch (error) {
    logger.error('Follow user error', {
      error: error.message,
      userId: req.params.userId,
      followerId: req.user?.id
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'FOLLOW_USER_FAILED',
        message: 'Failed to follow user'
      },
      timestamp: new Date()
    });
  }
});

/**
 * DELETE /api/users/:userId/follow
 * Unfollow a user
 */
router.delete('/:userId/follow', 
  authenticate, 
  param('userId').isMongoId(), 
  async (req: Request, res: Response) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid user ID'
        },
        timestamp: new Date()
      });
    }

    const targetUserId = req.params.userId;
    const currentUserId = req.user!.id;

    // Update follower/following counts
    await Promise.all([
      UserModel.findByIdAndUpdate(targetUserId, { $inc: { followers: -1 } }),
      UserModel.findByIdAndUpdate(currentUserId, { $inc: { following: -1 } })
    ]);

    logger.info('User unfollowed', {
      followerId: currentUserId,
      targetUserId
    });

    res.json({
      success: true,
      data: {
        message: 'User unfollowed successfully'
      },
      timestamp: new Date()
    });

  } catch (error) {
    logger.error('Unfollow user error', {
      error: error.message,
      userId: req.params.userId,
      followerId: req.user?.id
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'UNFOLLOW_USER_FAILED',
        message: 'Failed to unfollow user'
      },
      timestamp: new Date()
    });
  }
});

/**
 * GET /api/users/:userId/stats
 * Get user statistics (for profile analytics)
 */
router.get('/:userId/stats', 
  authenticate, 
  param('userId').isMongoId(), 
  checkOwnership, 
  async (req: Request, res: Response) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid user ID'
        },
        timestamp: new Date()
      });
    }

    const user = await UserModel.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        },
        timestamp: new Date()
      });
    }

    // Get additional stats from events
    const eventStats = await EventModel.aggregate([
      { $match: { userId: req.params.userId } },
      {
        $group: {
          _id: null,
          totalEvents: { $sum: 1 },
          liveEvents: {
            $sum: { $cond: [{ $eq: ['$status', 'live'] }, 1, 0] }
          },
          totalViews: { $sum: '$metrics.totalViews' },
          totalChatMessages: { $sum: '$metrics.chatMessages' },
          averageViewers: { $avg: '$metrics.peakViewers' }
        }
      }
    ]);

    const stats = eventStats[0] || {
      totalEvents: 0,
      liveEvents: 0,
      totalViews: 0,
      totalChatMessages: 0,
      averageViewers: 0
    };

    res.json({
      success: true,
      data: {
        profile: {
          followers: user.followers,
          following: user.following,
          totalViews: user.totalViews,
          memberSince: user.createdAt
        },
        streaming: {
          totalStreams: stats.totalEvents,
          liveStreams: stats.liveEvents,
          totalViewTime: user.stats?.totalStreamTime || 0,
          averageViewers: Math.round(stats.averageViewers || 0),
          peakViewers: user.stats?.peakViewers || 0,
          lastStreamDate: user.stats?.lastStreamDate
        },
        engagement: {
          totalViews: stats.totalViews,
          totalChatMessages: stats.totalChatMessages,
          engagementRate: stats.totalViews > 0 ? 
            (stats.totalChatMessages / stats.totalViews * 100).toFixed(2) : '0'
        }
      },
      timestamp: new Date()
    });

  } catch (error) {
    logger.error('Get user stats error', {
      error: error.message,
      userId: req.params.userId
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_USER_STATS_FAILED',
        message: 'Failed to fetch user statistics'
      },
      timestamp: new Date()
    });
  }
});

/**
 * POST /api/users/:userId/upgrade
 * Upgrade user role (admin only)
 */
router.post('/:userId/upgrade', 
  authenticate, 
  authorize(['admin']), 
  param('userId').isMongoId(), 
  async (req: Request, res: Response) => {
  try {
    const { role } = req.body;

    if (!['viewer', 'streamer', 'moderator', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ROLE',
          message: 'Invalid role specified'
        },
        timestamp: new Date()
      });
    }

    const user = await UserModel.findByIdAndUpdate(
      req.params.userId,
      { role },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        },
        timestamp: new Date()
      });
    }

    logger.info('User role upgraded', {
      userId: user.id,
      newRole: role,
      adminId: req.user!.id
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        }
      },
      timestamp: new Date()
    });

  } catch (error) {
    logger.error('Upgrade user role error', {
      error: error.message,
      userId: req.params.userId,
      adminId: req.user?.id
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'UPGRADE_ROLE_FAILED',
        message: 'Failed to upgrade user role'
      },
      timestamp: new Date()
    });
  }
});

export default router;
