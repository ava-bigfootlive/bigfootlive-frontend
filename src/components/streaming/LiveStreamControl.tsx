import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Play, Pause, Square, Video, Mic, MicOff, Camera, CameraOff,
  Settings, Users, MessageSquare, TrendingUp, AlertTriangle,
  CheckCircle, Wifi, WifiOff, Monitor, Share2, Eye, Clock,
  Volume2, VolumeX, Maximize, Minimize, RotateCw, Download
} from 'lucide-react';
import { useRealTimeAnalytics } from '@/hooks/useRealTimeAnalytics';
import { realTimeChatService, ChatMessage, ChatStats } from '@/services/realTimeChatService';
import { eventService } from '@/services/events';
import { streamingService } from '@/services/streaming';

interface StreamSettings {
  title: string;
  description: string;
  category: string;
  privacy: 'public' | 'unlisted' | 'private';
  chatEnabled: boolean;
  recordingEnabled: boolean;
  donationsEnabled: boolean;
  quality: {
    resolution: string;
    bitrate: number;
    fps: number;
  };
}

interface StreamStatus {
  isLive: boolean;
  isRecording: boolean;
  startTime?: Date;
  duration: number;
  health: 'excellent' | 'good' | 'warning' | 'error';
  rtmpUrl?: string;
  streamKey?: string;
}

interface LiveStreamControlProps {
  streamId?: string;
  onStreamStart?: (streamId: string) => void;
  onStreamEnd?: (streamId: string) => void;
}

export default function LiveStreamControl({ 
  streamId, 
  onStreamStart, 
  onStreamEnd 
}: LiveStreamControlProps) {
  const [streamStatus, setStreamStatus] = useState<StreamStatus>({
    isLive: false,
    isRecording: false,
    duration: 0,
    health: 'good'
  });

  const [streamSettings, setStreamSettings] = useState<StreamSettings>({
    title: '',
    description: '',
    category: '',
    privacy: 'public',
    chatEnabled: true,
    recordingEnabled: false,
    donationsEnabled: true,
    quality: {
      resolution: '1080p',
      bitrate: 4500,
      fps: 30
    }
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatStats, setChatStats] = useState<ChatStats>({
    totalMessages: 0,
    activeUsers: 0,
    messagesPerMinute: 0,
    topChatters: [],
    sentiment: { positive: 0, neutral: 0, negative: 0 }
  });

  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [newMessage, setNewMessage] = useState('');

  const durationTimer = useRef<NodeJS.Timeout | null>(null);

  // Real-time analytics integration
  const {
    data: analyticsData,
    isConnected: analyticsConnected,
    refresh: refreshAnalytics
  } = useRealTimeAnalytics({
    streamId,
    enabled: !!streamId && streamStatus.isLive
  });

  // Initialize chat connection when stream goes live
  useEffect(() => {
    if (streamId && streamStatus.isLive) {
      initializeChat(streamId);
    } else {
      realTimeChatService.disconnect();
    }

    return () => {
      realTimeChatService.disconnect();
    };
  }, [streamId, streamStatus.isLive]);

  // Duration timer
  useEffect(() => {
    if (streamStatus.isLive && streamStatus.startTime) {
      durationTimer.current = setInterval(() => {
        const now = new Date();
        const startTime = streamStatus.startTime!;
        const duration = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        setStreamStatus(prev => ({ ...prev, duration }));
      }, 1000);
    } else if (durationTimer.current) {
      clearInterval(durationTimer.current);
      durationTimer.current = null;
    }

    return () => {
      if (durationTimer.current) {
        clearInterval(durationTimer.current);
      }
    };
  }, [streamStatus.isLive, streamStatus.startTime]);

  const initializeChat = async (streamId: string) => {
    try {
      await realTimeChatService.connectToStream(streamId);

      // Subscribe to chat messages
      const unsubscribeMessages = realTimeChatService.onMessage((message) => {
        setChatMessages(prev => [message, ...prev.slice(0, 99)]); // Keep last 100 messages
      });

      // Subscribe to chat stats
      const unsubscribeStats = realTimeChatService.onStatsUpdate((stats) => {
        setChatStats(stats);
      });

      return () => {
        unsubscribeMessages();
        unsubscribeStats();
      };
    } catch (error) {
      console.error('Failed to initialize chat:', error);
    }
  };

  const handleStartStream = async () => {
    if (!streamSettings.title.trim()) {
      alert('Please enter a stream title');
      return;
    }

    setIsStarting(true);
    try {
      // Create or update stream event
      let currentStreamId = streamId;
      
      if (!currentStreamId) {
        const newStream = await eventService.createEvent({
          title: streamSettings.title,
          description: streamSettings.description,
          category: streamSettings.category,
          privacy: streamSettings.privacy,
          chatEnabled: streamSettings.chatEnabled,
          recordingEnabled: streamSettings.recordingEnabled,
          donationsEnabled: streamSettings.donationsEnabled
        });
        currentStreamId = newStream.id;
      }

      // Start the stream
      const streamResponse = await eventService.startStream(currentStreamId);
      
      // Update stream status
      setStreamStatus({
        isLive: true,
        isRecording: streamSettings.recordingEnabled,
        startTime: new Date(),
        duration: 0,
        health: 'excellent',
        rtmpUrl: streamResponse.stream_url,
        streamKey: currentStreamId
      });

      if (onStreamStart) {
        onStreamStart(currentStreamId);
      }

    } catch (error) {
      console.error('Failed to start stream:', error);
      alert('Failed to start stream. Please try again.');
    } finally {
      setIsStarting(false);
    }
  };

  const handleStopStream = async () => {
    if (!streamId) return;

    setIsStopping(true);
    try {
      await eventService.endStream(streamId);
      
      setStreamStatus({
        isLive: false,
        isRecording: false,
        duration: 0,
        health: 'good'
      });

      realTimeChatService.disconnect();
      setChatMessages([]);
      setChatStats({
        totalMessages: 0,
        activeUsers: 0,
        messagesPerMinute: 0,
        topChatters: [],
        sentiment: { positive: 0, neutral: 0, negative: 0 }
      });

      if (onStreamEnd) {
        onStreamEnd(streamId);
      }

    } catch (error) {
      console.error('Failed to stop stream:', error);
      alert('Failed to stop stream. Please try again.');
    } finally {
      setIsStopping(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await realTimeChatService.sendMessage(newMessage);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message');
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-blue-500';
      case 'warning': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'excellent': return CheckCircle;
      case 'good': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'error': return AlertTriangle;
      default: return AlertTriangle;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stream Status Header */}
      <Card className={`${streamStatus.isLive ? 'border-red-500 bg-red-50/10' : 'border-gray-200'}`}>
        <CardContent className="flex items-center justify-between p-6">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              {streamStatus.isLive ? (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="font-bold text-red-600">LIVE</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-400 rounded-full" />
                  <span className="font-medium text-gray-600">OFFLINE</span>
                </div>
              )}
            </div>

            {streamStatus.isLive && (
              <>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-mono text-lg">{formatDuration(streamStatus.duration)}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{analyticsData.currentViewers.toLocaleString()}</span>
                </div>

                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{chatStats.activeUsers}</span>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-4">
            {streamStatus.isLive && (
              <div className="flex items-center gap-2">
                {React.createElement(getHealthIcon(streamStatus.health), {
                  className: `h-5 w-5 ${getHealthColor(streamStatus.health)}`
                })}
                <span className={`text-sm font-medium ${getHealthColor(streamStatus.health)}`}>
                  {streamStatus.health.toUpperCase()}
                </span>
              </div>
            )}

            {streamStatus.isLive ? (
              <Button 
                onClick={handleStopStream} 
                disabled={isStopping}
                variant="destructive"
                size="lg"
              >
                <Square className="h-4 w-4 mr-2" />
                {isStopping ? 'Stopping...' : 'Stop Stream'}
              </Button>
            ) : (
              <Button 
                onClick={handleStartStream} 
                disabled={isStarting}
                size="lg"
              >
                <Play className="h-4 w-4 mr-2" />
                {isStarting ? 'Starting...' : 'Start Stream'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="settings" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="settings">Stream Settings</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
        </TabsList>

        {/* Stream Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Basic Settings</CardTitle>
                <CardDescription>Configure your stream details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Stream Title</label>
                  <Input
                    value={streamSettings.title}
                    onChange={(e) => setStreamSettings(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter stream title..."
                    disabled={streamStatus.isLive}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={streamSettings.description}
                    onChange={(e) => setStreamSettings(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter stream description..."
                    disabled={streamStatus.isLive}
                    rows={3}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <Select
                      value={streamSettings.category}
                      onValueChange={(value) => setStreamSettings(prev => ({ ...prev, category: value }))}
                      disabled={streamStatus.isLive}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gaming">Gaming</SelectItem>
                        <SelectItem value="music">Music</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="entertainment">Entertainment</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Privacy</label>
                    <Select
                      value={streamSettings.privacy}
                      onValueChange={(value: 'public' | 'unlisted' | 'private') => 
                        setStreamSettings(prev => ({ ...prev, privacy: value }))}
                      disabled={streamStatus.isLive}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="unlisted">Unlisted</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quality Settings</CardTitle>
                <CardDescription>Configure stream quality and features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="text-sm font-medium">Resolution</label>
                    <Select
                      value={streamSettings.quality.resolution}
                      onValueChange={(value) => 
                        setStreamSettings(prev => ({ 
                          ...prev, 
                          quality: { ...prev.quality, resolution: value }
                        }))}
                      disabled={streamStatus.isLive}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="4K">4K (2160p)</SelectItem>
                        <SelectItem value="1080p">Full HD (1080p)</SelectItem>
                        <SelectItem value="720p">HD (720p)</SelectItem>
                        <SelectItem value="480p">SD (480p)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Bitrate (kbps)</label>
                    <Input
                      type="number"
                      value={streamSettings.quality.bitrate}
                      onChange={(e) => 
                        setStreamSettings(prev => ({ 
                          ...prev, 
                          quality: { ...prev.quality, bitrate: parseInt(e.target.value) || 0 }
                        }))}
                      disabled={streamStatus.isLive}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">FPS</label>
                    <Select
                      value={streamSettings.quality.fps.toString()}
                      onValueChange={(value) => 
                        setStreamSettings(prev => ({ 
                          ...prev, 
                          quality: { ...prev.quality, fps: parseInt(value) }
                        }))}
                      disabled={streamStatus.isLive}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="60">60 FPS</SelectItem>
                        <SelectItem value="30">30 FPS</SelectItem>
                        <SelectItem value="24">24 FPS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Enable Chat</label>
                    <Button
                      variant={streamSettings.chatEnabled ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStreamSettings(prev => ({ ...prev, chatEnabled: !prev.chatEnabled }))}
                      disabled={streamStatus.isLive}
                    >
                      {streamSettings.chatEnabled ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Record Stream</label>
                    <Button
                      variant={streamSettings.recordingEnabled ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStreamSettings(prev => ({ ...prev, recordingEnabled: !prev.recordingEnabled }))}
                      disabled={streamStatus.isLive}
                    >
                      {streamSettings.recordingEnabled ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Enable Donations</label>
                    <Button
                      variant={streamSettings.donationsEnabled ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStreamSettings(prev => ({ ...prev, donationsEnabled: !prev.donationsEnabled }))}
                      disabled={streamStatus.isLive}
                    >
                      {streamSettings.donationsEnabled ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {streamStatus.rtmpUrl && (
            <Card>
              <CardHeader>
                <CardTitle>Streaming Information</CardTitle>
                <CardDescription>Use these details in your streaming software (OBS, XSplit, etc.)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">RTMP URL</label>
                    <div className="flex items-center gap-2">
                      <Input value={streamStatus.rtmpUrl} readOnly />
                      <Button 
                        size="sm" 
                        onClick={() => navigator.clipboard.writeText(streamStatus.rtmpUrl || '')}
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Stream Key</label>
                    <div className="flex items-center gap-2">
                      <Input value={streamStatus.streamKey} readOnly type="password" />
                      <Button 
                        size="sm" 
                        onClick={() => navigator.clipboard.writeText(streamStatus.streamKey || '')}
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          {streamStatus.isLive ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Current Viewers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsData.currentViewers.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Watching now</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Peak Viewers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsData.peakViewers.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Highest today</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Chat Messages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{chatStats.totalMessages.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">{chatStats.messagesPerMinute}/min</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Stream Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${getHealthColor(streamStatus.health)}`}>
                    {streamStatus.health.toUpperCase()}
                  </div>
                  <div className="text-xs text-muted-foreground">Connection quality</div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Analytics Available</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  Start your stream to see real-time analytics and viewer data.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Chat Tab */}
        <TabsContent value="chat" className="space-y-4">
          {streamStatus.isLive && streamSettings.chatEnabled ? (
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Live Chat
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="h-64 overflow-y-auto border rounded-lg p-3 space-y-2 bg-muted/20">
                      {chatMessages.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8">
                          No messages yet. Chat with your viewers!
                        </div>
                      ) : (
                        chatMessages.map((message) => (
                          <div key={message.id} className="flex gap-2 text-sm">
                            <span className="font-medium text-primary">{message.displayName}:</span>
                            <span>{message.content}</span>
                          </div>
                        ))
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      />
                      <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                        Send
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Chat Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Active Users</div>
                    <div className="text-2xl font-bold">{chatStats.activeUsers}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-muted-foreground">Messages/min</div>
                    <div className="text-2xl font-bold">{chatStats.messagesPerMinute}</div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Top Chatters</div>
                    <div className="space-y-1">
                      {chatStats.topChatters.slice(0, 5).map((chatter, index) => (
                        <div key={chatter.username} className="flex justify-between text-sm">
                          <span>{chatter.username}</span>
                          <span className="text-muted-foreground">{chatter.messageCount}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Chat Not Available</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  {!streamStatus.isLive 
                    ? 'Start your stream to enable chat functionality.'
                    : 'Chat is disabled for this stream.'
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Technical Tab */}
        <TabsContent value="technical" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Connection Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Analytics Connection</span>
                  <div className="flex items-center gap-2">
                    {analyticsConnected ? (
                      <>
                        <Wifi className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-600">Connected</span>
                      </>
                    ) : (
                      <>
                        <WifiOff className="h-4 w-4 text-red-500" />
                        <span className="text-sm text-red-600">Disconnected</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Chat Connection</span>
                  <div className="flex items-center gap-2">
                    {realTimeChatService.getConnectionStatus().isConnected ? (
                      <>
                        <Wifi className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-600">Connected</span>
                      </>
                    ) : (
                      <>
                        <WifiOff className="h-4 w-4 text-red-500" />
                        <span className="text-sm text-red-600">Disconnected</span>
                      </>
                    )}
                  </div>
                </div>

                {streamStatus.isLive && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Stream Health</span>
                      <span className={getHealthColor(streamStatus.health)}>
                        {streamStatus.health.toUpperCase()}
                      </span>
                    </div>
                    <Progress value={streamStatus.health === 'excellent' ? 100 : streamStatus.health === 'good' ? 80 : streamStatus.health === 'warning' ? 60 : 30} />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Stream Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Status</span>
                  <Badge variant={streamStatus.isLive ? "destructive" : "secondary"}>
                    {streamStatus.isLive ? 'LIVE' : 'OFFLINE'}
                  </Badge>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Recording</span>
                  <Badge variant={streamStatus.isRecording ? "default" : "secondary"}>
                    {streamStatus.isRecording ? 'RECORDING' : 'NOT RECORDING'}
                  </Badge>
                </div>

                {streamStatus.isLive && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span>Duration</span>
                      <span className="font-mono">{formatDuration(streamStatus.duration)}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span>Start Time</span>
                      <span>{streamStatus.startTime?.toLocaleTimeString()}</span>
                    </div>
                  </>
                )}

                <div className="flex justify-between text-sm">
                  <span>Quality</span>
                  <span>{streamSettings.quality.resolution} @ {streamSettings.quality.fps}fps</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span>Bitrate</span>
                  <span>{streamSettings.quality.bitrate} kbps</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
