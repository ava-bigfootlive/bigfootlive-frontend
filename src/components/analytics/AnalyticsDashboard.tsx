import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import { DateRange } from 'react-day-picker';
import { analyticsService } from '@/services/analyticsService';
import type { ComprehensiveAnalytics, HistoricalAnalytics, AnalyticsFilter } from '@/types/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { OverviewStats } from './OverviewStats';
import { DashboardSkeleton } from './DashboardSkeleton';
import { AnalyticsError } from './AnalyticsError';
import { EmptyState } from './EmptyState';
import { ComponentLoader } from './ComponentLoader';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Lazy load analytics components for better performance
const RevenueDashboard = lazy(() => import('./RevenueDashboard').then(module => ({ default: module.RevenueDashboard })));
const ViewershipDashboard = lazy(() => import('./ViewershipDashboard').then(module => ({ default: module.ViewershipDashboard })));
const EngagementDashboard = lazy(() => import('./EngagementDashboard').then(module => ({ default: module.EngagementDashboard })));
const PerformanceDashboard = lazy(() => import('./PerformanceDashboard').then(module => ({ default: module.PerformanceDashboard })));
const RealTimeMonitor = lazy(() => import('./RealTimeMonitor').then(module => ({ default: module.RealTimeMonitor })));
const GoalsDashboard = lazy(() => import('./GoalsDashboard').then(module => ({ default: module.GoalsDashboard })));
const AlertsDashboard = lazy(() => import('./AlertsDashboard').then(module => ({ default: module.AlertsDashboard })));

interface AnalyticsDashboardProps {
  channelId: string;
  initialStreamId?: string;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ channelId, initialStreamId }) => {
  const [streamId, setStreamId] = useState<string | undefined>(initialStreamId);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 7)),
    to: new Date(),
  });
  const [analytics, setAnalytics] = useState<ComprehensiveAnalytics | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filter = useMemo((): AnalyticsFilter | null => {
    if (dateRange?.from && dateRange?.to) {
      return { dateRange: { start: dateRange.from, end: dateRange.to } };
    }
    return null;
  }, [dateRange]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (streamId && filter) {
          const data = await analyticsService.getComprehensiveAnalytics(streamId, filter);
          setAnalytics(data);
        } else if (filter) {
          const historical = await analyticsService.getHistoricalAnalytics(channelId, filter);
          setHistoricalData(historical);
          setAnalytics(null); // Clear single-stream analytics
        }
      } catch (e) {
        setError('Failed to load analytics data. Please try again later.');
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [streamId, filter, channelId]);

  const handleStreamSelect = (newStreamId: string) => {
    if (newStreamId === 'all') {
      setStreamId(undefined);
    } else {
      setStreamId(newStreamId);
    }
  };

  const handleRetry = () => {
    setError(null);
    // The useEffect will trigger a refetch when error is cleared
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <AnalyticsError
        title="Analytics Data Unavailable"
        message={error}
        onRetry={handleRetry}
      />
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <div className="flex items-center gap-4">
          {historicalData && (
            <Select onValueChange={handleStreamSelect} defaultValue={streamId || 'all'}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a stream" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Streams</SelectItem>
                {historicalData.streams.map(s => (
                  <SelectItem key={s.streamId} value={s.streamId}>
                    {s.overview.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <DateRangePicker onUpdate={({ range }) => setDateRange(range)} />
        </div>
      </header>

      {analytics && (
        <OverviewStats overview={analytics.overview} />
      )}
      
      {historicalData && !streamId && (
        <OverviewStats overview={historicalData.aggregated as any} />
      )}

      <Tabs defaultValue="viewership" className="w-full">
        <TabsList>
          <TabsTrigger value="real-time">Real-Time</TabsTrigger>
          <TabsTrigger value="viewership">Viewership</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="real-time">
          {streamId ? (
            <Suspense fallback={<ComponentLoader message="Loading real-time data..." />}>
              <RealTimeMonitor streamId={streamId} />
            </Suspense>
          ) : (
            <EmptyState
              title="Select a Stream"
              message="Choose a specific stream from the dropdown above to view real-time analytics data."
            />
          )}
        </TabsContent>
        
        <TabsContent value="viewership">
          <Suspense fallback={<ComponentLoader message="Loading viewership data..." />}>
            {analytics ? (
              <ViewershipDashboard audience={analytics.audience} overview={analytics.overview} />
            ) : historicalData ? (
              <ViewershipDashboard trends={historicalData.trends} aggregated={historicalData.aggregated} />
            ) : (
              <EmptyState
                message="No viewership data available for the selected time period. Try selecting a different date range."
              />
            )}
          </Suspense>
        </TabsContent>
        
        <TabsContent value="revenue">
          <Suspense fallback={<ComponentLoader message="Loading revenue data..." />}>
            {analytics ? (
              <RevenueDashboard revenue={analytics.revenue} />
            ) : historicalData ? (
              <RevenueDashboard trends={historicalData.trends} aggregated={historicalData.aggregated} />
            ) : (
              <EmptyState
                message="No revenue data available for the selected time period. Try selecting a different date range."
              />
            )}
          </Suspense>
        </TabsContent>

        <TabsContent value="engagement">
          <Suspense fallback={<ComponentLoader message="Loading engagement data..." />}>
            {analytics ? (
              <EngagementDashboard chat={analytics.chat} audience={analytics.audience} />
            ) : historicalData ? (
              <EngagementDashboard trends={historicalData.trends} aggregated={historicalData.aggregated} />
            ) : (
              <EmptyState
                message="No engagement data available for the selected time period. Try selecting a different date range."
              />
            )}
          </Suspense>
        </TabsContent>
        
        <TabsContent value="performance">
          <Suspense fallback={<ComponentLoader message="Loading performance data..." />}>
            {analytics ? (
              <PerformanceDashboard performance={analytics.performance} />
            ) : (
              <EmptyState
                title="Performance Metrics"
                message="Performance metrics are available when viewing data for a specific stream. Select a stream from the dropdown to see detailed performance data."
              />
            )}
          </Suspense>
        </TabsContent>
        
        <TabsContent value="goals">
          <Suspense fallback={<ComponentLoader message="Loading goals dashboard..." />}>
            <GoalsDashboard channelId={channelId} />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="alerts">
          <Suspense fallback={<ComponentLoader message="Loading alerts dashboard..." />}>
            <AlertsDashboard channelId={channelId} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
};
