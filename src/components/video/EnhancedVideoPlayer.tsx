import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Heart, Loader2, Maximize, MessageSquare, Minimize, Pause, Play, Radio, Settings, Share2, SkipBack, SkipForward, Users, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnhancedVideoPlayerProps {
  src: string;
  isLive?: boolean;
  title?: string;
  viewers?: number;
  onViewerJoin?: () => void;
  onViewerLeave?: () => void;
}

export default function EnhancedVideoPlayer({
  src,
  isLive = false,
  title = '',
  viewers = 0,
  onViewerJoin,
  onViewerLeave
}: EnhancedVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [volume, setVolume] = useState(100);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [showStats, setShowStats] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [quality, setQuality] = useState('auto');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [playbackRate, setPlaybackRate] = useState(1);
  
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
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
  
  // Auto-hide controls
  useEffect(() => {
    const hideControls = () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }, 3000);
    };
    
    hideControls();
    
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying, showControls]);
  
  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume / 100;
      setIsMuted(newVolume === 0);
    }
  };
  
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
      if (!isMuted) {
        setVolume(0);
      } else {
        setVolume(100);
        videoRef.current.volume = 1;
      }
    }
  };
  
  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleSeek = (value: number[]) => {
    const newTime = value[0];
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };
  
  const skipTime = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };
  
  return (
    <motion.div
      ref={containerRef}
      className={cn(
        "relative bg-black rounded-lg overflow-hidden",
        isFullscreen && "fixed inset-0 z-50"
      )}
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full"
        onLoadedMetadata={(e) => {
          setDuration(e.currentTarget.duration);
        }}
        onTimeUpdate={(e) => {
          setCurrentTime(e.currentTarget.currentTime);
        }}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        onEnded={() => setIsPlaying(false)}
      />
      
      {/* Buffering Indicator */}
      <AnimatePresence>
        {isBuffering && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/50"
          >
            <Loader2 className="h-12 w-12 animate-spin text-white" />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Live Indicator */}
      {isLive && (
        <div className="absolute top-4 left-4 z-20">
          <Badge variant="destructive" className="animate-pulse-live">
            <Radio className="h-3 w-3 mr-1" />
            LIVE
          </Badge>
        </div>
      )}
      
      {/* Viewer Count */}
      {viewers > 0 && (
        <div className="absolute top-4 right-4 z-20">
          <Badge variant="secondary" className="bg-black/70 text-white">
            <Users className="h-3 w-3 mr-1" />
            {viewers.toLocaleString()}
          </Badge>
        </div>
      )}
      
      {/* Controls Overlay */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"
          >
            {/* Title */}
            {title && (
              <div className="absolute top-16 left-4 right-4">
                <h2 className="text-white text-xl font-semibold">{title}</h2>
              </div>
            )}
            
            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              {/* Progress Bar */}
              {!isLive && (
                <div className="mb-4">
                  <Slider
                    value={[currentTime]}
                    max={duration}
                    step={0.1}
                    onValueChange={handleSeek}
                    className="cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-white/70 mt-1">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>
              )}
              
              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* Play/Pause */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={handlePlayPause}
                  >
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </Button>
                  
                  {/* Skip buttons (for VOD) */}
                  {!isLive && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20"
                        onClick={() => skipTime(-10)}
                      >
                        <SkipBack className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20"
                        onClick={() => skipTime(10)}
                      >
                        <SkipForward className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  
                  {/* Volume */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/20"
                      onClick={toggleMute}
                    >
                      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                    <div className="w-24">
                      <Slider
                        value={[volume]}
                        max={100}
                        step={1}
                        onValueChange={handleVolumeChange}
                        className="cursor-pointer"
                      />
                    </div>
                  </div>
                  
                  {/* Current time / Live indicator */}
                  <span className="text-sm text-white ml-2">
                    {isLive ? 'LIVE' : `${formatTime(currentTime)} / ${formatTime(duration)}`}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Quality Selector */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                    onClick={() => setShowStats(!showStats)}
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    {quality}
                  </Button>
                  
                  {/* Chat Toggle */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                  
                  {/* Like */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                  
                  {/* Share */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                  
                  {/* Fullscreen */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={handleFullscreen}
                  >
                    {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Stats Overlay */}
            {showStats && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-20 right-4 bg-black/80 rounded-lg p-4 text-white text-sm"
              >
                <div className="space-y-2">
                  <div className="flex justify-between gap-8">
                    <span className="text-white/70">Quality:</span>
                    <span>1080p60</span>
                  </div>
                  <div className="flex justify-between gap-8">
                    <span className="text-white/70">Bitrate:</span>
                    <span>4,500 kbps</span>
                  </div>
                  <div className="flex justify-between gap-8">
                    <span className="text-white/70">Latency:</span>
                    <span className="text-green-400">2.3s</span>
                  </div>
                  <div className="flex justify-between gap-8">
                    <span className="text-white/70">Dropped Frames:</span>
                    <span>0</span>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}