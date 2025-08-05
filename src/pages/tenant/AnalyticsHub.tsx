import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  Activity, TrendingUp, TrendingDown, Users, Clock, DollarSign,
  Download, Globe, AlertCircle, CheckCircle, PlayCircle
} from 'lucide-react';
import { authService } from '@/lib/auth';
import { eventService } from '@/services/events';

// Mock real-time data generator
const generateRealtimeData = () => ({
  currentViewers: Math.floor(Math.random() * 5000) + 1000,
  peakViewers: Math.floor(Math.random() * 8000) + 3000,
  avgWatchTime: Math.floor(Math.random() * 45) + 15,
  totalWatchHours: Math.floor(Math.random() * 10000) + 5000,
  activeStreams: Math.floor(Math.random() * 20) + 5,
  revenue: Math.floor(Math.random() * 5000) + 2000,
  engagement: Math.floor(Math.random() * 30) + 70,
  buffering: Math.random() * 2 + 0.5,
});

// Time series data
const generateTimeSeriesData = () => {
  const data = [];
  const now = new Date();
  for (let i = 24; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    data.push({
      time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      viewers: Math.floor(Math.random() * 3000) + 1000,
      bandwidth: Math.floor(Math.random() * 500) + 200,
      cpu: Math.floor(Math.random() * 40) + 30,
      revenue: Math.floor(Math.random() * 200) + 50,
    });
  }
  return data;
};

// Geographic distribution data
const geoData = [
  { country: 'United States', viewers: 4532, percentage: 35 },
  { country: 'United Kingdom', viewers: 2341, percentage: 18 },
  { country: 'Canada', viewers: 1876, percentage: 14 },
  { country: 'Germany', viewers: 1234, percentage: 10 },
  { country: 'France', viewers: 987, percentage: 8 },
  { country: 'Others', viewers: 1930, percentage: 15 },
];

// Device distribution
const deviceData = [
  { name: 'Desktop', value: 45, color: '#8b5cf6' },
  { name: 'Mobile', value: 35, color: '#ec4899' },
  { name: 'Smart TV', value: 15, color: '#3b82f6' },
  { name: 'Tablet', value: 5, color: '#10b981' },
];

// Stream quality metrics
const qualityMetrics = [
  { metric: 'Uptime', value: 99.8, status: 'excellent', icon: CheckCircle },
  { metric: 'Buffering Rate', value: 0.8, status: 'good', icon: AlertCircle },
  { metric: 'Start Time', value: 2.1, status: 'good', icon: PlayCircle },
  { metric: 'Error Rate', value: 0.02, status: 'excellent', icon: AlertCircle },
];

export default function AnalyticsHub() {
  const [timeRange, setTimeRange] = useState('24h');
  const [realtimeData, setRealtimeData] = useState(generateRealtimeData());
  const [timeSeriesData, setTimeSeriesData] = useState(generateTimeSeriesData());
  const [selectedStream, setSelectedStream] = useState('all');
  const [wsConnected, setWsConnected] = useState(false);
  const [activeStreams, setActiveStreams] = useState<Array<{id: string; title: string}>>([]);
  const [streamMetrics, setStreamMetrics] = useState<Partial<EventMetrics> | null>(null);
  const streamMetricsCleanupRef = useRef<(() => void) | null>(null);

  // Connect to real-time analytics WebSocket
  useEffect(() => {
    let ws: WebSocket | null = null;
    let heartbeatInterval: NodeJS.Timeout | null = null;
    let fallbackInterval: NodeJS.Timeout | null = null;

    const connectWebSocket = async () => {
      const token = await authService.getAccessToken();
      if (!token) return;

      const baseUrl = import.meta.env.VITE_API_URL || 'https://bigfootlive.io';
      const wsUrl = baseUrl.replace('http://', 'ws://').replace('https://', 'wss://');
      ws = new WebSocket(`${wsUrl}/api/ws/analytics/realtime?token=${token}`);

      ws.onopen = () => {
        console.log('Analytics WebSocket connected');
        setWsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'analytics') {
            // Update real-time data from WebSocket
            setRealtimeData(prev => ({
              ...prev,
              currentViewers: data.data.totalViewers || prev.currentViewers,
              activeStreams: data.data.activeStreams || prev.activeStreams,
              revenue: data.data.revenueToday || prev.revenue,
              engagement: data.data.avgEngagement || prev.engagement,
              buffering: data.data.errorRate || prev.buffering,
            }));

            // Update time series with new data point
            setTimeSeriesData(prev => {
              const newData = [...prev.slice(1)];
              const lastTime = new Date();
              newData.push({
                time: lastTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                viewers: data.data.totalViewers || 0,
                bandwidth: Math.floor(data.data.serverLoad * 10) || 0,
                cpu: data.data.serverLoad || 0,
                revenue: data.data.revenueToday || 0,
              });
              return newData;
            });
          }
        } catch (error) {
          console.error('Failed to parse analytics data:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('Analytics WebSocket error:', error);
        setWsConnected(false);
      };

      ws.onclose = () => {
        console.log('Analytics WebSocket disconnected');
        setWsConnected(false);
      };

      // Send heartbeat every 25 seconds
      heartbeatInterval = setInterval(() => {
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'heartbeat' }));
        }
      }, 25000);

      // Fallback to simulated data if WebSocket fails
      fallbackInterval = setInterval(() => {
        if (!wsConnected) {
          setRealtimeData(generateRealtimeData());
        }
      }, 5000);
    };

    connectWebSocket();

    return () => {
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      if (fallbackInterval) clearInterval(fallbackInterval);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [wsConnected]);

  // Connect to stream-specific metrics when a stream is selected
  useEffect(() => {
    // Clean up previous connection
    if (streamMetricsCleanupRef.current) {
      streamMetricsCleanupRef.current();
      streamMetricsCleanupRef.current = null;
    }

    if (selectedStream && selectedStream !== 'all') {
      // Connect to stream metrics WebSocket
      const cleanup = eventService.connectToMetrics(selectedStream, (metrics) => {
        setStreamMetrics(metrics);
        
        // Update real-time data with stream-specific metrics
        setRealtimeData(prev => ({
          ...prev,
          currentViewers: metrics.currentViewers || prev.currentViewers,
          engagement: metrics.quality || prev.engagement,
          buffering: metrics.buffering || prev.buffering,
        }));
      });

      streamMetricsCleanupRef.current = cleanup;
    } else {
      setStreamMetrics(null);
    }

    return () => {
      if (streamMetricsCleanupRef.current) {
        streamMetricsCleanupRef.current();
      }
    };
  }, [selectedStream]);

  // Fetch active streams on mount
  useEffect(() => {
    const fetchStreams = async () => {
      try {
        const streams = await eventService.getEvents('live');
        setActiveStreams(streams);
      } catch (error) {
        console.error('Failed to fetch active streams:', error);
      }
    };

    fetchStreams();
    // Refresh every 30 seconds
    const interval = setInterval(fetchStreams, 30000);
    return () => clearInterval(interval);
  }, []);

  const MetricCard = ({ title, value, change, icon: Icon, prefix = '', suffix = '' }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
        </div>
        {change !== undefined && (
          <div className={`flex items-center text-xs ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {change >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
            {Math.abs(change)}% from last period
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Hub</h1>
          <p className="text-muted-foreground">Real-time streaming analytics and insights</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedStream} onValueChange={setSelectedStream}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select stream" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Streams</SelectItem>
              {activeStreams.map((stream) => (
                <SelectItem key={stream.id} value={stream.id}>
                  {stream.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Real-time Status Bar */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10">
        <CardContent className="flex items-center justify-between p-6">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 ${wsConnected ? 'bg-green-500' : 'bg-yellow-500'} rounded-full animate-pulse`} />
              <span className="font-medium">{wsConnected ? 'Live Data' : 'Simulated Data'}</span>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Active Streams:</span>
              <span className="ml-2 font-bold">{realtimeData.activeStreams}</span>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Total Viewers:</span>
              <span className="ml-2 font-bold">{realtimeData.currentViewers.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">System Health:</span>
              <Badge className="ml-2" variant="outline">
                <CheckCircle className="h-3 w-3 mr-1" />
                Excellent
              </Badge>
            </div>
          </div>
          <Button size="sm">View Live Dashboard</Button>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Current Viewers"
          value={realtimeData.currentViewers}
          change={12}
          icon={Users}
        />
        <MetricCard
          title="Avg. Watch Time"
          value={realtimeData.avgWatchTime}
          change={5}
          icon={Clock}
          suffix=" min"
        />
        <MetricCard
          title="Revenue"
          value={realtimeData.revenue}
          change={-3}
          icon={DollarSign}
          prefix="$"
        />
        <MetricCard
          title="Engagement Rate"
          value={realtimeData.engagement}
          change={8}
          icon={Activity}
          suffix="%"
        />
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="realtime" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="realtime">Real-time</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        {/* Real-time Tab */}
        <TabsContent value="realtime" className="space-y-4">
          {/* Stream-specific metrics if a stream is selected */}
          {selectedStream !== 'all' && streamMetrics && (
            <Card className="border-purple-500/20 bg-purple-50/5">
              <CardHeader>
                <CardTitle>Live Stream Metrics</CardTitle>
                <CardDescription>Real-time data for selected stream</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-5">
                  <div>
                    <div className="text-sm text-muted-foreground">Current Viewers</div>
                    <div className="text-2xl font-bold">{streamMetrics.currentViewers || 0}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Peak Viewers</div>
                    <div className="text-2xl font-bold">{streamMetrics.peakViewers || 0}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Chat Messages</div>
                    <div className="text-2xl font-bold">{streamMetrics.chatMessages || 0}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Stream Quality</div>
                    <div className="text-2xl font-bold">{streamMetrics.quality || 100}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Bandwidth</div>
                    <div className="text-2xl font-bold">{((streamMetrics.bandwidth || 0) / 1000).toFixed(1)} Mbps</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {/* Viewer Timeline */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Viewer Timeline</CardTitle>
                <CardDescription>Real-time viewer count over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={timeSeriesData}>
                    <defs>
                      <linearGradient id="viewerGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="viewers"
                      stroke="#8b5cf6"
                      fillOpacity={1}
                      fill="url(#viewerGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Stream Health Metrics */}
          <div className="grid gap-4 md:grid-cols-4">
            {qualityMetrics.map((metric) => (
              <Card key={metric.metric}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">{metric.metric}</CardTitle>
                    <metric.icon 
                      className={`h-4 w-4 ${
                        metric.status === 'excellent' ? 'text-green-500' : 'text-yellow-500'
                      }`} 
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metric.value}{metric.metric.includes('Rate') || metric.metric === 'Uptime' ? '%' : 's'}
                  </div>
                  <Progress 
                    value={metric.metric === 'Uptime' ? metric.value : 100 - metric.value * 10} 
                    className="mt-2 h-2"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Audience Tab */}
        <TabsContent value="audience" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Geographic Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
                <CardDescription>Viewers by country</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={geoData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="country" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="viewers" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Device Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Device Distribution</CardTitle>
                <CardDescription>Viewing devices breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={deviceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name} ${entry.value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {deviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Audience Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Audience Insights</CardTitle>
              <CardDescription>Key viewer behavior patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Peak Viewing Hours</div>
                  <div className="text-2xl font-bold">7PM - 10PM EST</div>
                  <div className="text-xs text-muted-foreground">65% of daily traffic</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Avg. Session Duration</div>
                  <div className="text-2xl font-bold">32 minutes</div>
                  <div className="text-xs text-green-500">+15% from last month</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Returning Viewers</div>
                  <div className="text-2xl font-bold">78%</div>
                  <div className="text-xs text-green-500">+5% from last month</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Bandwidth Usage */}
            <Card>
              <CardHeader>
                <CardTitle>Bandwidth Usage</CardTitle>
                <CardDescription>Network throughput over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="bandwidth" stroke="#ec4899" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* CPU Usage */}
            <Card>
              <CardHeader>
                <CardTitle>CPU Usage</CardTitle>
                <CardDescription>Server CPU utilization</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="cpu" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* CDN Performance */}
          <Card>
            <CardHeader>
              <CardTitle>CDN Performance</CardTitle>
              <CardDescription>Content delivery metrics by region</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['North America', 'Europe', 'Asia Pacific', 'South America'].map((region) => (
                  <div key={region} className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{region}</div>
                        <Progress value={Math.random() * 40 + 60} className="mt-1 h-2" />
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground ml-4">
                      {(Math.random() * 50 + 10).toFixed(1)}ms
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$47,892</div>
                <div className="text-xs text-green-500">+23% from last month</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg. Revenue per Stream</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$2,394</div>
                <div className="text-xs text-green-500">+8% from last month</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3.8%</div>
                <div className="text-xs text-red-500">-0.5% from last month</div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
              <CardDescription>Daily revenue over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={timeSeriesData}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value}`} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#revenueGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}