import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  DollarSign, 
  Radio,
  Video,
  Clock,
  BarChart3,
  ArrowUp,
  Eye,
  Server,
  Monitor,
  PlayCircle,
  Calendar,
  Settings,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const Dashboard = () => {
  const navigate = useNavigate();
  
  // Real-time streaming metrics
  const metrics = [
    {
      title: 'Live Viewers',
      value: '15,478',
      change: '+12.5%',
      trend: 'up',
      icon: Eye,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Active Streams',
      value: '3',
      change: '+3',
      trend: 'up', 
      icon: Radio,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Revenue Today',
      value: '$15,600',
      change: '+18.2%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Avg Watch Time',
      value: '42 min',
      change: '+8.3%',
      trend: 'up',
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    }
  ];

  // Live streaming sessions
  const activeStreams = [
    {
      id: 'stream_1',
      title: 'Gaming Marathon 2024',
      streamer: 'ProGamer_Mike',
      viewers: 5234,
      duration: '2h 15m',
      status: 'live',
      category: 'Gaming',
      quality: '1080p60',
      health: 'excellent'
    },
    {
      id: 'stream_2', 
      title: 'Tech Talk Tuesday',
      streamer: 'DevMaster_Jane',
      viewers: 1823,
      duration: '45m',
      status: 'live',
      category: 'Technology', 
      quality: '720p30',
      health: 'good'
    },
    {
      id: 'stream_3',
      title: 'Music Concert Live',
      streamer: 'ArtistStudio',
      viewers: 8421,
      duration: '1h 30m', 
      status: 'live',
      category: 'Music',
      quality: '1080p30',
      health: 'excellent'
    }
  ];
  
  // Upcoming scheduled streams
  const upcomingStreams = [
    {
      id: 'upcoming_1',
      title: 'Developer Conference Keynote',
      streamer: 'TechCorp',
      scheduledTime: '2:00 PM',
      date: 'Today',
      expectedViewers: '10K+',
      category: 'Technology'
    },
    {
      id: 'upcoming_2', 
      title: 'Product Launch Event',
      streamer: 'StartupXYZ',
      scheduledTime: '10:00 AM',
      date: 'Tomorrow',
      expectedViewers: '5K+',
      category: 'Business'
    }
  ];

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'poor': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'excellent': return '🟢';
      case 'good': return '🔵';
      case 'poor': return '🟡';
      default: return '⚫';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Streaming Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Monitor your live streams and platform performance
              </p>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={() => navigate('/tenant/live-control')}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Radio className="mr-2 h-4 w-4" />
                Go Live
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/tenant/analytics')}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Analytics
              </Button>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <Card key={index} className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">
                      {metric.title}
                    </p>
                    <div className="mt-2 flex items-baseline">
                      <p className="text-2xl font-semibold text-gray-900">
                        {metric.value}
                      </p>
                      <span className="ml-2 flex items-center text-sm font-medium text-green-600">
                        <ArrowUp className="h-3 w-3 mr-1" />
                        {metric.change}
                      </span>
                    </div>
                  </div>
                  <div className={cn("p-3 rounded-lg", metric.bgColor)}>
                    <metric.icon className={cn("h-6 w-6", metric.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Active Streams */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Radio className="h-5 w-5 text-red-600" />
                    Active Streams
                  </CardTitle>
                  <CardDescription>
                    Currently broadcasting to {metrics[0].value} viewers
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/tenant/live-control')}
                >
                  Manage All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeStreams.map((stream) => (
                <div key={stream.id} 
                     className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                     onClick={() => navigate(`/tenant/live-control`)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-xs font-medium text-red-600 uppercase">LIVE</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {stream.title}
                      </h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{stream.streamer}</span>
                        <span>•</span>
                        <span className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {stream.viewers.toLocaleString()}
                        </span>
                        <span>•</span>
                        <span>{stream.duration}</span>
                        <span>•</span>
                        <span>{stream.quality}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={cn("text-xs", getHealthColor(stream.health))}>
                      {getHealthIcon(stream.health)} {stream.health}
                    </span>
                    <Badge variant="secondary">{stream.category}</Badge>
                  </div>
                </div>
              ))}
              
              {activeStreams.length === 0 && (
                <div className="text-center py-8">
                  <PlayCircle className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No active streams
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Start your first stream to see it here
                  </p>
                  <div className="mt-6">
                    <Button onClick={() => navigate('/tenant/live-control')}>
                      <Radio className="mr-2 h-4 w-4" />
                      Start Streaming
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right Sidebar */}
          <div className="space-y-6">
            
            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5 text-blue-600" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Server Health</span>
                    <span className="text-green-600 font-medium">94%</span>
                  </div>
                  <Progress value={94} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Bandwidth Usage</span>
                    <span className="font-medium">2.5 GB</span>
                  </div>
                  <Progress value={42} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Storage Used</span>
                    <span className="font-medium">68%</span>
                  </div>
                  <Progress value={68} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Streams */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  Upcoming Streams
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingStreams.map((stream) => (
                  <div key={stream.id} className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-sm text-gray-900">
                      {stream.title}
                    </h4>
                    <div className="mt-1 text-xs text-gray-600 space-y-1">
                      <div className="flex items-center justify-between">
                        <span>{stream.date} at {stream.scheduledTime}</span>
                        <Badge variant="outline" className="text-xs">
                          {stream.category}
                        </Badge>
                      </div>
                      <div>Expected: {stream.expectedViewers} viewers</div>
                    </div>
                  </div>
                ))}
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-3"
                  onClick={() => navigate('/tenant/content')}
                >
                  <Calendar className="mr-2 h-3 w-3" />
                  Schedule New Stream
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => navigate('/tenant/content')}
                >
                  <Video className="mr-2 h-4 w-4" />
                  Upload Content
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => navigate('/tenant/interactive')}
                >
                  <Monitor className="mr-2 h-4 w-4" />
                  Interactive Features
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => navigate('/tenant/settings')}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;