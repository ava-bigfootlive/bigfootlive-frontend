/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, Plus, Radio, TrendingUp, Users, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CardSkeleton } from '@/components/ui/loading';
import { notify } from '@/hooks/useNotifications';
import { useApiData } from '@/hooks/useApiData';
import { MetricsGrid } from '@/components/dashboard/MetricsGrid';
import api from '@/services/api';

interface Stat {
  name: string;
  value: string;
  change: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface Stream {
  id: number;
  title: string;
  viewers: number;
  status: 'live' | 'ended' | 'scheduled';
  duration: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stat[]>([]);
  const [recentStreams, setRecentStreams] = useState<Stream[]>([]);
  
  // Fetch analytics overview from API
  const { data: analyticsData, loading: analyticsLoading, error: analyticsError } = useApiData(
    () => api.analytics.getOverview(),
    []
  );
  
  // Fetch recent streams from API
  const { data: streamsData, loading: streamsLoading, error: streamsError } = useApiData(
    () => api.streams.list(),
    []
  );

  useEffect(() => {
    // Process analytics data when it arrives
    if (analyticsData) {
      // Map API data to stats format
      setStats([
        { 
          name: 'Total Views', 
          value: analyticsData.totalViews?.toLocaleString() || '0', 
          change: `+${analyticsData.viewsChange || 0}%`, 
          icon: TrendingUp 
        },
        { 
          name: 'Active Viewers', 
          value: analyticsData.activeViewers?.toLocaleString() || '0', 
          change: `+${analyticsData.viewersChange || 0}%`, 
          icon: Users 
        },
        { 
          name: 'Revenue', 
          value: `$${analyticsData.revenue?.toLocaleString() || '0'}`, 
          change: `+${analyticsData.revenueChange || 0}%`, 
          icon: DollarSign 
        },
        { 
          name: 'Total Streams', 
          value: analyticsData.totalStreams?.toString() || '0', 
          change: `+${analyticsData.streamsChange || 0}`, 
          icon: Video 
        },
      ]);
    } else if (!analyticsLoading && !analyticsError) {
      // Set default data if API returns empty
      setStats([
        { name: 'Total Views', value: '24.5K', change: '+12.5%', icon: TrendingUp },
        { name: 'Active Viewers', value: '1,234', change: '+4.2%', icon: Users },
        { name: 'Revenue', value: '$3,456', change: '+18.1%', icon: DollarSign },
        { name: 'Total Streams', value: '48', change: '+2', icon: Video },
      ]);
    }
  }, [analyticsData, analyticsLoading, analyticsError]);
  
  useEffect(() => {
    // Process streams data when it arrives
    if (streamsData && Array.isArray(streamsData)) {
      // Map API data to stream format
      const mappedStreams = streamsData.slice(0, 3).map((stream: unknown) => ({
        id: stream.id,
        title: stream.title,
        viewers: stream.viewers || 0,
        status: stream.status || 'scheduled',
        duration: stream.duration || '--:--'
      }));
      setRecentStreams(mappedStreams);
    } else if (!streamsLoading && !streamsError) {
      // Set default data if API returns empty
      setRecentStreams([
        { id: 1, title: 'Product Launch Livestream', viewers: 892, status: 'live', duration: '45:23' },
        { id: 2, title: 'Q&A Session with CEO', viewers: 1234, status: 'ended', duration: '1:23:45' },
        { id: 3, title: 'Tech Talk: Cloud Architecture', viewers: 567, status: 'scheduled', duration: '--:--' },
      ]);
    }
  }, [streamsData, streamsLoading, streamsError]);

  // Show error notifications
  useEffect(() => {
    if (analyticsError) {
      notify.error('Failed to load analytics data', 'API Error');
    }
    if (streamsError) {
      notify.error('Failed to load streams data', 'API Error');
    }
  }, [analyticsError, streamsError]);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back to BigfootLive</p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8">
        {analyticsLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : (
          <MetricsGrid 
            liveStreams={recentStreams.filter(s => s.status === 'live').length}
            totalViewers={recentStreams.reduce((sum, s) => sum + s.viewers, 0)}
            bandwidth="12.5 Mbps"
            uptime="99.9%"
          />
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Start Streaming</CardTitle>
            <CardDescription>Go live with your audience</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              size="lg"
              onClick={() => navigate('/streams/new')}
            >
              <Radio className="mr-2 h-5 w-5" />
              Go Live Now
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Schedule Stream</CardTitle>
            <CardDescription>Plan your next broadcast</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full" 
              size="lg"
              onClick={() => navigate('/streams/schedule')}
            >
              <Plus className="mr-2 h-5 w-5" />
              Schedule Stream
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Streams */}
      {streamsLoading ? (
        <CardSkeleton />
      ) : (
      <Card>
        <CardHeader>
          <CardTitle>Recent Streams</CardTitle>
          <CardDescription>Your latest broadcasts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentStreams.map((stream) => (
              <div
                key={stream.id}
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => navigate(`/streams/${stream.id}`)}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "h-3 w-3 rounded-full",
                    stream.status === 'live' && "bg-red-500 animate-pulse",
                    stream.status === 'ended' && "bg-gray-400",
                    stream.status === 'scheduled' && "bg-yellow-500"
                  )} />
                  <div>
                    <p className="font-medium">{stream.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {stream.status === 'live' && `${stream.viewers} watching now`}
                      {stream.status === 'ended' && `${stream.viewers} total views`}
                      {stream.status === 'scheduled' && 'Upcoming'}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {stream.duration}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      )}
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}