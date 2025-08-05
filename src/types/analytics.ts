export interface StreamingMetrics {
  streamId: string;
  eventId: string;
  title: string;
  status: 'live' | 'ended' | 'starting' | 'error';
  startTime: Date;
  endTime?: Date;
  duration: number; // in seconds
  
  // Viewer Analytics
  totalViewers: number;
  peakViewers: number;
  averageViewTime: number; // in seconds
  uniqueViewers: number;
  returningViewers: number;
  
  // Geographic Data
  viewersByRegion: Record<string, number>;
  viewersByCountry: Record<string, number>;
  
  // Technical Metrics
  averageBitrate: number;
  qualityDistribution: Record<string, number>; // '720p': 45, '1080p': 55
  bufferingEvents: number;
  averageLatency: number; // in milliseconds
  
  // Engagement Metrics
  chatMessages: number;
  chatParticipants: number;
  peakConcurrentChat: number;
  averageEngagementRate: number; // percentage
  
  // Device & Platform
  deviceTypes: Record<string, number>; // 'mobile': 60, 'desktop': 40
  browsers: Record<string, number>;
  operatingSystems: Record<string, number>;
}

export interface ViewerSession {
  sessionId: string;
  streamId: string;
  userId?: string;
  ipAddress: string;
  userAgent: string;
  joinTime: Date;
  leaveTime?: Date;
  watchTime: number; // in seconds
  country: string;
  region: string;
  city: string;
  device: 'mobile' | 'tablet' | 'desktop';
  browser: string;
  os: string;
  quality: string;
  bufferingEvents: number;
  chatMessages: number;
}

export interface AnalyticsSummary {
  period: 'today' | 'week' | 'month' | 'year';
  totalStreams: number;
  totalViewTime: number; // in hours
  totalViewers: number;
  averageViewersPerStream: number;
  topStreams: StreamingMetrics[];
  revenueMetrics?: {
    totalRevenue: number;
    averageRevenuePerStream: number;
    subscriptions: number;
    oneTimePurchases: number;
  };
  growthMetrics: {
    viewerGrowth: number; // percentage
    streamGrowth: number; // percentage
    engagementGrowth: number; // percentage
  };
}

export interface RealTimeAnalytics {
  currentViewers: number;
  viewersOverTime: Array<{ timestamp: Date; viewers: number }>;
  chatActivity: Array<{ timestamp: Date; messages: number }>;
  geographicDistribution: Record<string, number>;
  qualityDistribution: Record<string, number>;
  deviceDistribution: Record<string, number>;
}

export interface AnalyticsFilter {
  dateRange: {
    start: Date;
    end: Date;
  };
  streamIds?: string[];
  regions?: string[];
  devices?: string[];
  qualities?: string[];
}

// Enhanced Analytics Types for Dashboard
export interface RevenueMetrics {
  totalRevenue: number;
  donations: {
    total: number;
    count: number;
    averageAmount: number;
    topDonation: number;
  };
  superChats: {
    total: number;
    count: number;
    averageAmount: number;
  };
  subscriptions: {
    total: number;
    newSubs: number;
    renewals: number;
    cancellations: number;
  };
  tips: {
    total: number;
    count: number;
  };
}

export interface ChatAnalytics {
  totalMessages: number;
  messagesPerMinute: number;
  activeUsers: number;
  topChatters: Array<{
    username: string;
    messageCount: number;
    userId: string;
  }>;
  emotesUsed: Array<{
    emote: string;
    count: number;
  }>;
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
  moderationActions: {
    timeouts: number;
    bans: number;
    deletedMessages: number;
  };
}

export interface AudienceInsights {
  demographics: {
    ageGroups: Record<string, number>;
    genders: Record<string, number>;
    countries: Record<string, number>;
    languages: Record<string, number>;
  };
  behavior: {
    averageSessionLength: number;
    returnViewerRate: number;
    peakViewingHours: Array<{
      hour: number;
      viewers: number;
    }>;
    dropOffPoints: Array<{
      timestamp: number;
      percentage: number;
    }>;
  };
  engagement: {
    chatParticipationRate: number;
    followConversionRate: number;
    subscriptionConversionRate: number;
  };
}

export interface StreamPerformance {
  technicalMetrics: {
    averageBitrate: number;
    frameDrops: number;
    reconnections: number;
    averageLatency: number;
    bufferingRatio: number;
  };
  qualityMetrics: {
    streamHealth: 'excellent' | 'good' | 'fair' | 'poor';
    stabilityScore: number;
    viewerSatisfaction: number;
  };
}

export interface ComprehensiveAnalytics {
  streamId: string;
  period: AnalyticsFilter['dateRange'];
  overview: StreamingMetrics;
  revenue: RevenueMetrics;
  chat: ChatAnalytics;
  audience: AudienceInsights;
  performance: StreamPerformance;
  realTime: RealTimeAnalytics;
}

export interface AnalyticsGoals {
  targetViewers: number;
  targetRevenue: number;
  targetFollowers: number;
  targetStreamHours: number;
  targetEngagementRate: number;
}

export interface AnalyticsAlert {
  id: string;
  type: 'goal_reached' | 'milestone' | 'threshold' | 'anomaly' | 'performance';
  title: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  severity: 'info' | 'warning' | 'error' | 'success';
  data?: Record<string, any>;
}

export interface HistoricalAnalytics {
  streams: ComprehensiveAnalytics[];
  aggregated: {
    totalStreams: number;
    totalHoursStreamed: number;
    totalViews: number;
    totalRevenue: number;
    averageViewers: number;
    growthRate: number;
  };
  trends: {
    viewersTrend: Array<{ timestamp: Date; value: number }>;
    revenueTrend: Array<{ timestamp: Date; value: number }>;
    followersTrend: Array<{ timestamp: Date; value: number }>;
    engagementTrend: Array<{ timestamp: Date; value: number }>;
  };
}
