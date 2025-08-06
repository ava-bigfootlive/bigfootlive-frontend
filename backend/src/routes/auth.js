const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const saml2 = require('saml2-js');
const { body, validationResult } = require('express-validator');
const { User, SSOProvider, AuthSession, AuditEvent, SecurityPolicy } = require('../models');
const { authenticateToken, requirePermission } = require('../middleware/auth');
const { logAuditEvent } = require('../utils/audit');

const router = express.Router();

// Rate limiting for authentication attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many login attempts, please try again later.',
    errorCode: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const mfaLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // More attempts allowed for MFA
  message: {
    error: 'Too many MFA attempts, please try again later.',
    errorCode: 'MFA_RATE_LIMIT_EXCEEDED'
  }
});

// Validation middleware
const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('deviceId').optional().isString(),
  body('rememberMe').optional().isBoolean()
];

const validateMFASetup = [
  body('method').isIn(['totp', 'sms', 'email', 'hardware_token']),
  body('phoneNumber').optional().isMobilePhone(),
  body('emailAddress').optional().isEmail()
];

// Traditional Login
router.post('/login', loginLimiter, validateLogin, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        errorCode: 'VALIDATION_ERROR',
        details: errors.array()
      });
    }

    const { email, password, deviceId, rememberMe } = req.body;
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    // Find user
    const user = await User.findOne({ email }).populate('tenant');
    if (!user) {
      await logAuditEvent({
        eventType: 'login_failed',
        description: `Login failed for ${email} - user not found`,
        ipAddress,
        userAgent,
        success: false,
        metadata: { email, reason: 'user_not_found' }
      });
      
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        errorCode: 'INVALID_CREDENTIALS'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      await logAuditEvent({
        userId: user._id,
        eventType: 'login_failed',
        description: 'Login failed - account inactive',
        ipAddress,
        userAgent,
        success: false,
        metadata: { reason: 'account_inactive' }
      });
      
      return res.status(401).json({
        success: false,
        error: 'Account is inactive',
        errorCode: 'ACCOUNT_INACTIVE'
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      // Increment failed attempts
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      user.lastFailedLogin = new Date();
      
      // Lock account after 5 failed attempts
      if (user.failedLoginAttempts >= 5) {
        user.accountLockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        await logAuditEvent({
          userId: user._id,
          eventType: 'account_locked',
          description: 'Account locked due to failed login attempts',
          ipAddress,
          userAgent,
          success: false,
          metadata: { attempts: user.failedLoginAttempts }
        });
      }
      
      await user.save();
      
      await logAuditEvent({
        userId: user._id,
        eventType: 'login_failed',
        description: 'Login failed - invalid password',
        ipAddress,
        userAgent,
        success: false,
        metadata: { attempts: user.failedLoginAttempts }
      });
      
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        errorCode: 'INVALID_CREDENTIALS'
      });
    }

    // Check if account is locked
    if (user.accountLockedUntil && user.accountLockedUntil > new Date()) {
      return res.status(423).json({
        success: false,
        error: 'Account is temporarily locked',
        errorCode: 'ACCOUNT_LOCKED',
        lockedUntil: user.accountLockedUntil
      });
    }

    // Reset failed attempts on successful password verification
    user.failedLoginAttempts = 0;
    user.accountLockedUntil = null;

    // Check if MFA is required
    if (user.mfaEnabled && user.mfaMethods.length > 0) {
      // Create MFA challenge
      const challenge = {
        id: require('crypto').randomUUID(),
        userId: user._id,
        method: user.mfaMethods.find(m => m.isPrimary)?.type || user.mfaMethods[0].type,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
        attempts: 0,
        maxAttempts: 3
      };
      
      // Store challenge in Redis or database
      await req.app.locals.redis.setex(`mfa_challenge:${challenge.id}`, 300, JSON.stringify(challenge));
      
      return res.json({
        success: false,
        requiresMFA: true,
        mfaMethods: user.mfaMethods.filter(m => m.isEnabled),
        mfaChallengeId: challenge.id
      });
    }

    // Generate session
    const session = await createAuthSession(user, { ipAddress, userAgent, deviceId, rememberMe });
    
    // Generate JWT tokens
    const tokenExpiry = rememberMe ? '30d' : '1d';
    const refreshTokenExpiry = rememberMe ? '90d' : '7d';
    
    const token = jwt.sign(
      {
        sub: user._id,
        email: user.email,
        username: user.username,
        roles: user.roles,
        permissions: user.permissions,
        sessionId: session._id,
        tenant: user.tenant?._id
      },
      process.env.JWT_SECRET,
      { expiresIn: tokenExpiry }
    );
    
    const refreshToken = jwt.sign(
      { sub: user._id, sessionId: session._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: refreshTokenExpiry }
    );

    // Update user login info
    user.lastLogin = new Date();
    user.loginCount = (user.loginCount || 0) + 1;
    await user.save();

    await logAuditEvent({
      userId: user._id,
      sessionId: session._id,
      eventType: 'login',
      description: 'User logged in successfully',
      ipAddress,
      userAgent,
      deviceId,
      success: true,
      metadata: { loginMethod: 'password' }
    });

    res.json({
      success: true,
      user: await formatUserResponse(user),
      token,
      refreshToken,
      expiresIn: rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60 // seconds
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      errorCode: 'INTERNAL_ERROR'
    });
  }
});

// MFA Verification
router.post('/mfa/verify', mfaLimiter, async (req, res) => {
  try {
    const { challengeId, code, methodId } = req.body;
    
    if (!challengeId || !code) {
      return res.status(400).json({
        success: false,
        error: 'Challenge ID and code are required',
        errorCode: 'MISSING_PARAMETERS'
      });
    }

    // Get challenge from Redis
    const challengeData = await req.app.locals.redis.get(`mfa_challenge:${challengeId}`);
    if (!challengeData) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired MFA challenge',
        errorCode: 'INVALID_CHALLENGE'
      });
    }

    const challenge = JSON.parse(challengeData);
    
    // Check if challenge is expired
    if (new Date() > new Date(challenge.expiresAt)) {
      await req.app.locals.redis.del(`mfa_challenge:${challengeId}`);
      return res.status(400).json({
        success: false,
        error: 'MFA challenge expired',
        errorCode: 'CHALLENGE_EXPIRED'
      });
    }

    // Check attempt limit
    if (challenge.attempts >= challenge.maxAttempts) {
      await req.app.locals.redis.del(`mfa_challenge:${challengeId}`);
      return res.status(429).json({
        success: false,
        error: 'Too many MFA attempts',
        errorCode: 'MAX_ATTEMPTS_EXCEEDED'
      });
    }

    const user = await User.findById(challenge.userId).populate('tenant');
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        errorCode: 'USER_NOT_FOUND'
      });
    }

    // Find MFA method
    const mfaMethod = user.mfaMethods.find(m => 
      methodId ? m._id.toString() === methodId : m.type === challenge.method
    );
    
    if (!mfaMethod || !mfaMethod.isEnabled) {
      return res.status(400).json({
        success: false,
        error: 'Invalid MFA method',
        errorCode: 'INVALID_MFA_METHOD'
      });
    }

    let isValidCode = false;

    // Verify code based on method type
    switch (mfaMethod.type) {
      case 'totp':
        isValidCode = speakeasy.totp.verify({
          secret: mfaMethod.secret,
          encoding: 'base32',
          token: code,
          window: 2 // Allow 2 time steps of variance
        });
        break;
        
      case 'backup_codes':
        const codeIndex = user.backupCodes.indexOf(code);
        if (codeIndex !== -1) {
          // Remove used backup code
          user.backupCodes.splice(codeIndex, 1);
          await user.save();
          isValidCode = true;
        }
        break;
        
      case 'sms':
      case 'email':
        // In production, you'd verify against sent code stored in Redis/DB
        // For demo purposes, accept any 6-digit code
        isValidCode = /^\d{6}$/.test(code);
        break;
        
      default:
        return res.status(400).json({
          success: false,
          error: 'Unsupported MFA method',
          errorCode: 'UNSUPPORTED_MFA_METHOD'
        });
    }

    if (!isValidCode) {
      // Increment attempts
      challenge.attempts++;
      await req.app.locals.redis.setex(
        `mfa_challenge:${challengeId}`, 
        300, 
        JSON.stringify(challenge)
      );
      
      await logAuditEvent({
        userId: user._id,
        eventType: 'mfa_failed',
        description: 'MFA verification failed',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        success: false,
        metadata: { method: mfaMethod.type, attempts: challenge.attempts }
      });
      
      return res.status(401).json({
        success: false,
        error: 'Invalid MFA code',
        errorCode: 'INVALID_MFA_CODE'
      });
    }

    // MFA successful - complete login
    await req.app.locals.redis.del(`mfa_challenge:${challengeId}`);

    // Create session
    const session = await createAuthSession(user, {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Generate tokens
    const token = jwt.sign(
      {
        sub: user._id,
        email: user.email,
        username: user.username,
        roles: user.roles,
        permissions: user.permissions,
        sessionId: session._id,
        tenant: user.tenant?._id
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    const refreshToken = jwt.sign(
      { sub: user._id, sessionId: session._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // Update MFA method last used
    mfaMethod.lastUsed = new Date();
    user.lastLogin = new Date();
    user.loginCount = (user.loginCount || 0) + 1;
    await user.save();

    await logAuditEvent({
      userId: user._id,
      sessionId: session._id,
      eventType: 'mfa_used',
      description: 'MFA verification successful',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: true,
      metadata: { method: mfaMethod.type }
    });

    res.json({
      success: true,
      user: await formatUserResponse(user),
      token,
      refreshToken,
      expiresIn: 24 * 60 * 60
    });

  } catch (error) {
    console.error('MFA verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      errorCode: 'INTERNAL_ERROR'
    });
  }
});

// MFA Setup
router.post('/mfa/setup', authenticateToken, validateMFASetup, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { method, phoneNumber, emailAddress } = req.body;
    const user = await User.findById(req.user.sub);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    let setupData = {};

    switch (method) {
      case 'totp':
        const secret = speakeasy.generateSecret({
          name: `BigfootLive (${user.email})`,
          issuer: 'BigfootLive'
        });
        
        const qrCode = await QRCode.toDataURL(secret.otpauth_url);
        
        // Generate backup codes
        const backupCodes = Array.from({ length: 10 }, () => 
          Math.random().toString(36).substring(2, 8).toUpperCase()
        );
        
        setupData = {
          secret: secret.base32,
          qrCode,
          backupCodes
        };
        
        // Add MFA method to user
        user.mfaMethods.push({
          type: 'totp',
          name: 'Authenticator App',
          secret: secret.base32,
          isEnabled: false, // Require verification before enabling
          isPrimary: user.mfaMethods.length === 0,
          createdAt: new Date()
        });
        
        // Store backup codes
        user.backupCodes = backupCodes;
        break;
        
      case 'sms':
        if (!phoneNumber) {
          return res.status(400).json({
            success: false,
            error: 'Phone number is required for SMS MFA'
          });
        }
        
        user.mfaMethods.push({
          type: 'sms',
          name: `SMS (${phoneNumber})`,
          phoneNumber,
          isEnabled: false,
          isPrimary: user.mfaMethods.length === 0,
          createdAt: new Date()
        });
        break;
        
      case 'email':
        const email = emailAddress || user.email;
        
        user.mfaMethods.push({
          type: 'email',
          name: `Email (${email})`,
          emailAddress: email,
          isEnabled: false,
          isPrimary: user.mfaMethods.length === 0,
          createdAt: new Date()
        });
        break;
        
      default:
        return res.status(400).json({
          success: false,
          error: 'Unsupported MFA method'
        });
    }

    await user.save();

    await logAuditEvent({
      userId: user._id,
      eventType: 'mfa_setup',
      description: `MFA setup initiated for ${method}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: true,
      metadata: { method }
    });

    res.json({
      success: true,
      ...setupData
    });

  } catch (error) {
    console.error('MFA setup error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// SSO Initiation
router.post('/sso/initiate', async (req, res) => {
  try {
    const { providerId, returnUrl } = req.body;
    
    const provider = await SSOProvider.findOne({
      _id: providerId,
      isEnabled: true
    });
    
    if (!provider) {
      return res.status(404).json({
        success: false,
        error: 'SSO provider not found or disabled'
      });
    }

    let redirectUrl = '';

    switch (provider.type) {
      case 'saml':
        // Create SAML service provider
        const sp = new saml2.ServiceProvider({
          entity_id: `${process.env.BASE_URL}/auth/saml/metadata`,
          private_key: provider.config.saml.privateCert || process.env.SAML_PRIVATE_KEY,
          certificate: provider.config.saml.cert,
          assert_endpoint: provider.config.saml.callbackUrl,
          sign_get_request: provider.config.saml.signRequest
        });

        // Create identity provider
        const idp = new saml2.IdentityProvider({
          sso_login_url: provider.config.saml.entryPoint,
          sso_logout_url: provider.config.saml.logoutUrl,
          certificates: [provider.config.saml.cert]
        });

        // Create login URL
        redirectUrl = sp.create_login_request_url(idp, {
          relay_state: returnUrl || '/'
        });
        break;
        
      case 'oidc':
        const state = require('crypto').randomUUID();
        const nonce = require('crypto').randomUUID();
        
        // Store state in Redis for validation
        await req.app.locals.redis.setex(`oidc_state:${state}`, 600, JSON.stringify({
          providerId,
          returnUrl,
          nonce
        }));
        
        const params = new URLSearchParams({
          response_type: provider.config.oidc.responseType,
          client_id: provider.config.oidc.clientId,
          redirect_uri: provider.config.oidc.redirectUri,
          scope: provider.config.oidc.scope.join(' '),
          state,
          nonce
        });
        
        redirectUrl = `${provider.config.oidc.issuer}/oauth2/v1/authorize?${params}`;
        break;
        
      default:
        return res.status(400).json({
          success: false,
          error: 'Unsupported SSO provider type'
        });
    }

    res.json({
      success: true,
      redirectUrl
    });

  } catch (error) {
    console.error('SSO initiation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Token Refresh
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token is required'
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const session = await AuthSession.findById(decoded.sessionId).populate('user');
    
    if (!session || !session.isActive || session.expiresAt < new Date()) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired refresh token'
      });
    }

    const user = session.user;
    
    // Generate new access token
    const token = jwt.sign(
      {
        sub: user._id,
        email: user.email,
        username: user.username,
        roles: user.roles,
        permissions: user.permissions,
        sessionId: session._id,
        tenant: user.tenant
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      success: true,
      token,
      expiresIn: 3600,
      user: await formatUserResponse(user)
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid refresh token'
    });
  }
});

// Logout
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.body;
    const targetSessionId = sessionId || req.user.sessionId;
    
    await AuthSession.findByIdAndUpdate(targetSessionId, {
      isActive: false,
      endedAt: new Date()
    });

    await logAuditEvent({
      userId: req.user.sub,
      sessionId: targetSessionId,
      eventType: 'logout',
      description: 'User logged out',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: true
    });

    res.json({ success: true });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get User Sessions
router.get('/sessions/:userId', authenticateToken, requirePermission('user.sessions.read'), async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Users can only access their own sessions unless they have admin permissions
    if (userId !== req.user.sub && !req.user.permissions.includes('admin.sessions.read')) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const sessions = await AuthSession.find({
      user: userId,
      isActive: true
    }).sort({ createdAt: -1 });

    res.json(sessions);

  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get Audit Events
router.get('/audit', authenticateToken, requirePermission('audit.read'), async (req, res) => {
  try {
    const { userId, limit = 50, offset = 0 } = req.query;
    
    const query = {};
    if (userId) {
      query.userId = userId;
    }
    
    const events = await AuditEvent.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .populate('user', 'email username displayName');

    res.json(events);

  } catch (error) {
    console.error('Get audit events error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Utility functions
async function createAuthSession(user, sessionData) {
  const session = new AuthSession({
    user: user._id,
    token: require('crypto').randomBytes(32).toString('hex'),
    ipAddress: sessionData.ipAddress,
    userAgent: sessionData.userAgent,
    device: sessionData.deviceId,
    expiresAt: new Date(Date.now() + (sessionData.rememberMe ? 90 : 7) * 24 * 60 * 60 * 1000),
    isActive: true,
    createdAt: new Date()
  });
  
  return await session.save();
}

async function formatUserResponse(user) {
  return {
    id: user._id,
    email: user.email,
    username: user.username,
    displayName: user.displayName,
    firstName: user.firstName,
    lastName: user.lastName,
    avatar: user.avatar,
    roles: user.roles,
    permissions: user.permissions,
    isActive: user.isActive,
    isVerified: user.isVerified,
    lastLogin: user.lastLogin,
    loginCount: user.loginCount,
    mfaEnabled: user.mfaEnabled,
    mfaMethods: user.mfaMethods?.filter(m => m.isEnabled) || [],
    tenant: user.tenant
  };
}

module.exports = router;
