import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  SkipBack,
  SkipForward,
  PictureInPicture,
  Wifi,
  Radio,
  Users,
  Loader2,
  ChevronDown,
  ChevronUp,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoPlayerControlsProps {
  isPlaying: boolean;
  isMuted: boolean;
  isFullscreen: boolean;
  isLive?: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  isLoading: boolean;
  quality: string;
  playbackRate: number;
  viewers?: number;
  onPlayPause: () => void;
  onVolumeChange: (volume: number[]) => void;
  onToggleMute: () => void;
  onToggleFullscreen: () => void;
  onSeek: (time: number[]) => void;
  onSkip: (seconds: number) => void;
  onQualityChange: (quality: string) => void;
  onPlaybackRateChange: (rate: number) => void;
  className?: string;
}

export function VideoPlayerControls({
  isPlaying,
  isMuted,
  isFullscreen,
  isLive = false,
  volume,
  currentTime,
  duration,
  isLoading,
  quality,
  playbackRate,
  viewers = 0,
  onPlayPause,
  onVolumeChange,
  onToggleMute,
  onToggleFullscreen,
  onSeek,
  onSkip,
  onQualityChange,
  onPlaybackRateChange,
  className
}: VideoPlayerControlsProps) {
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [autoHideControls, setAutoHideControls] = useState(true);
  const [theaterMode, setTheaterMode] = useState(false);
  const [lowLatencyMode, setLowLatencyMode] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const qualityOptions = ['Auto', '1080p60', '1080p', '720p60', '720p', '480p', '360p'];
  const playbackRateOptions = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  // Auto-hide controls
  useEffect(() => {
    if (!autoHideControls || !isPlaying) return;

    const hideControls = () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };
    
    hideControls();
    
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying, showControls, autoHideControls]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
  };

  const handleMouseLeave = () => {
    if (isPlaying && autoHideControls) {
      setShowControls(false);
    }
  };

  return (
    <div 
      className={cn("relative group", className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Loading Indicator */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/50 z-20"
          >
            <Loader2 className="h-12 w-12 animate-spin text-white" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Indicator */}
      {isLive && (
        <div className="absolute top-4 left-4 z-30">
          <Badge variant="destructive" className="animate-pulse">
            <Radio className="h-3 w-3 mr-1" />
            LIVE
          </Badge>
        </div>
      )}

      {/* Viewer Count */}
      {viewers > 0 && (
        <div className="absolute top-4 right-4 z-30">
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
            className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent z-10"
          >
            {/* Progress Bar */}
            {!isLive && (
              <div className="absolute bottom-16 left-4 right-4">
                <Slider
                  value={[currentTime]}
                  max={duration || 0}
                  step={0.1}
                  onValueChange={onSeek}
                  className="cursor-pointer"
                />
                <div className="flex justify-between text-xs text-white/70 mt-1">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
            )}

            {/* Control Buttons */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* Play/Pause */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={onPlayPause}
                  >
                    {isPlaying ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5" />
                    )}
                  </Button>

                  {/* Skip buttons (for VOD) */}
                  {!isLive && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20"
                        onClick={() => onSkip(-10)}
                      >
                        <SkipBack className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20"
                        onClick={() => onSkip(10)}
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
                      onClick={onToggleMute}
                    >
                      {isMuted ? (
                        <VolumeX className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </Button>
                    <div className="w-24">
                      <Slider
                        value={[isMuted ? 0 : volume]}
                        max={100}
                        step={1}
                        onValueChange={onVolumeChange}
                        className="cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Current time / Live indicator */}
                  <span className="text-sm text-white ml-2">
                    {isLive ? (
                      <Badge variant="destructive" className="bg-red-600">
                        <Zap className="h-3 w-3 mr-1" />
                        LIVE
                      </Badge>
                    ) : (
                      `${formatTime(currentTime)} / ${formatTime(duration)}`
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Quality indicator */}
                  <Badge variant="secondary" className="bg-black/50 text-white text-xs">
                    {quality}
                  </Badge>

                  {/* PiP Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={() => {
                      // PiP implementation would go here
                      console.log('Picture-in-Picture');
                    }}
                  >
                    <PictureInPicture className="h-4 w-4" />
                  </Button>

                  {/* Settings Dialog */}
                  <Dialog open={showSettings} onOpenChange={setShowSettings}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[450px]">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Settings className="h-5 w-5" />
                          Player Settings
                        </DialogTitle>
                        <DialogDescription>
                          Customize your viewing experience.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-6">
                        {/* Quality Settings */}
                        <div className="space-y-4">
                          <h4 className="text-sm font-medium">Video Quality</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {qualityOptions.map((q) => (
                              <Button
                                key={q}
                                variant={quality === q ? "default" : "outline"}
                                size="sm"
                                onClick={() => onQualityChange(q)}
                                className="justify-start"
                              >
                                {q}
                              </Button>
                            ))}
                          </div>
                        </div>

                        <Separator />

                        {/* Playback Speed */}
                        {!isLive && (
                          <>
                            <div className="space-y-4">
                              <h4 className="text-sm font-medium">Playback Speed</h4>
                              <div className="grid grid-cols-4 gap-2">
                                {playbackRateOptions.map((rate) => (
                                  <Button
                                    key={rate}
                                    variant={playbackRate === rate ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => onPlaybackRateChange(rate)}
                                  >
                                    {rate}x
                                  </Button>
                                ))}
                              </div>
                            </div>
                            <Separator />
                          </>
                        )}

                        {/* Player Options */}
                        <div className="space-y-4">
                          <h4 className="text-sm font-medium">Player Options</h4>
                          
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label className="text-sm font-normal">Auto-hide Controls</Label>
                              <p className="text-xs text-muted-foreground">
                                Hide controls when playing
                              </p>
                            </div>
                            <Switch
                              checked={autoHideControls}
                              onCheckedChange={setAutoHideControls}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label className="text-sm font-normal">Theater Mode</Label>
                              <p className="text-xs text-muted-foreground">
                                Wider player for better viewing
                              </p>
                            </div>
                            <Switch
                              checked={theaterMode}
                              onCheckedChange={setTheaterMode}
                            />
                          </div>
                          
                          {isLive && (
                            <div className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                <Label className="text-sm font-normal">Low Latency Mode</Label>
                                <p className="text-xs text-muted-foreground">
                                  Reduce stream delay
                                </p>
                              </div>
                              <Switch
                                checked={lowLatencyMode}
                                onCheckedChange={setLowLatencyMode}
                              />
                            </div>
                          )}
                        </div>

                        {/* Advanced Settings Toggle */}
                        <div className="pt-2">
                          <Button
                            variant="ghost"
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="w-full justify-between"
                          >
                            Advanced Settings
                            {showAdvanced ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                          
                          <AnimatePresence>
                            {showAdvanced && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="mt-4 space-y-4 overflow-hidden"
                              >
                                <Separator />
                                <div className="space-y-4">
                                  <h4 className="text-sm font-medium">Stream Statistics</h4>
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <Label className="text-xs text-muted-foreground">Bitrate</Label>
                                      <p>4,500 kbps</p>
                                    </div>
                                    <div>
                                      <Label className="text-xs text-muted-foreground">Latency</Label>
                                      <p className="text-green-600">2.3s</p>
                                    </div>
                                    <div>
                                      <Label className="text-xs text-muted-foreground">Dropped Frames</Label>
                                      <p>0</p>
                                    </div>
                                    <div>
                                      <Label className="text-xs text-muted-foreground">Connection</Label>
                                      <div className="flex items-center gap-1">
                                        <Wifi className="h-3 w-3 text-green-600" />
                                        <span>Stable</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Fullscreen */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={onToggleFullscreen}
                  >
                    {isFullscreen ? (
                      <Minimize className="h-4 w-4" />
                    ) : (
                      <Maximize className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default VideoPlayerControls;
