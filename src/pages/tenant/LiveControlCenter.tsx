/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import {
  Play,
  Pause,
  Square,
  Radio,
  Calendar,
  Settings,
  Activity,
  Users,
  Eye,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Volume2,
  VolumeX,
  Monitor,
  Wifi,
  WifiOff,
  AlertCircle,
  CheckCircle,
  MoreVertical,
  Plus,
  Filter,
  Search,
  BarChart3,
  MessageSquare,
  Heart,
  ThumbsUp,
  HelpCircle,
  Target,
  Zap,
  Clock,
  Copy,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

// Stream Status Component
interface StreamStatus {
  id: string;
  title: string;
  status: 'live' | 'scheduled' | 'ended' | 'preparing';
  viewers: number;
  peakViewers: number;
  duration: string;
  startTime: Date;
  streamKey: string;
  health: 'excellent' | 'good' | 'poor';
  bitrate: number;
  fps: number;
  resolution: string;
  interactiveFeatures: {
    polls: boolean;
    qa: boolean;
    reactions: boolean;
    checkpoints: boolean;
  };
}

const StreamStatusCard: React.FC<{ stream: StreamStatus }> = ({ stream }) => {
  const navigate = useNavigate();
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'destructive';
      case 'scheduled':
        return 'secondary';
      case 'preparing':
        return 'warning';
      case 'ended':
        return 'outline';
      default:
        return 'default';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'excellent':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'good':
        return <AlertCircle className="h-4 w-4 text-warning" />;
      case 'poor':
        return <AlertCircle className="h-4 w-4 text-danger" />;
      default:
        return null;
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate(`/tenant/live/stream/${stream.id}`)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{stream.title}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Badge variant={getStatusColor(stream.status)}>
                {stream.status === 'live' && <span className="animate-pulse mr-1">●</span>}
                {stream.status.toUpperCase()}
              </Badge>
              {stream.status === 'live' && (
                <>
                  <span className="text-xs">•</span>
                  <span className="text-xs">{stream.duration}</span>
                </>
              )}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <BarChart3 className="h-4 w-4 mr-2" />
                View Analytics
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="h-4 w-4 mr-2" />
                Stream Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-danger">
                <Square className="h-4 w-4 mr-2" />
                End Stream
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        {/* Viewer Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Current Viewers</p>
            <p className="text-2xl font-bold flex items-center gap-2">
              {stream.viewers.toLocaleString()}
              <Users className="h-4 w-4 text-muted-foreground" />
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Peak Viewers</p>
            <p className="text-2xl font-bold flex items-center gap-2">
              {stream.peakViewers.toLocaleString()}
              <Eye className="h-4 w-4 text-muted-foreground" />
            </p>
          </div>
        </div>

        {/* Stream Health */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Stream Health</span>
            <span className="flex items-center gap-1">
              {getHealthIcon(stream.health)}
              <span className="capitalize">{stream.health}</span>
            </span>
          </div>
          <Progress value={stream.health === 'excellent' ? 100 : stream.health === 'good' ? 75 : 40} className="h-2" />
        </div>

        {/* Technical Stats */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center p-2 bg-muted rounded">
            <p className="text-muted-foreground">Bitrate</p>
            <p className="font-medium">{stream.bitrate} kbps</p>
          </div>
          <div className="text-center p-2 bg-muted rounded">
            <p className="text-muted-foreground">FPS</p>
            <p className="font-medium">{stream.fps}</p>
          </div>
          <div className="text-center p-2 bg-muted rounded">
            <p className="text-muted-foreground">Resolution</p>
            <p className="font-medium">{stream.resolution}</p>
          </div>
        </div>

        {/* Interactive Features */}
        <div className="flex items-center gap-2 mt-4">
          {stream.interactiveFeatures.polls && (
            <Badge variant="secondary" className="text-xs">
              <BarChart3 className="h-3 w-3 mr-1" />
              Polls
            </Badge>
          )}
          {stream.interactiveFeatures.qa && (
            <Badge variant="secondary" className="text-xs">
              <MessageSquare className="h-3 w-3 mr-1" />
              Q&A
            </Badge>
          )}
          {stream.interactiveFeatures.reactions && (
            <Badge variant="secondary" className="text-xs">
              <Heart className="h-3 w-3 mr-1" />
              Reactions
            </Badge>
          )}
          {stream.interactiveFeatures.checkpoints && (
            <Badge variant="secondary" className="text-xs">
              <Target className="h-3 w-3 mr-1" />
              Checkpoints
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Quick Start Dialog
const QuickStartDialog: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [streamTitle, setStreamTitle] = useState('');
  const [streamType, setStreamType] = useState('live');
  const navigate = useNavigate();

  const handleQuickStart = () => {
    // TODO: Create stream and navigate to stream page
    toast({
      title: "Stream Created",
      description: `Starting ${streamTitle}...`,
    });
    setOpen(false);
    navigate('/tenant/live/stream/new');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Zap className="h-4 w-4 mr-2" />
          Quick Start
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Quick Start Stream</DialogTitle>
          <DialogDescription>
            Get your stream up and running in seconds
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="stream-title">Stream Title</Label>
            <Input
              id="stream-title"
              placeholder="Enter stream title..."
              value={streamTitle}
              onChange={(e) => setStreamTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stream-type">Stream Type</Label>
            <Select value={streamType} onValueChange={setStreamType}>
              <SelectTrigger>
                <SelectValue placeholder="Select stream type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="live">Live Stream</SelectItem>
                <SelectItem value="simlive">SimLive</SelectItem>
                <SelectItem value="premiere">Premiere</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Interactive Features</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch id="polls" defaultChecked />
                <Label htmlFor="polls" className="text-sm font-normal">Enable Polls</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="qa" defaultChecked />
                <Label htmlFor="qa" className="text-sm font-normal">Enable Q&A</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="reactions" defaultChecked />
                <Label htmlFor="reactions" className="text-sm font-normal">Enable Reactions</Label>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleQuickStart} disabled={!streamTitle}>
            <Play className="h-4 w-4 mr-2" />
            Start Streaming
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Main Live Control Center Component
import GoLive from './GoLive';
import StreamViewer from './StreamViewer';

function LiveControlCenterMain() {
  const navigate = useNavigate();
  const [activeStreams, setActiveStreams] = useState<StreamStatus[]>([]);
  const [scheduledStreams, setScheduledStreams] = useState<StreamStatus[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data
  useEffect(() => {
    setActiveStreams([
      {
        id: '1',
        title: 'Q4 2024 Earnings Call',
        status: 'live',
        viewers: 3421,
        peakViewers: 4532,
        duration: '45:32',
        startTime: new Date(),
        streamKey: 'str_abc123',
        health: 'excellent',
        bitrate: 4500,
        fps: 30,
        resolution: '1080p',
        interactiveFeatures: {
          polls: true,
          qa: true,
          reactions: true,
          checkpoints: false
        }
      },
      {
        id: '2',
        title: 'Product Training Session',
        status: 'preparing',
        viewers: 0,
        peakViewers: 0,
        duration: '00:00',
        startTime: new Date(Date.now() + 1800000),
        streamKey: 'str_def456',
        health: 'good',
        bitrate: 0,
        fps: 0,
        resolution: '720p',
        interactiveFeatures: {
          polls: false,
          qa: true,
          reactions: false,
          checkpoints: true
        }
      }
    ]);

    setScheduledStreams([
      {
        id: '3',
        title: 'Annual Shareholder Meeting',
        status: 'scheduled',
        viewers: 0,
        peakViewers: 0,
        duration: '00:00',
        startTime: new Date(Date.now() + 86400000),
        streamKey: 'str_ghi789',
        health: 'excellent',
        bitrate: 0,
        fps: 0,
        resolution: '1080p',
        interactiveFeatures: {
          polls: true,
          qa: true,
          reactions: true,
          checkpoints: true
        }
      }
    ]);
  }, []);

  const filteredStreams = [...activeStreams, ...scheduledStreams].filter(stream => {
    const matchesSearch = stream.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || stream.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Live Control Center</h1>
          <p className="text-muted-foreground">Manage your live streams and broadcasts</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate('/tenant/live/schedule/new')}>
            <Calendar className="h-4 w-4 mr-2" />
            Schedule
          </Button>
          <QuickStartDialog />
        </div>
      </div>

      {/* Live Status Bar */}
      <Card className="bg-gradient-to-r from-red-500/10 to-orange-500/10">
        <CardContent className="flex items-center justify-between p-6">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse" />
              <span className="font-medium">Live Now</span>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Active Streams:</span>
              <span className="ml-2 font-bold">{activeStreams.filter(s => s.status === 'live').length}</span>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Total Viewers:</span>
              <span className="ml-2 font-bold">
                {activeStreams.reduce((sum, s) => sum + s.viewers, 0).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Network Status:</span>
              <Badge className="ml-2" variant="outline">
                <Wifi className="h-3 w-3 mr-1" />
                Excellent
              </Badge>
            </div>
          </div>
          <Button size="sm" variant="secondary">
            <Monitor className="h-4 w-4 mr-2" />
            Multiview
          </Button>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search streams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Streams</SelectItem>
            <SelectItem value="live">Live</SelectItem>
            <SelectItem value="preparing">Preparing</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="ended">Ended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Streams Grid */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">
            Active Streams ({activeStreams.length})
          </TabsTrigger>
          <TabsTrigger value="scheduled">
            Scheduled ({scheduledStreams.length})
          </TabsTrigger>
          <TabsTrigger value="templates">
            Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeStreams.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Radio className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Active Streams</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Start streaming to see your active broadcasts here
                </p>
                <Button onClick={() => navigate('/tenant/live/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Start Streaming
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeStreams.map(stream => (
                <StreamStatusCard key={stream.id} stream={stream} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          {scheduledStreams.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Scheduled Streams</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Schedule your upcoming broadcasts to see them here
                </p>
                <Button onClick={() => navigate('/tenant/live/schedule/new')}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Stream
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {scheduledStreams.map(stream => (
                <StreamStatusCard key={stream.id} stream={stream} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Stream Templates</CardTitle>
                  <CardDescription>Pre-configured stream settings for quick setup</CardDescription>
                </div>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Template
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {['Corporate Webinar', 'Product Launch', 'Training Session', 'Town Hall'].map((template) => (
                  <Card key={template} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-2">{template}</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Pre-configured settings for {template.toLowerCase()}
                      </p>
                      <Button size="sm" className="w-full">Use Template</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function LiveControlCenter() {
  return (
    <Routes>
      <Route path="/" element={<LiveControlCenterMain />} />
      <Route path="new" element={<GoLive />} />
      <Route path="stream/:id" element={<StreamViewer />} />
    </Routes>
  );
}