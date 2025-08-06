import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { UserModel } from '@/models/User';
import { config } from '@/utils/config';
import { logger, logSecurity } from '@/utils/logger';
import { authenticate, rateLimitSensitive } from '@/middleware/auth';

const router = Router();

// Validation rules
const registerValidation = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username must be 3-30 characters and contain only letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('displayName')
    .isLength({ min: 1, max: 50 })
    .trim()
    .withMessage('Display name must be 1-50 characters long')
];

const loginValidation = [
  body('identifier')
    .notEmpty()
    .withMessage('Username or email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
];

// Helper function to generate JWT tokens
const generateTokens = (user: any) => {
  const payload = {
    userId: user.id,
    username: user.username,
    email: user.email,
    role: user.role
  };

  const accessToken = jwt.sign(payload, config.auth.jwtSecret, {
    expiresIn: config.auth.jwtExpiresIn
  });

  const refreshToken = jwt.sign(payload, config.auth.jwtSecret, {
    expiresIn: '30d' // Refresh tokens last longer
  });

  return { accessToken, refreshToken };
};

/**
 * POST /api/auth/register
 * Register a new user account
 */
router.post('/register', registerValidation, rateLimitSensitive(), async (req: Request, res: Response) => {
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

    const { username, email, password, displayName } = req.body;

    // Check if user already exists
    const existingUser = await UserModel.existsByEmailOrUsername(email, username);
    if (existingUser) {
      logSecurity('REGISTRATION_ATTEMPT_DUPLICATE', undefined, {
        username,
        email,
        ip: req.ip
      });

      return res.status(409).json({
        success: false,
        error: {
          code: 'USER_EXISTS',
          message: 'A user with this email or username already exists'
        },
        timestamp: new Date()
      });
    }

    // Create new user
    const user = new UserModel({
      username,
      email,
      password,
      displayName
    });

    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    logSecurity('USER_REGISTERED', user.id, {
      username,
      email,
      ip: req.ip
    });

    logger.info('User registered successfully', {
      userId: user.id,
      username,
      email
    });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          displayName: user.displayName,
          role: user.role,
          isVerified: user.isVerified
        },
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: 7 * 24 * 60 * 60 // 7 days in seconds
        }
      },
      timestamp: new Date()
    });

  } catch (error) {
    logger.error('Registration error', {
      error: error.message,
      stack: error.stack,
      body: req.body
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'REGISTRATION_FAILED',
        message: 'Registration failed. Please try again.'
      },
      timestamp: new Date()
    });
  }
});

/**
 * POST /api/auth/login
 * Login with username/email and password
 */
router.post('/login', loginValidation, rateLimitSensitive(), async (req: Request, res: Response) => {
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

    const { identifier, password } = req.body;

    // Find user by email or username
    const user = await UserModel.findByCredentials(identifier);
    if (!user) {
      logSecurity('LOGIN_ATTEMPT_INVALID_USER', undefined, {
        identifier,
        ip: req.ip
      });

      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid username/email or password'
        },
        timestamp: new Date()
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      logSecurity('LOGIN_ATTEMPT_LOCKED_ACCOUNT', user.id, {
        identifier,
        ip: req.ip
      });

      return res.status(423).json({
        success: false,
        error: {
          code: 'ACCOUNT_LOCKED',
          message: 'Account is temporarily locked due to multiple failed login attempts'
        },
        timestamp: new Date()
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      await user.incrementLoginAttempts();
      
      logSecurity('LOGIN_ATTEMPT_INVALID_PASSWORD', user.id, {
        identifier,
        ip: req.ip,
        attempts: user.security.loginAttempts + 1
      });

      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid username/email or password'
        },
        timestamp: new Date()
      });
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    logSecurity('USER_LOGIN', user.id, {
      username: user.username,
      ip: req.ip
    });

    logger.info('User logged in successfully', {
      userId: user.id,
      username: user.username
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          displayName: user.displayName,
          avatar: user.avatar,
          role: user.role,
          isVerified: user.isVerified,
          followers: user.followers,
          following: user.following
        },
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: 7 * 24 * 60 * 60 // 7 days in seconds
        }
      },
      timestamp: new Date()
    });

  } catch (error) {
    logger.error('Login error', {
      error: error.message,
      stack: error.stack,
      identifier: req.body.identifier
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'LOGIN_FAILED',
        message: 'Login failed. Please try again.'
      },
      timestamp: new Date()
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout user (mainly for logging purposes)
 */
router.post('/logout', authenticate, async (req: Request, res: Response) => {
  try {
    logSecurity('USER_LOGOUT', req.user!.id, {
      username: req.user!.username,
      ip: req.ip
    });

    logger.info('User logged out', {
      userId: req.user!.id,
      username: req.user!.username
    });

    res.json({
      success: true,
      data: {
        message: 'Logged out successfully'
      },
      timestamp: new Date()
    });

  } catch (error) {
    logger.error('Logout error', {
      error: error.message,
      userId: req.user?.id
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'LOGOUT_FAILED',
        message: 'Logout failed'
      },
      timestamp: new Date()
    });
  }
});

/**
 * GET /api/auth/me
 * Get current user information
 */
router.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const user = await UserModel.findById(req.user!.id);
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

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          displayName: user.displayName,
          avatar: user.avatar,
          role: user.role,
          isVerified: user.isVerified,
          followers: user.followers,
          following: user.following,
          totalViews: user.totalViews,
          stats: user.stats,
          subscription: user.subscription,
          profile: user.profile,
          createdAt: user.createdAt
        }
      },
      timestamp: new Date()
    });

  } catch (error) {
    logger.error('Get current user error', {
      error: error.message,
      userId: req.user?.id
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_USER_FAILED',
        message: 'Failed to fetch user information'
      },
      timestamp: new Date()
    });
  }
});

/**
 * POST /api/auth/change-password
 * Change user password
 */
router.post('/change-password', authenticate, changePasswordValidation, rateLimitSensitive(), async (req: Request, res: Response) => {
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

    const { currentPassword, newPassword } = req.body;

    // Get user with password field
    const user = await UserModel.findById(req.user!.id).select('+password');
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

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      logSecurity('PASSWORD_CHANGE_INVALID_CURRENT', user.id, {
        ip: req.ip
      });

      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_CURRENT_PASSWORD',
          message: 'Current password is incorrect'
        },
        timestamp: new Date()
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    logSecurity('PASSWORD_CHANGED', user.id, {
      username: user.username,
      ip: req.ip
    });

    logger.info('User password changed', {
      userId: user.id,
      username: user.username
    });

    res.json({
      success: true,
      data: {
        message: 'Password changed successfully'
      },
      timestamp: new Date()
    });

  } catch (error) {
    logger.error('Change password error', {
      error: error.message,
      userId: req.user?.id
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'PASSWORD_CHANGE_FAILED',
        message: 'Failed to change password'
      },
      timestamp: new Date()
    });
  }
});

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'REFRESH_TOKEN_REQUIRED',
          message: 'Refresh token is required'
        },
        timestamp: new Date()
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, config.auth.jwtSecret) as any;
    
    // Get user
    const user = await UserModel.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_REFRESH_TOKEN',
          message: 'Invalid refresh token'
        },
        timestamp: new Date()
      });
    }

    // Generate new tokens
    const tokens = generateTokens(user);

    res.json({
      success: true,
      data: {
        tokens: {
          ...tokens,
          expiresIn: 7 * 24 * 60 * 60
        }
      },
      timestamp: new Date()
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_REFRESH_TOKEN',
          message: 'Invalid or expired refresh token'
        },
        timestamp: new Date()
      });
    }

    logger.error('Token refresh error', {
      error: error.message
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'TOKEN_REFRESH_FAILED',
        message: 'Failed to refresh token'
      },
      timestamp: new Date()
    });
  }
});

export default router;
