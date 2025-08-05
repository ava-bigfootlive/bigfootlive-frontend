import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { VideoPlayer } from '@/components/video/VideoPlayer';
import { LiveIndicator } from '@/components/video/LiveIndicator';
import StreamChat from '@/components/Chat/StreamChat';
import { PollList } from '@/components/polls/PollList';
import { QuestionList } from '@/components/qa/QuestionList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Share2, 
  Heart, 
  Users,
  Clock,
  MoreVertical,
  MessageSquare,
  BarChart3,
  HelpCircle
} from 'lucide-react';

// Mock stream data
const mockStream = {
  id: '1',
  title: 'Live Product Demo - Q1 2024 Features',
  description: 'Join us for an exciting demonstration of our latest features and improvements. We\'ll cover the new dashboard, enhanced analytics, and our revolutionary AI-powered streaming assistant.',
  status: 'live' as const,
  viewers: 1234,
  likes: 456,
  startedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
  streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', // Sample HLS stream
  thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1920&h=1080&fit=crop',
  host: {
    name: 'John Doe',
    avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=6366f1&color=fff&size=40',
    role: 'Product Manager'
  }
};

export default function StreamView() {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);

  const getDuration = () => {
    const now = new Date();
    const diff = now.getTime() - mockStream.startedAt.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4 lg:p-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Video player */}
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <VideoPlayer 
                src={mockStream.streamUrl}
                poster={mockStream.thumbnail}
                className="w-full h-full"
                autoPlay
              />
              <div className="absolute top-4 left-4">
                <LiveIndicator isLive={mockStream.status === 'live'} viewers={mockStream.viewers} />
              </div>
            </div>

            {/* Stream info */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-2xl">{mockStream.title}</CardTitle>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {mockStream.viewers.toLocaleString()} watching
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Started {getDuration()} ago
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={isLiked ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIsLiked(!isLiked)}
                    >
                      <Heart className={cn("h-4 w-4 mr-1", isLiked && "fill-current")} />
                      {mockStream.likes + (isLiked ? 1 : 0)}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <img 
                    src={mockStream.host.avatar} 
                    alt={mockStream.host.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-medium">{mockStream.host.name}</p>
                    <p className="text-sm text-muted-foreground">{mockStream.host.role}</p>
                  </div>
                </div>
                <CardDescription className="text-base">
                  {mockStream.description}
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Chat, Polls & Q&A */}
          <div className="space-y-4">
            <Tabs defaultValue="chat" className="h-[600px]">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="chat" className="flex items-center gap-1 text-xs">
                  <MessageSquare className="h-4 w-4" />
                  Chat
                </TabsTrigger>
                <TabsTrigger value="polls" className="flex items-center gap-1 text-xs">
                  <BarChart3 className="h-4 w-4" />
                  Polls
                </TabsTrigger>
                <TabsTrigger value="qa" className="flex items-center gap-1 text-xs">
                  <HelpCircle className="h-4 w-4" />
                  Q&A
                </TabsTrigger>
              </TabsList>
              <TabsContent value="chat" className="h-[calc(100%-40px)]">
                <StreamChat 
                  streamId={mockStream.id} 
                  isOwner={false}
                  isModerator={false}
                />
              </TabsContent>
              <TabsContent value="polls" className="h-[calc(100%-40px)]">
                <PollList 
                  streamId={mockStream.id}
                  canCreate={false}
                  className="h-full"
                />
              </TabsContent>
              <TabsContent value="qa" className="h-[calc(100%-40px)]">
                <QuestionList 
                  streamId={mockStream.id}
                  canAsk={true}
                  canModerate={false}
                  canAnswer={false}
                  className="h-full"
                />
              </TabsContent>
            </Tabs>

            {/* Related streams */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Related Streams</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div 
                    key={i} 
                    className="flex gap-3 cursor-pointer hover:bg-accent/50 p-2 -m-2 rounded"
                    onClick={() => navigate(`/streams/${i + 1}`)}
                  >
                    <div className="w-24 h-16 bg-muted rounded" />
                    <div className="flex-1">
                      <p className="font-medium text-sm line-clamp-2">
                        Another Great Stream Title #{i}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        2.3K views • 2 days ago
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}