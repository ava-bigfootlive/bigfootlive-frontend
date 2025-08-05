import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
import { BarChart3, Copy, Download, Edit, ExternalLink, Eye, FileVideo, Folder, FolderPlus, Globe, Grid, Layout, Link, List, Lock, MoreVertical, Search, Share2, Trash2, Upload, Video, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
// import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue} from '@/components/ui/select';
// import { Textarea } from '@/components/ui/textarea';
// import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

// Types
interface ContentItem {
  id: string;
  title: string;
  type: 'vod' | 'simlive' | 'live-recording';
  status: 'processing' | 'ready' | 'failed' | 'scheduled';
  duration: string;
  size: string;
  views: number;
  created: Date;
  thumbnail?: string;
  privacy: 'public' | 'private' | 'unlisted';
  tags: string[];
}

interface Playlist {
  id: string;
  title: string;
  description: string;
  itemCount: number;
  totalDuration: string;
  visibility: 'public' | 'private' | 'unlisted';
  created: Date;
  thumbnail?: string;
  items?: ContentItem[];
}

interface Microsite {
  id: string;
  name: string;
  domain: string;
  status: 'active' | 'draft' | 'inactive';
  theme: string;
  pages: number;
  videos: number;
  lastUpdated: Date;
  analytics: {
    visits: number;
    uniqueVisitors: number;
    avgDuration: string;
  };
}

// Content Card Component
const ContentCard: React.FC<{ 
  content: ContentItem; 
  viewMode: 'grid' | 'list';
  selected: boolean;
  onSelect: (id: string) => void;
}> = ({ content, viewMode, selected, onSelect }) => {

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'success';
      case 'processing':
        return 'warning';
      case 'failed':
        return 'danger';
      case 'scheduled':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'vod':
        return <FileVideo className="h-4 w-4" />;
      case 'simlive':
        return <Zap className="h-4 w-4" />;
      case 'live-recording':
        return <Video className="h-4 w-4" />;
      default:
        return <FileVideo className="h-4 w-4" />;
    }
  };

  if (viewMode === 'list') {
    return (
      <div className={cn(
        "flex items-center gap-4 p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer",
        selected && "bg-accent"
      )}>
        <Checkbox
          checked={selected}
          onCheckedChange={() => onSelect(content.id)}
          onClick={(e) => e.stopPropagation()}
        />
        <div className="relative w-24 h-14 bg-muted rounded overflow-hidden flex-shrink-0">
          {content.thumbnail ? (
            <img src={content.thumbnail} alt={content.title} className="object-cover w-full h-full" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {getTypeIcon(content.type)}
            </div>
          )}
          <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
            {content.duration}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium truncate">{content.title}</h4>
            <Badge variant={getStatusColor(content.status)} className="text-xs">
              {content.status}
            </Badge>
            {content.privacy === 'private' && <Lock className="h-3 w-3 text-muted-foreground" />}
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
            <span className="flex items-center gap-1">
              {getTypeIcon(content.type)}
              {content.type.replace('-', ' ')}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {content.views.toLocaleString()} views
            </span>
            <span>{content.size}</span>
            <span>{content.created.toLocaleDateString()}</span>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Edit className="h-4 w-4 mr-2" />
              Edit Details
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Download className="h-4 w-4 mr-2" />
              Download
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-danger">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <Card 
      className={cn(
        "cursor-pointer hover:shadow-lg transition-all",
        selected && "ring-2 ring-primary"
      )}
      onClick={() => {
        // navigate(`/tenant/content/${content.id}`);
        console.log('Navigate to:', `/tenant/content/${content.id}`);
      }}
    >
      <div className="relative aspect-video bg-muted">
        {content.thumbnail ? (
          <img src={content.thumbnail} alt={content.title} className="object-cover w-full h-full" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {getTypeIcon(content.type)}
          </div>
        )}
        <div className="absolute top-2 left-2">
          <Checkbox
            checked={selected}
            onCheckedChange={() => onSelect(content.id)}
            onClick={(e) => e.stopPropagation()}
            className="bg-white"
          />
        </div>
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          {content.duration}
        </div>
        {content.privacy === 'private' && (
          <div className="absolute top-2 right-2">
            <Lock className="h-4 w-4 text-white drop-shadow" />
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium truncate">{content.title}</h4>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={getStatusColor(content.status)} className="text-xs">
                {content.status}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {content.views.toLocaleString()} views
              </span>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-danger">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
};

// Playlist Card Component
const PlaylistCard: React.FC<{ playlist: Playlist }> = ({ playlist }) => {
  // const __navigate = useNavigate();
  
  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all"
      onClick={() => {
        // navigate(`/tenant/content/playlist/${playlist.id}`);
        console.log('Navigate to:', `/tenant/content/playlist/${playlist.id}`);
      }}
    >
      <div className="relative aspect-video bg-muted">
        {playlist.thumbnail ? (
          <img src={playlist.thumbnail} alt={playlist.title} className="object-cover w-full h-full" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Folder className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-2 left-2 text-white">
          <p className="text-sm font-medium">{playlist.itemCount} videos</p>
          <p className="text-xs opacity-90">{playlist.totalDuration}</p>
        </div>
        {playlist.visibility === 'private' && (
          <div className="absolute top-2 right-2">
            <Lock className="h-4 w-4 text-white drop-shadow" />
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <h4 className="font-medium">{playlist.title}</h4>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
          {playlist.description}
        </p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-muted-foreground">
            Updated {playlist.created.toLocaleDateString()}
          </span>
          <Button variant="ghost" size="sm" onClick={(e) => {
            e.stopPropagation();
            // navigate(`/tenant/content/playlist/${playlist.id}/edit`);
            console.log('Navigate to:', `/tenant/content/playlist/${playlist.id}/edit`);
          }}>
            <Edit className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Microsite Card Component
const MicrositeCard: React.FC<{ microsite: Microsite }> = ({ microsite }) => {
  // const __navigate = useNavigate();
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'draft':
        return 'warning';
      case 'inactive':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {microsite.name}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Link className="h-3 w-3" />
              <a href={`https://${microsite.domain}`} target="_blank" rel="noopener noreferrer" 
                className="hover:underline" onClick={(e) => e.stopPropagation()}>
                {microsite.domain}
              </a>
              <ExternalLink className="h-3 w-3" />
            </CardDescription>
          </div>
          <Badge variant={getStatusColor(microsite.status)}>
            {microsite.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Pages</p>
            <p className="text-2xl font-bold">{microsite.pages}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Videos</p>
            <p className="text-2xl font-bold">{microsite.videos}</p>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Analytics (Last 30 days)</h4>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="text-center p-2 bg-muted rounded">
              <p className="text-muted-foreground text-xs">Visits</p>
              <p className="font-medium">{microsite.analytics.visits.toLocaleString()}</p>
            </div>
            <div className="text-center p-2 bg-muted rounded">
              <p className="text-muted-foreground text-xs">Unique</p>
              <p className="font-medium">{microsite.analytics.uniqueVisitors.toLocaleString()}</p>
            </div>
            <div className="text-center p-2 bg-muted rounded">
              <p className="text-muted-foreground text-xs">Avg. Time</p>
              <p className="font-medium">{microsite.analytics.avgDuration}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="flex-1" onClick={() => {
            // navigate(`/tenant/content/microsite/${microsite.id}/edit`);
            console.log('Navigate to:', `/tenant/content/microsite/${microsite.id}/edit`);
          }}>
            <Layout className="h-4 w-4 mr-2" />
            Edit Site
          </Button>
          <Button size="sm" variant="outline" className="flex-1" onClick={() => {
            // navigate(`/tenant/content/microsite/${microsite.id}/analytics`);
            console.log('Navigate to:', `/tenant/content/microsite/${microsite.id}/analytics`);
          }}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Upload Dialog Component
const UploadDialog: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [uploadType, setUploadType] = useState<'file' | 'url' | 'simlive'>('file');
  const [files, setFiles] = useState<File[]>([]);

  const handleUpload = () => {
    toast({
      title: "Upload Started",
      description: `Uploading ${files.length} file(s)...`});
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Upload
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Content</DialogTitle>
          <DialogDescription>
            Add new videos to your content library
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={uploadType} onValueChange={(v) => setUploadType(v as "file" | "url" | "simlive")}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="file">File Upload</TabsTrigger>
            <TabsTrigger value="url">Import from URL</TabsTrigger>
            <TabsTrigger value="simlive">Create SimLive</TabsTrigger>
          </TabsList>

          <TabsContent value="file" className="space-y-4">
            <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-2">
                Drag and drop files here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                Supported formats: MP4, MOV, AVI, MKV (max 5GB)
              </p>
              <Input
                type="file"
                multiple
                accept="video/*"
                className="hidden"
                id="file-upload"
                onChange={(e) => setFiles(Array.from(e.target.files || []))}
              />
              <Button variant="secondary" className="mt-4" asChild>
                <label htmlFor="file-upload">Choose Files</label>
              </Button>
            </div>
            {files.length > 0 && (
              <div className="space-y-2">
                <Label>Selected Files</Label>
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm truncate">{file.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="url" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="video-url">Video URL</Label>
              <Input
                id="video-url"
                placeholder="https://example.com/video.mp4"
                type="url"
              />
              <p className="text-xs text-muted-foreground">
                Import videos from YouTube, Vimeo, or direct video URLs
              </p>
            </div>
          </TabsContent>

          <TabsContent value="simlive" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="simlive-title">SimLive Title</Label>
                <Input
                  id="simlive-title"
                  placeholder="Enter SimLive event title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="simlive-video">Select Existing Video</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a video from your library" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Q4 2024 Earnings Call Recording</SelectItem>
                    <SelectItem value="2">Product Launch Event</SelectItem>
                    <SelectItem value="3">Training Session Part 1</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="simlive-schedule">Schedule Time</Label>
                <Input
                  id="simlive-schedule"
                  type="datetime-local"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleUpload}>
            {uploadType === 'simlive' ? 'Create SimLive' : 'Start Upload'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Main Content Library Component
export default function ContentLibrary() {
  // const __navigate = useNavigate();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  // Mock data
  const [contentItems] = useState<ContentItem[]>([
    {
      id: '1',
      title: 'Q4 2024 Earnings Call Recording',
      type: 'live-recording',
      status: 'ready',
      duration: '1:23:45',
      size: '2.4 GB',
      views: 12453,
      created: new Date('2024-01-15'),
      privacy: 'public',
      tags: ['earnings', 'investor-relations']
    },
    {
      id: '2',
      title: 'Product Demo 2024',
      type: 'vod',
      status: 'ready',
      duration: '15:32',
      size: '450 MB',
      views: 8934,
      created: new Date('2024-01-10'),
      privacy: 'unlisted',
      tags: ['product', 'demo']
    },
    {
      id: '3',
      title: 'Training Session - Module 1',
      type: 'simlive',
      status: 'scheduled',
      duration: '45:00',
      size: '1.2 GB',
      views: 0,
      created: new Date('2024-01-20'),
      privacy: 'private',
      tags: ['training', 'internal']
    }
  ]);

  const [playlists] = useState<Playlist[]>([
    {
      id: '1',
      title: 'Investor Relations 2024',
      description: 'All earnings calls and investor presentations for 2024',
      itemCount: 12,
      totalDuration: '18:45:00',
      visibility: 'public',
      created: new Date('2024-01-01')
    },
    {
      id: '2',
      title: 'Employee Training Series',
      description: 'Complete onboarding and training modules for new employees',
      itemCount: 24,
      totalDuration: '36:00:00',
      visibility: 'private',
      created: new Date('2024-01-05')
    }
  ]);

  const [microsites] = useState<Microsite[]>([
    {
      id: '1',
      name: 'Investor Portal',
      domain: 'investors.bigfootlive.io',
      status: 'active',
      theme: 'corporate',
      pages: 5,
      videos: 12,
      lastUpdated: new Date('2024-01-18'),
      analytics: {
        visits: 15234,
        uniqueVisitors: 8932,
        avgDuration: '8:45'
      }
    },
    {
      id: '2',
      name: 'Training Academy',
      domain: 'academy.bigfootlive.io',
      status: 'draft',
      theme: 'education',
      pages: 12,
      videos: 48,
      lastUpdated: new Date('2024-01-20'),
      analytics: {
        visits: 0,
        uniqueVisitors: 0,
        avgDuration: '0:00'
      }
    }
  ]);

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === contentItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(contentItems.map(item => item.id));
    }
  };

  const filteredContent = contentItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Content Library</h1>
          <p className="text-muted-foreground">Manage your videos, playlists, and microsites</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <FolderPlus className="h-4 w-4 mr-2" />
            New Playlist
          </Button>
          <Button variant="outline">
            <Globe className="h-4 w-4 mr-2" />
            New Microsite
          </Button>
          <UploadDialog />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="videos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="videos">
            Videos ({contentItems.length})
          </TabsTrigger>
          <TabsTrigger value="playlists">
            Playlists ({playlists.length})
          </TabsTrigger>
          <TabsTrigger value="microsites">
            Microsites ({microsites.length})
          </TabsTrigger>
        </TabsList>

        {/* Videos Tab */}
        <TabsContent value="videos" className="space-y-4">
          {/* Filters and Search */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search videos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="vod">VOD</SelectItem>
                  <SelectItem value="simlive">SimLive</SelectItem>
                  <SelectItem value="live-recording">Live Recording</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date Added</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="views">Views</SelectItem>
                  <SelectItem value="duration">Duration</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' ? 'bg-accent' : ''}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'bg-accent' : ''}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Selection Actions */}
          {selectedItems.length > 0 && (
            <Card>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <Checkbox
                    checked={selectedItems.length === contentItems.length}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-sm font-medium">
                    {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Folder className="h-4 w-4 mr-2" />
                    Add to Playlist
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm" className="text-danger">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Content Grid/List */}
          {viewMode === 'grid' ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredContent.map(content => (
                <ContentCard
                  key={content.id}
                  content={content}
                  viewMode={viewMode}
                  selected={selectedItems.includes(content.id)}
                  onSelect={handleSelectItem}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredContent.map(content => (
                <ContentCard
                  key={content.id}
                  content={content}
                  viewMode={viewMode}
                  selected={selectedItems.includes(content.id)}
                  onSelect={handleSelectItem}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Playlists Tab */}
        <TabsContent value="playlists" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {playlists.map(playlist => (
              <PlaylistCard key={playlist.id} playlist={playlist} />
            ))}
          </div>
        </TabsContent>

        {/* Microsites Tab */}
        <TabsContent value="microsites" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {microsites.map(microsite => (
              <MicrositeCard key={microsite.id} microsite={microsite} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}