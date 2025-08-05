import React from 'react';
import { Activity, ArrowDownRight, ArrowUpRight, BarChart3, Calendar, Clock, MoreHorizontal, PlayCircle, TrendingUp, Users, Video, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ElementType;
  trend: 'up' | 'down';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon: Icon, trend }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          {trend === 'up' ? (
            <ArrowUpRight className="h-3 w-3 text-success" />
          ) : (
            <ArrowDownRight className="h-3 w-3 text-danger" />
          )}
          <span className={cn(trend === 'up' ? 'text-success' : 'text-danger')}>
            {change}%
          </span>
          <span>from last month</span>
        </p>
      </CardContent>
    </Card>
  );
};

interface ActiveStreamProps {
  id: string;
  title: string;
  viewers: number;
  duration: string;
  quality: number;
  status: 'live' | 'scheduled' | 'ended';
}

const ActiveStreamCard: React.FC<ActiveStreamProps> = ({
  title,
  viewers,
  duration,
  quality,
  status
}) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-medium">{title}</h4>
              {status === 'live' && (
                <Badge variant="destructive" className="h-5">
                  <span className="animate-pulse mr-1">●</span> LIVE
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {viewers.toLocaleString()} viewers
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {duration}
              </span>
              <span className="flex items-center gap-1">
                <Activity className="h-3 w-3" />
                {quality}% quality
              </span>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Stream</DropdownMenuItem>
              <DropdownMenuItem>Analytics</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem className="text-danger">End Stream</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Progress value={quality} className="mt-3 h-1" />
      </CardContent>
    </Card>
  );
};

interface UpcomingEventProps {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'live' | 'simlive' | 'premiere';
}

const UpcomingEventCard: React.FC<UpcomingEventProps> = ({ title, date, time, type }) => {
  const typeConfig = {
    live: { label: 'Live Event', color: 'bg-danger' },
    simlive: { label: 'SimLive', color: 'bg-warning' },
    premiere: { label: 'Premiere', color: 'bg-primary' }
  };

  return (
    <div className="flex items-center gap-4 py-3">
      <div className="flex-shrink-0">
        <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-muted">
          <span className="text-xs font-medium">{date.split(' ')[0]}</span>
          <span className="text-xs text-muted-foreground">{date.split(' ')[1]}</span>
        </div>
      </div>
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium">{title}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{time}</span>
          <span>•</span>
          <Badge variant="secondary" className="h-5">
            {typeConfig[type].label}
          </Badge>
        </div>
      </div>
      <Button size="sm" variant="ghost">
        Manage
      </Button>
    </div>
  );
};

export default function DashboardOverview() {
  // Mock data
  const metrics = [
    { title: 'Total Viewers', value: '24.5K', change: 12.5, icon: Users, trend: 'up' as const },
    { title: 'Active Streams', value: '8', change: -2.4, icon: PlayCircle, trend: 'down' as const },
    { title: 'Engagement Rate', value: '68%', change: 5.2, icon: TrendingUp, trend: 'up' as const },
    { title: 'Watch Time', value: '142K hrs', change: 18.7, icon: Clock, trend: 'up' as const }
  ];

  const activeStreams: ActiveStreamProps[] = [
    {
      id: '1',
      title: 'Q4 2024 Earnings Call',
      viewers: 1234,
      duration: '45:32',
      quality: 98,
      status: 'live'
    },
    {
      id: '2',
      title: 'Product Launch Event',
      viewers: 856,
      duration: '23:15',
      quality: 95,
      status: 'live'
    }
  ];

  const upcomingEvents: UpcomingEventProps[] = [
    {
      id: '1',
      title: 'Annual Shareholder Meeting',
      date: '15 Feb',
      time: '2:00 PM EST',
      type: 'live'
    },
    {
      id: '2',
      title: 'Training Series: Episode 4',
      date: '16 Feb',
      time: '10:00 AM EST',
      type: 'simlive'
    },
    {
      id: '3',
      title: 'CEO Town Hall',
      date: '20 Feb',
      time: '3:00 PM EST',
      type: 'live'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your streams today.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Last 30 days
          </Button>
          <Button>
            <Zap className="h-4 w-4 mr-2" />
            Go Live
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Active Streams */}
        <div className="lg:col-span-4">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Active Streams</CardTitle>
                  <CardDescription>Currently broadcasting</CardDescription>
                </div>
                <Button variant="ghost" size="sm">
                  View all
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeStreams.map((stream) => (
                  <ActiveStreamCard key={stream.id} {...stream} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events */}
        <div className="lg:col-span-3">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Upcoming Events</CardTitle>
                  <CardDescription>Next 7 days</CardDescription>
                </div>
                <Button variant="ghost" size="sm">
                  Schedule new
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {upcomingEvents.map((event) => (
                  <UpcomingEventCard key={event.id} {...event} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Content</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Product Demo 2024</span>
                <span className="text-sm text-muted-foreground">12.3K views</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Q3 Earnings Call</span>
                <span className="text-sm text-muted-foreground">8.7K views</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Training Series Ep.3</span>
                <span className="text-sm text-muted-foreground">6.2K views</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Audience Insights</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Desktop</span>
                <div className="flex items-center gap-2">
                  <Progress value={65} className="w-20 h-2" />
                  <span className="text-sm text-muted-foreground">65%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Mobile</span>
                <div className="flex items-center gap-2">
                  <Progress value={30} className="w-20 h-2" />
                  <span className="text-sm text-muted-foreground">30%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Tablet</span>
                <div className="flex items-center gap-2">
                  <Progress value={5} className="w-20 h-2" />
                  <span className="text-sm text-muted-foreground">5%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stream Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Uptime</span>
                <Badge variant="success">99.9%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Avg. Bitrate</span>
                <span className="text-sm font-medium">4.2 Mbps</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">CDN Status</span>
                <Badge variant="success">Healthy</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}