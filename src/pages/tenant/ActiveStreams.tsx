import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import {
  Radio, Users, Eye, Settings, MoreVertical, Search,
  CheckCircle, AlertTriangle, Play, Square, BarChart3
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Mock active streams data
const mockActiveStreams = [
  {
    id: '1',
    title: 'Gaming Marathon 2024',
    streamer: 'ProGamer_Mike',
    viewers: 5234,
    peakViewers: 6789,
    duration: '2h 15m',
    status: 'live',
    quality: '1080p60',
    health: 'excellent',
    bitrate: 6000,
    fps: 60,
    category: 'Gaming',
    thumbnail: '/api/placeholder/160/90',
  },
  {
    id: '2',
    title: 'Tech Talk Tuesday',
    streamer: 'DevMaster_Jane',
    viewers: 1823,
    peakViewers: 2145,
    duration: '45m',
    status: 'live',
    quality: '720p30',
    health: 'good',
    bitrate: 3500,
    fps: 30,
    category: 'Technology',
    thumbnail: '/api/placeholder/160/90',
  },
  {
    id: '3',
    title: 'Music Concert Live',
    streamer: 'ArtistStudio',
    viewers: 8421,
    peakViewers: 12456,
    duration: '1h 30m',
    status: 'live',
    quality: '1080p30',
    health: 'excellent',
    bitrate: 5000,
    fps: 30,
    category: 'Music',
    thumbnail: '/api/placeholder/160/90',
  },
  {
    id: '4',
    title: 'Cooking Masterclass',
    streamer: 'ChefExpert',
    viewers: 892,
    peakViewers: 1234,
    duration: '25m',
    status: 'live',
    quality: '720p30',
    health: 'poor',
    bitrate: 2500,
    fps: 30,
    category: 'Lifestyle',
    thumbnail: '/api/placeholder/160/90',
  },
];

export default function ActiveStreams() {
  const [streams, setStreams] = useState(mockActiveStreams);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const filteredStreams = streams.filter(stream => {
    const matchesSearch = stream.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         stream.streamer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || stream.category.toLowerCase() === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: string, health: string) => {
    if (status === 'live') {
      switch (health) {
        case 'excellent': return 'text-green-600 bg-green-100';
        case 'good': return 'text-blue-600 bg-blue-100';
        case 'poor': return 'text-red-600 bg-red-100';
        default: return 'text-gray-600 bg-gray-100';
      }
    }
    return 'text-gray-600 bg-gray-100';
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'excellent': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'good': return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'poor': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Active Streams</h1>
          <p className="text-muted-foreground">Monitor and manage your currently broadcasting streams</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-green-600 bg-green-50">
            <Radio className="h-3 w-3 mr-1 animate-pulse" />
            {streams.length} Live Streams
          </Badge>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search streams or streamers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select 
          className="px-3 py-2 border rounded-md text-sm"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="all">All Categories</option>
          <option value="gaming">Gaming</option>
          <option value="technology">Technology</option>
          <option value="music">Music</option>
          <option value="lifestyle">Lifestyle</option>
        </select>
      </div>

      {/* Active Streams Grid */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredStreams.map((stream) => (
          <Card key={stream.id} className="overflow-hidden hover:shadow-lg transition-all">
            <div className="aspect-video bg-gray-100 relative">
              {/* Stream thumbnail placeholder */}
              <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Play className="h-12 w-12 text-white opacity-80" />
              </div>
              
              {/* Live indicator */}
              <div className="absolute top-3 left-3">
                <Badge className="bg-red-600 text-white">
                  <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse" />
                  LIVE
                </Badge>
              </div>
              
              {/* Duration */}
              <div className="absolute top-3 right-3 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                {stream.duration}
              </div>

              {/* Quick actions */}
              <div className="absolute bottom-3 right-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="secondary" className="bg-black bg-opacity-75 text-white hover:bg-opacity-100">
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
                    <DropdownMenuItem className="text-red-600">
                      <Square className="h-4 w-4 mr-2" />
                      End Stream
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <CardHeader>
              <CardTitle className="text-lg line-clamp-1">{stream.title}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <span>{stream.streamer}</span>
                <span>•</span>
                <Badge variant="outline">{stream.category}</Badge>
              </CardDescription>
            </CardHeader>

            <CardContent>
              {/* Viewer Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{stream.viewers.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                    <Users className="h-3 w-3" />
                    Current
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-muted-foreground">{stream.peakViewers.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                    <Eye className="h-3 w-3" />
                    Peak
                  </div>
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
                <Progress 
                  value={stream.health === 'excellent' ? 100 : stream.health === 'good' ? 75 : 40} 
                  className="h-2" 
                />
              </div>

              {/* Technical Details */}
              <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                <div className="text-center">
                  <div className="font-medium text-foreground">{stream.quality}</div>
                  <div>Quality</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-foreground">{stream.bitrate}k</div>
                  <div>Bitrate</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-foreground">{stream.fps}</div>
                  <div>FPS</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredStreams.length === 0 && (
        <div className="text-center py-12">
          <Radio className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">No active streams found</h3>
          <p className="text-sm text-muted-foreground">
            {searchQuery || filterCategory !== 'all' 
              ? "Try adjusting your search or filter criteria"
              : "Start a new stream to see it here"
            }
          </p>
        </div>
      )}

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Live Streaming Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{streams.length}</div>
              <div className="text-sm text-muted-foreground">Active Streams</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {streams.reduce((sum, s) => sum + s.viewers, 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Viewers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Math.max(...streams.map(s => s.peakViewers)).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Peak Concurrent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {streams.filter(s => s.health === 'excellent').length}
              </div>
              <div className="text-sm text-muted-foreground">Excellent Quality</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
