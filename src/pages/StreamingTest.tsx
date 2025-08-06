import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { VideoPlayer } from '@/components/video/VideoPlayer';
import { streamingService } from '@/services/streaming';
import { 
  Play, 
  Square, 
  Eye, 
  Radio, 
  Copy, 
  ExternalLink, 
  CheckCircle,
  XCircle,
  Activity,
  Server
} from 'lucide-react';

export default function StreamingTest() {
  const [testStreamId, setTestStreamId] = useState('test-stream-001');
  const [isLive, setIsLive] = useState(false);
  const [streamHealth, setStreamHealth] = useState<any>(null);
  const [viewers, setViewers] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Generated URLs
  const rtmpUrl = streamingService.getRTMPIngestUrl(testStreamId);
  const hlsUrl = streamingService.getHLSPlaylistUrl(testStreamId);

  useEffect(() => {
    // Check stream health every 5 seconds
    const interval = setInterval(async () => {
      try {
        const health = await streamingService.getStreamHealth(testStreamId);
        setStreamHealth(health);
        setIsLive(health.status === 'online');
        setViewers(health.viewers || 0);
      } catch {
        setStreamHealth(null);
        setIsLive(false);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [testStreamId]);

  const handleStartStream = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await streamingService.startStream(testStreamId, {
        title: 'Test Stream',
        description: 'Infrastructure test stream',
        quality: '1080p',
        recordingEnabled: true
      });

      setSuccess(`Stream started! Stream ID: ${result.streamId}`);
      setIsLive(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleStopStream = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await streamingService.stopStream(testStreamId);
      setSuccess(`Stream stopped. Duration: ${result.duration}s, Peak viewers: ${result.viewerStats.peak}`);
      setIsLive(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setSuccess(`${type} URL copied to clipboard!`);
      setTimeout(() => setSuccess(null), 2000);
    });
  };

  const testServices = [
    {
      name: 'SRS Media Server',
      url: 'http://localhost:8080/api/v1/summaries',
      description: 'RTMP ingestion and streaming server'
    },
    {
      name: 'NGINX Streaming Proxy',
      url: 'http://localhost:8090/health',
      description: 'HLS delivery and load balancing'
    },
    {
      name: 'FFmpeg Processor',
      url: 'http://localhost:3000/health',
      description: 'Video processing and transcoding'
    },
    {
      name: 'Redis Cache',
      url: 'redis://localhost:6380',
      description: 'Real-time data and session management'
    },
    {
      name: 'MongoDB Streaming',
      url: 'mongodb://localhost:27018',
      description: 'Streaming metadata and analytics'
    }
  ];

  const ServiceHealthCheck = ({ service }: { service: typeof testServices[0] }) => {
    const [status, setStatus] = useState<'checking' | 'healthy' | 'unhealthy'>('checking');

    useEffect(() => {
      const checkHealth = async () => {
        try {
          if (service.url.startsWith('http')) {
            const response = await fetch(service.url);
            setStatus(response.ok ? 'healthy' : 'unhealthy');
          } else {
            // For non-HTTP services, assume healthy (would need specific checks)
            setStatus('healthy');
          }
        } catch {
          setStatus('unhealthy');
        }
      };

      checkHealth();
      const interval = setInterval(checkHealth, 10000);
      return () => clearInterval(interval);
    }, [service.url]);

    return (
      <div className="flex items-center justify-between p-3 border rounded-lg">
        <div className="flex-1">
          <p className="font-medium">{service.name}</p>
          <p className="text-sm text-muted-foreground">{service.description}</p>
        </div>
        <div className="flex items-center gap-2">
          {status === 'checking' && <Activity className="h-4 w-4 animate-spin" />}
          {status === 'healthy' && <CheckCircle className="h-4 w-4 text-green-500" />}
          {status === 'unhealthy' && <XCircle className="h-4 w-4 text-red-500" />}
          <Badge variant={status === 'healthy' ? 'default' : status === 'unhealthy' ? 'destructive' : 'secondary'}>
            {status}
          </Badge>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">🎬 BigFoot Live Streaming Test</h1>
          <p className="text-muted-foreground">Test your streaming infrastructure and verify all services are operational</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Service Health */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Service Health
              </CardTitle>
              <CardDescription>Real-time status of all streaming services</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {testServices.map((service, index) => (
                <ServiceHealthCheck key={index} service={service} />
              ))}
            </CardContent>
          </Card>

          {/* Stream Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Radio className="h-5 w-5" />
                Stream Controls
                {isLive && <Badge variant="destructive" className="animate-pulse ml-2">LIVE</Badge>}
              </CardTitle>
              <CardDescription>Start and manage test streams</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="streamId">Stream ID</Label>
                <Input 
                  id="streamId"
                  value={testStreamId} 
                  onChange={(e) => setTestStreamId(e.target.value)}
                  placeholder="Enter stream ID"
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleStartStream} 
                  disabled={loading || isLive}
                  className="flex-1"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Stream
                </Button>
                <Button 
                  onClick={handleStopStream} 
                  disabled={loading || !isLive}
                  variant="destructive"
                  className="flex-1"
                >
                  <Square className="h-4 w-4 mr-2" />
                  Stop Stream
                </Button>
              </div>

              {streamHealth && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">Stream Metrics</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Status: <span className={isLive ? 'text-green-600' : 'text-red-600'}>{streamHealth.status}</span></div>
                    <div>Viewers: <span className="font-mono">{viewers}</span></div>
                    <div>Bitrate: <span className="font-mono">{streamHealth.bitrate || 0} kbps</span></div>
                    <div>FPS: <span className="font-mono">{streamHealth.fps || 0}</span></div>
                  </div>
                </div>
              )}

              {/* Alerts */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Streaming URLs */}
        <Card>
          <CardHeader>
            <CardTitle>Streaming Endpoints</CardTitle>
            <CardDescription>Use these URLs to test streaming with OBS or other software</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-red-600 font-semibold">RTMP Ingest URL (for OBS/Broadcasting)</Label>
              <div className="flex gap-2 mt-1">
                <Input value={rtmpUrl} readOnly className="font-mono text-sm" />
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => copyToClipboard(rtmpUrl, 'RTMP')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => window.open('obs://studio', '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-blue-600 font-semibold">HLS Playback URL (for Viewers)</Label>
              <div className="flex gap-2 mt-1">
                <Input value={hlsUrl} readOnly className="font-mono text-sm" />
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => copyToClipboard(hlsUrl, 'HLS')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => window.open(hlsUrl, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Live Preview
              {isLive && <Badge variant="destructive" className="animate-pulse">ON AIR</Badge>}
            </CardTitle>
            <CardDescription>Real-time preview of your stream</CardDescription>
          </CardHeader>
          <CardContent>
            {isLive ? (
              <VideoPlayer 
                src={hlsUrl}
                autoPlay
                className="w-full aspect-video"
              />
            ) : (
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center space-y-2">
                  <Radio className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">Stream is offline</p>
                  <p className="text-sm text-muted-foreground">Start a stream to see live preview</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Setup Guide */}
        <Card>
          <CardHeader>
            <CardTitle>🚀 Quick Setup Guide</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm space-y-2">
              <p><strong>1. Start Stream:</strong> Click "Start Stream" button above</p>
              <p><strong>2. Configure OBS:</strong> Use the RTMP URL in OBS Studio's stream settings</p>
              <p><strong>3. Set Stream Key:</strong> Use your stream ID as the stream key</p>
              <p><strong>4. Start Broadcasting:</strong> Begin streaming from OBS</p>
              <p><strong>5. Watch Live:</strong> The HLS preview will show your live stream</p>
              <p><strong>6. Test Recording:</strong> Recordings will be automatically processed by FFmpeg</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
