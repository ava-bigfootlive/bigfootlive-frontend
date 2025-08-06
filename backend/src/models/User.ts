import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '@/types';

export interface UserDocument extends Omit<User, 'id'>, Document {
  id: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
  incrementViews(count?: number): Promise<void>;
  updateProfile(updates: Partial<User>): Promise<UserDocument>;
}

const userSchema = new Schema<UserDocument>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    match: /^[a-zA-Z0-9_]+$/
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false // Don't include password in queries by default
  },
  displayName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  avatar: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['viewer', 'streamer', 'moderator', 'admin'],
    default: 'viewer'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  followers: {
    type: Number,
    default: 0,
    min: 0
  },
  following: {
    type: Number,
    default: 0,
    min: 0
  },
  totalViews: {
    type: Number,
    default: 0,
    min: 0
  },
  profile: {
    bio: {
      type: String,
      maxlength: 500,
      default: ''
    },
    socialLinks: {
      twitter: { type: String, default: '' },
      youtube: { type: String, default: '' },
      instagram: { type: String, default: '' },
      website: { type: String, default: '' }
    },
    preferences: {
      emailNotifications: { type: Boolean, default: true },
      chatNotifications: { type: Boolean, default: true },
      followNotifications: { type: Boolean, default: true }
    }
  },
  stats: {
    totalStreams: { type: Number, default: 0 },
    totalStreamTime: { type: Number, default: 0 }, // in minutes
    averageViewers: { type: Number, default: 0 },
    peakViewers: { type: Number, default: 0 },
    lastStreamDate: { type: Date, default: null }
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'pro', 'enterprise'],
      default: 'free'
    },
    subscribedAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null }
  },
  security: {
    twoFactorEnabled: { type: Boolean, default: false },
    lastLogin: { type: Date, default: null },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null }
  }
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      delete ret.password;
      return ret;
    }
  },
  toObject: {
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isVerified: 1 });
userSchema.index({ 'stats.totalStreams': -1 });
userSchema.index({ followers: -1 });
userSchema.index({ createdAt: -1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  const user = this as UserDocument;

  // Only hash password if it's modified
  if (!user.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  const user = this as UserDocument;
  return bcrypt.compare(candidatePassword, user.password);
};

// Method to increment total views
userSchema.methods.incrementViews = async function(count = 1): Promise<void> {
  const user = this as UserDocument;
  user.totalViews += count;
  await user.save();
};

// Method to update profile
userSchema.methods.updateProfile = async function(updates: Partial<User>): Promise<UserDocument> {
  const user = this as UserDocument;
  
  Object.keys(updates).forEach(key => {
    if (updates[key] !== undefined && key !== 'password') {
      (user as any)[key] = updates[key];
    }
  });

  return await user.save();
};

// Static method to find by email or username
userSchema.statics.findByCredentials = async function(identifier: string): Promise<UserDocument | null> {
  const user = await this.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { username: identifier }
    ]
  }).select('+password');
  
  return user;
};

// Static method to check if user exists
userSchema.statics.existsByEmailOrUsername = async function(email: string, username: string): Promise<boolean> {
  const user = await this.findOne({
    $or: [
      { email: email.toLowerCase() },
      { username: username }
    ]
  });
  
  return !!user;
};

// Virtual for account lock status
userSchema.virtual('isLocked').get(function(this: UserDocument) {
  return !!(this.security.lockUntil && this.security.lockUntil > new Date());
});

// Method to increment login attempts
userSchema.methods.incrementLoginAttempts = async function(): Promise<UserDocument> {
  const user = this as UserDocument;
  
  // Reset attempts if lock expired
  if (user.security.lockUntil && user.security.lockUntil < new Date()) {
    return await this.updateOne({
      $unset: { 'security.lockUntil': 1 },
      $set: { 'security.loginAttempts': 1 }
    });
  }
  
  const updates: any = { $inc: { 'security.loginAttempts': 1 } };
  
  // Lock account after 5 attempts for 2 hours
  if (user.security.loginAttempts + 1 >= 5 && !user.security.lockUntil) {
    updates.$set = {
      'security.lockUntil': new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours
    };
  }
  
  await this.updateOne(updates);
  return user;
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = async function(): Promise<void> {
  const user = this as UserDocument;
  
  await user.updateOne({
    $unset: { 
      'security.loginAttempts': 1,
      'security.lockUntil': 1
    },
    $set: {
      'security.lastLogin': new Date()
    }
  });
};

export const UserModel = mongoose.model<UserDocument>('User', userSchema);
export default UserModel;
