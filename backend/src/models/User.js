const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const mfaMethodSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['totp', 'sms', 'email', 'hardware_token', 'backup_codes'],
    required: true
  },
  name: {
    type: String,
    required: true
  },
  isEnabled: {
    type: Boolean,
    default: false
  },
  isPrimary: {
    type: Boolean,
    default: false
  },
  
  // TOTP specific
  secret: String,
  
  // SMS/Email specific
  phoneNumber: String,
  emailAddress: String,
  
  // Hardware token specific
  serialNumber: String,
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastUsed: Date
});

const userPreferencesSchema = new mongoose.Schema({
  language: {
    type: String,
    default: 'en'
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  theme: {
    type: String,
    enum: ['light', 'dark', 'auto'],
    default: 'light'
  },
  notifications: {
    email: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: false
    },
    push: {
      type: Boolean,
      default: true
    },
    marketing: {
      type: Boolean,
      default: false
    }
  },
  privacy: {
    profileVisibility: {
      type: String,
      enum: ['public', 'private', 'team_only'],
      default: 'team_only'
    },
    showOnlineStatus: {
      type: Boolean,
      default: true
    },
    allowDirectMessages: {
      type: Boolean,
      default: true
    }
  }
});

const userSchema = new mongoose.Schema({
  // Basic user information
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  passwordHash: {
    type: String,
    required: function() {
      // Password not required for SSO-only users
      return !this.ssoOnly;
    }
  },
  
  // Profile information
  firstName: String,
  lastName: String,
  displayName: {
    type: String,
    required: true
  },
  avatar: String,
  bio: String,
  
  // Enterprise fields
  employeeId: String,
  department: String,
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  jobTitle: String,
  
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  emailVerifiedAt: Date,
  
  // Authentication
  ssoOnly: {
    type: Boolean,
    default: false
  },
  lastLogin: Date,
  lastFailedLogin: Date,
  loginCount: {
    type: Number,
    default: 0
  },
  failedLoginAttempts: {
    type: Number,
    default: 0
  },
  accountLockedUntil: Date,
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  
  // MFA
  mfaEnabled: {
    type: Boolean,
    default: false
  },
  mfaMethods: [mfaMethodSchema],
  backupCodes: [String],
  
  // Authorization
  roles: [{
    type: String,
    enum: ['admin', 'tenant_admin', 'manager', 'user', 'viewer', 'guest'],
    default: 'user'
  }],
  permissions: [String],
  
  // Tenant association
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  
  // User preferences
  preferences: {
    type: userPreferencesSchema,
    default: () => ({})
  },
  
  // Metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  // Soft delete
  deletedAt: Date,
  isDeleted: {
    type: Boolean,
    default: false
  }
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ tenant: 1 });
userSchema.index({ roles: 1 });
userSchema.index({ isActive: 1, isDeleted: 1 });
userSchema.index({ employeeId: 1, tenant: 1 });
userSchema.index({ createdAt: -1 });

// Pre-save middleware
userSchema.pre('save', async function(next) {
  // Update timestamps
  this.updatedAt = new Date();
  
  // Hash password if modified
  if (this.isModified('passwordHash') && this.passwordHash) {
    this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
    this.passwordChangedAt = new Date();
  }
  
  // Generate display name if not provided
  if (!this.displayName) {
    if (this.firstName && this.lastName) {
      this.displayName = `${this.firstName} ${this.lastName}`;
    } else {
      this.displayName = this.username;
    }
  }
  
  // Enable MFA if methods are configured
  this.mfaEnabled = this.mfaMethods.some(method => method.isEnabled);
  
  next();
});

// Instance methods
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

userSchema.methods.hasPermission = function(permission) {
  return this.permissions.includes(permission) || this.roles.includes('admin');
};

userSchema.methods.hasRole = function(role) {
  return this.roles.includes(role);
};

userSchema.methods.hasAnyRole = function(roles) {
  return roles.some(role => this.roles.includes(role));
};

userSchema.methods.addPermission = function(permission) {
  if (!this.permissions.includes(permission)) {
    this.permissions.push(permission);
  }
};

userSchema.methods.removePermission = function(permission) {
  this.permissions = this.permissions.filter(p => p !== permission);
};

userSchema.methods.addRole = function(role) {
  if (!this.roles.includes(role)) {
    this.roles.push(role);
  }
};

userSchema.methods.removeRole = function(role) {
  this.roles = this.roles.filter(r => r !== role);
};

userSchema.methods.getFullName = function() {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  return this.displayName || this.username;
};

userSchema.methods.canAccessTenant = function(tenantId) {
  return this.tenant.toString() === tenantId.toString() || 
         this.hasRole('admin');
};

userSchema.methods.setupMFA = function(method) {
  // Remove existing method of same type
  this.mfaMethods = this.mfaMethods.filter(m => m.type !== method.type);
  
  // Add new method
  this.mfaMethods.push({
    ...method,
    isPrimary: this.mfaMethods.length === 0,
    createdAt: new Date()
  });
  
  this.mfaEnabled = true;
};

userSchema.methods.removeMFA = function(methodId) {
  this.mfaMethods = this.mfaMethods.filter(m => m._id.toString() !== methodId.toString());
  this.mfaEnabled = this.mfaMethods.some(m => m.isEnabled);
};

userSchema.methods.getPrimaryMFAMethod = function() {
  return this.mfaMethods.find(m => m.isPrimary && m.isEnabled) ||
         this.mfaMethods.find(m => m.isEnabled);
};

userSchema.methods.generateBackupCodes = function() {
  this.backupCodes = Array.from({ length: 10 }, () => 
    Math.random().toString(36).substring(2, 8).toUpperCase()
  );
  return this.backupCodes;
};

userSchema.methods.useBackupCode = function(code) {
  const index = this.backupCodes.indexOf(code);
  if (index !== -1) {
    this.backupCodes.splice(index, 1);
    return true;
  }
  return false;
};

userSchema.methods.toJSON = function() {
  const user = this.toObject();
  
  // Remove sensitive fields
  delete user.passwordHash;
  delete user.passwordResetToken;
  delete user.mfaMethods.forEach(method => {
    delete method.secret;
  });
  delete user.backupCodes;
  
  return user;
};

// Static methods
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ 
    email: email.toLowerCase(), 
    isDeleted: false 
  });
};

userSchema.statics.findByUsername = function(username) {
  return this.findOne({ 
    username: username.toLowerCase(), 
    isDeleted: false 
  });
};

userSchema.statics.findByEmployeeId = function(employeeId, tenantId) {
  return this.findOne({ 
    employeeId, 
    tenant: tenantId, 
    isDeleted: false 
  });
};

userSchema.statics.createUser = async function(userData) {
  const user = new this(userData);
  
  // Set default permissions based on role
  if (user.roles.includes('admin')) {
    user.permissions = ['*']; // All permissions
  } else if (user.roles.includes('tenant_admin')) {
    user.permissions = [
      'tenant.read',
      'tenant.write',
      'user.read',
      'user.write',
      'sso.configure',
      'audit.read'
    ];
  } else if (user.roles.includes('manager')) {
    user.permissions = [
      'user.read',
      'analytics.read',
      'stream.manage'
    ];
  } else {
    user.permissions = [
      'stream.create',
      'stream.view',
      'profile.edit'
    ];
  }
  
  return await user.save();
};

userSchema.statics.getActiveUsers = function(tenantId) {
  return this.find({
    tenant: tenantId,
    isActive: true,
    isDeleted: false
  }).sort({ lastLogin: -1 });
};

userSchema.statics.searchUsers = function(tenantId, query, options = {}) {
  const searchQuery = {
    tenant: tenantId,
    isDeleted: false,
    $or: [
      { email: { $regex: query, $options: 'i' } },
      { username: { $regex: query, $options: 'i' } },
      { displayName: { $regex: query, $options: 'i' } },
      { firstName: { $regex: query, $options: 'i' } },
      { lastName: { $regex: query, $options: 'i' } }
    ]
  };
  
  const { limit = 50, skip = 0, sort = { createdAt: -1 } } = options;
  
  return this.find(searchQuery)
    .sort(sort)
    .limit(limit)
    .skip(skip)
    .populate('tenant', 'name domain')
    .populate('manager', 'displayName email');
};

// Virtual fields
userSchema.virtual('isLocked').get(function() {
  return this.accountLockedUntil && this.accountLockedUntil > new Date();
});

userSchema.virtual('fullName').get(function() {
  return this.getFullName();
});

userSchema.virtual('initials').get(function() {
  if (this.firstName && this.lastName) {
    return `${this.firstName.charAt(0)}${this.lastName.charAt(0)}`.toUpperCase();
  }
  return this.displayName?.charAt(0)?.toUpperCase() || this.username?.charAt(0)?.toUpperCase() || '?';
});

module.exports = mongoose.model('User', userSchema);
