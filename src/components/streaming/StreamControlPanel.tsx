import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Square, 
  Settings, 
  Users, 
  Eye, 
  Heart, 
  MessageCircle, 
  DollarSign,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle,
  Clock,
  Monitor,
  Mic,
  MicOff,
  Video,
  VideoOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { websocketService } from '@/services/websocket';
import { apiService } from '@/services/api';

interface StreamControlPanelProps {
  eventId: string;
  isLive?: boolean;
  onStreamStart?: () => void;
  onStreamStop?: () => void;
}

interface StreamSettings {
  title: string;
  description: string;
  category: string;
  quality: 'auto' | '1080p' | '720p' | '480p';
  bitrate: number;
  fps: number;
  chatEnabled: boolean;
  donationsEnabled: boolean;
  recordingEnabled: boolean;
  isPrivate: boolean;
}

interface StreamStats {
  viewers: number;
  peakViewers: number;
  duration: number;
  bitrate: number;
  fps: number;
  droppedFrames: number;
  chatMessages: number;
  donations: number;
  followers: number;
}

export const StreamControlPanel: React.FC<StreamControlPanelProps> = ({
  eventId,
  isLive = false,
  onStreamStart,
  onStreamStop
}) => {
  const [streamingStatus, setStreamingStatus] = useState<'offline' | 'starting' | 'live' | 'stopping'>('offline');
  const [connectionHealth, setConnectionHealth] = useState<'excellent' | 'good' | 'warning' | 'error'>('good');
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  
  const [settings, setSettings] = useState<StreamSettings>({
    title: 'My Awesome Stream',
    description: 'Join me for an epic streaming session!',
    category: 'Gaming',
    quality: 'auto',
    bitrate: 3000,
    fps: 30,
    chatEnabled: true,
    donationsEnabled: true,
    recordingEnabled: false,
    isPrivate: false
  });

  const [stats, setStats] = useState<StreamStats>({
    viewers: 0,
    peakViewers: 0,
    duration: 0,
    bitrate: 0,
    fps: 0,
    droppedFrames: 0,
    chatMessages: 0,
    donations: 0,
    followers: 0
  });

  const [streamConfig, setStreamConfig] = useState<{
    rtmpUrl: string;
    streamKey: string;
    hlsUrl: string;
  } | null>(null);

  useEffect(() => {
    // Load streaming configuration
    loadStreamConfig();
    
    // Connect to WebSocket for real-time updates
    websocketService.connect();
    websocketService.joinEvent(eventId);

    // Listen for analytics updates
    websocketService.onAnalyticsUpdate((data) => {
      setStats(prev => ({ ...prev, ...data }));
    });

    // Listen for stream status updates
    websocketService.onStreamStarted(() => {
      setStreamingStatus('live');
    });

    websocketService.onStreamEnded(() => {
      setStreamingStatus('offline');
    });

    return () => {
      websocketService.disconnect();
    };
  }, [eventId]);

  const loadStreamConfig = async () => {
    try {
      const response = await apiService.getStreamingConfig(eventId);
      if (response.success) {
        setStreamConfig(response.data);
      }
    } catch (error) {
      console.error('Failed to load stream config:', error);
    }
  };

  const handleStreamStart = async () => {
    setStreamingStatus('starting');
    
    try {
      await apiService.startEvent(eventId);
      websocketService.notifyStreamStart(eventId);
      setStreamingStatus('live');
      onStreamStart?.();
    } catch (error) {
      console.error('Failed to start stream:', error);
      setStreamingStatus('offline');
    }
  };

  const handleStreamStop = async () => {
    setStreamingStatus('stopping');
    
    try {
      await apiService.stopEvent(eventId);
      websocketService.notifyStreamStop(eventId);
      setStreamingStatus('offline');
      onStreamStop?.();
    } catch (error) {
      console.error('Failed to stop stream:', error);
      setStreamingStatus('live');
    }
  };

  const updateSettings = async (newSettings: Partial<StreamSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    
    try {
      await apiService.updateEvent(eventId, updatedSettings);
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  };

  const copyStreamKey = () => {
    if (streamConfig?.streamKey) {
      navigator.clipboard.writeText(streamConfig.streamKey);
      // Show toast notification
    }
  };

  const getStatusIcon = () => {
    switch (streamingStatus) {
      case 'live':
        return <Wifi className="text-green-500" size={20} />;
      case 'starting':
      case 'stopping':
        return <Clock className="text-yellow-500" size={20} />;
      case 'offline':
      default:
        return <WifiOff className="text-gray-500" size={20} />;
    }
  };

  const getHealthIcon = () => {
    switch (connectionHealth) {
      case 'excellent':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'good':
        return <CheckCircle className="text-blue-500" size={16} />;
      case 'warning':
        return <AlertTriangle className="text-yellow-500" size={16} />;
      case 'error':
        return <AlertTriangle className="text-red-500" size={16} />;
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Stream Status Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getStatusIcon()}
              <div>
                <CardTitle className="text-lg">Stream Control</CardTitle>
                <p className="text-sm text-muted-foreground capitalize">
                  Status: {streamingStatus}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {streamingStatus === 'offline' ? (
                <Button 
                  onClick={handleStreamStart}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={streamingStatus === 'starting'}
                >
                  <Play size={16} className="mr-2" />
                  Go Live
                </Button>
              ) : (
                <Button 
                  onClick={handleStreamStop}
                  variant="outline"
                  disabled={streamingStatus === 'stopping'}
                >
                  <Square size={16} className="mr-2" />
                  End Stream
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        {streamingStatus === 'live' && (
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Users size={16} className="mr-1" />
                </div>
                <div className="text-2xl font-bold">{stats.viewers}</div>
                <div className="text-xs text-muted-foreground">Viewers</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Eye size={16} className="mr-1" />
                </div>
                <div className="text-2xl font-bold">{stats.peakViewers}</div>
                <div className="text-xs text-muted-foreground">Peak</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Clock size={16} className="mr-1" />
                </div>
                <div className="text-2xl font-bold">{formatDuration(stats.duration)}</div>
                <div className="text-xs text-muted-foreground">Duration</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <MessageCircle size={16} className="mr-1" />
                </div>
                <div className="text-2xl font-bold">{stats.chatMessages}</div>
                <div className="text-xs text-muted-foreground">Messages</div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Quick Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Button
                variant={micEnabled ? "default" : "outline"}
                size="sm"
                onClick={() => setMicEnabled(!micEnabled)}
              >
                {micEnabled ? <Mic size={16} /> : <MicOff size={16} />}
              </Button>
              <span className="text-sm">Microphone</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={cameraEnabled ? "default" : "outline"}
                size="sm"
                onClick={() => setCameraEnabled(!cameraEnabled)}
              >
                {cameraEnabled ? <Video size={16} /> : <VideoOff size={16} />}
              </Button>
              <span className="text-sm">Camera</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                checked={settings.chatEnabled}
                onCheckedChange={(checked) => updateSettings({ chatEnabled: checked })}
              />
              <span className="text-sm">Chat</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                checked={settings.donationsEnabled}
                onCheckedChange={(checked) => updateSettings({ donationsEnabled: checked })}
              />
              <span className="text-sm">Donations</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Controls */}
      <Tabs defaultValue="stream" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="stream">Stream</TabsTrigger>
          <TabsTrigger value="quality">Quality</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="stream" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Stream Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Stream Title</Label>
                <Input
                  id="title"
                  value={settings.title}
                  onChange={(e) => updateSettings({ title: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={settings.description}
                  onChange={(e) => updateSettings({ description: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={settings.category}
                  onValueChange={(value) => updateSettings({ category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Gaming">Gaming</SelectItem>
                    <SelectItem value="Music">Music</SelectItem>
                    <SelectItem value="Tech">Technology</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Entertainment">Entertainment</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {streamConfig && (
                <div className="space-y-2">
                  <Label>RTMP Configuration</Label>
                  <div className="p-3 bg-muted rounded">
                    <div className="text-sm space-y-1">
                      <div><strong>Server:</strong> {streamConfig.rtmpUrl}</div>
                      <div className="flex items-center justify-between">
                        <span><strong>Stream Key:</strong> {streamConfig.streamKey.substring(0, 20)}...</span>
                        <Button size="sm" variant="outline" onClick={copyStreamKey}>
                          Copy Key
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Stream Quality</CardTitle>
              <div className="flex items-center space-x-2">
                {getHealthIcon()}
                <span className="text-sm capitalize">{connectionHealth} Connection</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Resolution</Label>
                <Select
                  value={settings.quality}
                  onValueChange={(value: any) => updateSettings({ quality: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto</SelectItem>
                    <SelectItem value="1080p">1080p</SelectItem>
                    <SelectItem value="720p">720p</SelectItem>
                    <SelectItem value="480p">480p</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Bitrate: {settings.bitrate} kbps</Label>
                <Slider
                  value={[settings.bitrate]}
                  onValueChange={(value) => updateSettings({ bitrate: value[0] })}
                  max={8000}
                  min={500}
                  step={100}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Frame Rate</Label>
                <Select
                  value={settings.fps.toString()}
                  onValueChange={(value) => updateSettings({ fps: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24">24 FPS</SelectItem>
                    <SelectItem value="30">30 FPS</SelectItem>
                    <SelectItem value="60">60 FPS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {streamingStatus === 'live' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current Bitrate:</span>
                    <span>{stats.bitrate} kbps</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Current FPS:</span>
                    <span>{stats.fps}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Dropped Frames:</span>
                    <span className={stats.droppedFrames > 100 ? 'text-red-500' : 'text-green-500'}>
                      {stats.droppedFrames}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Messages</span>
                    <span className="font-bold">{stats.chatMessages}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">New Followers</span>
                    <span className="font-bold">{stats.followers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Donations</span>
                    <span className="font-bold">${stats.donations}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Avg Bitrate</span>
                    <span className="font-bold">{stats.bitrate} kbps</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Avg FPS</span>
                    <span className="font-bold">{stats.fps}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Health</span>
                    <Badge variant={connectionHealth === 'excellent' ? 'default' : 
                                   connectionHealth === 'good' ? 'secondary' :
                                   connectionHealth === 'warning' ? 'outline' : 'destructive'}>
                      {connectionHealth}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Reach</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Current</span>
                    <span className="font-bold">{stats.viewers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Peak</span>
                    <span className="font-bold">{stats.peakViewers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Duration</span>
                    <span className="font-bold">{formatDuration(stats.duration)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Privacy & Recording</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Private Stream</Label>
                  <p className="text-xs text-muted-foreground">Only you can see this stream</p>
                </div>
                <Switch
                  checked={settings.isPrivate}
                  onCheckedChange={(checked) => updateSettings({ isPrivate: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Record Stream</Label>
                  <p className="text-xs text-muted-foreground">Save stream for later viewing</p>
                </div>
                <Switch
                  checked={settings.recordingEnabled}
                  onCheckedChange={(checked) => updateSettings({ recordingEnabled: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
