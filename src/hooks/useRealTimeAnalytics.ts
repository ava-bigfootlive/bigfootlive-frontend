import { useState, useEffect, useCallback, useRef } from 'react';
import { analyticsService } from '@/services/analytics';
import { eventService } from '@/services/events';
import type { RealTimeAnalytics, StreamEvent, EventMetrics } from '@/types/analytics';

interface UseRealTimeAnalyticsOptions {
  streamId?: string;
  enabled?: boolean;
  updateInterval?: number;
  enableWebSocket?: boolean;
}

interface RealTimeAnalyticsState {
  // Core metrics
  currentViewers: number;
  peakViewers: number;
  totalViews: number;
  avgViewDuration: number;
  
  // Performance metrics
  bandwidth: number;
  latency: number;
  errorRate: number;
  uptime: number;
  
  // Engagement metrics
  chatMessages: number;
  reactions: number;
  shares: number;
  
  // Geographic and device data
  geographicDistribution: Record<string, number>;
  deviceDistribution: Record<string, number>;
  
  // Time series data
  viewerTimeline: Array<{
    timestamp: Date;
    viewers: number;
    chatActivity: number;
  }>;
  
  // Status
  isConnected: boolean;
  lastUpdated: Date | null;
  error: string | null;
}

const initialState: RealTimeAnalyticsState = {
  currentViewers: 0,
  peakViewers: 0,
  totalViews: 0,
  avgViewDuration: 0,
  bandwidth: 0,
  latency: 0,
  errorRate: 0,
  uptime: 100,
  chatMessages: 0,
  reactions: 0,
  shares: 0,
  geographicDistribution: {},
  deviceDistribution: {},
  viewerTimeline: [],
  isConnected: false,
  lastUpdated: null,
  error: null,
};

export function useRealTimeAnalytics(options: UseRealTimeAnalyticsOptions = {}) {
  const {
    streamId,
    enabled = true,
    updateInterval = 5000,
    enableWebSocket = true,
  } = options;

  const [data, setData] = useState<RealTimeAnalyticsState>(initialState);
  const [isLoading, setIsLoading] = useState(false);
  
  const websocketCleanupRef = useRef<(() => void) | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Update data state
  const updateData = useCallback((updates: Partial<RealTimeAnalyticsState>) => {
    setData(prevData => ({
      ...prevData,
      ...updates,
      lastUpdated: new Date(),
    }));
  }, []);

  // Merge real-time metrics from event service
  const mergeEventMetrics = useCallback((metrics: Partial<EventMetrics>) => {
    updateData({
      currentViewers: metrics.currentViewers || data.currentViewers,
      peakViewers: Math.max(metrics.peakViewers || 0, data.peakViewers),
      totalViews: metrics.totalViews || data.totalViews,
      avgViewDuration: metrics.avgViewDuration || data.avgViewDuration,
      bandwidth: metrics.bandwidth || data.bandwidth,
      chatMessages: metrics.chatMessages || data.chatMessages,
      errorRate: (metrics.errors || 0) / 100, // Convert to percentage
    });
  }, [data, updateData]);

  // WebSocket connection for real-time updates
  const connectWebSocket = useCallback(() => {
    if (!streamId || !enableWebSocket) return;

    try {
      // Connect to analytics WebSocket
      analyticsService.connectRealTimeAnalytics(streamId, (analyticsData: RealTimeAnalytics) => {
        updateData({
          currentViewers: analyticsData.currentViewers,
          geographicDistribution: analyticsData.geographicDistribution,
          deviceDistribution: analyticsData.deviceDistribution,
          isConnected: true,
          error: null,
        });

        // Update timeline data
        if (analyticsData.viewersOverTime && analyticsData.chatActivity) {
          const newTimelineData = analyticsData.viewersOverTime.map((viewerPoint, index) => ({
            timestamp: viewerPoint.timestamp,
            viewers: viewerPoint.viewers,
            chatActivity: analyticsData.chatActivity?.[index]?.messages || 0,
          }));

          setData(prevData => ({
            ...prevData,
            viewerTimeline: [...prevData.viewerTimeline.slice(-23), ...newTimelineData].slice(-24),
          }));
        }
      });

      // Connect to event metrics WebSocket
      const eventCleanup = eventService.connectToMetrics(streamId, mergeEventMetrics);

      // Store cleanup function
      websocketCleanupRef.current = () => {
        analyticsService.disconnectRealTimeAnalytics();
        eventCleanup();
      };

    } catch (error) {
      console.error('Failed to connect to real-time analytics:', error);
      updateData({
        isConnected: false,
        error: error instanceof Error ? error.message : 'Connection failed',
      });
    }
  }, [streamId, enableWebSocket, updateData, mergeEventMetrics]);

  // Polling fallback for when WebSocket is not available
  const startPolling = useCallback(async () => {
    if (!streamId || enableWebSocket) return;

    const pollData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch real-time analytics
        const [analyticsData, eventMetrics] = await Promise.all([
          analyticsService.getRealTimeAnalytics(streamId),
          eventService.getEventMetrics(streamId),
        ]);

        updateData({
          currentViewers: analyticsData.currentViewers,
          geographicDistribution: analyticsData.geographicDistribution,
          deviceDistribution: analyticsData.deviceDistribution,
          isConnected: true,
          error: null,
        });

        mergeEventMetrics(eventMetrics);

      } catch (error) {
        console.error('Polling error:', error);
        updateData({
          isConnected: false,
          error: error instanceof Error ? error.message : 'Polling failed',
        });
      } finally {
        setIsLoading(false);
      }
    };

    // Initial poll
    await pollData();

    // Set up polling interval
    pollingIntervalRef.current = setInterval(pollData, updateInterval);
  }, [streamId, enableWebSocket, updateInterval, updateData, mergeEventMetrics]);

  // Initialize connections
  useEffect(() => {
    if (!enabled || !streamId) return;

    if (enableWebSocket) {
      connectWebSocket();
    } else {
      startPolling();
    }

    return () => {
      // Cleanup WebSocket
      if (websocketCleanupRef.current) {
        websocketCleanupRef.current();
        websocketCleanupRef.current = null;
      }

      // Cleanup polling
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [enabled, streamId, enableWebSocket, connectWebSocket, startPolling]);

  // Manual refresh function
  const refresh = useCallback(async () => {
    if (!streamId) return;

    try {
      setIsLoading(true);
      
      const [analyticsData, eventMetrics] = await Promise.all([
        analyticsService.getRealTimeAnalytics(streamId),
        eventService.getEventMetrics(streamId),
      ]);

      updateData({
        currentViewers: analyticsData.currentViewers,
        geographicDistribution: analyticsData.geographicDistribution,
        deviceDistribution: analyticsData.deviceDistribution,
        error: null,
      });

      mergeEventMetrics(eventMetrics);

    } catch (error) {
      console.error('Manual refresh error:', error);
      updateData({
        error: error instanceof Error ? error.message : 'Refresh failed',
      });
    } finally {
      setIsLoading(false);
    }
  }, [streamId, updateData, mergeEventMetrics]);

  // Get active streams
  const getActiveStreams = useCallback(async () => {
    try {
      const liveEvents = await eventService.getEvents('live');
      return liveEvents.map(event => ({
        id: event.id,
        title: event.title,
        viewers: event.viewer_count,
        status: event.status,
        startTime: event.actual_start ? new Date(event.actual_start) : null,
      }));
    } catch (error) {
      console.error('Failed to fetch active streams:', error);
      return [];
    }
  }, []);

  return {
    data,
    isLoading,
    refresh,
    getActiveStreams,
    
    // Connection status helpers
    isConnected: data.isConnected,
    hasError: !!data.error,
    error: data.error,
    lastUpdated: data.lastUpdated,
    
    // Data helpers
    hasData: data.lastUpdated !== null,
    isEmpty: data.currentViewers === 0 && data.totalViews === 0,
  };
}

export type { RealTimeAnalyticsState, UseRealTimeAnalyticsOptions };
