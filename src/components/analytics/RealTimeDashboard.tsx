import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import {
  Users, Eye, MessageSquare, Heart, Share2, Globe,
  Monitor, Smartphone, Tablet, Tv, Signal, Zap,
  Activity, TrendingUp, TrendingDown, RefreshCw,
  AlertCircle, CheckCircle, WifiOff
} from 'lucide-react';
import { useRealTimeAnalytics } from '@/hooks/useRealTimeAnalytics';

interface RealTimeDashboardProps {
  streamId?: string;
  className?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const deviceIcons = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
  'smart tv': Tv,
  tv: Tv,
};

const deviceColors = {
  desktop: '#8b5cf6',
  mobile: '#ec4899', 
  tablet: '#3b82f6',
  'smart tv': '#10b981',
  tv: '#f59e0b',
};

export default function RealTimeDashboard({ 
  streamId, 
  className = '',
  autoRefresh = true,
  refreshInterval = 5000 
}: RealTimeDashboardProps) {
  const [selectedStream, setSelectedStream] = useState<string>(streamId || '');
  const [activeStreams, setActiveStreams] = useState<Array<{
    id: string;
    title: string;
    viewers: number;
    status: string;
  }>>([]);

  const {
    data,
    isLoading,
    refresh,
    getActiveStreams,
    isConnected,
    hasError,
    error,
    lastUpdated,
    hasData
  } = useRealTimeAnalytics({
    streamId: selectedStream,
    enabled: !!selectedStream,
    updateInterval: refreshInterval,
    enableWebSocket: true,
  });

  // Load active streams on mount
  useEffect(() => {
    const loadActiveStreams = async () => {
      const streams = await getActiveStreams();
      setActiveStreams(streams);
      
      // Auto-select first stream if none selected
      if (!selectedStream && streams.length > 0) {
        setSelectedStream(streams[0].id);
      }
    };
    
    loadActiveStreams();
  }, [getActiveStreams, selectedStream]);

  // Connection status indicator
  const ConnectionStatus = () => (
    <div className="flex items-center gap-2">
      {isConnected ? (
        <>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-green-600">Live</span>
        </>
      ) : hasError ? (
        <>
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span className="text-xs text-red-600">Error</span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4 text-gray-400" />
          <span className="text-xs text-gray-500">Offline</span>
        </>
      )}
    </div>
  );

  // Format device data for charts
  const deviceChartData = Object.entries(data.deviceDistribution || {}).map(([device, count]) => ({
    name: device.charAt(0).toUpperCase() + device.slice(1),
    value: count,
    color: deviceColors[device.toLowerCase()] || '#6b7280'
  }));

  // Format geographic data for display
  const geographicData = Object.entries(data.geographicDistribution || {})
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10);

  // Metric cards configuration
  const metrics = [
    {
      title: 'Current Viewers',
      value: data.currentViewers,
      icon: Users,
      color: 'text-blue-600',
      change: data.currentViewers > data.peakViewers * 0.8 ? 'up' : 'stable'
    },
    {
      title: 'Peak Viewers',
      value: data.peakViewers,
      icon: TrendingUp,
      color: 'text-green-600',
      subtitle: 'Today\'s highest'
    },
    {
      title: 'Chat Messages',
      value: data.chatMessages,
      icon: MessageSquare,
      color: 'text-purple-600',
      change: 'up'
    },
    {
      title: 'Avg Watch Time',
      value: `${Math.round(data.avgViewDuration / 60)}m`,
      icon: Eye,
      color: 'text-orange-600',
      subtitle: 'Per viewer'
    }
  ];

  const MetricCard = ({ title, value, icon: Icon, color, change, subtitle }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
        {change && (
          <div className="flex items-center mt-2">
            {change === 'up' && <TrendingUp className="h-3 w-3 text-green-500 mr-1" />}
            {change === 'down' && <TrendingDown className="h-3 w-3 text-red-500 mr-1" />}
            <span className="text-xs text-muted-foreground">
              {change === 'up' ? 'Trending up' : change === 'down' ? 'Trending down' : 'Stable'}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (!selectedStream) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Activity className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Active Streams</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Start a live stream to see real-time analytics and viewer data.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Real-Time Analytics</h1>
          <p className="text-muted-foreground">Live streaming metrics and audience insights</p>
        </div>
        <div className="flex items-center gap-4">
          <ConnectionStatus />
          {activeStreams.length > 1 && (
            <Select value={selectedStream} onValueChange={setSelectedStream}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select stream" />
              </SelectTrigger>
              <SelectContent>
                {activeStreams.map((stream) => (
                  <SelectItem key={stream.id} value={stream.id}>
                    {stream.title} ({stream.viewers} viewers)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error State */}
      {hasError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center gap-3 pt-6">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <div>
              <p className="font-medium text-red-900">Connection Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Viewer Timeline */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Viewer Activity</CardTitle>
                <CardDescription>Real-time viewer count and chat activity</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.viewerTimeline}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="timestamp" 
                      className="text-xs"
                      tickFormatter={(value) => new Date(value).toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleTimeString()}
                    />
                    <Line
                      type="monotone"
                      dataKey="viewers"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      name="Viewers"
                      dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="chatActivity"
                      stroke="#ec4899"
                      strokeWidth={2}
                      name="Chat Messages/min"
                      dot={{ fill: '#ec4899', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Audience Tab */}
        <TabsContent value="audience" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Device Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Device Breakdown</CardTitle>
                <CardDescription>How viewers are watching</CardDescription>
              </CardHeader>
              <CardContent>
                {deviceChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={deviceChartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {deviceChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                    No device data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Geographic Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Top Locations</CardTitle>
                <CardDescription>Viewers by country/region</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {geographicData.length > 0 ? (
                    geographicData.map(([country, viewers]) => {
                      const percentage = data.currentViewers > 0 ? (viewers / data.currentViewers) * 100 : 0;
                      return (
                        <div key={country} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{country}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Progress value={percentage} className="w-20" />
                            <span className="text-sm text-muted-foreground w-12">
                              {viewers.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      No geographic data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Latency</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.latency}ms</div>
                <p className="text-xs text-muted-foreground">Average response time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bandwidth</CardTitle>
                <Signal className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(data.bandwidth / 1000).toFixed(1)} GB/h</div>
                <p className="text-xs text-muted-foreground">Data transfer rate</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Uptime</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.uptime.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">Service availability</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Engagement Tab */}
        <TabsContent value="engagement" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Chat Messages</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.chatMessages.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Total messages sent</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Reactions</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.reactions.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Likes and reactions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Shares</CardTitle>
                <Share2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.shares.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Stream shares</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Last Updated */}
      {lastUpdated && (
        <div className="text-xs text-muted-foreground text-center">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}
