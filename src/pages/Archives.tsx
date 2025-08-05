import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Archive, BarChart3, Calendar, CheckCircle, Clock, Database, DollarSign, Download, Eye, Search } from 'lucide-react';
import {
  Card, CardHeader, CardContent, CardTitle, CardDescription} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle} from '@/components/ui/dialog';


import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { formatDistanceToNow, format } from 'date-fns';
import api from '@/lib/api';

interface Archive {
  id: string;
  event_id: string;
  event_title: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  storage_tier: 'hot' | 'warm' | 'cool' | 'glacier' | 'deep_archive';
  package_size_bytes: number;
  content_summary: {
    video_count: number;
    total_duration_seconds: number;
    chat_message_count: number;
    unique_viewers: number;
    peak_concurrent_viewers: number;
    total_bandwidth_gb: number;
  };
  retrieval_status: 'not_requested' | 'pending' | 'in_progress' | 'available' | 'expired';
  retrieval_available_until?: string;
  storage_cost_monthly: number;
  created_at: string;
  completed_at?: string;
}

const STORAGE_TIER_INFO = {
  hot: {
    label: 'Hot Storage',
    description: 'Instant access',
    icon: '🔥',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10'
  },
  warm: {
    label: 'Warm Storage',
    description: 'Instant access',
    icon: '☀️',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10'
  },
  cool: {
    label: 'Cool Storage',
    description: 'Instant access',
    icon: '❄️',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10'
  },
  glacier: {
    label: 'Glacier',
    description: '3-5 hour retrieval',
    icon: '🧊',
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10'
  },
  deep_archive: {
    label: 'Deep Archive',
    description: '12-48 hour retrieval',
    icon: '🗄️',
    color: 'text-gray-500',
    bgColor: 'bg-gray-500/10'
  }
};

export default function Archives() {
  const [archives, setArchives] = useState<Archive[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [selectedArchive, setSelectedArchive] = useState<Archive | null>(null);
  const [retrievalDialog, setRetrievalDialog] = useState(false);
  const [retrievalType, setRetrievalType] = useState('Standard');

  const fetchArchives = useCallback(async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockArchives: Archive[] = [
        {
          id: '1',
          title: 'Q4 2024 Earnings Call',
          status: 'available',
          tier: 'standard',
          size: 1024 * 1024 * 500,
          created_at: new Date(Date.now() - 86400000),
          last_accessed: new Date(Date.now() - 3600000),
          views: 1234,
          duration: 3600,
          metadata: {
            format: 'mp4',
            resolution: '1080p',
            bitrate: '5000kbps'
          }
        }
      ];
      setArchives(mockArchives);
    } catch (error) { void error;
      console.error('Error fetching archives:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArchives();
  }, [fetchArchives]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: unknown; icon: JSX.Element }> = {
      completed: { variant: 'success', icon: <CheckCircle className="w-3 h-3" /> },
      in_progress: { variant: 'warning', icon: <Loader2 className="w-3 h-3 animate-spin" /> },
      pending: { variant: 'secondary', icon: <Clock className="w-3 h-3" /> },
      failed: { variant: 'destructive', icon: <AlertCircle className="w-3 h-3" /> }
    };
    
    const { variant, icon } = variants[status] || variants.pending;
    
    return (
      <Badge variant={variant} className="gap-1">
        {icon}
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const handleRetrieve = async () => {
    if (!selectedArchive) return;
    
    try {
      const response = await api.post(`/api/v1/archives/${selectedArchive.id}/retrieve`, {
        retrieval_type: retrievalType
      });
      
      if (response.data.status === 'available') {
        toast.success('Archive is ready for download');
        window.open(response.data.download_url, '_blank');
      } else {
        toast.info(`Retrieval initiated. Estimated completion: ${response.data.estimated_completion}`);
      }
      
      setRetrievalDialog(false);
      fetchArchives();
    } catch (error) { void error;
      toast.error('Failed to initiate retrieval');
    }
  };

  const filteredArchives = archives.filter(archive =>
    archive.event_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    archive.event_id.includes(searchQuery)
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Archive className="w-8 h-8 text-primary" />
            Event Archives
          </h1>
          <p className="text-muted-foreground mt-1">
            Browse and retrieve archived streaming events
          </p>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col md:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search by event title or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={tierFilter} onValueChange={setTierFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by tier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tiers</SelectItem>
            <SelectItem value="hot">Hot Storage</SelectItem>
            <SelectItem value="warm">Warm Storage</SelectItem>
            <SelectItem value="cool">Cool Storage</SelectItem>
            <SelectItem value="glacier">Glacier</SelectItem>
            <SelectItem value="deep_archive">Deep Archive</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Archives Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {filteredArchives.map((archive, index) => {
              const tierInfo = STORAGE_TIER_INFO[archive.storage_tier];
              
              return (
                <motion.div
                  key={archive.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card 
                    className="group hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary/50"
                    onClick={() => setSelectedArchive(archive)}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1">
                          <CardTitle className="text-lg line-clamp-1">
                            {archive.event_title}
                          </CardTitle>
                          <CardDescription className="text-xs mt-1">
                            {archive.event_id}
                          </CardDescription>
                        </div>
                        {getStatusBadge(archive.status)}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Storage Tier */}
                      <div className={`flex items-center gap-2 p-2 rounded-lg ${tierInfo.bgColor}`}>
                        <span className="text-2xl">{tierInfo.icon}</span>
                        <div className="flex-1">
                          <p className={`font-medium text-sm ${tierInfo.color}`}>
                            {tierInfo.label}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {tierInfo.description}
                          </p>
                        </div>
                      </div>
                      
                      {/* Content Summary */}
                      {archive.content_summary && (
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-1">
                            <Play className="w-3 h-3 text-muted-foreground" />
                            <span>{archive.content_summary.video_count} videos</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            <span>{formatDuration(archive.content_summary.total_duration_seconds)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3 text-muted-foreground" />
                            <span>{archive.content_summary.unique_viewers} viewers</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Database className="w-3 h-3 text-muted-foreground" />
                            <span>{formatBytes(archive.package_size_bytes)}</span>
                          </div>
                        </div>
                      )}
                      
                      <Separator />
                      
                      {/* Footer */}
                      <div className="flex justify-between items-center">
                        <div className="text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          {format(new Date(archive.created_at), 'MMM d, yyyy')}
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <DollarSign className="w-3 h-3" />
                          <span className="font-medium">
                            ${archive.storage_cost_monthly.toFixed(2)}/mo
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Archive Details Dialog */}
      <Dialog open={!!selectedArchive} onOpenChange={() => setSelectedArchive(null)}>
        {selectedArchive && (
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">{selectedArchive.event_title}</DialogTitle>
              <DialogDescription>
                Event ID: {selectedArchive.event_id}
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="overview" className="mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="retrieval">Retrieval</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Archive Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {getStatusBadge(selectedArchive.status)}
                      {selectedArchive.completed_at && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Completed {formatDistanceToNow(new Date(selectedArchive.completed_at))} ago
                        </p>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Storage Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{STORAGE_TIER_INFO[selectedArchive.storage_tier].label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <HardDrive className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{formatBytes(selectedArchive.package_size_bytes)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">${selectedArchive.storage_cost_monthly.toFixed(2)}/month</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="content" className="space-y-4">
                {selectedArchive.content_summary ? (
                  <>
                    <div className="grid grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Play className="w-4 h-4" />
                            Videos
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold">{selectedArchive.content_summary.video_count}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDuration(selectedArchive.content_summary.total_duration_seconds)} total
                          </p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            Viewers
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold">{selectedArchive.content_summary.unique_viewers}</p>
                          <p className="text-sm text-muted-foreground">
                            Peak: {selectedArchive.content_summary.peak_concurrent_viewers}
                          </p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <BarChart3 className="w-4 h-4" />
                            Bandwidth
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold">
                            {selectedArchive.content_summary.total_bandwidth_gb.toFixed(1)} GB
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Total transferred
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Chat Activity</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-lg font-semibold">
                          {selectedArchive.content_summary.chat_message_count.toLocaleString()} messages
                        </p>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Content summary not available
                  </p>
                )}
              </TabsContent>
              
              <TabsContent value="retrieval" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Retrieval Options</CardTitle>
                    <CardDescription>
                      {selectedArchive.storage_tier === 'hot' || selectedArchive.storage_tier === 'warm' || selectedArchive.storage_tier === 'cool' ? (
                        'This archive is available for instant download'
                      ) : (
                        'This archive requires retrieval from cold storage'
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedArchive.retrieval_status === 'available' && selectedArchive.retrieval_available_until && (
                      <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <p className="text-sm text-green-600 dark:text-green-400">
                          Archive is available for download until{' '}
                          {format(new Date(selectedArchive.retrieval_available_until), 'PPp')}
                        </p>
                      </div>
                    )}
                    
                    {selectedArchive.storage_tier === 'glacier' && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium">Glacier Retrieval Options</h4>
                        <div className="space-y-2">
                          <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-accent">
                            <input
                              type="radio"
                              value="Expedited"
                              checked={retrievalType === 'Expedited'}
                              onChange={(e) => setRetrievalType(e.target.value)}
                            />
                            <div className="flex-1">
                              <p className="font-medium">Expedited</p>
                              <p className="text-xs text-muted-foreground">1-5 minutes • ~$0.03/GB</p>
                            </div>
                          </label>
                          <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-accent">
                            <input
                              type="radio"
                              value="Standard"
                              checked={retrievalType === 'Standard'}
                              onChange={(e) => setRetrievalType(e.target.value)}
                            />
                            <div className="flex-1">
                              <p className="font-medium">Standard</p>
                              <p className="text-xs text-muted-foreground">3-5 hours • ~$0.01/GB</p>
                            </div>
                          </label>
                          <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-accent">
                            <input
                              type="radio"
                              value="Bulk"
                              checked={retrievalType === 'Bulk'}
                              onChange={(e) => setRetrievalType(e.target.value)}
                            />
                            <div className="flex-1">
                              <p className="font-medium">Bulk</p>
                              <p className="text-xs text-muted-foreground">5-12 hours • ~$0.0025/GB</p>
                            </div>
                          </label>
                        </div>
                      </div>
                    )}
                    
                    {selectedArchive.storage_tier === 'deep_archive' && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium">Deep Archive Retrieval Options</h4>
                        <div className="space-y-2">
                          <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-accent">
                            <input
                              type="radio"
                              value="Standard"
                              checked={retrievalType === 'Standard'}
                              onChange={(e) => setRetrievalType(e.target.value)}
                            />
                            <div className="flex-1">
                              <p className="font-medium">Standard</p>
                              <p className="text-xs text-muted-foreground">12 hours • ~$0.02/GB</p>
                            </div>
                          </label>
                          <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-accent">
                            <input
                              type="radio"
                              value="Bulk"
                              checked={retrievalType === 'Bulk'}
                              onChange={(e) => setRetrievalType(e.target.value)}
                            />
                            <div className="flex-1">
                              <p className="font-medium">Bulk</p>
                              <p className="text-xs text-muted-foreground">48 hours • ~$0.0025/GB</p>
                            </div>
                          </label>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setSelectedArchive(null)}>
                Close
              </Button>
              {selectedArchive.status === 'completed' && (
                <Button
                  onClick={() => {
                    if (selectedArchive.storage_tier === 'hot' || 
                        selectedArchive.storage_tier === 'warm' || 
                        selectedArchive.storage_tier === 'cool' ||
                        selectedArchive.retrieval_status === 'available') {
                      handleRetrieve();
                    } else {
                      setRetrievalDialog(true);
                    }
                  }}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  {selectedArchive.retrieval_status === 'available' ? 'Download' : 'Retrieve Archive'}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Retrieval Confirmation Dialog */}
      <Dialog open={retrievalDialog} onOpenChange={setRetrievalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Archive Retrieval</DialogTitle>
            <DialogDescription>
              You are about to initiate a retrieval for this archive.
            </DialogDescription>
          </DialogHeader>
          
          {selectedArchive && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <p className="text-sm">
                  <strong>Archive:</strong> {selectedArchive.event_title}
                </p>
                <p className="text-sm">
                  <strong>Size:</strong> {formatBytes(selectedArchive.package_size_bytes)}
                </p>
                <p className="text-sm">
                  <strong>Retrieval Type:</strong> {retrievalType}
                </p>
                <p className="text-sm">
                  <strong>Estimated Cost:</strong> $
                  {(selectedArchive.package_size_bytes / (1024 ** 3) * 
                    (retrievalType === 'Expedited' ? 0.03 : 
                     retrievalType === 'Standard' ? 0.01 : 0.0025)
                  ).toFixed(2)}
                </p>
              </div>
              
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  Retrieval charges will be applied to your account. The archive will be 
                  available for download for 24 hours after retrieval completes.
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setRetrievalDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRetrieve}>
              Confirm Retrieval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}