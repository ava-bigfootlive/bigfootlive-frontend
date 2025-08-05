import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Heart, 
  Share2, 
  Radio,
  Minimize,
  Settings,
  MessageSquare,
  ThumbsUp,
  Gift
} from 'lucide-react';
import EnhancedVideoPlayer from '@/components/video/EnhancedVideoPlayer';
import StreamChat from '@/components/Chat/StreamChat';
import { cn } from '@/lib/utils';

interface StreamViewerProps {
  streamId: string;
  hlsUrl: string;
  title: string;
  description?: string;
  streamerName: string;
  streamerAvatar?: string;
  isLive: boolean;
  viewerCount: number;
  onViewerJoin?: () => void;
  onViewerLeave?: () => void;
}

interface ViewerInteraction {
  likes: number;
  shares: number;
  donations: number;
}

export function StreamViewer({
  streamId,
  hlsUrl,
  title,
  description,
  streamerName,
  streamerAvatar,
  isLive,
  viewerCount,
  onViewerJoin,
  onViewerLeave
}: StreamViewerProps) {
  const [showChat, setShowChat] = useState(true);
  const [liked, setLiked] = useState(false);
  const [interactions, setInteractions] = useState<ViewerInteraction>({
    likes: 127,
    shares: 23,
    donations: 5
  });
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    // Report viewer join
    if (onViewerJoin) {
      onViewerJoin();
    }

    return () => {
      // Report viewer leave
      if (onViewerLeave) {
        onViewerLeave();
      }
    };
  }, [onViewerJoin, onViewerLeave]);

  const handleLike = () => {
    setLiked(!liked);
    setInteractions(prev => ({
      ...prev,
      likes: liked ? prev.likes - 1 : prev.likes + 1
    }));
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: title,
        text: `Watch ${streamerName} live on BigfootLive!`,
        url: window.location.href
      });
      setInteractions(prev => ({ ...prev, shares: prev.shares + 1 }));
    } catch {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className={cn(
        "flex h-screen",
        showChat ? "" : "justify-center"
      )}>
        {/* Main Video Area */}
        <div className={cn(
          "flex-1 flex flex-col",
          showChat ? "max-w-[calc(100%-320px)]" : "max-w-none"
        )}>
          {/* Video Player */}
          <div className="relative flex-1 bg-black">
            <EnhancedVideoPlayer
              src={hlsUrl}
              isLive={isLive}
              title={title}
              viewers={viewerCount}
              onViewerJoin={onViewerJoin}
              onViewerLeave={onViewerLeave}
            />
            
            {/* Stream Info Overlay */}
            <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isLive && (
                    <Badge variant="destructive" className="animate-pulse">
                      <Radio className="h-3 w-3 mr-1" />
                      LIVE
                    </Badge>
                  )}
                  <Badge variant="secondary" className="bg-black/70">
                    <Users className="h-3 w-3 mr-1" />
                    {viewerCount.toLocaleString()}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={() => setShowChat(!showChat)}
                  >
                    <MessageSquare className={cn("h-4 w-4", showChat && "text-blue-400")} />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Stream Details */}
          <Card className="m-4 mt-0 rounded-t-none border-t-0">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold mb-2">{title}</h1>
                  
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={streamerAvatar} />
                      <AvatarFallback>
                        {streamerName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <p className="font-semibold">{streamerName}</p>
                      <p className="text-sm text-muted-foreground">
                        {viewerCount.toLocaleString()} viewers
                        {isLive && " • Live now"}
                      </p>
                    </div>
                    
                    <Button
                      variant={isFollowing ? "secondary" : "default"}
                      onClick={handleFollow}
                      className="px-6"
                    >
                      {isFollowing ? "Following" : "Follow"}
                    </Button>
                  </div>
                  
                  {description && (
                    <p className="text-muted-foreground text-sm mb-4">
                      {description}
                    </p>
                  )}
                  
                  {/* Interaction Buttons */}
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLike}
                      className={cn(
                        "flex items-center gap-2",
                        liked && "text-red-500"
                      )}
                    >
                      <Heart className={cn("h-4 w-4", liked && "fill-current")} />
                      <span>{interactions.likes}</span>
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleShare}
                      className="flex items-center gap-2"
                    >
                      <Share2 className="h-4 w-4" />
                      <span>{interactions.shares}</span>
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Gift className="h-4 w-4" />
                      <span>Donate</span>
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      <span>React</span>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Mobile Chat Toggle */}
          <div className="md:hidden px-4 pb-4">
            <Button
              variant="outline"
              onClick={() => setShowChat(!showChat)}
              className="w-full"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              {showChat ? "Hide Chat" : "Show Chat"}
            </Button>
          </div>
        </div>

        {/* Chat Sidebar */}
        {showChat && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="w-80 border-l bg-card flex flex-col"
          >
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Stream Chat</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowChat(false)}
                  className="h-8 w-8"
                >
                  <Minimize className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex-1">
              <StreamChat streamId={streamId} />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
