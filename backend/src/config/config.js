require('dotenv').config();

const config = {
  // Server configuration
  server: {
    port: process.env.PORT || 3001,
    host: process.env.HOST || 'localhost',
    env: process.env.NODE_ENV || 'development'
  },

  // Database configuration
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/bigfootlive-auth'
  },

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  },

  // Redis configuration (for session storage and rate limiting)
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || null,
    db: process.env.REDIS_DB || 0
  },

  // CORS configuration
  cors: {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000'],
    credentials: true
  },

  // Rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false
  },

  // Security
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
    sessionSecret: process.env.SESSION_SECRET || 'your-session-secret-change-this',
    cookieMaxAge: parseInt(process.env.COOKIE_MAX_AGE) || 24 * 60 * 60 * 1000, // 24 hours
    csrfSecret: process.env.CSRF_SECRET || 'your-csrf-secret'
  },

  // Email configuration (for MFA and notifications)
  email: {
    service: process.env.EMAIL_SERVICE || 'gmail',
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM || 'noreply@bigfootlive.com'
  },

  // SMS configuration (for MFA)
  sms: {
    provider: process.env.SMS_PROVIDER || 'twilio',
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    fromNumber: process.env.TWILIO_FROM_NUMBER
  },

  // SSO configuration
  sso: {
    baseUrl: process.env.SSO_BASE_URL || 'http://localhost:3001',
    callbackPath: process.env.SSO_CALLBACK_PATH || '/api/auth/sso/callback',
    metadataPath: process.env.SSO_METADATA_PATH || '/api/auth/sso/metadata'
  },

  // File upload configuration
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
    allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,application/pdf').split(','),
    uploadPath: process.env.UPLOAD_PATH || './uploads'
  },

  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'combined'
  },

  // Feature flags
  features: {
    ssoEnabled: process.env.FEATURE_SSO_ENABLED !== 'false',
    mfaEnabled: process.env.FEATURE_MFA_ENABLED !== 'false',
    auditingEnabled: process.env.FEATURE_AUDITING_ENABLED !== 'false',
    analyticsEnabled: process.env.FEATURE_ANALYTICS_ENABLED !== 'false'
  },

  // External services
  external: {
    // Stripe for billing
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
    },
    
    // Analytics
    analytics: {
      googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID,
      mixpanelToken: process.env.MIXPANEL_TOKEN
    },

    // Monitoring
    monitoring: {
      sentryDsn: process.env.SENTRY_DSN,
      datadogApiKey: process.env.DATADOG_API_KEY
    }
  }
};

// Validation for required environment variables in production
if (config.server.env === 'production') {
  const requiredEnvVars = [
    'JWT_SECRET',
    'SESSION_SECRET',
    'MONGODB_URI'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables in production:');
    missingVars.forEach(varName => console.error(`  - ${varName}`));
    process.exit(1);
  }
}

module.exports = config;
