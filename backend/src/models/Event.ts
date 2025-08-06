import mongoose, { Schema, Document } from 'mongoose';
import { Event, EventSettings } from '@/types';

export interface EventDocument extends Omit<Event, 'id'>, Document {
  id: string;
  updateStreamStats(stats: any): Promise<void>;
  calculateDuration(): number;
  isLive(): boolean;
  canStart(): boolean;
  canStop(): boolean;
}

const eventSettingsSchema = new Schema<EventSettings>({
  chatEnabled: { type: Boolean, default: true },
  recordingEnabled: { type: Boolean, default: false },
  donationsEnabled: { type: Boolean, default: true },
  quality: {
    resolution: {
      type: String,
      enum: ['4K', '1080p', '720p', '480p'],
      default: '1080p'
    },
    bitrate: {
      type: Number,
      min: 500,
      max: 50000,
      default: 4500
    },
    fps: {
      type: Number,
      enum: [24, 30, 60],
      default: 30
    }
  },
  moderation: {
    autoMod: { type: Boolean, default: true },
    badWordFilter: { type: Boolean, default: true },
    slowMode: {
      type: Number,
      min: 0,
      max: 300,
      default: 0
    },
    subscriberOnly: { type: Boolean, default: false }
  }
}, { _id: false });

const eventSchema = new Schema<EventDocument>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    maxlength: 2000,
    default: ''
  },
  category: {
    type: String,
    required: true,
    enum: ['gaming', 'music', 'education', 'technology', 'entertainment', 'sports', 'art', 'cooking', 'travel', 'other'],
    index: true
  },
  privacy: {
    type: String,
    enum: ['public', 'unlisted', 'private'],
    default: 'public',
    index: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'live', 'ended', 'cancelled'],
    default: 'scheduled',
    index: true
  },
  scheduledStart: {
    type: Date,
    default: null
  },
  actualStart: {
    type: Date,
    default: null,
    index: true
  },
  actualEnd: {
    type: Date,
    default: null
  },
  settings: {
    type: eventSettingsSchema,
    required: true
  },
  containerId: {
    type: String,
    default: null,
    index: true
  },
  streamKey: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  rtmpUrl: {
    type: String,
    required: true
  },
  hlsUrl: {
    type: String,
    default: null
  },
  // Real-time metrics (updated during stream)
  metrics: {
    currentViewers: { type: Number, default: 0 },
    peakViewers: { type: Number, default: 0 },
    totalViews: { type: Number, default: 0 },
    averageViewTime: { type: Number, default: 0 }, // in seconds
    chatMessages: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    newFollowers: { type: Number, default: 0 },
    donations: {
      count: { type: Number, default: 0 },
      totalAmount: { type: Number, default: 0 }
    }
  },
  // Technical info
  technical: {
    streamHealth: {
      type: String,
      enum: ['excellent', 'good', 'warning', 'error'],
      default: 'good'
    },
    bitrate: { type: Number, default: 0 },
    fps: { type: Number, default: 0 },
    droppedFrames: { type: Number, default: 0 },
    bandwidth: { type: Number, default: 0 },
    lastHealthCheck: { type: Date, default: null }
  },
  // Thumbnails and previews
  media: {
    thumbnail: { type: String, default: null },
    previewImage: { type: String, default: null },
    recordingUrl: { type: String, default: null },
    highlights: [{
      title: String,
      url: String,
      timestamp: Date,
      duration: Number
    }]
  },
  // Engagement tracking
  engagement: {
    chatActivity: { type: Number, default: 0 }, // messages per minute
    viewerRetention: { type: Number, default: 0 }, // percentage
    interactionRate: { type: Number, default: 0 }, // likes/messages per viewer
    peakConcurrentViewers: { type: Number, default: 0 },
    averageSessionDuration: { type: Number, default: 0 }
  },
  // Tags for discovery
  tags: [{
    type: String,
    maxlength: 30,
    index: true
  }],
  // Geographic data
  geographic: {
    primaryCountry: { type: String, default: null },
    topCountries: [{
      country: String,
      percentage: Number
    }],
    timezone: { type: String, default: null }
  }
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
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
eventSchema.index({ userId: 1, status: 1 });
eventSchema.index({ status: 1, privacy: 1, actualStart: -1 });
eventSchema.index({ category: 1, status: 1 });
eventSchema.index({ 'metrics.peakViewers': -1 });
eventSchema.index({ createdAt: -1 });
eventSchema.index({ actualStart: -1 });
eventSchema.index({ tags: 1 });
eventSchema.index({ 'geographic.primaryCountry': 1 });

// Compound indexes
eventSchema.index({ status: 1, privacy: 1, category: 1, actualStart: -1 });
eventSchema.index({ userId: 1, createdAt: -1 });

// Text search index
eventSchema.index({
  title: 'text',
  description: 'text',
  tags: 'text'
}, {
  weights: {
    title: 3,
    tags: 2,
    description: 1
  }
});

// Pre-save middleware
eventSchema.pre('save', function(next) {
  const event = this as EventDocument;
  
  // Auto-generate stream key if not set
  if (!event.streamKey) {
    event.streamKey = require('crypto').randomBytes(16).toString('hex');
  }
  
  // Set RTMP URL based on stream key
  if (!event.rtmpUrl) {
    event.rtmpUrl = `rtmp://ingest.bigfootlive.com:1935/live/${event.streamKey}`;
  }
  
  next();
});

// Instance methods
eventSchema.methods.updateStreamStats = async function(stats: any): Promise<void> {
  const event = this as EventDocument;
  
  // Update metrics
  event.metrics.currentViewers = stats.currentViewers || 0;
  event.metrics.peakViewers = Math.max(event.metrics.peakViewers, stats.currentViewers || 0);
  event.metrics.totalViews = stats.totalViews || event.metrics.totalViews;
  event.metrics.chatMessages = stats.chatMessages || event.metrics.chatMessages;
  
  // Update technical info
  event.technical.bitrate = stats.bitrate || event.technical.bitrate;
  event.technical.fps = stats.fps || event.technical.fps;
  event.technical.droppedFrames = stats.droppedFrames || event.technical.droppedFrames;
  event.technical.streamHealth = stats.streamHealth || event.technical.streamHealth;
  event.technical.lastHealthCheck = new Date();
  
  await event.save();
};

eventSchema.methods.calculateDuration = function(): number {
  const event = this as EventDocument;
  if (!event.actualStart) return 0;
  
  const endTime = event.actualEnd || new Date();
  return Math.floor((endTime.getTime() - event.actualStart.getTime()) / 1000);
};

eventSchema.methods.isLive = function(): boolean {
  const event = this as EventDocument;
  return event.status === 'live';
};

eventSchema.methods.canStart = function(): boolean {
  const event = this as EventDocument;
  return ['scheduled', 'ended'].includes(event.status);
};

eventSchema.methods.canStop = function(): boolean {
  const event = this as EventDocument;
  return event.status === 'live';
};

// Static methods
eventSchema.statics.findLiveEvents = function(options: {
  category?: string;
  limit?: number;
  skip?: number;
} = {}) {
  const query = { status: 'live', privacy: 'public' };
  
  if (options.category) {
    (query as any).category = options.category;
  }
  
  return this.find(query)
    .sort({ 'metrics.currentViewers': -1, actualStart: -1 })
    .limit(options.limit || 20)
    .skip(options.skip || 0)
    .populate('userId', 'username displayName avatar isVerified');
};

eventSchema.statics.findUserEvents = function(userId: string, options: {
  status?: string;
  limit?: number;
  skip?: number;
} = {}) {
  const query: any = { userId };
  
  if (options.status) {
    query.status = options.status;
  }
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(options.limit || 50)
    .skip(options.skip || 0);
};

eventSchema.statics.searchEvents = function(searchTerm: string, options: {
  category?: string;
  limit?: number;
  skip?: number;
} = {}) {
  const query: any = {
    $text: { $search: searchTerm },
    status: 'live',
    privacy: 'public'
  };
  
  if (options.category) {
    query.category = options.category;
  }
  
  return this.find(query, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' }, 'metrics.currentViewers': -1 })
    .limit(options.limit || 20)
    .skip(options.skip || 0)
    .populate('userId', 'username displayName avatar isVerified');
};

eventSchema.statics.getTrendingEvents = function(timeframe = 24) {
  const since = new Date(Date.now() - timeframe * 60 * 60 * 1000);
  
  return this.find({
    status: { $in: ['live', 'ended'] },
    privacy: 'public',
    actualStart: { $gte: since }
  })
  .sort({ 'metrics.peakViewers': -1, 'engagement.interactionRate': -1 })
  .limit(10)
  .populate('userId', 'username displayName avatar isVerified');
};

// Virtual fields
eventSchema.virtual('duration').get(function(this: EventDocument) {
  return this.calculateDuration();
});

eventSchema.virtual('isScheduled').get(function(this: EventDocument) {
  return this.status === 'scheduled' && this.scheduledStart && this.scheduledStart > new Date();
});

eventSchema.virtual('viewerEngagement').get(function(this: EventDocument) {
  if (this.metrics.totalViews === 0) return 0;
  return (this.metrics.chatMessages + this.metrics.likes) / this.metrics.totalViews;
});

export const EventModel = mongoose.model<EventDocument>('Event', eventSchema);
export default EventModel;
