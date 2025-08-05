// Mock API responses for development
export const mockApiResponses = {
  '/analytics/overview': {
    total_views: 45231,
    unique_viewers: 12234,
    avg_watch_time: 24.5,
    engagement_rate: 68.3,
    total_streams: 23,
    active_streams: 2,
    total_revenue: 15420.50,
    growth_rate: 20.1},
  
  '/analytics/viewership': {
    period: '30 days',
    data: Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toISOString(),
        total_viewers: 3000 + (i * 100) + (i % 3 * 500),
        unique_viewers: Math.floor((3000 + (i * 100) + (i % 3 * 500)) * 0.6)
      };
    })
  },
  
  '/analytics/revenue/breakdown': {
    total_revenue: 15420.50,
    average_revenue_per_stream: 670.46,
    revenue_by_source: {
      'Subscriptions': 8234.25,
      'Pay-per-view': 4567.30,
      'Ads': 1892.45,
      'Donations': 726.50
    },
    daily_revenue: Object.fromEntries(
      Array.from({ length: 14 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (13 - i));
        return [date.toISOString().split('T')[0], 500 + Math.random() * 1000];
      })
    )
  },
  
  '/analytics/performance/summary': {
    summary: {
      total_cost: 456.78,
      net_profit: 14963.72,
      profit_margin: 97.0,
      average_viewers_per_stream: 2145
    },
    efficiency: {
      savings_vs_traditional: 82.3,
      revenue_per_viewer: 0.312,
      cost_per_viewer: 0.0094
    },
    trends: {
      revenue_growth: 18.5,
      viewer_growth: 12.3,
      stream_growth: 8.7
    },
    recommendations: [
      'Schedule more streams during peak hours (2-4 PM EST) to maximize viewership',
      'Consider implementing viewer rewards program - 68% engagement rate shows high loyalty',
      'Optimize stream quality settings - current bitrate may be too high for mobile viewers',
      'Enable chat moderation for streams over 1000 viewers to maintain quality'
    ]
  },
  
  '/analytics/audience': {
    geographic_distribution: [
      { country: 'United States', viewers: 4532, percentage: 37 },
      { country: 'Canada', viewers: 2341, percentage: 19 },
      { country: 'United Kingdom', viewers: 1876, percentage: 15 },
      { country: 'Australia', viewers: 1234, percentage: 10 },
      { country: 'Germany', viewers: 987, percentage: 8 },
      { country: 'Others', viewers: 1264, percentage: 11 }
    ],
    device_breakdown: {
      desktop: 45,
      mobile: 38,
      tablet: 12,
      tv: 5
    },
    age_groups: [
      { range: '18-24', percentage: 28 },
      { range: '25-34', percentage: 35 },
      { range: '35-44', percentage: 22 },
      { range: '45-54', percentage: 10 },
      { range: '55+', percentage: 5 }
    ]
  },
  
  '/streams': [
    {
      id: '1',
      title: 'Live Product Demo',
      description: 'Showcasing our latest features',
      status: 'live',
      viewers: 892,
      duration: '45:23',
      thumbnail: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=320&h=180&fit=crop',
      startedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      streamKey: 'demo-stream-key',
      playbackUrl: 'https://example.com/stream/1',
      isPublic: true
    },
    {
      id: '2',
      title: 'Q&A Session with CEO',
      description: 'Monthly Q&A session',
      status: 'ended',
      viewers: 1234,
      duration: '1:23:45',
      thumbnail: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=320&h=180&fit=crop',
      endedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      streamKey: 'qa-stream-key',
      playbackUrl: 'https://example.com/stream/2',
      isPublic: true
    },
    {
      id: '3',
      title: 'Tech Talk: Cloud Architecture',
      description: 'Deep dive into our infrastructure',
      status: 'scheduled',
      viewers: 0,
      thumbnail: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=320&h=180&fit=crop',
      scheduledFor: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      streamKey: 'tech-talk-key',
      isPublic: false
    }
  ],
  
  '/api/tenant/analytics/overview': {
    totalViews: 24567,
    viewsChange: 12.5,
    activeViewers: 1234,
    viewersChange: 4.2,
    revenue: 3456,
    revenueChange: 18.1,
    totalStreams: 48,
    streamsChange: 2
  },
  
  '/api/tenant/streams': [
    {
      id: '1',
      title: 'Live Product Demo',
      description: 'Showcasing our latest features',
      status: 'live',
      viewers: 892,
      duration: '45:23',
      thumbnail: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=320&h=180&fit=crop',
      startedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      title: 'Q&A Session with CEO',
      description: 'Monthly Q&A session',
      status: 'ended',
      viewers: 1234,
      duration: '1:23:45',
      thumbnail: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=320&h=180&fit=crop',
      endedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '3',
      title: 'Tech Talk: Cloud Architecture',
      description: 'Deep dive into our infrastructure',
      status: 'scheduled',
      viewers: 0,
      thumbnail: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=320&h=180&fit=crop',
      scheduledFor: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  
  '/api/tenant/viewers': [
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      status: 'active',
      joinDate: '2024-01-15',
      lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      watchTime: 145,
      streams: 23,
      location: 'United States',
      engagement: 89
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      status: 'active',
      joinDate: '2023-12-20',
      lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      watchTime: 98,
      streams: 15,
      location: 'Canada',
      engagement: 76
    }
  ],
  
  '/api/tenant/analytics/streams': {
    streams: [
      { date: '2024-01-01', views: 1200, avgDuration: 45 },
      { date: '2024-01-02', views: 1500, avgDuration: 52 },
      { date: '2024-01-03', views: 1800, avgDuration: 48 },
      { date: '2024-01-04', views: 2200, avgDuration: 55 },
      { date: '2024-01-05', views: 2500, avgDuration: 50 }
    ]
  },
  
  '/api/tenant/analytics/audience': {
    demographics: {
      age: [
        { range: '18-24', count: 2500 },
        { range: '25-34', count: 4200 },
        { range: '35-44', count: 3100 },
        { range: '45-54', count: 1800 },
        { range: '55+', count: 800 }
      ],
      location: [
        { country: 'US', count: 5200 },
        { country: 'UK', count: 2100 },
        { country: 'CA', count: 1800 },
        { country: 'AU', count: 1200 },
        { country: 'Other', count: 2100 }
      ]
    }
  },
  
  '/api/tenant/analytics/engagement': {
    metrics: [
      { date: '2024-01-01', likes: 450, comments: 120, shares: 85 },
      { date: '2024-01-02', likes: 520, comments: 145, shares: 92 },
      { date: '2024-01-03', likes: 480, comments: 135, shares: 88 },
      { date: '2024-01-04', likes: 590, comments: 165, shares: 105 },
      { date: '2024-01-05', likes: 620, comments: 175, shares: 112 }
    ]
  }
};

// Mock delay to simulate network latency
export const mockDelay = () => new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700));