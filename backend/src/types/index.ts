// Core Event Types
export interface Event {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category: string;
  privacy: 'public' | 'unlisted' | 'private';
  status: 'scheduled' | 'live' | 'ended' | 'cancelled';
  scheduledStart?: Date;
  actualStart?: Date;
  actualEnd?: Date;
  settings: EventSettings;
  containerId?: string;
  streamKey: string;
  rtmpUrl: string;
  hlsUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventSettings {
  chatEnabled: boolean;
  recordingEnabled: boolean;
  donationsEnabled: boolean;
  quality: {
    resolution: string;
    bitrate: number;
    fps: number;
  };
  moderation: {
    autoMod: boolean;
    badWordFilter: boolean;
    slowMode: number;
    subscriberOnly: boolean;
  };
}

// Event Container Types
export interface EventContainer {
  id: string;
  eventId: string;
  status: 'starting' | 'running' | 'stopping' | 'stopped' | 'error';
  createdAt: Date;
  resources: {
    cpu: string;
    memory: string;
    storage: string;
  };
  endpoints: {
    rtmp: string;
    hls: string;
    websocket: string;
    api: string;
  };
  health: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: HealthCheck[];
    lastCheck: Date;
  };
}

export interface HealthCheck {
  name: string;
  status: 'pass' | 'fail';
  message?: string;
  timestamp: Date;
}

// User Types
export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatar?: string;
  role: 'viewer' | 'streamer' | 'moderator' | 'admin';
  isVerified: boolean;
  followers: number;
  following: number;
  totalViews: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Analytics Types
export interface AnalyticsData {
  eventId: string;
  timestamp: Date;
  metrics: {
    currentViewers: number;
    peakViewers: number;
    totalViews: number;
    avgWatchTime: number;
    chatMessages: number;
    newFollowers: number;
    donations: number;
    donationAmount: number;
  };
  demographics: {
    countries: Record<string, number>;
    devices: Record<string, number>;
    sources: Record<string, number>;
  };
  performance: {
    bitrate: number;
    fps: number;
    droppedFrames: number;
    quality: 'excellent' | 'good' | 'warning' | 'error';
  };
}

// Chat Types
export interface ChatMessage {
  id: string;
  eventId: string;
  userId: string;
  username: string;
  displayName: string;
  avatar?: string;
  content: string;
  type: 'message' | 'super_chat' | 'system' | 'mod_action';
  timestamp: Date;
  badges: string[];
  metadata?: {
    amount?: number;
    currency?: string;
    color?: string;
    duration?: number;
  };
  moderation?: {
    flagged: boolean;
    reason?: string;
    action?: 'timeout' | 'delete' | 'ban';
  };
}

export interface ChatStats {
  eventId: string;
  totalMessages: number;
  activeUsers: number;
  messagesPerMinute: number;
  topChatters: Array<{
    username: string;
    messageCount: number;
  }>;
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
  moderation: {
    flaggedMessages: number;
    timeouts: number;
    bans: number;
  };
}

// WebSocket Types
export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: Date;
  eventId?: string;
  userId?: string;
}

export interface WebSocketConnection {
  id: string;
  userId?: string;
  eventId?: string;
  type: 'viewer' | 'streamer' | 'moderator';
  connectedAt: Date;
  lastActivity: Date;
  subscriptions: string[];
}

// Storage Types
export interface StorageArtifact {
  id: string;
  eventId: string;
  type: 'recording' | 'thumbnail' | 'highlight' | 'chat_log' | 'analytics';
  filename: string;
  filesize: number;
  duration?: number;
  url: string;
  metadata: Record<string, any>;
  createdAt: Date;
  expiresAt?: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  timestamp: Date;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filter?: Record<string, any>;
}

// Queue Job Types
export interface QueueJob<T = any> {
  id: string;
  type: string;
  data: T;
  priority: number;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
  processedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
  error?: string;
}

export interface EventCleanupJob {
  eventId: string;
  containerId: string;
  artifacts: string[];
  analyticsData: any[];
  chatLogs: ChatMessage[];
}

export interface AnalyticsProcessingJob {
  eventId: string;
  rawData: any[];
  timeRange: {
    start: Date;
    end: Date;
  };
}

// Configuration Types
export interface AppConfig {
  server: {
    port: number;
    env: string;
    apiUrl: string;
  };
  database: {
    mongodb: string;
    redis: string;
  };
  auth: {
    jwtSecret: string;
    jwtExpiresIn: string;
    bcryptRounds: number;
  };
  streaming: {
    rtmpPort: number;
    chunkSize: number;
    ping: number;
    pingTimeout: number;
  };
  storage: {
    aws: {
      region: string;
      accessKeyId: string;
      secretAccessKey: string;
    };
    buckets: {
      recordings: string;
      thumbnails: string;
      artifacts: string;
    };
  };
  cdn: {
    baseUrl: string;
    hlsSegmentDuration: number;
    hlsListSize: number;
  };
  analytics: {
    batchSize: number;
    flushInterval: number;
    retentionDays: number;
  };
  chat: {
    maxMessageLength: number;
    rateLimitMessages: number;
    rateLimitWindow: number;
    moderationEnabled: boolean;
  };
}
