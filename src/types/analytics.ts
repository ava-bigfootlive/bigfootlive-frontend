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
