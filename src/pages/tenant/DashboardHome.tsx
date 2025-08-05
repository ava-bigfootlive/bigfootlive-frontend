import React, { useState, useEffect } from 'react';
import { Activity, AlertCircle, ArrowDownRight, ArrowUpRight, BarChart3, Calendar, CheckCircle, Clock, DollarSign, Eye, MoreHorizontal, PlayCircle, TrendingUp, Users, Video, Wifi, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
// import { TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { eventService, type StreamEvent } from '@/services/events';
import { useNavigate } from 'react-router-dom';
import { notify } from '@/hooks/useNotifications';

// Metric Card Component
interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  description?: string;
  color?: 'default' | 'success' | 'warning' | 'danger';
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  trend = 'neutral',
  description,
  color = 'default'
}) => {
  const colorClasses = {
    default: 'text-muted-foreground',
    success: 'text-success',
    warning: 'text-warning',
    danger: 'text-danger'
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={cn("h-4 w-4", colorClasses[color])} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {change !== undefined && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
            {trend === 'up' ? (
              <ArrowUpRight className="h-3 w-3 text-success" />
            ) : trend === 'down' ? (
              <ArrowDownRight className="h-3 w-3 text-danger" />
            ) : null}
            <span className={cn(
              trend === 'up' ? 'text-success' : 
              trend === 'down' ? 'text-danger' : 
              'text-muted-foreground'
            )}>
              {change > 0 ? '+' : ''}{change}%
            </span>
            <span>from last period</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
};

// Stream Card Component
const StreamCard: React.FC<{ stream: StreamEvent; onUpdate: () => void }> = ({ stream, onUpdate }) => {
  const navigate = useNavigate();
  // const __getStatusColor = (status: string) => {
  //   switch (status) {
  //     case 'live':
  //       return 'destructive';
  //     case 'scheduled':
  //       return 'secondary';
  //     case 'ended':
  //       return 'outline';
  //     default:
  //       return 'default';
  //   }
  // };

  const handleEndStream = async () => {
    try {
      await eventService.endStream(stream.id);
      notify.success('Stream ended successfully');
      onUpdate();
    } catch {
      notify.error('Failed to end stream');
    }
  };

  const getDuration = () => {
    if (stream.status === 'live' && stream.actual_start) {
      const start = new Date(stream.actual_start).getTime();
      const now = Date.now();
      const diff = Math.floor((now - start) / 1000);
      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      return hours > 0 ? `${hours}:${minutes.toString().padStart(2, '0')}` : `${minutes} min`;
    }
    if (stream.status === 'ended' && stream.actual_start && stream.actual_end) {
      const start = new Date(stream.actual_start).getTime();
      const end = new Date(stream.actual_end).getTime();
      const diff = Math.floor((end - start) / 1000);
      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;
      return hours > 0 ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}` : `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    return 'Not started';
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/tenant/live/stream/${stream.id}`)}>
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Thumbnail */}
          <div className="relative w-32 h-20 bg-muted rounded-md overflow-hidden flex-shrink-0">
            {stream.thumbnail_url ? (
              <img src={stream.thumbnail_url} alt={stream.title} className="object-cover w-full h-full" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Video className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            {stream.status === 'live' && (
              <div className="absolute top-2 left-2">
                <Badge variant="destructive" className="h-5">
                  <span className="animate-pulse mr-1">●</span> LIVE
                </Badge>
              </div>
            )}
            {stream.status === 'scheduled' && (
              <div className="absolute top-2 left-2">
                <Badge variant="secondary" className="h-5">
                  SCHEDULED
                </Badge>
              </div>
            )}
          </div>

          {/* Stream Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-sm font-medium truncate">{stream.title}</h4>
                <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {stream.viewer_count.toLocaleString()} {stream.status === 'live' ? 'watching' : 'views'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {getDuration()}
                  </span>
                  {stream.tags?.length > 0 && (
                    <span className="text-xs">
                      {stream.tags[0]}
                    </span>
                  )}
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/tenant/live/stream/${stream.id}`);
                  }}>View Details</DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/tenant/analytics?eventId=${stream.id}`);
                  }}>Analytics</DropdownMenuItem>
                  {stream.status === 'live' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-danger" onClick={(e) => {
                        e.stopPropagation();
                        handleEndStream();
                      }}>End Stream</DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {stream.status === 'live' && (
              <Progress value={50} className="h-1 mt-2" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Quick Stats Component
const QuickStats: React.FC = () => {
  const stats = [
    { label: 'Total Watch Time', value: '2.4M hrs', icon: Clock, change: 12 },
    { label: 'Unique Viewers', value: '845K', icon: Users, change: 8 },
    { label: 'Avg. View Duration', value: '42 min', icon: Eye, change: -3 },
    { label: 'Revenue', value: '$124,532', icon: DollarSign, change: 23 },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <MetricCard
          key={index}
          title={stat.label}
          value={stat.value}
          icon={stat.icon}
          change={stat.change}
          trend={stat.change > 0 ? 'up' : 'down'}
        />
      ))}
    </div>
  );
};

// Main Dashboard Component
export default function DashboardHome() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [metricsConnections, setMetricsConnections] = useState<Map<string, () => void>>(new Map());

  const fetchEvents = async () => {
    try {
      const allEvents = await eventService.getEvents();
      setEvents(allEvents);
      
      // Set up real-time metrics for live events
      const liveEvents = allEvents.filter(e => e.status === 'live');
      const newConnections = new Map<string, () => void>();
      
      liveEvents.forEach(event => {
        if (!metricsConnections.has(event.id)) {
          const cleanup = eventService.connectToMetrics(event.id, (metrics) => {
            setEvents(prev => prev.map(e => 
              e.id === event.id 
                ? { ...e, viewer_count: metrics.currentViewers || e.viewer_count, peak_viewers: metrics.peakViewers || e.peak_viewers } 
                : e
            ));
          });
          newConnections.set(event.id, cleanup);
        }
      });
      
      // Clean up old connections
      metricsConnections.forEach((cleanup, id) => {
        if (!newConnections.has(id)) {
          cleanup();
        }
      });
      
      setMetricsConnections(newConnections);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      notify.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 30000); // Refresh every 30 seconds
    
    return () => {
      clearInterval(interval);
      // Clean up all WebSocket connections
      metricsConnections.forEach(cleanup => cleanup());
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Chart data
  const viewershipData = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    viewers: Math.floor(Math.random() * 3000) + 1000,
    revenue: Math.floor(Math.random() * 500) + 100}));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your streams today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Last 7 days
          </Button>
          <Button size="sm" onClick={() => navigate('/tenant/live/new')}>
            <Zap className="h-4 w-4 mr-2" />
            Go Live
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <QuickStats />

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Left Column - Streams & Activity */}
        <div className="lg:col-span-4 space-y-6">
          {/* Active Streams */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Active Streams</CardTitle>
                  <CardDescription>Currently broadcasting and scheduled</CardDescription>
                </div>
                <Button variant="outline" size="sm">View All</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : events.length === 0 ? (
                <div className="text-center py-8">
                  <Video className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">No streams yet</p>
                  <Button variant="outline" size="sm" className="mt-3" onClick={() => navigate('/tenant/live/new')}>
                    Create your first stream
                  </Button>
                </div>
              ) : (
                events.map(event => (
                  <StreamCard key={event.id} stream={event} onUpdate={fetchEvents} />
                ))
              )}
            </CardContent>
          </Card>

          {/* Viewership Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Viewership Trends</CardTitle>
              <CardDescription>Concurrent viewers over the last 24 hours</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={viewershipData}>
                  <defs>
                    <linearGradient id="colorViewers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="time" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="viewers"
                    stroke="#8b5cf6"
                    fillOpacity={1}
                    fill="url(#colorViewers)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Performance & Insights */}
        <div className="lg:col-span-3 space-y-6">
          {/* System Health */}
          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <CardDescription>Real-time performance metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Uptime</span>
                  </div>
                  <span className="text-sm font-medium">99.98%</span>
                </div>
                <Progress value={99.98} className="h-2" />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wifi className="h-4 w-4 text-primary" />
                    <span className="text-sm">Bandwidth Usage</span>
                  </div>
                  <span className="text-sm font-medium">72%</span>
                </div>
                <Progress value={72} className="h-2" />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-warning" />
                    <span className="text-sm">CPU Load</span>
                  </div>
                  <span className="text-sm font-medium">45%</span>
                </div>
                <Progress value={45} className="h-2" />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-danger" />
                    <span className="text-sm">Error Rate</span>
                  </div>
                  <span className="text-sm font-medium">0.02%</span>
                </div>
                <Progress value={0.02} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest actions and events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { action: 'Stream started', user: 'John Doe', time: '2 min ago', icon: PlayCircle },
                  { action: 'New viewer milestone', user: 'System', time: '15 min ago', icon: TrendingUp },
                  { action: 'Stream scheduled', user: 'Jane Smith', time: '1 hour ago', icon: Calendar },
                  { action: 'Settings updated', user: 'Admin', time: '3 hours ago', icon: Activity },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <activity.icon className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.user} • {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="justify-start" size="sm">
                <Video className="h-4 w-4 mr-2" />
                New Stream
              </Button>
              <Button variant="outline" className="justify-start" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule
              </Button>
              <Button variant="outline" className="justify-start" size="sm">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Button>
              <Button variant="outline" className="justify-start" size="sm">
                <Users className="h-4 w-4 mr-2" />
                Audience
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}