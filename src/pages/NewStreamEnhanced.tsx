import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, BookOpen, Calendar, Check, Copy, Gamepad2, Globe, Info, MessageSquare, Music, Palette, Radio, Sparkles, Video, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { notify } from '@/hooks/useNotifications';

interface StreamCategory {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const categories: StreamCategory[] = [
  { id: 'gaming', name: 'Gaming', icon: Gamepad2, color: 'text-purple-600' },
  { id: 'music', name: 'Music', icon: Music, color: 'text-pink-600' },
  { id: 'art', name: 'Art & Creative', icon: Palette, color: 'text-blue-600' },
  { id: 'education', name: 'Education', icon: BookOpen, color: 'text-green-600' },
  { id: 'talk', name: 'Just Chatting', icon: MessageSquare, color: 'text-orange-600' },
];

export default function NewStreamEnhanced() {
  const navigate = useNavigate();
  const [streamType, setStreamType] = useState<'instant' | 'scheduled'>('instant');
  const [streamKey, setStreamKey] = useState('');
  const [rtmpUrl] = useState('rtmp://live.bigfootlive.io/live');
  const [copied, setCopied] = useState<'key' | 'url' | null>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [chatEnabled, setChatEnabled] = useState(true);
  const [recordingEnabled, setRecordingEnabled] = useState(false);
  // const [scheduledDate] = useState('');
  // const [scheduledTime] = useState('');
  
  // Stream settings
  const [resolution, setResolution] = useState('1080p');
  const [fps, setFps] = useState('60');
  const [bitrate, setBitrate] = useState('4500');
  
  const generateStreamKey = () => {
    const key = `live_${Math.random().toString(36).substring(2, 15)}`;
    setStreamKey(key);
    notify.success('Stream key generated!');
  };
  
  const copyToClipboard = (text: string, type: 'key' | 'url') => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };
  
  const handleStartStream = async () => {
    if (!title || !category) {
      notify.error('Please fill in all required fields');
      return;
    }
    
    // API call to create stream
    notify.success('Stream created successfully!');
    navigate('/streams/live/123'); // Navigate to live view
  };
  
  // const __handleScheduleStream = async () => {
  //   if (!title || !category || !scheduledDate || !scheduledTime) {
  //     notify.error('Please fill in all required fields');
  //     return;
  //   }
  //   
  //   // API call to schedule stream
  //   notify.success('Stream scheduled successfully!');
  //   navigate('/streams');
  // };
  
  return (
    <motion.div 
      className="p-8 max-w-6xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create New Stream</h1>
        <p className="text-muted-foreground">Set up your broadcast and go live</p>
      </div>
      
      {/* Stream Type Selector */}
      <Tabs value={streamType} onValueChange={(v) => setStreamType(v as "file" | "url" | "simlive")} className="mb-8">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="instant" className="flex items-center gap-2">
            <Radio className="h-4 w-4" />
            Go Live Now
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Schedule Stream
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="instant" className="space-y-6 mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Stream Details */}
            <Card>
              <CardHeader>
                <CardTitle>Stream Details</CardTitle>
                <CardDescription>Tell viewers about your stream</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Stream Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter a catchy title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-lg"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="What's your stream about?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {categories.map((cat) => (
                      <motion.div
                        key={cat.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card
                          className={cn(
                            "cursor-pointer transition-all",
                            category === cat.id && "ring-2 ring-primary"
                          )}
                          onClick={() => setCategory(cat.id)}
                        >
                          <CardContent className="flex items-center gap-3 p-4">
                            <cat.icon className={cn("h-5 w-5", cat.color)} />
                            <span className="font-medium">{cat.name}</span>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Stream Configuration */}
            <div className="space-y-6">
              {/* Privacy Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Privacy & Features</CardTitle>
                  <CardDescription>Control who can view and interact</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="public">Public Stream</Label>
                    </div>
                    <Switch
                      id="public"
                      checked={isPublic}
                      onCheckedChange={setIsPublic}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="chat">Enable Chat</Label>
                    </div>
                    <Switch
                      id="chat"
                      checked={chatEnabled}
                      onCheckedChange={setChatEnabled}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="recording">Record Stream</Label>
                    </div>
                    <Switch
                      id="recording"
                      checked={recordingEnabled}
                      onCheckedChange={setRecordingEnabled}
                    />
                  </div>
                </CardContent>
              </Card>
              
              {/* Stream Quality */}
              <Card>
                <CardHeader>
                  <CardTitle>Stream Quality</CardTitle>
                  <CardDescription>Recommended settings for best quality</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Resolution</Label>
                    <Select value={resolution} onValueChange={setResolution}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="720p">720p HD</SelectItem>
                        <SelectItem value="1080p">1080p Full HD</SelectItem>
                        <SelectItem value="1440p">1440p 2K</SelectItem>
                        <SelectItem value="2160p">2160p 4K</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Frame Rate</Label>
                    <Select value={fps} onValueChange={setFps}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 FPS</SelectItem>
                        <SelectItem value="60">60 FPS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Bitrate</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={bitrate}
                        onChange={(e) => setBitrate(e.target.value)}
                        className="flex-1"
                      />
                      <span className="text-sm text-muted-foreground">kbps</span>
                    </div>
                  </div>
                  
                  <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 p-3">
                    <div className="flex gap-2">
                      <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                      <p className="text-sm text-blue-900 dark:text-blue-200">
                        For {resolution} at {fps} FPS, we recommend a bitrate of {bitrate} kbps
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Stream Key Section */}
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-purple-600" />
                Ready to Stream?
              </CardTitle>
              <CardDescription>
                Use these credentials in your streaming software
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!streamKey ? (
                <Button
                  size="lg"
                  className="w-full"
                  onClick={generateStreamKey}
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  Generate Stream Key
                </Button>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label>RTMP Server URL</Label>
                    <div className="flex gap-2">
                      <Input value={rtmpUrl} readOnly className="font-mono text-sm" />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(rtmpUrl, 'url')}
                      >
                        {copied === 'url' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Stream Key</Label>
                    <div className="flex gap-2">
                      <Input 
                        value={streamKey} 
                        readOnly 
                        type="password"
                        className="font-mono text-sm" 
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(streamKey, 'key')}
                      >
                        {copied === 'key' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950/20 p-3">
                    <div className="flex gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
                      <p className="text-sm text-yellow-900 dark:text-yellow-200">
                        Keep your stream key private. Anyone with this key can stream to your channel.
                      </p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={handleStartStream}
                    disabled={!title || !category}
                  >
                    <Radio className="h-5 w-5 mr-2" />
                    Start Streaming
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="scheduled" className="space-y-6 mt-6">
          {/* Scheduled stream form would go here */}
          <Card>
            <CardHeader>
              <CardTitle>Schedule Your Stream</CardTitle>
              <CardDescription>Plan your broadcast in advance</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}