import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Square,
  Activity,
  Globe,
  Server,
  Wifi,
  Eye,
  AlertTriangle,
  Copy,
  ExternalLink,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { VideoPlayer } from '@/components/video/VideoPlayer';
import { streamingService, type ContainerStatus, type LaunchResponse } from '@/services/streaming';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { AnalyticsDashboard } from '../analytics/AnalyticsDashboard';
import { LiveChat } from '@/components/Chat/LiveChat';

interface StreamControlCenterProps {
  launchResponse: LaunchResponse;
  onStreamEnd: () => void;
}

interface ViewerStats {
  current: number;
  peak: number;
  total: number;
}

interface StreamMetrics {
  bitrate: number;
  fps: number;
  resolution: string;
  latency: number;
  dropped_frames: number;
}

export function StreamControlCenter({ launchResponse, onStreamEnd }: StreamControlCenterProps) {
  const [containerStatus, setContainerStatus] = useState<ContainerStatus | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [viewerStats, setViewerStats] = useState<ViewerStats>({ current: 0, peak: 0, total: 0 });
  const [streamMetrics, setStreamMetrics] = useState<StreamMetrics>({
    bitrate: 0,
    fps: 0,
    resolution: '720p',
    latency: 0,
    dropped_frames: 0
  });
  const [logs, setLogs] = useState<Array<{ timestamp: string; message: string }>>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [uptime, setUptime] = useState('00:00:00');
  const [isStopping, setIsStopping] = useState(false);
  
  const { toast } = useToast();

  // Real-time status updates
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const status = await streamingService.getContainerStatus(launchResponse.container_id);
        setContainerStatus(status);
        
        // Check if container is running and healthy
        const isHealthy = status.status === 'running' && status.health === 'healthy';
        setIsLive(isHealthy);
      } catch (error) {
        console.error('Failed to fetch container status:', error);
      }
    };

    // Initial fetch
    fetchStatus();
    
    // Set up polling every 10 seconds
    const interval = setInterval(fetchStatus, 10000);
    
    return () => clearInterval(interval);
  }, [launchResponse.container_id]);

  // WebSocket updates for real-time metrics
  useEffect(() => {
    const handleStatusUpdate = (update: { type: string; data: Record<string, unknown> }) => {
      if (update.type === 'viewers') {
        setViewerStats(prev => ({
          current: update.data.current || prev.current,
          peak: Math.max(update.data.current || 0, prev.peak),
          total: update.data.total || prev.total
        }));
      } else if (update.type === 'metrics') {
        setStreamMetrics(prev => ({ ...prev, ...update.data }));
      } else if (update.type === 'health') {
        setIsLive(update.data.status === 'live');
      }
    };

    streamingService.subscribeToContainerUpdates(launchResponse.container_id, handleStatusUpdate);
    
    return () => {
      streamingService.unsubscribeFromContainerUpdates(launchResponse.container_id);
    };
  }, [launchResponse.container_id]);

  // Update uptime every second
  useEffect(() => {
    if (!containerStatus?.uptime) return;
    
    const interval = setInterval(() => {
      const [hours, minutes, seconds] = containerStatus.uptime.split(':').map(Number);
      const totalSeconds = hours * 3600 + minutes * 60 + seconds + 1;
      const newHours = Math.floor(totalSeconds / 3600);
      const newMinutes = Math.floor((totalSeconds % 3600) / 60);
      const newSeconds = totalSeconds % 60;
      
      setUptime(`${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}:${newSeconds.toString().padStart(2, '0')}`);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [containerStatus?.uptime]);

  const handleRefreshLogs = async () => {
    setIsRefreshing(true);
    try {
      const logsResponse = await streamingService.getContainerLogs(launchResponse.container_id, 50);
      setLogs(logsResponse.logs.reverse()); // Show newest first
    } catch {
      toast({
        title: "Failed to refresh logs",
        description: "Could not fetch the latest container logs",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleStopStream = async () => {
    setIsStopping(true);
    try {
      const response = await streamingService.stopContainer(launchResponse.container_id);
      
      toast({
        title: "Stream Stopped",
        description: `Stream duration: ${response.duration}. Estimated cost: ${response.estimated_cost}`,
      });
      
      onStreamEnd();
    } catch {
      toast({
        title: "Stop Failed",
        description: "Failed to stop the streaming container",
        variant: "destructive",
      });
    } finally {
      setIsStopping(false);
    }
  };

  const copyEndpoint = async (url: string, type: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: `${type} Endpoint Copied`,
        description: "Endpoint URL has been copied to clipboard",
      });
    } catch {
      toast({
        title: "Copy Failed",
        description: "Failed to copy endpoint to clipboard",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'running': return 'text-green-500';
      case 'starting': return 'text-yellow-500';
      case 'stopping': return 'text-orange-500';
      case 'stopped': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getHealthColor = (health: string | undefined) => {
    switch (health) {
      case 'healthy': return 'text-green-500';
      case 'unhealthy': return 'text-red-500';
      default: return 'text-yellow-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto space-y-6"
    >
      {/* Header with Live Status */}
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
                    <Server className="h-3 w-3 mr-1" />
                    STARTING
                  </Badge>
                )}
                <span className="text-sm text-muted-foreground">Container: {launchResponse.container_id}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
              
              <Button
                variant="destructive"
                size="sm"
                onClick={handleStopStream}
                disabled={isStopping}
              >
                {isStopping ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Square className="h-4 w-4 mr-1" />
                )}
                Stop Stream
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Live Preview */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Live Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {launchResponse.hls_endpoints.length > 0 ? (
                <VideoPlayer
                  src={launchResponse.hls_endpoints[0].url}
                  autoPlay
                  className="w-full aspect-video"
                />
              ) : (
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                    <p className="text-sm text-muted-foreground">Waiting for stream...</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stream Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Stream Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{viewerStats.current}</p>
                  <p className="text-sm text-muted-foreground">Current Viewers</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{viewerStats.peak}</p>
                  <p className="text-sm text-muted-foreground">Peak Viewers</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{streamMetrics.bitrate.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Bitrate (kbps)</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">{streamMetrics.latency}s</p>
                  <p className="text-sm text-muted-foreground">Latency</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Control Panel */}
        <div className="space-y-6">
          {/* Container Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-4 w-4" />
                Container Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Status</span>
                <span className={cn("text-sm font-semibold", getStatusColor(containerStatus?.status))}>
                  {containerStatus?.status?.toUpperCase() || 'UNKNOWN'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Health</span>
                <span className={cn("text-sm font-semibold", getHealthColor(containerStatus?.health))}>
                  {containerStatus?.health?.toUpperCase() || 'UNKNOWN'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Uptime</span>
                <span className="text-sm font-mono">
                  {containerStatus?.uptime || uptime}
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>CPU Usage</span>
                  <span>{containerStatus?.metrics.cpu_usage || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Memory Usage</span>
                  <span>{containerStatus?.metrics.memory_usage || 'N/A'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Streaming Endpoints */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Endpoints
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* RTMP Endpoints */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-red-600">RTMP (Publishing)</p>
                {launchResponse.rtmp_endpoints.map((endpoint, index) => (
                  <div key={index} className="p-2 bg-muted rounded text-xs font-mono break-all">
                    <div className="flex items-center justify-between">
                      <span className="truncate">{endpoint.url}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyEndpoint(endpoint.url, 'RTMP')}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* HLS Endpoints */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-blue-600">HLS (Viewing)</p>
                {launchResponse.hls_endpoints.map((endpoint, index) => (
                  <div key={index} className="p-2 bg-muted rounded text-xs font-mono break-all">
                    <div className="flex items-center justify-between">
                      <span className="truncate">{endpoint.url}</span>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyEndpoint(endpoint.url, 'HLS')}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(endpoint.url, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Detailed Information Tabs */}
      <Card>
        <CardContent className="p-0">
          <Tabs defaultValue="logs" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="logs">Container Logs</TabsTrigger>
              <TabsTrigger value="analytics">Analytics Dashboard</TabsTrigger>
              <TabsTrigger value="chat">Live Chat</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="logs" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Live Container Logs</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefreshLogs}
                  disabled={isRefreshing}
                >
                  {isRefreshing ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-1" />
                  )}
                  Refresh
                </Button>
              </div>
              
              <ScrollArea className="h-64 w-full border rounded-md p-4">
                {logs.length > 0 ? (
                  <div className="space-y-1">
                    {logs.map((log, index) => (
                      <div key={index} className="text-xs font-mono">
                        <span className="text-muted-foreground mr-2">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                        <span>{log.message}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <p>No logs available yet</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRefreshLogs}
                      className="mt-2"
                    >
                      Fetch Logs
                    </Button>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="analytics" className="p-0">
              <div className="h-[800px] overflow-auto">
                <AnalyticsDashboard
                  streamId={launchResponse.container_id}
                  className="p-6"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="chat" className="p-0">
              <div className="h-[600px]">
                <LiveChat
                  streamId={launchResponse.container_id}
                  userId="current-user-id" // TODO: Get from auth context
                  username="StreamOwner" // TODO: Get from auth context
                  userRole="streamer"
                  className="h-full"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="settings" className="p-6">
              <div className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Stream settings cannot be changed while the container is running.
                    Stop the stream to modify configuration.
                  </AlertDescription>
                </Alert>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Resource Allocation</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>CPU:</span>
                        <span>{launchResponse.resources.cpu} units</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Memory:</span>
                        <span>{launchResponse.resources.memory} MB</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Instance:</span>
                        <span>{launchResponse.resources.instance_type}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Cost Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Estimated Cost:</span>
                        <span className="font-semibold">{launchResponse.estimated_cost}/event</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Billing Model:</span>
                        <span>Pay-per-use</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}
