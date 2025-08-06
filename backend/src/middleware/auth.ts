import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '@/utils/config';
import { logger } from '@/utils/logger';
import { UserModel } from '@/models/User';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        email: string;
        role: string;
      };
    }
  }
}

interface JwtPayload {
  userId: string;
  username: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * Authentication middleware to verify JWT tokens
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'NO_TOKEN',
          message: 'No authentication token provided'
        },
        timestamp: new Date()
      });
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : authHeader;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN_FORMAT',
          message: 'Invalid token format'
        },
        timestamp: new Date()
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, config.auth.jwtSecret) as JwtPayload;
    
    // Verify user still exists and is active
    const user = await UserModel.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User account no longer exists'
        },
        timestamp: new Date()
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        error: {
          code: 'ACCOUNT_LOCKED',
          message: 'Account is temporarily locked due to multiple failed login attempts'
        },
        timestamp: new Date()
      });
    }

    // Attach user info to request
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    };

    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid authentication token'
        },
        timestamp: new Date()
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'Authentication token has expired'
        },
        timestamp: new Date()
      });
    }

    logger.error('Authentication middleware error', {
      error: error.message,
      stack: error.stack
    });

    return res.status(500).json({
      success: false,
      error: {
        code: 'AUTH_ERROR',
        message: 'Authentication error occurred'
      },
      timestamp: new Date()
    });
  }
};

/**
 * Authorization middleware to check user roles
 */
export const authorize = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHENTICATED',
          message: 'Authentication required'
        },
        timestamp: new Date()
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'Insufficient permissions for this action'
        },
        timestamp: new Date()
      });
    }

    next();
  };
};

/**
 * Optional authentication middleware - doesn't fail if no token provided
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.header('Authorization');
  
  if (!authHeader) {
    return next(); // Continue without authentication
  }

  try {
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : authHeader;

    const decoded = jwt.verify(token, config.auth.jwtSecret) as JwtPayload;
    const user = await UserModel.findById(decoded.userId);

    if (user && !user.isLocked) {
      req.user = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      };
    }
  } catch (error) {
    // Silently ignore authentication errors for optional auth
    logger.debug('Optional auth failed', { error: error.message });
  }

  next();
};

/**
 * Check if user owns the resource (for user-specific endpoints)
 */
export const checkOwnership = (req: Request, res: Response, next: NextFunction) => {
  const resourceUserId = req.params.userId || req.body.userId;
  
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHENTICATED',
        message: 'Authentication required'
      },
      timestamp: new Date()
    });
  }

  // Admins can access any resource
  if (req.user.role === 'admin') {
    return next();
  }

  // Users can only access their own resources
  if (req.user.id !== resourceUserId) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'ACCESS_DENIED',
        message: 'Access denied: You can only access your own resources'
      },
      timestamp: new Date()
    });
  }

  next();
};

/**
 * Rate limiting middleware for sensitive operations
 */
export const rateLimitSensitive = (windowMs = 15 * 60 * 1000, maxAttempts = 5) => {
  const attempts = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction) => {
    const identifier = req.user?.id || req.ip;
    const now = Date.now();

    // Clean up expired entries
    for (const [key, value] of attempts.entries()) {
      if (now > value.resetTime) {
        attempts.delete(key);
      }
    }

    const userAttempts = attempts.get(identifier) || { count: 0, resetTime: now + windowMs };

    if (userAttempts.count >= maxAttempts) {
      const resetIn = Math.ceil((userAttempts.resetTime - now) / 1000);
      
      return res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: `Too many attempts. Try again in ${resetIn} seconds.`
        },
        timestamp: new Date()
      });
    }

    userAttempts.count++;
    attempts.set(identifier, userAttempts);
    
    next();
  };
};
