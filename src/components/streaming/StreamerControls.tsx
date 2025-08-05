import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Square,
  Pause,
  Play,
  Settings,
  Users,
  Eye,
  Heart,
  MessageSquare,
  Volume2,
  VolumeX,
  Camera,
  MonitorSpeaker,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle,
  Activity,
  BarChart3,
  Share2,
  Record,
  StopCircle,
  Clock,
  Server,
  Zap
} from 'lucide-react';

interface StreamerControlsProps {
  streamId: string;
  isLive: boolean;
  onStreamToggle: (isLive: boolean) => void;
  onRecordingToggle: (isRecording: boolean) => void;
  className?: string;
}

interface StreamStats {
  viewers: number;
  likes: number;
  messages: number;
  duration: string;
  bitrate: number;
  fps: number;
  quality: string;
  latency: number;
  droppedFrames: number;
  cpuUsage: number;
  memoryUsage: number;
  bandwidth: number;
}

interface StreamHealth {
  status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  score: number;
  issues: string[];
}

const mockStats: StreamStats = {
  viewers: 1247,
  likes: 89,
  messages: 234,
  duration: '02:15:30',
  bitrate: 4500,
  fps: 60,
  quality: '1080p',
  latency: 2.3,
  droppedFrames: 2,
  cpuUsage: 45,
  memoryUsage: 68,
  bandwidth: 125.5
};

const mockStreamHealth: StreamHealth = {
  status: 'good',
  score: 85,
  issues: ['CPU usage slightly elevated']
};

export function StreamerControls({ 
  streamId, 
  isLive, 
  onStreamToggle, 
  onRecordingToggle,
  className 
}: StreamerControlsProps) {
  const [stats, setStats] = useState<StreamStats>(mockStats);
  const [streamHealth, setStreamHealth] = useState<StreamHealth>(mockStreamHealth);
  const [isRecording, setIsRecording] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [micVolume, setMicVolume] = useState([75]);
  const [cameraVolume, setCameraVolume] = useState([80]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [streamTitle, setStreamTitle] = useState('My Live Stream');
  const [streamDescription, setStreamDescription] = useState('');
  const [autoRecord, setAutoRecord] = useState(true);
  const [lowLatencyMode, setLowLatencyMode] = useState(false);

  // Real-time stats updates
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        viewers: prev.viewers + Math.floor(Math.random() * 10 - 5),
        likes: prev.likes + Math.floor(Math.random() * 3),
        messages: prev.messages + Math.floor(Math.random() * 5),
        latency: Math.max(1, prev.latency + (Math.random() - 0.5) * 0.5),
        droppedFrames: Math.max(0, prev.droppedFrames + Math.floor(Math.random() * 2 - 1)),
        cpuUsage: Math.max(0, Math.min(100, prev.cpuUsage + Math.floor(Math.random() * 10 - 5))),
        memoryUsage: Math.max(0, Math.min(100, prev.memoryUsage + Math.floor(Math.random() * 8 - 4))),
        bandwidth: Math.max(0, prev.bandwidth + (Math.random() - 0.5) * 10)
      }));

      // Update health score based on performance
      const healthScore = Math.max(0, Math.min(100, 
        100 - (stats.cpuUsage * 0.3) - (stats.memoryUsage * 0.2) - (stats.latency * 5) - (stats.droppedFrames * 2)
      ));
      
      let healthStatus: StreamHealth['status'] = 'excellent';
      if (healthScore < 90) healthStatus = 'good';
      if (healthScore < 75) healthStatus = 'fair';
      if (healthScore < 60) healthStatus = 'poor';
      if (healthScore < 40) healthStatus = 'critical';

      setStreamHealth({
        status: healthStatus,
        score: Math.round(healthScore),
        issues: [
          ...(stats.cpuUsage > 80 ? ['High CPU usage'] : []),
          ...(stats.memoryUsage > 85 ? ['High memory usage'] : []),
          ...(stats.latency > 3 ? ['High latency detected'] : []),
          ...(stats.droppedFrames > 10 ? ['Frame drops detected'] : [])
        ]
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isLive, stats.cpuUsage, stats.memoryUsage, stats.latency, stats.droppedFrames]);

  const handleStreamToggle = useCallback(() => {
    onStreamToggle(!isLive);
  }, [isLive, onStreamToggle]);

  const handleRecordingToggle = useCallback(() => {
    setIsRecording(!isRecording);
    onRecordingToggle(!isRecording);
  }, [isRecording, onRecordingToggle]);

  const getHealthColor = (status: StreamHealth['status']) => {
    switch (status) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-blue-500';
      case 'fair': return 'text-yellow-500';
      case 'poor': return 'text-orange-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getHealthIcon = (status: StreamHealth['status']) => {
    switch (status) {
      case 'excellent':
      case 'good':
        return <CheckCircle className="h-4 w-4" />;
      case 'fair':
        return <Activity className="h-4 w-4" />;
      case 'poor':
      case 'critical':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className={className}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Stream Status Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {isLive ? (
                    <Badge variant="destructive" className="animate-pulse">
                      <Wifi className="h-3 w-3 mr-1" />
                      LIVE
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <WifiOff className="h-3 w-3 mr-1" />
                      OFFLINE
                    </Badge>
                  )}
                  <span className="text-sm text-muted-foreground">
                    Stream ID: {streamId}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant={isLive ? "destructive" : "default"}
                  size="lg"
                  onClick={handleStreamToggle}
                  className="min-w-[120px]"
                >
                  {isLive ? (
                    <>
                      <Square className="h-4 w-4 mr-2" />
                      Stop Stream
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Go Live
                    </>
                  )}
                </Button>
              </div>
            </div>
            {isLive && (
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {stats.duration}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {stats.viewers.toLocaleString()} viewers
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  {stats.likes} likes
                </span>
              </div>
            )}
          </CardHeader>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Audio/Video Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Media Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Primary Controls */}
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant={isMicMuted ? "destructive" : "outline"}
                    size="lg"
                    onClick={() => setIsMicMuted(!isMicMuted)}
                    className="w-24 h-16"
                  >
                    {isMicMuted ? (
                      <MicOff className="h-6 w-6" />
                    ) : (
                      <Mic className="h-6 w-6" />
                    )}
                  </Button>
                  
                  <Button
                    variant={isCameraOff ? "destructive" : "outline"}
                    size="lg"
                    onClick={() => setIsCameraOff(!isCameraOff)}
                    className="w-24 h-16"
                  >
                    {isCameraOff ? (
                      <VideoOff className="h-6 w-6" />
                    ) : (
                      <Video className="h-6 w-6" />
                    )}
                  </Button>
                  
                  <Button
                    variant={isRecording ? "destructive" : "outline"}
                    size="lg"
                    onClick={handleRecordingToggle}
                    className="w-24 h-16"
                  >
                    {isRecording ? (
                      <StopCircle className="h-6 w-6" />
                    ) : (
                      <Record className="h-6 w-6" />
                    )}
                  </Button>
                </div>

                <Separator />

                {/* Volume Controls */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Mic className="h-4 w-4" />
                      Microphone Volume
                    </Label>
                    <div className="flex items-center gap-4">
                      <Slider
                        value={micVolume}
                        onValueChange={setMicVolume}
                        max={100}
                        step={1}
                        className="flex-1"
                        disabled={isMicMuted}
                      />
                      <span className="text-sm font-mono w-12">
                        {micVolume[0]}%
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <MonitorSpeaker className="h-4 w-4" />
                      System Audio
                    </Label>
                    <div className="flex items-center gap-4">
                      <Slider
                        value={cameraVolume}
                        onValueChange={setCameraVolume}
                        max={100}
                        step={1}
                        className="flex-1"
                      />
                      <span className="text-sm font-mono w-12">
                        {cameraVolume[0]}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stream Information */}
            <Card>
              <CardHeader>
                <CardTitle>Stream Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="stream-title">Stream Title</Label>
                  <input
                    id="stream-title"
                    value={streamTitle}
                    onChange={(e) => setStreamTitle(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="Enter stream title..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="stream-description">Description</Label>
                  <Textarea
                    id="stream-description"
                    value={streamDescription}
                    onChange={(e) => setStreamDescription(e.target.value)}
                    placeholder="Describe your stream..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats & Health Panel */}
          <div className="space-y-6">
            {/* Stream Health */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Stream Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Score</span>
                  <div className={`flex items-center gap-2 ${getHealthColor(streamHealth.status)}`}>
                    {getHealthIcon(streamHealth.status)}
                    <span className="font-bold">{streamHealth.score}/100</span>
                  </div>
                </div>
                
                <Progress value={streamHealth.score} className="h-2" />
                
                <div className="space-y-1">
                  <span className="text-sm font-medium">Status:</span>
                  <Badge 
                    variant={streamHealth.status === 'excellent' || streamHealth.status === 'good' ? 'default' : 'destructive'}
                    className="capitalize"
                  >
                    {streamHealth.status}
                  </Badge>
                </div>

                {streamHealth.issues.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Issues:</span>
                    {streamHealth.issues.map((issue, index) => (
                      <Alert key={index} variant="destructive" className="py-2">
                        <AlertTriangle className="h-3 w-3" />
                        <AlertDescription className="text-xs">{issue}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Technical Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Technical Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Bitrate</span>
                    <div className="font-mono font-semibold">
                      {stats.bitrate.toLocaleString()} kbps
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground">FPS</span>
                    <div className="font-mono font-semibold">{stats.fps}</div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Latency</span>
                    <div className="font-mono font-semibold">{stats.latency.toFixed(1)}s</div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Dropped</span>
                    <div className="font-mono font-semibold">{stats.droppedFrames}</div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>CPU Usage</span>
                      <span className="font-mono">{stats.cpuUsage}%</span>
                    </div>
                    <Progress value={stats.cpuUsage} className="h-1" />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Memory Usage</span>
                      <span className="font-mono">{stats.memoryUsage}%</span>
                    </div>
                    <Progress value={stats.memoryUsage} className="h-1" />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Bandwidth</span>
                      <span className="font-mono">{stats.bandwidth.toFixed(1)} Mbps</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Stream
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Moderate Chat
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Advanced Settings
                </Button>
              </CardContent>
            </Card>

            {/* Advanced Settings */}
            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Advanced Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="auto-record">Auto Recording</Label>
                        <Switch
                          id="auto-record"
                          checked={autoRecord}
                          onCheckedChange={setAutoRecord}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="low-latency">Low Latency Mode</Label>
                        <Switch
                          id="low-latency"
                          checked={lowLatencyMode}
                          onCheckedChange={setLowLatencyMode}
                        />
                      </div>
                      
                      <Separator />
                      
                      <Button variant="destructive" size="sm" className="w-full">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Emergency Stop
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
