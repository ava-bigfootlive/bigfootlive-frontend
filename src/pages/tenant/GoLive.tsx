import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Settings, Video, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StreamSetup } from '@/components/streaming/StreamSetup';
import { StreamControlCenter } from '@/components/streaming/StreamControlCenter';
import { eventService, type StreamEvent } from '@/services/events';
import { type LaunchResponse } from '@/services/streaming';
import { notify } from '@/hooks/useNotifications';

export default function GoLive() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [resolution, setResolution] = useState('1920x1080');
  const [bitrate, setBitrate] = useState('4000');
  const [framerate, setFramerate] = useState('30');
  const [enableChat, setEnableChat] = useState(true);
  const [enableRecording, setEnableRecording] = useState(true);
  const [isPublic, setIsPublic] = useState(true);
  
  // Created event state
  const [createdEvent, setCreatedEvent] = useState<StreamEvent | null>(null);
  const [launchResponse, setLaunchResponse] = useState<LaunchResponse | null>(null);
  const [streamingPhase, setStreamingPhase] = useState<'setup' | 'launched' | 'live'>('setup');

  const handleCreateStream = async () => {
    if (!title.trim()) {
      notify.error('Please enter a stream title');
      return;
    }

    setLoading(true);
    try {
      const event = await eventService.createEvent({
        title: title.trim(),
        description: description.trim(),
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        privacy: isPublic ? 'public' : 'private',
        chat_enabled: enableChat,
        recording_enabled: enableRecording,
        donations_enabled: false
      });

      setCreatedEvent(event);
      setActiveTab('setup');
      notify.success('Stream created successfully!');
    } catch (error) {
      notify.error('Failed to create stream');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Go Live</h1>
          <p className="text-muted-foreground">
            Create and start your live stream
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic" disabled={createdEvent}>
            <span className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              Basic Info
            </span>
          </TabsTrigger>
          <TabsTrigger value="settings" disabled={createdEvent}>
            <span className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </span>
          </TabsTrigger>
          <TabsTrigger value="setup" disabled={!createdEvent}>
            <span className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Stream Setup
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Stream Information</CardTitle>
              <CardDescription>
                Enter basic information about your stream
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter stream title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={loading || createdEvent}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what your stream is about"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={loading || createdEvent}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  placeholder="gaming, tutorial, live (comma separated)"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  disabled={loading || createdEvent}
                />
                <p className="text-xs text-muted-foreground">
                  Add tags to help viewers find your stream
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Stream Quality</CardTitle>
                <CardDescription>
                  Configure your stream output settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="resolution">Resolution</Label>
                  <Select value={resolution} onValueChange={setResolution} disabled={loading || createdEvent}>
                    <SelectTrigger id="resolution">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1920x1080">1080p (1920x1080)</SelectItem>
                      <SelectItem value="1280x720">720p (1280x720)</SelectItem>
                      <SelectItem value="854x480">480p (854x480)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bitrate">Bitrate (kbps)</Label>
                  <Select value={bitrate} onValueChange={setBitrate} disabled={loading || createdEvent}>
                    <SelectTrigger id="bitrate">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6000">6000 kbps (High)</SelectItem>
                      <SelectItem value="4000">4000 kbps (Recommended)</SelectItem>
                      <SelectItem value="2500">2500 kbps (Medium)</SelectItem>
                      <SelectItem value="1500">1500 kbps (Low)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="framerate">Frame Rate</Label>
                  <Select value={framerate} onValueChange={setFramerate} disabled={loading || createdEvent}>
                    <SelectTrigger id="framerate">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="60">60 FPS</SelectItem>
                      <SelectItem value="30">30 FPS</SelectItem>
                      <SelectItem value="24">24 FPS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Stream Features</CardTitle>
                <CardDescription>
                  Enable or disable stream features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Chat</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow viewers to chat during the stream
                    </p>
                  </div>
                  <Switch
                    checked={enableChat}
                    onCheckedChange={setEnableChat}
                    disabled={loading || createdEvent}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Recording</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically record your stream
                    </p>
                  </div>
                  <Switch
                    checked={enableRecording}
                    onCheckedChange={setEnableRecording}
                    disabled={loading || createdEvent}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Public Stream</Label>
                    <p className="text-sm text-muted-foreground">
                      Make stream visible to everyone
                    </p>
                  </div>
                  <Switch
                    checked={isPublic}
                    onCheckedChange={setIsPublic}
                    disabled={loading || createdEvent}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {!createdEvent && (
            <div className="flex justify-end">
              <Button
                size="lg"
                onClick={handleCreateStream}
                disabled={loading || !title.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Create Stream
                  </>
                )}
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="setup" className="space-y-6">
          {createdEvent && (
            <>
              {streamingPhase === 'setup' && !launchResponse && (
                <StreamSetup
                  eventId={createdEvent.id}
                  streamKey={createdEvent.stream_key || 'generating...'}
                  onLaunchSuccess={(response) => {
                    setLaunchResponse(response);
                    setStreamingPhase('launched');
                  }}
                  onLaunchError={(error) => {
                    notify.error(error);
                  }}
                />
              )}
              
              {streamingPhase === 'launched' && launchResponse && (
                <StreamControlCenter
                  launchResponse={launchResponse}
                  onStreamEnd={() => {
                    setStreamingPhase('setup');
                    setLaunchResponse(null);
                    navigate('/tenant');
                  }}
                />
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}