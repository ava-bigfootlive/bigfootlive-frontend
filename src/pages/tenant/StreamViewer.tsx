import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StreamViewer } from '@/components/streaming/StreamViewer';
import { eventService, type StreamEvent } from '@/services/events';

export default function StreamViewerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [stream, setStream] = useState<StreamEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewerCount, setViewerCount] = useState(0);

  useEffect(() => {
    if (!id) return;
    
    const fetchStream = async () => {
      try {
        const streamData = await eventService.getEvent(id);
        setStream(streamData);
        setViewerCount(streamData.viewer_count || 0);
      } catch (error) {
        console.error('Failed to fetch stream:', error);
        setError('Failed to load stream');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStream();
    
    // Set up real-time metrics
    const cleanup = eventService.connectToMetrics(id, (metrics) => {
      setViewerCount(metrics.currentViewers || viewerCount);
    });
    
    return () => {
      cleanup();
    };
  }, [id, viewerCount]);

  const handleViewerJoin = () => {
    setViewerCount(prev => prev + 1);
  };

  const handleViewerLeave = () => {
    setViewerCount(prev => Math.max(0, prev - 1));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading stream...</p>
        </div>
      </div>
    );
  }

  if (error || !stream) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Stream Not Available</h2>
        <p className="text-muted-foreground mb-4">{error || 'This stream could not be loaded'}</p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  // Get HLS URL from stream data or generate it
  const hlsUrl = stream.playback_url || eventService.getHLSUrl(stream.stream_key) || '#';
  
  return (
    <StreamViewer
      streamId={stream.id}
      hlsUrl={hlsUrl}
      title={stream.title}
      description={stream.description}
      streamerName={stream.user?.username || 'Unknown'}
      streamerAvatar={stream.user?.avatar}
      isLive={stream.status === 'live'}
      viewerCount={viewerCount}
      onViewerJoin={handleViewerJoin}
      onViewerLeave={handleViewerLeave}
    />
  );
}
