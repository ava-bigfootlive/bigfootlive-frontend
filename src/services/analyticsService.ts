import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import type {
  ComprehensiveAnalytics,
  RealTimeAnalytics,
  AnalyticsFilter,
  AnalyticsGoals,
  AnalyticsAlert,
  HistoricalAnalytics,
} from '@/types/analytics';
import { buildApiUrl, getAuthHeaders, API_PATHS, API_CONFIG, withRetry } from '@/config/api';

// Environment flag to determine if we should use mock data
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_ANALYTICS === 'true' || import.meta.env.MODE === 'development';

class AnalyticsService {
  private async request<T>(
    method: 'get' | 'post' | 'put',
    path: string, 
    payload?: Record<string, any>,
    config?: AxiosRequestConfig
  ): Promise<T> {
    
    if (USE_MOCK_DATA) {
      return this.getMockData(path) as T;
    }

    const url = buildApiUrl(path);
    const headers = getAuthHeaders();

    const requestConfig: AxiosRequestConfig = {
      method,
      url,
      headers,
      timeout: config?.timeout || API_CONFIG.TIMEOUTS.DEFAULT,
      ...config
    };

    if (method === 'get') {
      requestConfig.params = payload;
    } else {
      requestConfig.data = payload;
    }

    return withRetry(async () => {
      try {
        const response = await axios(requestConfig);
        return response.data as T;
      } catch (error) {
        this.handleApiError(error as AxiosError);
        throw error;
      }
    });
  }

  private handleApiError(error: AxiosError) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Network Error:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request Error:', error.message);
    }
  }

  getComprehensiveAnalytics(streamId: string, filter: AnalyticsFilter): Promise<ComprehensiveAnalytics> {
    const path = API_PATHS.analytics.comprehensive(streamId);
    return this.request('get', path, { filter: JSON.stringify(filter) });
  }

  getRealTimeAnalytics(streamId: string): Promise<RealTimeAnalytics> {
    const path = API_PATHS.analytics.realTime(streamId);
    return this.request('get', path, undefined, { timeout: API_CONFIG.TIMEOUTS.REAL_TIME });
  }

  getHistoricalAnalytics(channelId: string, filter: AnalyticsFilter): Promise<HistoricalAnalytics> {
    const path = API_PATHS.analytics.historical(channelId);
    return this.request('get', path, { filter: JSON.stringify(filter) });
  }

  getAnalyticsGoals(channelId: string): Promise<AnalyticsGoals> {
    const path = API_PATHS.analytics.goals(channelId);
    return this.request('get', path);
  }

  updateAnalyticsGoals(channelId: string, goals: Partial<AnalyticsGoals>): Promise<AnalyticsGoals> {
    const path = API_PATHS.analytics.goals(channelId);
    return this.request('post', path, goals);
  }

  getAnalyticsAlerts(channelId: string): Promise<AnalyticsAlert[]> {
    const path = API_PATHS.analytics.alerts(channelId);
    return this.request('get', path);
  }

  acknowledgeAnalyticsAlert(alertId: string): Promise<void> {
    const path = API_PATHS.analytics.alertAck(alertId);
    return this.request('post', path);
  }

  private getMockData(endpoint: string): any {
    // Return mock data based on endpoint
    if (endpoint.includes('/historical/') || endpoint.includes('/comprehensive/')) {
      return {
        period: { start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), end: new Date() },
        aggregated: {
          totalViewers: 45230,
          peakViewers: 12500,
          averageViewers: 3200,
          totalHoursStreamed: 168,
          uniqueViewers: 28700,
          averageViewTime: 1800, // 30 minutes
          chatMessages: 156789,
          totalRevenue: 15600,
          viewerGrowth: 12.5,
          engagementGrowth: 8.3,
          totalStreams: 24
        },
        trends: {
          viewershipTrend: Array.from({ length: 7 }, (_, i) => ({
            date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000),
            viewers: Math.floor(Math.random() * 5000) + 2000,
            uniqueViewers: Math.floor(Math.random() * 3000) + 1500
          })),
          revenueTrend: Array.from({ length: 7 }, (_, i) => ({
            date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000),
            revenue: Math.floor(Math.random() * 1000) + 500,
            donations: Math.floor(Math.random() * 300) + 100
          })),
          engagementTrend: Array.from({ length: 7 }, (_, i) => ({
            date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000),
            chatMessages: Math.floor(Math.random() * 5000) + 1000,
            avgEngagement: Math.random() * 30 + 70
          }))
        },
        streams: [
          {
            streamId: 'stream-1',
            overview: {
              title: 'Gaming Session #1',
              totalViewers: 15420,
              peakViewers: 8200,
              averageViewTime: 2100,
              chatMessages: 45600
            }
          },
          {
            streamId: 'stream-2', 
            overview: {
              title: 'Music & Chill',
              totalViewers: 8900,
              peakViewers: 4300,
              averageViewTime: 1650,
              chatMessages: 23400
            }
          }
        ],
        // Add mock data for other analytics types as needed
        audience: { demographics: { countries: {} }, interests: {} },
        chat: { topChatters: [], sentiment: { positive: 0, neutral: 0, negative: 0 } },
        performance: { qualityMetrics: {}, technicalMetrics: {} },
        revenue: { donations: { total: 0 }, superChats: { total: 0 }, subscriptions: { total: 0 }, tips: { total: 0 } }
      };
    }
    
    if (endpoint.includes('/real-time/')) {
      return {
        currentViewers: Math.floor(Math.random() * 5000) + 1000,
        viewersOverTime: Array.from({ length: 10 }, (_, i) => ({
          timestamp: new Date(Date.now() - (9 - i) * 10000),
          viewers: Math.floor(Math.random() * 3000) + 1000
        })),
        chatActivity: Array.from({ length: 10 }, (_, i) => ({
          timestamp: new Date(Date.now() - (9 - i) * 10000),
          messages: Math.floor(Math.random() * 50)
        })),
        geographicDistribution: { 'United States': 1200, 'Canada': 500, 'United Kingdom': 800 },
        deviceDistribution: { desktop: 1500, mobile: 800, tablet: 200 }
      };
    }

    if (endpoint.includes('/goals/')) {
      return {
        monthlyViewers: 50000,
        monthlyRevenue: 5000,
        avgWatchTime: 25, // minutes
        period: 'monthly',
        current: {
          monthlyViewers: 32450,
          monthlyRevenue: 3200,
          avgWatchTime: 18
        },
        progress: {
          viewers: 64.9, // percentage
          revenue: 64.0,
          watchTime: 72.0
        }
      };
    }

    if (endpoint.includes('/alerts/')) {
      return [
        {
          id: 'alert-1',
          type: 'goal_milestone',
          title: 'Revenue Goal Achievement',
          message: 'You have reached 80% of your monthly revenue goal!',
          severity: 'info',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          acknowledged: false
        },
        {
          id: 'alert-2',
          type: 'performance_drop',
          title: 'Viewer Drop Alert',
          message: 'Your average viewers have decreased by 15% compared to last week.',
          severity: 'warning',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          acknowledged: false
        }
      ];
    }
    
    return {};
  }
}

export const analyticsService = new AnalyticsService();

