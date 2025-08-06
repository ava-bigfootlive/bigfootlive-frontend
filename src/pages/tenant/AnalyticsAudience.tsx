import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import {
  Users, Globe, Smartphone, Monitor, Tablet, TrendingUp,
  TrendingDown, Clock, MapPin, Eye, Heart, RefreshCw
} from 'lucide-react';
import { analyticsService } from '@/services/analytics';
import { useRealTimeAnalytics } from '@/hooks/useRealTimeAnalytics';

// Mock audience data
const generateAudienceData = () => {
  const data = [];
  const now = new Date();
  for (let i = 24; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    data.push({
      time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      viewers: Math.floor(Math.random() * 2000) + 1000,
      newViewers: Math.floor(Math.random() * 300) + 100,
      returningViewers: Math.floor(Math.random() * 400) + 200,
      engagementRate: Math.floor(Math.random() * 30) + 60,
    });
  }
  return data;
};

// Geographic distribution
const geographicData = [
  { country: 'United States', viewers: 12845, percentage: 38.5, flag: '🇺🇸', growth: 12 },
  { country: 'United Kingdom', viewers: 5234, percentage: 15.7, flag: '🇬🇧', growth: 8 },
  { country: 'Canada', viewers: 4123, percentage: 12.4, flag: '🇨🇦', growth: 15 },
  { country: 'Germany', viewers: 3456, percentage: 10.4, flag: '🇩🇪', growth: 5 },
  { country: 'France', viewers: 2987, percentage: 9.0, flag: '🇫🇷', growth: -2 },
  { country: 'Australia', viewers: 2134, percentage: 6.4, flag: '🇦🇺', growth: 22 },
  { country: 'Japan', viewers: 1876, percentage: 5.6, flag: '🇯🇵', growth: 18 },
  { country: 'Others', viewers: 834, percentage: 2.5, flag: '🌍', growth: 7 },
];

// Device breakdown
const deviceData = [
  { name: 'Desktop', value: 45.2, count: 15067, color: '#8b5cf6' },
  { name: 'Mobile', value: 35.8, count: 11926, color: '#ec4899' },
  { name: 'Smart TV', value: 12.4, count: 4135, color: '#3b82f6' },
  { name: 'Tablet', value: 6.6, count: 2198, color: '#10b981' },
];

// Age demographics
const ageData = [
  { ageGroup: '13-17', viewers: 2456, percentage: 7.4, trend: 'up' },
  { ageGroup: '18-24', viewers: 8932, percentage: 26.8, trend: 'up' },
  { ageGroup: '25-34', viewers: 12456, percentage: 37.4, trend: 'stable' },
  { ageGroup: '35-44', viewers: 6234, percentage: 18.7, trend: 'down' },
  { ageGroup: '45-54', viewers: 2145, percentage: 6.4, trend: 'stable' },
  { ageGroup: '55+', viewers: 1101, percentage: 3.3, trend: 'up' },
];

// Watch time patterns
const watchTimeData = [
  { hour: '00', viewers: 1234, avgTime: 45 },
  { hour: '02', viewers: 892, avgTime: 52 },
  { hour: '04', viewers: 567, avgTime: 38 },
  { hour: '06', viewers: 1456, avgTime: 42 },
  { hour: '08', viewers: 2890, avgTime: 35 },
  { hour: '10', viewers: 3456, avgTime: 48 },
  { hour: '12', viewers: 4567, avgTime: 41 },
  { hour: '14', viewers: 5234, avgTime: 46 },
  { hour: '16', viewers: 6789, avgTime: 52 },
  { hour: '18', viewers: 8901, avgTime: 58 },
  { hour: '20', viewers: 12456, avgTime: 65 },
  { hour: '22', viewers: 9876, avgTime: 62 },
];

export default function AnalyticsAudience() {
  const [timeRange, setTimeRange] = useState('24h');
  const [audienceData, setAudienceData] = useState(generateAudienceData());
  const [selectedRegion, setSelectedRegion] = useState('global');
  const [activeStreams, setActiveStreams] = useState([]);
  const [selectedStream, setSelectedStream] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    data: realTimeData,
    isConnected,
    refresh: refreshRealTime,
    getActiveStreams
  } = useRealTimeAnalytics({
    streamId: selectedStream,
    enabled: !!selectedStream
  });

  // Load active streams
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const streams = await getActiveStreams();
        setActiveStreams(streams);
        
        if (streams.length > 0 && !selectedStream) {
          setSelectedStream(streams[0].id);
        }
      } catch (error) {
        console.error('Failed to load streams:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [getActiveStreams, selectedStream]);

  // Update mock data periodically (fallback)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!selectedStream) {
        setAudienceData(generateAudienceData());
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [selectedStream]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'down': return <TrendingDown className="h-3 w-3 text-red-500" />;
      default: return <div className="h-3 w-3" />;
    }
  };

  const MetricCard = ({ title, value, unit, change, icon: Icon, subtitle }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {typeof value === 'number' ? value.toLocaleString() : value}{unit}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
        {change !== undefined && (
          <div className={`flex items-center text-xs mt-2 ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
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
          <h1 className="text-3xl font-bold">Audience Analytics</h1>
          <p className="text-muted-foreground">Understand your viewers and their behavior patterns</p>
        </div>
        <div className="flex items-center gap-4">
          {activeStreams.length > 0 && (
            <Select value={selectedStream} onValueChange={setSelectedStream}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select stream" />
              </SelectTrigger>
              <SelectContent>
                {activeStreams.map((stream) => (
                  <SelectItem key={stream.id} value={stream.id}>
                    {stream.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="global">Global</SelectItem>
              <SelectItem value="us">United States</SelectItem>
              <SelectItem value="eu">Europe</SelectItem>
              <SelectItem value="apac">Asia Pacific</SelectItem>
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
          <Button
            variant="outline"
            size="sm"
            onClick={refreshRealTime}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Audience Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Viewers"
          value={realTimeData.totalViews || 33326}
          change={18}
          icon={Users}
          subtitle="Across all streams"
        />
        <MetricCard
          title="Avg Watch Time"
          value={realTimeData.avgViewDuration ? Math.round(realTimeData.avgViewDuration / 60) : 47}
          unit=" min"
          change={12}
          icon={Clock}
          subtitle="Per viewer session"
        />
        <MetricCard
          title="Current Viewers"
          value={realTimeData.currentViewers || 8934}
          change={realTimeData.currentViewers > realTimeData.peakViewers * 0.7 ? 25 : -5}
          icon={Eye}
          subtitle="Watching now"
        />
        <MetricCard
          title="Peak Viewers"
          value={realTimeData.peakViewers || 73}
          change={5}
          icon={Heart}
          subtitle="Today's highest"
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
          <TabsTrigger value="geography">Geography</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="behavior">Behavior</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Viewer Timeline */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Viewer Timeline</CardTitle>
                <CardDescription>New vs returning viewers over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={audienceData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="time" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="newViewers"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      name="New Viewers"
                    />
                    <Line
                      type="monotone"
                      dataKey="returningViewers"
                      stroke="#ec4899"
                      strokeWidth={2}
                      name="Returning Viewers"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Demographics Tab */}
        <TabsContent value="demographics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Age Distribution</CardTitle>
              <CardDescription>Viewer distribution across age groups</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ageData.map((group) => (
                  <div key={group.ageGroup} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-16 text-sm font-medium">{group.ageGroup}</div>
                      <div className="flex-1 max-w-xs">
                        <Progress value={group.percentage} className="h-2" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground w-16">{group.percentage}%</span>
                      <span className="text-sm font-medium w-20">{group.viewers.toLocaleString()}</span>
                      {getTrendIcon(group.trend)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Geography Tab */}
        <TabsContent value="geography" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Geographic Distribution</CardTitle>
              <CardDescription>Viewers by country and region</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {geographicData.map((location) => (
                  <div key={location.country} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{location.flag}</span>
                      <div>
                        <h4 className="font-medium">{location.country}</h4>
                        <p className="text-sm text-muted-foreground">{location.percentage}% of total</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-medium">{location.viewers.toLocaleString()}</span>
                      <div className={`flex items-center text-xs ${location.growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {location.growth >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                        {Math.abs(location.growth)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Devices Tab */}
        <TabsContent value="devices" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Device Distribution</CardTitle>
                <CardDescription>How viewers access your streams</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={deviceData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
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

            <Card>
              <CardHeader>
                <CardTitle>Device Details</CardTitle>
                <CardDescription>Detailed device usage statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {deviceData.map((device, index) => {
                    const icons = {
                      Desktop: Monitor,
                      Mobile: Smartphone,
                      'Smart TV': Monitor,
                      Tablet: Tablet,
                    };
                    const Icon = icons[device.name] || Monitor;
                    
                    return (
                      <div key={device.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <h4 className="font-medium">{device.name}</h4>
                            <p className="text-sm text-muted-foreground">{device.count.toLocaleString()} viewers</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={device.value} className="w-24" />
                          <span className="text-sm font-medium w-12">{device.value}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Behavior Tab */}
        <TabsContent value="behavior" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Viewing Patterns by Hour</CardTitle>
              <CardDescription>Peak viewing times and average watch duration</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={watchTimeData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="hour" className="text-xs" />
                  <YAxis yAxisId="viewers" orientation="left" className="text-xs" />
                  <YAxis yAxisId="time" orientation="right" className="text-xs" />
                  <Tooltip />
                  <Bar yAxisId="viewers" dataKey="viewers" fill="#8b5cf6" name="Concurrent Viewers" />
                  <Line yAxisId="time" dataKey="avgTime" stroke="#ec4899" strokeWidth={2} name="Avg Watch Time (min)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Engagement Insights</CardTitle>
                <CardDescription>Viewer interaction patterns</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Chat Messages</span>
                  <span className="font-medium">245,678</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Reactions</span>
                  <span className="font-medium">89,234</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Shares</span>
                  <span className="font-medium">12,456</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Follows</span>
                  <span className="font-medium">3,789</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Retention Metrics</CardTitle>
                <CardDescription>Viewer loyalty and return patterns</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">24h Return Rate</span>
                  <span className="font-medium">34.2%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">7d Return Rate</span>
                  <span className="font-medium">58.7%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">30d Return Rate</span>
                  <span className="font-medium">76.3%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Avg Sessions/User</span>
                  <span className="font-medium">4.2</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
