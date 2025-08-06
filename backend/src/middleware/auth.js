const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const config = require('../config/config');
const { User, AuthSession, AuditEvent } = require('../models');

// JWT token verification middleware
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Access denied. No token provided.' 
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify JWT token
    const decoded = jwt.verify(token, config.jwt.secret);
    
    // Check if session exists and is active
    const session = await AuthSession.findOne({
      token,
      user: decoded.userId,
      isActive: true,
      expiresAt: { $gt: new Date() }
    }).populate('user');

    if (!session) {
      return res.status(401).json({ 
        error: 'Invalid or expired session.' 
      });
    }

    // Check if user is still active
    if (!session.user || !session.user.isActive || session.user.isDeleted) {
      return res.status(401).json({ 
        error: 'User account is inactive or deleted.' 
      });
    }

    // Update session activity
    session.lastActiveAt = new Date();
    await session.save();

    // Attach user and session to request
    req.user = session.user;
    req.session = session;
    
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token.' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired.' });
    }
    
    return res.status(500).json({ error: 'Token verification failed.' });
  }
};

// Optional token verification (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, config.jwt.secret);
    
    const session = await AuthSession.findOne({
      token,
      user: decoded.userId,
      isActive: true,
      expiresAt: { $gt: new Date() }
    }).populate('user');

    if (session && session.user && session.user.isActive) {
      req.user = session.user;
      req.session = session;
      
      // Update session activity
      session.lastActiveAt = new Date();
      await session.save();
    }
    
    next();
  } catch (error) {
    // Silently fail for optional auth
    next();
  }
};

// Role-based access control
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const userRoles = Array.isArray(req.user.roles) ? req.user.roles : [req.user.roles];
    const requiredRoles = Array.isArray(roles) ? roles : [roles];
    
    const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
    
    if (!hasRequiredRole) {
      // Log permission denied event
      AuditEvent.create({
        eventType: 'permission_denied',
        description: `Access denied. Required roles: ${requiredRoles.join(', ')}. User roles: ${userRoles.join(', ')}`,
        user: req.user._id,
        tenant: req.user.tenant,
        session: req.session?._id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        success: false,
        riskScore: 30,
        riskFactors: ['unauthorized_access_attempt']
      });

      return res.status(403).json({ 
        error: 'Insufficient permissions. Required roles: ' + requiredRoles.join(', ') 
      });
    }

    next();
  };
};

// Permission-based access control
const requirePermission = (permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];
    const hasPermission = req.user.hasPermission(requiredPermissions);
    
    if (!hasPermission) {
      // Log permission denied event
      AuditEvent.create({
        eventType: 'permission_denied',
        description: `Access denied. Required permissions: ${requiredPermissions.join(', ')}`,
        user: req.user._id,
        tenant: req.user.tenant,
        session: req.session?._id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        success: false,
        riskScore: 30,
        riskFactors: ['unauthorized_access_attempt']
      });

      return res.status(403).json({ 
        error: 'Insufficient permissions. Required: ' + requiredPermissions.join(', ') 
      });
    }

    next();
  };
};

// Tenant access control
const requireTenantAccess = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    // Get tenant ID from request (URL param, body, or query)
    const tenantId = req.params.tenantId || req.body.tenantId || req.query.tenantId;
    
    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID required.' });
    }

    // Check if user belongs to the tenant
    if (req.user.tenant.toString() !== tenantId) {
      // Log unauthorized tenant access attempt
      await AuditEvent.create({
        eventType: 'permission_denied',
        description: `Unauthorized tenant access attempt. User tenant: ${req.user.tenant}, Requested tenant: ${tenantId}`,
        user: req.user._id,
        tenant: req.user.tenant,
        session: req.session?._id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        success: false,
        riskScore: 50,
        riskFactors: ['cross_tenant_access_attempt']
      });

      return res.status(403).json({ error: 'Access denied. Insufficient tenant permissions.' });
    }

    next();
  } catch (error) {
    console.error('Tenant access check error:', error);
    return res.status(500).json({ error: 'Tenant access verification failed.' });
  }
};

// MFA verification middleware
// Tenant admin access control
const requireTenantAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    // Check if user has tenant admin role
    if (!req.user.roles.includes('tenant_admin') && !req.user.roles.includes('admin')) {
      return res.status(403).json({ 
        error: 'Tenant admin access required.' 
      });
    }

    next();
  } catch (error) {
    console.error('Tenant admin check error:', error);
    return res.status(500).json({ error: 'Access verification failed.' });
  }
};

const requireMFA = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    // Check if user has MFA enabled
    if (!req.user.mfa || !req.user.mfa.isEnabled) {
      return res.status(403).json({ 
        error: 'MFA is required but not enabled for this account.',
        requireMfaSetup: true
      });
    }

    // Check if current session has MFA verified
    if (!req.session.mfaVerified) {
      return res.status(403).json({ 
        error: 'MFA verification required for this action.',
        requireMfaVerification: true
      });
    }

    next();
  } catch (error) {
    console.error('MFA verification error:', error);
    return res.status(500).json({ error: 'MFA verification failed.' });
  }
};

// Rate limiting configurations
const createRateLimit = (options = {}) => {
  return rateLimit({
    windowMs: options.windowMs || config.rateLimit.windowMs,
    max: options.max || config.rateLimit.max,
    message: options.message || {
      error: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: config.rateLimit.standardHeaders,
    legacyHeaders: config.rateLimit.legacyHeaders,
    keyGenerator: options.keyGenerator || ((req) => req.ip),
    skip: options.skip || (() => false),
    handler: (req, res) => {
      // Log rate limit exceeded
      AuditEvent.create({
        eventType: 'login_failed',
        description: 'Rate limit exceeded',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        success: false,
        riskScore: 40,
        riskFactors: ['rate_limit_exceeded'],
        metadata: {
          endpoint: req.path,
          method: req.method
        }
      });

      res.status(429).json(options.message || {
        error: 'Too many requests from this IP, please try again later.'
      });
    }
  });
};

// Specific rate limiters
const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 login attempts per 15 minutes
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: 15 * 60 // seconds
  }
});

const mfaRateLimit = createRateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // 5 MFA attempts per 5 minutes
  message: {
    error: 'Too many MFA attempts, please try again later.',
    retryAfter: 5 * 60 // seconds
  }
});

const ssoRateLimit = createRateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20, // 20 SSO attempts per 10 minutes
  message: {
    error: 'Too many SSO attempts, please try again later.',
    retryAfter: 10 * 60 // seconds
  }
});

const apiRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 API calls per 15 minutes
  message: {
    error: 'API rate limit exceeded, please try again later.',
    retryAfter: 15 * 60 // seconds
  }
});

module.exports = {
  verifyToken,
  authenticateToken: verifyToken, // Alias for backward compatibility
  optionalAuth,
  requireRole,
  requirePermission,
  requireTenantAccess,
  requireTenantAdmin,
  requireMFA,
  createRateLimit,
  authRateLimit,
  mfaRateLimit,
  ssoRateLimit,
  apiRateLimit
};
