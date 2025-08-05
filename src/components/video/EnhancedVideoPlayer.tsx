import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Hls from 'hls.js';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Heart, 
  Loader2, 
  Maximize, 
  MessageSquare, 
  Minimize, 
  Pause, 
  Play, 
  Radio, 
  Settings, 
  Share2, 
  SkipBack, 
  SkipForward, 
  Users, 
  Volume2, 
  VolumeX,
  Check,
  Wifi,
  WifiOff,
  Activity,
  Eye,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QualityLevel {
  height: number;
  bitrate: number;
  name: string;
}

interface StreamStats {
  quality: string;
  bitrate: number;
  latency: number;
  droppedFrames: number;
  bufferHealth: number;
  connectionStatus: 'excellent' | 'good' | 'poor' | 'disconnected';
}

interface EnhancedVideoPlayerProps {
  src: string;
  poster?: string;
  isLive?: boolean;
  title?: string;
  viewers?: number;
  likes?: number;
  onViewerJoin?: () => void;
  onViewerLeave?: () => void;
  onLike?: () => void;
  onShare?: () => void;
  onChatToggle?: () => void;
  showChat?: boolean;
  className?: string;
}

const PLAYBACK_SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] as const;

export default function EnhancedVideoPlayer({
  src,
  poster,
  isLive = false,
  title = '',
  viewers = 0,
  likes = 0,
  onViewerJoin,
  onViewerLeave,
  onLike,
  onShare,
  onChatToggle,
  showChat = false,
  className
}: EnhancedVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [volume, setVolume] = useState(100);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isBuffering, setIsBuffering] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [qualityLevels, setQualityLevels] = useState<QualityLevel[]>([]);
  const [currentQuality, setCurrentQuality] = useState<number>(-1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [streamStats, setStreamStats] = useState<StreamStats>({
    quality: '1080p60',
    bitrate: 4500,
    latency: 2.3,
    droppedFrames: 0,
    bufferHealth: 100,
    connectionStatus: 'excellent'
  });
  const [liked, setLiked] = useState(false);

  // HLS and video initialization
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    if (src.endsWith('.m3u8') && Hls.isSupported()) {
      // HLS stream
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: isLive,
        backBufferLength: isLive ? 4 : 30,
      });
      
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setError('Network error - please check your connection');
              setStreamStats(prev => ({ ...prev, connectionStatus: 'poor' }));
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setError('Media error - attempting recovery');
              hls.recoverMediaError();
              break;
            default:
              setError('An error occurred loading the stream');
              setStreamStats(prev => ({ ...prev, connectionStatus: 'disconnected' }));
              break;
          }
        }
      });

      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        setIsLoading(false);
        
        // Extract quality levels from HLS manifest
        const levels: QualityLevel[] = data.levels.map((level, index) => {
          return {
            height: level.height,
            bitrate: level.bitrate,
            name: level.height ? `${level.height}p` : `Level ${index}`
          };
        });
        
        setQualityLevels(levels);
        setCurrentQuality(hls.currentLevel);
        
        // Update stream stats
        if (levels.length > 0) {
          const currentLevel = levels[hls.currentLevel] || levels[0];
          setStreamStats(prev => ({
            ...prev,
            quality: currentLevel.name,
            bitrate: Math.round(currentLevel.bitrate / 1000),
            connectionStatus: 'excellent'
          }));
        }
      });
      
      // Handle level switching events
      hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
        setCurrentQuality(data.level);
        if (qualityLevels[data.level]) {
          setStreamStats(prev => ({
            ...prev,
            quality: qualityLevels[data.level].name,
            bitrate: Math.round(qualityLevels[data.level].bitrate / 1000)
          }));
        }
      });

      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      video.src = src;
      setIsLoading(false);
    } else {
      // Regular video file
      video.src = src;
      setIsLoading(false);
    }
  }, [src, isLive, qualityLevels]);

  // Report viewer join/leave
  useEffect(() => {
    if (onViewerJoin) {
      onViewerJoin();
    }
    
    return () => {
      if (onViewerLeave) {
        onViewerLeave();
      }
    };
  }, [onViewerJoin, onViewerLeave]);
  
  // Auto-hide controls with proper cleanup
  useEffect(() => {
    const resetControlsTimer = () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      
      if (isPlaying && showControls) {
        controlsTimeoutRef.current = setTimeout(() => {
          setShowControls(false);
        }, 3000);
      }
    };
    
    resetControlsTimer();
    
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying, showControls]);

  // Optimized event handlers with useCallback
  const handlePlayPause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch(() => {
        setIsPlaying(false);
      });
    }
  }, [isPlaying]);
  
  const handleVolumeChange = useCallback((value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume / 100;
      setIsMuted(newVolume === 0);
    }
  }, []);
  
  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
    if (!isMuted) {
      setVolume(0);
    } else {
      setVolume(100);
      video.volume = 1;
    }
  }, [isMuted]);
  
  const handleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(() => {
        console.warn('Failed to enter fullscreen mode');
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {
        console.warn('Failed to exit fullscreen mode');
      });
      setIsFullscreen(false);
    }
  }, []);

  const handleQualityChange = useCallback((level: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = level;
      setCurrentQuality(level);
    }
  }, []);

  const handlePlaybackRateChange = useCallback((rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
    }
  }, []);

  const handleLike = useCallback(() => {
    setLiked(!liked);
    if (onLike) {
      onLike();
    }
  }, [liked, onLike]);

  const handleShare = useCallback(() => {
    if (onShare) {
      onShare();
    }
  }, [onShare]);

  const handleChatToggle = useCallback(() => {
    if (onChatToggle) {
      onChatToggle();
    }
  }, [onChatToggle]);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleSeek = useCallback((value: number[]) => {
    const newTime = value[0];
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  }, []);
  
  const skipTime = useCallback((seconds: number) => {
    if (videoRef.current) {
      const newTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
      videoRef.current.currentTime = newTime;
    }
  }, [duration]);

  // Connection status indicator
  const getConnectionIcon = () => {
    switch (streamStats.connectionStatus) {
      case 'excellent':
      case 'good':
        return <Wifi className="h-3 w-3" />;
      case 'poor':
        return <Activity className="h-3 w-3 text-yellow-400" />;
      case 'disconnected':
        return <WifiOff className="h-3 w-3 text-red-400" />;
      default:
        return <Wifi className="h-3 w-3" />;
    }
  };

  // Update stream stats periodically for live streams
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setStreamStats(prev => ({
        ...prev,
        latency: Math.random() * 2 + 1.5, // Simulate latency between 1.5-3.5s
        bufferHealth: Math.random() * 20 + 80, // Simulate buffer health 80-100%
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, [isLive]);
  
  return (
    <motion.div
      ref={containerRef}
      className={cn(
        "relative bg-black rounded-lg overflow-hidden enhanced-video-player",
        isFullscreen && "fixed inset-0 z-50",
        className
      )}
      tabIndex={0}
      role="application"
      aria-label="Enhanced video player"
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full"
        poster={poster}
        muted={isMuted}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onLoadedMetadata={(e) => {
          setDuration(e.currentTarget.duration);
        }}
        onTimeUpdate={(e) => {
          setCurrentTime(e.currentTarget.currentTime);
        }}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => {
          setIsBuffering(false);
          setIsLoading(false);
        }}
        onEnded={() => setIsPlaying(false)}
        onError={() => setError('Failed to load video')}
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
                  {/* Advanced Settings Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20"
                        aria-label="Video settings"
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        {currentQuality === -1 ? 'Auto' : qualityLevels[currentQuality]?.name || 'Auto'}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end">
                      <DropdownMenuLabel>Video Settings</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      
                      {/* Quality Selection */}
                      {qualityLevels.length > 0 && (
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>
                            <span>Quality</span>
                            <span className="ml-auto text-xs text-muted-foreground">
                              {currentQuality === -1 ? 'Auto' : qualityLevels[currentQuality]?.name || 'Auto'}
                            </span>
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            <DropdownMenuItem
                              onClick={() => handleQualityChange(-1)}
                              className="justify-between"
                            >
                              <span>Auto</span>
                              {currentQuality === -1 && <Check className="h-4 w-4" />}
                            </DropdownMenuItem>
                            {qualityLevels.map((level, index) => (
                              <DropdownMenuItem
                                key={index}
                                onClick={() => handleQualityChange(index)}
                                className="justify-between"
                              >
                                <span>{level.name}</span>
                                {currentQuality === index && <Check className="h-4 w-4" />}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                      )}
                      
                      {/* Playback Speed (for VOD only) */}
                      {!isLive && (
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>
                            <span>Speed</span>
                            <span className="ml-auto text-xs text-muted-foreground">
                              {playbackRate}x
                            </span>
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            {PLAYBACK_SPEEDS.map((speed) => (
                              <DropdownMenuItem
                                key={speed}
                                onClick={() => handlePlaybackRateChange(speed)}
                                className="justify-between"
                              >
                                <span>{speed}x</span>
                                {playbackRate === speed && <Check className="h-4 w-4" />}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                      )}
                      
                      <DropdownMenuSeparator />
                      
                      {/* Stream Stats Toggle */}
                      <DropdownMenuItem onClick={() => setShowStats(!showStats)}>
                        <Activity className="h-4 w-4 mr-2" />
                        <span>Stream Statistics</span>
                        {showStats && <Check className="h-4 w-4 ml-auto" />}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  {/* Chat Toggle */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "text-white hover:bg-white/20",
                      showChat && "bg-white/20"
                    )}
                    onClick={handleChatToggle}
                    aria-label="Toggle chat"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                  
                  {/* Like */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "text-white hover:bg-white/20 transition-colors",
                      liked && "text-red-500"
                    )}
                    onClick={handleLike}
                    aria-label={liked ? 'Unlike' : 'Like'}
                  >
                    <Heart className={cn("h-4 w-4", liked && "fill-current")} />
                  </Button>
                  
                  {/* Share */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={handleShare}
                    aria-label="Share stream"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                  
                  {/* Fullscreen */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={handleFullscreen}
                    aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
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
                className="absolute bottom-24 right-4 bg-black/80 rounded-lg p-4 text-white text-sm w-64"
              >
                <div className="space-y-2">
                  <h3 className="font-semibold mb-2">Stream Health</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70 flex items-center"><Wifi className="h-3 w-3 mr-1.5" /> Connection:</span>
                    <span className={`capitalize font-semibold ${streamStats.connectionStatus === 'excellent' || streamStats.connectionStatus === 'good' ? 'text-green-400' : streamStats.connectionStatus === 'poor' ? 'text-yellow-400' : 'text-red-400'}`}>
                      {streamStats.connectionStatus}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70 flex items-center"><Activity className="h-3 w-3 mr-1.5" /> Bitrate:</span>
                    <span>{streamStats.bitrate} kbps</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70 flex items-center"><Clock className="h-3 w-3 mr-1.5" /> Latency:</span>
                    <span className="text-green-400">{streamStats.latency.toFixed(2)}s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70 flex items-center"><Eye className="h-3 w-3 mr-1.5" /> Dropped Frames:</span>
                    <span>{streamStats.droppedFrames}</span>
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