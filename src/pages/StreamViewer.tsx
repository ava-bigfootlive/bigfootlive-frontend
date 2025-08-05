import { useParams } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Maximize, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function StreamViewer() {
  const { streamId } = useParams();
  const [stream, setStream] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const fetchStreamDetails = useCallback(async () => {
    try {
      const response = await fetch(`/api/streams/${streamId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch stream');
      
      const data = await response.json();
      setStream(data);
      setLoading(false);
    } catch (err) { void err;
      setError('Failed to load stream details');
      setLoading(false);
    }
  }, [streamId]);

  useEffect(() => {
    fetchStreamDetails();
  }, [fetchStreamDetails]);

  const getStreamUrl = () => {
    // In production, this would be the actual MediaMTX HLS URL
    const baseUrl = import.meta.env.VITE_STREAM_URL || 'https://stream.bigfootlive.io';
    return `${baseUrl}/hls/live/${stream?.tenant_id}/${stream?.stream_key}/index.m3u8`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading stream...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Video Player */}
          <div className="lg:col-span-3">
            <Card className="overflow-hidden">
              <div className="relative aspect-video bg-black">
                {stream?.status === 'live' ? (
                  <video
                    id="video-player"
                    className="w-full h-full"
                    controls
                    autoPlay
                    muted={isMuted}
                  >
                    <source src={getStreamUrl()} type="application/x-mpegURL" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <p className="text-xl text-muted-foreground mb-2">Stream is offline</p>
                      <p className="text-sm text-muted-foreground">
                        {stream?.scheduled_start && `Scheduled for ${new Date(stream.scheduled_start).toLocaleString()}`}
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Stream overlay controls */}
                {stream?.status === 'live' && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-white hover:bg-white/20"
                        onClick={() => setIsPlaying(!isPlaying)}
                      >
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-white hover:bg-white/20"
                        onClick={() => setIsMuted(!isMuted)}
                      >
                        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </Button>
                      <div className="flex-1" />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-white hover:bg-white/20"
                      >
                        <Maximize className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Stream info */}
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-2">{stream?.title}</h1>
                <p className="text-muted-foreground mb-4">{stream?.description}</p>
                
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    {stream?.viewer_count || 0} viewers
                  </span>
                  <span className="text-muted-foreground">
                    Started {stream?.actual_start && new Date(stream.actual_start).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Chat (placeholder) */}
          <div className="lg:col-span-1">
            <Card className="h-[600px]">
              <div className="p-4 border-b">
                <h3 className="font-semibold">Stream Chat</h3>
              </div>
              <div className="flex-1 p-4">
                <p className="text-center text-muted-foreground">
                  Chat coming soon...
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}