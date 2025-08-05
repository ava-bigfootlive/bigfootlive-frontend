import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  Users, 
  Clock, 
  Monitor, 
  Globe, 
  MessageCircle, 
  TrendingUp,
  Eye,
  PlayCircle,
  Activity
} from 'lucide-react';
import { analyticsService } from '@/services/analytics';
import type { AnalyticsSummary, StreamingMetrics, RealTimeAnalytics } from '@/types/analytics';
import { useToast } from '@/components/ui/use-toast';

interface AnalyticsDashboardProps {
  streamId?: string;
  className?: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ 
  streamId, 
  className = '' 
}) => {
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'year'>('today');
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [topStreams, setTopStreams] = useState<StreamingMetrics[]>([]);
  const [realTimeData, setRealTimeData] = useState<RealTimeAnalytics | null>(null);
  const [geographicData, setGeographicData] = useState<{
    countries: Record<string, number>;
    regions: Record<string, number>;
    cities: Record<string, { count: number; lat: number; lng: number }>;
  } | null>(null);
  const [deviceData, setDeviceData] = useState<{
    devices: Record<string, number>;
    browsers: Record<string, number>;
    operatingSystems: Record<string, number>;
    screenResolutions: Record<string, number>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadAnalyticsData();
  }, [period, streamId, loadAnalyticsData]);

  useEffect(() => {
    if (streamId) {
      // Connect to real-time analytics for specific stream
      analyticsService.connectRealTimeAnalytics(streamId, setRealTimeData);
      
      return () => {
        analyticsService.disconnectRealTimeAnalytics();
      };
    }
  }, [streamId]);

  const loadAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      
      const [summaryData, topStreamsData, geoData, devData] = await Promise.all([
        analyticsService.getAnalyticsSummary(period),
        analyticsService.getTopStreams(period),
        analyticsService.getGeographicData(streamId, period),
        analyticsService.getDeviceAnalytics(streamId, period)
      ]);

      setSummary(summaryData);
      setTopStreams(topStreamsData);
      setGeographicData(geoData);
      setDeviceData(devData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load analytics data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [period, streamId, toast]);

  const handleExport = async (format: 'csv' | 'json' | 'pdf') => {
    try {
      const blob = await analyticsService.exportAnalytics(format, {
        dateRange: {
          start: new Date(new Date().setDate(new Date().getDate() - 30)),
          end: new Date()
        }
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Export Complete',
        description: `Analytics data exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export analytics data',
        variant: 'destructive',
      });
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 bg-gray-200 rounded"></div>
            <div className="h-80 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">
            {streamId ? 'Stream Analytics' : 'Platform Overview'}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Select value={period} onValueChange={(value: 'today' | 'week' | 'month' | 'year') => setPeriod(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={handleExport}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Export" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">Export CSV</SelectItem>
              <SelectItem value="json">Export JSON</SelectItem>
              <SelectItem value="pdf">Export PDF</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Real-time Status (for specific stream) */}
      {streamId && realTimeData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-red-500" />
              Live Stream Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {formatNumber(realTimeData.currentViewers)}
                </div>
                <div className="text-sm text-gray-600">Current Viewers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Object.values(realTimeData.qualityDistribution)
                    .reduce((a, b) => a + b, 0)}
                </div>
                <div className="text-sm text-gray-600">Quality Streams</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Object.values(realTimeData.geographicDistribution).length}
                </div>
                <div className="text-sm text-gray-600">Countries</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Object.values(realTimeData.deviceDistribution)
                    .reduce((a, b) => a + b, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Devices</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Streams</p>
                  <p className="text-3xl font-bold">{formatNumber(summary.totalStreams)}</p>
                </div>
                <PlayCircle className="h-8 w-8 text-blue-600" />
              </div>
              <div className="flex items-center mt-4">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">
                  +{summary.growthMetrics.streamGrowth.toFixed(1)}%
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Viewers</p>
                  <p className="text-3xl font-bold">{formatNumber(summary.totalViewers)}</p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <div className="flex items-center mt-4">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">
                  +{summary.growthMetrics.viewerGrowth.toFixed(1)}%
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Watch Time</p>
                  <p className="text-3xl font-bold">{formatDuration(summary.totalViewTime * 3600)}</p>
                </div>
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
              <div className="flex items-center mt-4">
                <Eye className="h-4 w-4 text-blue-500 mr-1" />
                <span className="text-sm text-blue-600">
                  Avg: {formatNumber(summary.averageViewersPerStream)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Engagement</p>
                  <p className="text-3xl font-bold">
                    {summary.growthMetrics.engagementGrowth.toFixed(1)}%
                  </p>
                </div>
                <MessageCircle className="h-8 w-8 text-orange-600" />
              </div>
              <div className="flex items-center mt-4">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">
                  Growth Rate
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Streams */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Streams</CardTitle>
            <CardDescription>Streams with highest viewer count ({period})</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topStreams.slice(0, 5).map((stream, index) => (
                <div key={stream.streamId} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium truncate max-w-40">{stream.title}</p>
                      <p className="text-sm text-gray-600">
                        {formatDuration(stream.duration)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatNumber(stream.peakViewers)}</p>
                    <p className="text-sm text-gray-600">peak viewers</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Geographic Distribution */}
        {geographicData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Geographic Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={Object.entries(geographicData.countries).map(([country, count]) => ({
                      name: country,
                      value: count
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {Object.entries(geographicData.countries).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Analytics */}
        {deviceData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Device Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={Object.entries(deviceData.devices).map(([device, count]) => ({
                  device,
                  count
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="device" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Browser Distribution */}
        {deviceData && (
          <Card>
            <CardHeader>
              <CardTitle>Browser Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(deviceData.browsers)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 5)
                  .map(([browser, count]) => {
                    const total = Object.values(deviceData.browsers).reduce((a, b) => a + b, 0);
                    const percentage = ((count / total) * 100).toFixed(1);
                    
                    return (
                      <div key={browser} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          <span className="font-medium">{browser}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">{percentage}%</span>
                          <Badge variant="secondary">{formatNumber(count)}</Badge>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Real-time viewer chart for specific stream */}
      {streamId && realTimeData && (
        <Card>
          <CardHeader>
            <CardTitle>Real-time Viewer Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={realTimeData.viewersOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={(time) => new Date(time).toLocaleTimeString()}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(time) => new Date(time).toLocaleTimeString()}
                />
                <Area 
                  type="monotone" 
                  dataKey="viewers" 
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
