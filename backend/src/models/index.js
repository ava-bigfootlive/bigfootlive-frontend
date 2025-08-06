const mongoose = require('mongoose');

// Import existing User model
const User = require('./User');

// Tenant Model
const tenantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  domain: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  subdomain: {
    type: String,
    unique: true,
    lowercase: true
  },
  plan: {
    type: String,
    enum: ['starter', 'business', 'enterprise'],
    default: 'starter'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Settings
  settings: {
    branding: {
      logo: String,
      primaryColor: {
        type: String,
        default: '#667eea'
      },
      secondaryColor: {
        type: String,
        default: '#764ba2'
      },
      customCSS: String
    },
    security: {
      requireMFA: {
        type: Boolean,
        default: false
      },
      sessionTimeout: {
        type: Number,
        default: 24 * 60 * 60 // 24 hours in seconds
      },
      maxConcurrentSessions: {
        type: Number,
        default: 5
      },
      allowedDomains: [String],
      ipWhitelist: [String]
    },
    features: {
      ssoEnabled: {
        type: Boolean,
        default: false
      },
      analyticsEnabled: {
        type: Boolean,
        default: true
      },
      streamingEnabled: {
        type: Boolean,
        default: true
      },
      apiAccess: {
        type: Boolean,
        default: false
      }
    }
  },
  
  // SSO Configuration
  ssoProvider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SSOProvider'
  },
  
  // Billing
  billing: {
    stripeCustomerId: String,
    subscriptionId: String,
    subscriptionStatus: {
      type: String,
      enum: ['active', 'inactive', 'canceled', 'past_due'],
      default: 'active'
    },
    billingEmail: String,
    nextBillingDate: Date
  },
  
  // Usage metrics
  usage: {
    userCount: {
      type: Number,
      default: 0
    },
    streamCount: {
      type: Number,
      default: 0
    },
    storageUsed: {
      type: Number,
      default: 0
    },
    bandwidthUsed: {
      type: Number,
      default: 0
    }
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// SSO Provider Model
const ssoProviderSchema = new mongoose.Schema({
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  displayName: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['saml', 'oidc', 'oauth2', 'ldap', 'active_directory'],
    required: true
  },
  isEnabled: {
    type: Boolean,
    default: false
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  
  // Provider configuration
  config: {
    // SAML configuration
    saml: {
      entryPoint: String,
      issuer: String,
      cert: String,
      privateCert: String,
      callbackUrl: String,
      logoutUrl: String,
      metadataUrl: String,
      signatureAlgorithm: {
        type: String,
        enum: ['sha1', 'sha256'],
        default: 'sha256'
      },
      digestAlgorithm: {
        type: String,
        enum: ['sha1', 'sha256'],
        default: 'sha256'
      },
      signRequest: {
        type: Boolean,
        default: false
      },
      encryptAssertion: {
        type: Boolean,
        default: false
      },
      wantAssertionsSigned: {
        type: Boolean,
        default: true
      },
      wantResponseSigned: {
        type: Boolean,
        default: true
      }
    },
    
    // OIDC configuration
    oidc: {
      issuer: String,
      clientId: String,
      clientSecret: String,
      redirectUri: String,
      postLogoutRedirectUri: String,
      scope: [String],
      responseType: {
        type: String,
        default: 'code'
      },
      responseMode: {
        type: String,
        enum: ['query', 'fragment', 'form_post'],
        default: 'query'
      }
    },
    
    // OAuth2 configuration
    oauth2: {
      authorizationEndpoint: String,
      tokenEndpoint: String,
      userInfoEndpoint: String,
      clientId: String,
      clientSecret: String,
      redirectUri: String,
      scope: [String],
      grantType: {
        type: String,
        default: 'authorization_code'
      }
    },
    
    // LDAP configuration
    ldap: {
      url: String,
      bindDN: String,
      bindPassword: String,
      baseDN: String,
      userSearchFilter: String,
      groupSearchFilter: String,
      attributes: {
        mail: String,
        displayName: String,
        givenName: String,
        surname: String,
        memberOf: String
      }
    }
  },
  
  // Attribute mapping
  attributeMapping: {
    email: String,
    username: String,
    firstName: String,
    lastName: String,
    displayName: String,
    employeeId: String,
    department: String,
    groups: String,
    customAttributes: mongoose.Schema.Types.Mixed
  },
  
  // Group/role mapping
  groupMapping: [{
    ssoGroup: {
      type: String,
      required: true
    },
    internalRole: {
      type: String,
      required: true
    },
    permissions: [String]
  }],
  
  // Statistics
  stats: {
    totalLogins: {
      type: Number,
      default: 0
    },
    lastUsed: Date,
    lastTestResult: {
      success: Boolean,
      message: String,
      timestamp: Date
    }
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Auth Session Model
const authSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  refreshToken: String,
  
  // Session metadata
  ipAddress: String,
  userAgent: String,
  device: String,
  location: String,
  
  // SSO session info
  ssoSessionId: String,
  ssoProvider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SSOProvider'
  },
  ssoAttributes: mongoose.Schema.Types.Mixed,
  
  // Session status
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  },
  lastActiveAt: {
    type: Date,
    default: Date.now
  },
  endedAt: Date
});

// Audit Event Model
const auditEventSchema = new mongoose.Schema({
  // Event identification
  eventType: {
    type: String,
    required: true,
    enum: [
      'login', 'logout', 'login_failed', 'mfa_setup', 'mfa_used', 
      'password_change', 'account_locked', 'sso_login', 
      'permission_granted', 'permission_denied', 'user_created',
      'user_updated', 'user_deleted', 'role_assigned', 'role_removed',
      'sso_configuration_updated', 'sso_test', 'sso_disabled',
      'tenant_updated', 'security_policy_changed'
    ]
  },
  description: {
    type: String,
    required: true
  },
  
  // Associated entities
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant'
  },
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AuthSession'
  },
  
  // Request metadata
  ipAddress: String,
  userAgent: String,
  deviceId: String,
  location: String,
  
  // Event result
  success: {
    type: Boolean,
    required: true
  },
  
  // Additional metadata
  metadata: mongoose.Schema.Types.Mixed,
  
  // Risk assessment
  riskScore: {
    type: Number,
    min: 0,
    max: 100
  },
  riskFactors: [String],
  complianceFlags: [String],
  
  // Timestamp
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Security Policy Model
const securityPolicySchema = new mongoose.Schema({
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Password policy
  passwordPolicy: {
    minLength: {
      type: Number,
      default: 8
    },
    maxLength: {
      type: Number,
      default: 128
    },
    requireUppercase: {
      type: Boolean,
      default: true
    },
    requireLowercase: {
      type: Boolean,
      default: true
    },
    requireNumbers: {
      type: Boolean,
      default: true
    },
    requireSymbols: {
      type: Boolean,
      default: false
    },
    preventReuse: {
      type: Number,
      default: 5
    },
    maxAge: {
      type: Number,
      default: 90
    },
    lockoutAttempts: {
      type: Number,
      default: 5
    },
    lockoutDuration: {
      type: Number,
      default: 15
    }
  },
  
  // Session policy
  sessionPolicy: {
    maxDuration: {
      type: Number,
      default: 24 * 60
    },
    extendOnActivity: {
      type: Boolean,
      default: true
    },
    requireReauth: {
      type: Boolean,
      default: false
    },
    concurrentSessions: {
      type: Number,
      default: 5
    },
    ipRestriction: {
      type: Boolean,
      default: false
    },
    allowedIPs: [String]
  },
  
  // MFA policy
  mfaPolicy: {
    required: {
      type: Boolean,
      default: false
    },
    requiredForRoles: [String],
    allowedMethods: [{
      type: String,
      enum: ['totp', 'sms', 'email', 'hardware_token', 'backup_codes']
    }],
    gracePeriod: {
      type: Number,
      default: 7
    },
    backupCodesRequired: {
      type: Boolean,
      default: true
    }
  },
  
  // Login policy
  loginPolicy: {
    allowEmailLogin: {
      type: Boolean,
      default: true
    },
    allowUsernameLogin: {
      type: Boolean,
      default: true
    },
    requireEmailVerification: {
      type: Boolean,
      default: true
    },
    maxFailedAttempts: {
      type: Number,
      default: 5
    },
    lockoutDuration: {
      type: Number,
      default: 15
    },
    bruteForceProtection: {
      type: Boolean,
      default: true
    }
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
tenantSchema.index({ domain: 1 });
tenantSchema.index({ subdomain: 1 });
tenantSchema.index({ isActive: 1 });

ssoProviderSchema.index({ tenant: 1 });
ssoProviderSchema.index({ tenant: 1, isEnabled: 1 });
ssoProviderSchema.index({ type: 1 });

authSessionSchema.index({ user: 1 });
authSessionSchema.index({ token: 1 });
authSessionSchema.index({ isActive: 1, expiresAt: 1 });
authSessionSchema.index({ createdAt: -1 });
authSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

auditEventSchema.index({ user: 1, timestamp: -1 });
auditEventSchema.index({ tenant: 1, timestamp: -1 });
auditEventSchema.index({ eventType: 1, timestamp: -1 });
auditEventSchema.index({ timestamp: -1 });
auditEventSchema.index({ success: 1, timestamp: -1 });

securityPolicySchema.index({ tenant: 1 });
securityPolicySchema.index({ tenant: 1, isActive: 1 });

// Middleware
tenantSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

ssoProviderSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

authSessionSchema.pre('save', function(next) {
  this.lastActiveAt = new Date();
  next();
});

securityPolicySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Instance methods
tenantSchema.methods.getUserCount = async function() {
  const User = mongoose.model('User');
  return await User.countDocuments({ 
    tenant: this._id, 
    isActive: true, 
    isDeleted: false 
  });
};

tenantSchema.methods.getActiveStreamCount = async function() {
  // This would integrate with your streaming service
  return this.usage.streamCount;
};

tenantSchema.methods.canAccessFeature = function(featureName) {
  if (this.plan === 'enterprise') return true;
  
  const featureMap = {
    starter: ['basicStreaming', 'basicAnalytics'],
    business: ['basicStreaming', 'basicAnalytics', 'advancedAnalytics', 'customBranding'],
    enterprise: ['*'] // All features
  };
  
  return featureMap[this.plan].includes(featureName) || featureMap[this.plan].includes('*');
};

ssoProviderSchema.methods.testConnection = async function() {
  // This would implement actual connection testing
  // For now, just basic validation
  if (this.type === 'saml') {
    return this.config.saml && this.config.saml.entryPoint && this.config.saml.issuer;
  }
  return true;
};

authSessionSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

authSessionSchema.methods.extend = function(minutes = 60) {
  this.expiresAt = new Date(Date.now() + minutes * 60 * 1000);
  this.lastActiveAt = new Date();
};

// Static methods
auditEventSchema.statics.logEvent = async function(eventData) {
  const event = new this(eventData);
  return await event.save();
};

auditEventSchema.statics.getEventsByUser = function(userId, limit = 50) {
  return this.find({ user: userId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('user', 'email displayName')
    .populate('tenant', 'name domain');
};

auditEventSchema.statics.getEventsByTenant = function(tenantId, limit = 50) {
  return this.find({ tenant: tenantId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('user', 'email displayName')
    .populate('tenant', 'name domain');
};

// Create and export models
const Tenant = mongoose.model('Tenant', tenantSchema);
const SSOProvider = mongoose.model('SSOProvider', ssoProviderSchema);
const AuthSession = mongoose.model('AuthSession', authSessionSchema);
const AuditEvent = mongoose.model('AuditEvent', auditEventSchema);
const SecurityPolicy = mongoose.model('SecurityPolicy', securityPolicySchema);

module.exports = {
  User,
  Tenant,
  SSOProvider,
  AuthSession,
  AuditEvent,
  SecurityPolicy
};
