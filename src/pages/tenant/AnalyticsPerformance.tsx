import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import {
  Activity, TrendingUp, TrendingDown, Zap, Clock, Globe,
  Server, Wifi, AlertTriangle, CheckCircle, Gauge, RefreshCw
} from 'lucide-react';
import { analyticsService } from '@/services/analytics';
import { eventService } from '@/services/events';
import { useRealTimeAnalytics } from '@/hooks/useRealTimeAnalytics';

// Mock performance data
const generatePerformanceData = () => {
  const data = [];
  const now = new Date();
  for (let i = 24; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    data.push({
      time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      latency: Math.floor(Math.random() * 50) + 20,
      bandwidth: Math.floor(Math.random() * 1000) + 500,
      cpu: Math.floor(Math.random() * 40) + 30,
      memory: Math.floor(Math.random() * 30) + 60,
      uptime: 99.5 + Math.random() * 0.5,
      errors: Math.floor(Math.random() * 5),
    });
  }
  return data;
};

const cdnRegions = [
  { region: 'US-East', latency: 23, uptime: 99.9, requests: 45672, status: 'excellent' },
  { region: 'US-West', latency: 18, uptime: 99.8, requests: 38291, status: 'excellent' },
  { region: 'Europe', latency: 34, uptime: 99.7, requests: 29384, status: 'good' },
  { region: 'Asia-Pacific', latency: 42, uptime: 99.6, requests: 23847, status: 'good' },
  { region: 'Latin America', latency: 38, uptime: 99.4, requests: 12936, status: 'warning' },
];

const streamQualityLevels = [
  { quality: '4K (2160p)', viewers: 8234, percentage: 23, avgBitrate: 8500 },
  { quality: 'Full HD (1080p)', viewers: 18492, percentage: 52, avgBitrate: 4500 },
  { quality: 'HD (720p)', viewers: 7394, percentage: 21, avgBitrate: 2500 },
  { quality: 'SD (480p)', viewers: 1247, percentage: 4, avgBitrate: 1000 },
];

export default function AnalyticsPerformance() {
  const [timeRange, setTimeRange] = useState('24h');
  const [performanceData, setPerformanceData] = useState(generatePerformanceData());
  const [selectedMetric, setSelectedMetric] = useState('latency');
  const [realMetrics, setRealMetrics] = useState(null);
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

  // Load active streams and real performance data
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
        setPerformanceData(generatePerformanceData());
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [selectedStream]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const MetricCard = ({ title, value, unit, change, icon: Icon, status = 'good' }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {typeof value === 'number' ? value.toLocaleString() : value}{unit && unit}
        </div>
        <div className="flex items-center justify-between mt-2">
          {change !== undefined && (
            <div className={`flex items-center text-xs ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {change >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {Math.abs(change)}% from last period
            </div>
          )}
          <Badge className={`text-xs ${getStatusColor(status)}`} variant="outline">
            {status}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance Analytics</h1>
          <p className="text-muted-foreground">Monitor streaming infrastructure and service quality</p>
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

      {/* Key Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Avg Latency"
          value={realTimeData.latency || 28}
          unit="ms"
          change={realTimeData.latency ? (realTimeData.latency < 30 ? -12 : 8) : -12}
          icon={Zap}
          status={realTimeData.latency ? (realTimeData.latency < 30 ? 'excellent' : realTimeData.latency < 50 ? 'good' : 'warning') : 'excellent'}
        />
        <MetricCard
          title="CDN Uptime"
          value={realTimeData.uptime || 99.8}
          unit="%"
          change={0.1}
          icon={Server}
          status={realTimeData.uptime ? (realTimeData.uptime > 99.5 ? 'excellent' : realTimeData.uptime > 99 ? 'good' : 'warning') : 'excellent'}
        />
        <MetricCard
          title="Bandwidth Usage"
          value={realTimeData.bandwidth ? (realTimeData.bandwidth / 1000).toFixed(1) : 1.2}
          unit={realTimeData.bandwidth ? " GB/h" : " TB/h"}
          change={15}
          icon={Wifi}
          status="good"
        />
        <MetricCard
          title="Error Rate"
          value={realTimeData.errorRate || 0.03}
          unit="%"
          change={-45}
          icon={AlertTriangle}
          status={realTimeData.errorRate ? (realTimeData.errorRate < 0.1 ? 'excellent' : realTimeData.errorRate < 0.5 ? 'good' : 'warning') : 'excellent'}
        />
      </div>

      <Tabs defaultValue="infrastructure" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
          <TabsTrigger value="cdn">CDN Performance</TabsTrigger>
          <TabsTrigger value="quality">Stream Quality</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        {/* Infrastructure Tab */}
        <TabsContent value="infrastructure" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* System Performance */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>System Performance Metrics</CardTitle>
                <CardDescription>Real-time infrastructure monitoring</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex gap-2">
                  <Button
                    variant={selectedMetric === 'latency' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedMetric('latency')}
                  >
                    Latency
                  </Button>
                  <Button
                    variant={selectedMetric === 'bandwidth' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedMetric('bandwidth')}
                  >
                    Bandwidth
                  </Button>
                  <Button
                    variant={selectedMetric === 'cpu' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedMetric('cpu')}
                  >
                    CPU Usage
                  </Button>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="time" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey={selectedMetric}
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      dot={{ fill: '#8b5cf6', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* CDN Performance Tab */}
        <TabsContent value="cdn" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>CDN Regional Performance</CardTitle>
              <CardDescription>Performance metrics across global CDN regions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cdnRegions.map((region) => (
                  <div key={region.region} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Globe className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">{region.region}</h4>
                        <p className="text-sm text-muted-foreground">{region.requests.toLocaleString()} requests</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Latency</div>
                        <div className="font-medium">{region.latency}ms</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Uptime</div>
                        <div className="font-medium">{region.uptime}%</div>
                      </div>
                      <Badge className={`${getStatusColor(region.status)}`} variant="outline">
                        {region.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stream Quality Tab */}
        <TabsContent value="quality" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Stream Quality Distribution</CardTitle>
                <CardDescription>Viewer distribution across quality levels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {streamQualityLevels.map((level) => (
                    <div key={level.quality} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{level.quality}</span>
                        <span className="text-sm text-muted-foreground">{level.viewers.toLocaleString()} viewers</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={level.percentage} className="flex-1" />
                        <span className="text-sm text-muted-foreground w-12">{level.percentage}%</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Avg bitrate: {level.avgBitrate.toLocaleString()} kbps
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quality Metrics</CardTitle>
                <CardDescription>Stream delivery performance indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Gauge className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Buffer Health</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={95} className="w-24" />
                      <span className="text-sm font-medium">95%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Stream Stability</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={98} className="w-24" />
                      <span className="text-sm font-medium">98%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Start Time</span>
                    </div>
                    <span className="text-sm font-medium">2.1s</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Rebuffer Rate</span>
                    </div>
                    <span className="text-sm font-medium">0.8%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
              <CardDescription>Recent performance alerts and notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 border rounded-lg bg-green-50">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div className="flex-1">
                    <h4 className="font-medium">All Systems Operational</h4>
                    <p className="text-sm text-muted-foreground">All monitoring systems are running normally</p>
                  </div>
                  <span className="text-sm text-muted-foreground">2 min ago</span>
                </div>
                
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <div className="flex-1">
                    <h4 className="font-medium">High Bandwidth Usage</h4>
                    <p className="text-sm text-muted-foreground">Bandwidth usage is 15% above normal - monitoring closely</p>
                  </div>
                  <span className="text-sm text-muted-foreground">15 min ago</span>
                </div>

                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div className="flex-1">
                    <h4 className="font-medium">Latency Improved</h4>
                    <p className="text-sm text-muted-foreground">Average latency decreased by 12% after infrastructure upgrade</p>
                  </div>
                  <span className="text-sm text-muted-foreground">1 hour ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
