import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Calendar, Clock, Eye, Plus, Radio, Search, Settings, Trash2, Users } from 'lucide-react';
import { LiveIndicator } from '@/components/video/LiveIndicator';
import { StreamCardSkeleton } from '@/components/ui/loading';
import { notify } from '@/hooks/useNotifications';
import api from '@/services/api';

interface Stream {
  id: string;
  title: string;
  description: string;
  status: 'live' | 'scheduled' | 'ended';
  viewers?: number;
  scheduledFor?: string;
  duration?: string;
  thumbnail?: string;
}


export default function StreamsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [streams, setStreams] = useState<Stream[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStreams = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await api.get('/streams');
        
        if (response.data) {
          setStreams(response.data as Stream[]);
        } else if (response.error) {
          throw new Error(response.error);
        }
      } catch (err) { void err;
        setError((err as Error).message || 'Failed to load streams');
        notify.error('Failed to load streams', 'Error');
      } finally {
        setIsLoading(false);
      }
    };

    loadStreams();
  }, []);

  const filteredStreams = streams.filter(stream =>
    stream.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stream.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: Stream['status']) => {
    switch (status) {
      case 'live':
        return <Badge className="bg-red-600">Live</Badge>;
      case 'scheduled':
        return <Badge variant="secondary">Scheduled</Badge>;
      case 'ended':
        return <Badge variant="outline">Ended</Badge>;
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Streams</h1>
          <p className="text-muted-foreground">Manage your live streams and broadcasts</p>
        </div>
        <Button onClick={() => navigate('/streams/new')}>
          <Radio className="mr-2 h-4 w-4" />
          Go Live
        </Button>
      </div>

      {/* Search and filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search streams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline">
          <Calendar className="mr-2 h-4 w-4" />
          Schedule
        </Button>
      </div>

      {/* Streams grid */}
      {error ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to load streams</h3>
            <p className="text-muted-foreground text-center mb-4">
              {error}
            </p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <StreamCardSkeleton />
          <StreamCardSkeleton />
          <StreamCardSkeleton />
        </div>
      ) : (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" data-testid="stream-grid">
        {filteredStreams.map((stream) => (
          <Card key={stream.id} className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
            <div className="relative aspect-video bg-muted">
              {stream.thumbnail && (
                <img 
                  src={stream.thumbnail} 
                  alt={stream.title}
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute top-2 left-2">
                <LiveIndicator isLive={stream.status === 'live'} viewers={stream.viewers} />
              </div>
              {stream.status === 'ended' && stream.duration && (
                <div className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-xs">
                  {stream.duration}
                </div>
              )}
            </div>
            
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="line-clamp-1">{stream.title}</CardTitle>
                  <CardDescription className="line-clamp-2 mt-1">
                    {stream.description}
                  </CardDescription>
                </div>
                {getStatusBadge(stream.status)}
              </div>
            </CardHeader>

            <CardContent>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {stream.status === 'live' && (
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {stream.viewers?.toLocaleString()} viewers
                  </div>
                )}
                {stream.status === 'scheduled' && stream.scheduledFor && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {new Date(stream.scheduledFor).toLocaleDateString()}
                  </div>
                )}
                {stream.status === 'ended' && stream.viewers && (
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {stream.viewers.toLocaleString()} views
                  </div>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/streams/${stream.id}`);
                }}
              >
                {stream.status === 'live' ? 'View' : 'Details'}
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle settings
                }}
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle delete
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      )}

      {/* Empty state */}
      {filteredStreams.length === 0 && (
        <Card className="mt-8">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Radio className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No streams found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchQuery ? 'Try adjusting your search' : 'Get started by creating your first stream'}
            </p>
            <Button onClick={() => navigate('/streams/new')}>
              <Plus className="mr-2 h-4 w-4" />
              Create Stream
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}