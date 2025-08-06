import { apiService } from './api';
import type { 
  StreamingMetrics, 
  ViewerSession, 
  AnalyticsSummary, 
  RealTimeAnalytics
} from '../types/analytics';

export class AnalyticsService {
  private wsConnection: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  // Real-time Analytics WebSocket
  connectRealTimeAnalytics(streamId: string, onUpdate: (data: RealTimeAnalytics) => void) {
    const wsBaseUrl = import.meta.env.VITE_WS_URL;
    
    if (!wsBaseUrl) {
      console.warn('WebSocket URL not configured, real-time analytics will be disabled');
      return;
    }
    
    const wsUrl = `${wsBaseUrl}/ws/analytics/${streamId}`;
    
    try {
      this.wsConnection = new WebSocket(wsUrl);
      
      this.wsConnection.onopen = () => {
        console.log('Analytics WebSocket connected');
        this.reconnectAttempts = 0;
      };
      
      this.wsConnection.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onUpdate(data);
        } catch (error) {
          console.error('Error parsing analytics data:', error);
        }
      };
      
      this.wsConnection.onclose = () => {
        console.log('Analytics WebSocket disconnected');
        this.handleReconnect(streamId, onUpdate);
      };
      
      this.wsConnection.onerror = (error) => {
        console.warn('Analytics WebSocket connection failed, falling back to polling for real-time data:', error);
        // Could implement polling fallback here if needed
      };
    } catch (error) {
      console.error('Failed to connect to analytics WebSocket:', error);
    }
  }

  private handleReconnect(streamId: string, onUpdate: (data: RealTimeAnalytics) => void) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.pow(2, this.reconnectAttempts) * 1000;
      
      setTimeout(() => {
        console.log(`Reconnecting to analytics WebSocket (attempt ${this.reconnectAttempts})`);
        this.connectRealTimeAnalytics(streamId, onUpdate);
      }, delay);
    }
  }

  disconnectRealTimeAnalytics() {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
  }

  // Fetch streaming metrics for a specific stream
  async getStreamMetrics(streamId: string): Promise<StreamingMetrics> {
    const response = await api.get(`/analytics/streams/${streamId}/metrics`);
    return {
      ...response.data,
      startTime: new Date(response.data.startTime),
      endTime: response.data.endTime ? new Date(response.data.endTime) : undefined,
    };
  }

  // Fetch analytics summary for a period
  async getAnalyticsSummary(
    period: 'today' | 'week' | 'month' | 'year',
    filters?: {
      streamIds?: string[];
      regions?: string[];
      devices?: string[];
      dateRange?: { start: Date; end: Date };
    }
  ): Promise<AnalyticsSummary> {
    const params = new URLSearchParams();
    params.append('period', period);
    
    if (filters) {
      if (filters.streamIds?.length) {
        params.append('streamIds', filters.streamIds.join(','));
      }
      if (filters.regions?.length) {
        params.append('regions', filters.regions.join(','));
      }
      if (filters.devices?.length) {
        params.append('devices', filters.devices.join(','));
      }
      if (filters.dateRange) {
        params.append('startDate', filters.dateRange.start.toISOString());
        params.append('endDate', filters.dateRange.end.toISOString());
      }
    }

    const response = await api.get(`/analytics/summary?${params.toString()}`);
    return response.data;
  }

  // Fetch detailed viewer sessions
  async getViewerSessions(
    streamId: string,
    page = 1,
    limit = 50
  ): Promise<{ sessions: ViewerSession[]; total: number; hasMore: boolean }> {
    const response = await api.get(
      `/analytics/streams/${streamId}/sessions?page=${page}&limit=${limit}`
    );
    
    return {
      ...response.data,
      sessions: response.data.sessions.map((session: {
        id: string;
        userId?: string;
        joinTime: string;
        leaveTime?: string;
        duration: number;
        region: string;
        device: string;
        quality: string;
      }) => ({
        ...session,
        joinTime: new Date(session.joinTime),
        leaveTime: session.leaveTime ? new Date(session.leaveTime) : undefined,
      })),
    };
  }

  // Get top performing streams
  async getTopStreams(
    period: 'today' | 'week' | 'month' | 'year',
    metric: 'viewers' | 'engagement' | 'duration' = 'viewers',
    limit = 10
  ): Promise<StreamingMetrics[]> {
    const response = await api.get(
      `/analytics/top-streams?period=${period}&metric=${metric}&limit=${limit}`
    );
    
    return response.data.map((stream: {
      id: string;
      title: string;
      streamerId: string;
      startTime: string;
      endTime?: string;
      peakViewers: number;
      totalViews: number;
      duration: number;
      engagement: number;
    }) => ({
      ...stream,
      startTime: new Date(stream.startTime),
      endTime: stream.endTime ? new Date(stream.endTime) : undefined,
    }));
  }

  // Export analytics data
  async exportAnalytics(
    format: 'csv' | 'json' | 'pdf',
    filters: {
      dateRange: { start: Date; end: Date };
      streamIds?: string[];
    }
  ): Promise<Blob> {
    const params = new URLSearchParams();
    params.append('format', format);
    params.append('startDate', filters.dateRange.start.toISOString());
    params.append('endDate', filters.dateRange.end.toISOString());
    
    if (filters.streamIds?.length) {
      params.append('streamIds', filters.streamIds.join(','));
    }

    const response = await api.get(`/analytics/export?${params.toString()}`, {
      responseType: 'blob',
    });
    
    return response.data;
  }

  // Get geographic distribution data
  async getGeographicData(
    streamId?: string,
    period: 'today' | 'week' | 'month' = 'today'
  ): Promise<{
    countries: Record<string, number>;
    regions: Record<string, number>;
    cities: Record<string, { count: number; lat: number; lng: number }>;
  }> {
    const params = new URLSearchParams();
    params.append('period', period);
    
    if (streamId) {
      params.append('streamId', streamId);
    }

    const response = await api.get(`/analytics/geographic?${params.toString()}`);
    return response.data;
  }

  // Get device and platform analytics
  async getDeviceAnalytics(
    streamId?: string,
    period: 'today' | 'week' | 'month' = 'today'
  ): Promise<{
    devices: Record<string, number>;
    browsers: Record<string, number>;
    operatingSystems: Record<string, number>;
    screenResolutions: Record<string, number>;
  }> {
    const params = new URLSearchParams();
    params.append('period', period);
    
    if (streamId) {
      params.append('streamId', streamId);
    }

    const response = await api.get(`/analytics/devices?${params.toString()}`);
    return response.data;
  }

  // Track custom events
  async trackEvent(
    streamId: string,
    eventType: string,
    eventData: Record<string, unknown>
  ): Promise<void> {
    await api.post('/analytics/events', {
      streamId,
      eventType,
      eventData,
      timestamp: new Date().toISOString(),
    });
  }

  // Get engagement metrics over time
  async getEngagementOverTime(
    streamId: string,
    interval: '1m' | '5m' | '15m' | '1h' = '5m'
  ): Promise<Array<{
    timestamp: Date;
    viewers: number;
    chatMessages: number;
    qualityChanges: number;
    bufferingEvents: number;
  }>> {
    const response = await api.get(
      `/analytics/streams/${streamId}/engagement?interval=${interval}`
    );
    
    return response.data.map((point: {
      timestamp: string;
      viewers: number;
      chatMessages: number;
      qualityChanges: number;
      bufferingEvents: number;
    }) => ({
      ...point,
      timestamp: new Date(point.timestamp),
    }));
  }
}

export const analyticsService = new AnalyticsService();
