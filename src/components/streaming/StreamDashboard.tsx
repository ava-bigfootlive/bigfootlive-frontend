import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MetricsGrid } from '@/components/dashboard/MetricsGrid';
import { StreamManager } from './StreamManager';
import { streamingService } from '@/services/streaming';
import { useToast } from '@/components/ui/use-toast';
import { 
  Plus, 
  Search, 
  Filter, 
  Play, 
  Square, 
  Users, 
  Activity, 
  Clock, 
  TrendingUp,
  Settings,
  AlertTriangle,
  CheckCircle,
  Globe,
  Zap,
  MonitorPlay,
  BarChart3,
  Calendar,
  Wifi
} from 'lucide-react';

interface StreamInfo {
  id: string;
  title: string;
  status: 'live' | 'preparing' | 'ended';
  viewers: number;
  duration: string;
  quality: string;
  region: string;
  thumbnailUrl?: string;
  startTime: Date;
}

interface StreamDashboardProps {
  className?: string;
}

const mockStreams: StreamInfo[] = [
  {
    id: '1',
    title: 'BigfootLive Tech Conference 2024',
    status: 'live',
    viewers: 1234,
    duration: '02:15:30',
    quality: '1080p60',
    region: 'us-west-2',
    startTime: new Date(Date.now() - 2 * 60 * 60 * 1000)
  },
  {
    id: '2',
    title: 'Product Launch Stream',
    status: 'preparing',
    viewers: 0,
    duration: '00:00:00',
    quality: '720p30',
    region: 'us-east-1',
    startTime: new Date(Date.now() + 30 * 60 * 1000)
  },
  {
    id: '3',
    title: 'Community Q&A Session',
    status: 'ended',
    viewers: 856,
    duration: '01:45:20',
    quality: '1080p30',
    region: 'eu-west-1',
    startTime: new Date(Date.now() - 24 * 60 * 60 * 1000)
  }
];

export function StreamDashboard({ className }: StreamDashboardProps) {
  const [streams, setStreams] = useState<StreamInfo[]>(mockStreams);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'live' | 'preparing' | 'ended'>('all');
  const [showCreateStream, setShowCreateStream] = useState(false);
  const [newStreamKey, setNewStreamKey] = useState('');
  const [newEventId, setNewEventId] = useState('');
  
  const { toast } = useToast();

  useEffect(() => {
    // Generate stream key when creating new stream
    if (showCreateStream && !newStreamKey) {
      setNewStreamKey(streamingService.generateStreamKey());
      setNewEventId(`event_${Date.now()}`);
    }
  }, [showCreateStream, newStreamKey]);

  const filteredStreams = streams.filter(stream => {
    const matchesSearch = stream.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || stream.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const liveStreams = streams.filter(s => s.status === 'live');
  const totalViewers = liveStreams.reduce((sum, stream) => sum + stream.viewers, 0);

  const getStatusColor = (status: StreamInfo['status']) => {
    switch (status) {
      case 'live': return 'destructive';
      case 'preparing': return 'secondary';
      case 'ended': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: StreamInfo['status']) => {
    switch (status) {
      case 'live': return <Wifi className="h-3 w-3" />;
      case 'preparing': return <Clock className="h-3 w-3" />;
      case 'ended': return <CheckCircle className="h-3 w-3" />;
      default: return <Activity className="h-3 w-3" />;
    }
  };

  return (
    <div className={className}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Stream Dashboard</h1>
            <p className="text-muted-foreground">
              Manage and monitor your live streaming events
            </p>
          </div>
          
          <Button
            onClick={() => setShowCreateStream(true)}
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Stream
          </Button>
        </div>

        {/* Metrics Overview */}
        <MetricsGrid
          liveStreams={liveStreams.length}
          totalViewers={totalViewers}
          bandwidth="125.3 Mbps"
          uptime="99.9%"
        />

        {/* Main Content */}
        <Tabs defaultValue="streams" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="streams" className="flex items-center gap-2">
              <MonitorPlay className="h-4 w-4" />
              Live Streams
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="scheduler" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Scheduler
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Stream Management */}
          <TabsContent value="streams" className="space-y-4">
            {/* Filters and Search */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search streams..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant={filterStatus === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterStatus('all')}
                    >
                      All
                    </Button>
                    <Button
                      variant={filterStatus === 'live' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterStatus('live')}
                    >
                      <Wifi className="h-3 w-3 mr-1" />
                      Live
                    </Button>
                    <Button
                      variant={filterStatus === 'preparing' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterStatus('preparing')}
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      Preparing
                    </Button>
                    <Button
                      variant={filterStatus === 'ended' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterStatus('ended')}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Ended
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stream Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredStreams.map((stream) => (
                <Card key={stream.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg line-clamp-2">{stream.title}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant={getStatusColor(stream.status)} className="text-xs">
                            {getStatusIcon(stream.status)}
                            {stream.status.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {stream.quality}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Stream Metrics */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">{stream.viewers.toLocaleString()}</span>
                        <span className="text-muted-foreground">viewers</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-green-500" />
                        <span className="font-medium">{stream.duration}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-purple-500" />
                        <span className="text-muted-foreground">{stream.region}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-orange-500" />
                        <span className="text-muted-foreground">
                          {stream.startTime.toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      {stream.status === 'live' && (
                        <Button size="sm" variant="outline" className="flex-1">
                          <Activity className="h-3 w-3 mr-1" />
                          Monitor
                        </Button>
                      )}
                      {stream.status === 'preparing' && (
                        <Button size="sm" className="flex-1">
                          <Play className="h-3 w-3 mr-1" />
                          Start
                        </Button>
                      )}
                      {stream.status === 'ended' && (
                        <Button size="sm" variant="outline" className="flex-1">
                          <BarChart3 className="h-3 w-3 mr-1" />
                          Analytics
                        </Button>
                      )}
                      <Button size="sm" variant="ghost">
                        <Settings className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredStreams.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <div className="space-y-2">
                    <p className="text-lg font-semibold">No streams found</p>
                    <p className="text-muted-foreground">
                      {searchQuery || filterStatus !== 'all'
                        ? 'Try adjusting your search or filters'
                        : 'Create your first stream to get started'
                      }
                    </p>
                    {!searchQuery && filterStatus === 'all' && (
                      <Button
                        onClick={() => setShowCreateStream(true)}
                        className="mt-4"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Stream
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Stream Analytics
                </CardTitle>
                <CardDescription>
                  Performance metrics and insights for your streaming events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <BarChart3 className="h-4 w-4" />
                  <AlertDescription>
                    Advanced analytics dashboard is coming soon. Track viewer engagement, 
                    geographic distribution, and streaming quality metrics.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scheduler Tab */}
          <TabsContent value="scheduler" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Stream Scheduler
                </CardTitle>
                <CardDescription>
                  Schedule and manage upcoming streaming events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <Calendar className="h-4 w-4" />
                  <AlertDescription>
                    Stream scheduling feature is in development. Soon you'll be able to 
                    pre-schedule streams with automatic container provisioning.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Platform Settings
                </CardTitle>
                <CardDescription>
                  Configure global streaming platform settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <Settings className="h-4 w-4" />
                  <AlertDescription>
                    Platform-wide settings panel is under development. Configure default 
                    quality settings, regional preferences, and billing options.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create Stream Modal */}
        {showCreateStream && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Create New Stream</CardTitle>
                  <CardDescription>
                    Configure and launch a new streaming event
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCreateStream(false)}
                >
                  ×
                </Button>
              </CardHeader>
              <CardContent>
                <StreamManager
                  eventId={newEventId}
                  streamKey={newStreamKey}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </motion.div>
    </div>
  );
}
