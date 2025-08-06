import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';

interface VideoPlayerProps {
  streamUrl?: string;
  hlsUrl?: string;
  isLive?: boolean;
  title?: string;
  streamerName?: string;
  viewerCount?: number;
  onViewerJoin?: () => void;
  onViewerLeave?: () => void;
  className?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  streamUrl,
  hlsUrl,
  isLive = false,
  title = "Live Stream",
  streamerName = "Streamer",
  viewerCount = 0,
  onViewerJoin,
  onViewerLeave,
  className = ""
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState([100]);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [quality, setQuality] = useState('auto');
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error' | 'offline'>('connecting');
  const [latency, setLatency] = useState<number | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Initialize HLS
    if (hlsUrl && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
        maxBufferLength: 30,
        maxMaxBufferLength: 600,
        startLevel: -1, // Auto quality
        debug: false,
      });

      hlsRef.current = hls;

      hls.loadSource(hlsUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('📺 HLS manifest parsed');
        setConnectionStatus('connected');
        onViewerJoin?.();
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('🚨 HLS Error:', data);
        if (data.fatal) {
          setConnectionStatus('error');
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log('💥 Network error, attempting recovery...');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log('🎥 Media error, attempting recovery...');
              hls.recoverMediaError();
              break;
            default:
              console.log('💀 Fatal error, destroying HLS...');
              hls.destroy();
              break;
          }
        }
      });

      hls.on(Hls.Events.FRAG_LOADED, (event, data) => {
        // Calculate latency
        const now = Date.now();
        const fragStart = data.frag.start * 1000;
        const currentLatency = now - fragStart;
        setLatency(currentLatency);
      });

      return () => {
        hls.destroy();
        onViewerLeave?.();
      };
    } else if (streamUrl && video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      video.src = streamUrl;
      setConnectionStatus('connected');
      onViewerJoin?.();

      return () => {
        onViewerLeave?.();
      };
    } else if (!hlsUrl && !streamUrl) {
      setConnectionStatus('offline');
    }
  }, [hlsUrl, streamUrl, onViewerJoin, onViewerLeave]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = value[0];
    video.volume = newVolume / 100;
    setVolume(value);
    
    if (newVolume === 0) {
      setIsMuted(true);
      video.muted = true;
    } else if (isMuted) {
      setIsMuted(false);
      video.muted = false;
    }
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (!isFullscreen) {
      if (video.requestFullscreen) {
        video.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const changeQuality = (newQuality: string) => {
    const hls = hlsRef.current;
    if (!hls) return;

    if (newQuality === 'auto') {
      hls.currentLevel = -1;
    } else {
      const level = hls.levels.findIndex(level => level.height.toString() === newQuality);
      if (level !== -1) {
        hls.currentLevel = level;
      }
    }
    setQuality(newQuality);
  };

  const getQualityOptions = () => {
    const hls = hlsRef.current;
    if (!hls) return ['auto'];

    const qualities = hls.levels.map(level => level.height.toString());
    return ['auto', ...qualities];
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'LIVE';
      case 'connecting': return 'Connecting...';
      case 'error': return 'Connection Error';
      case 'offline': return 'Offline';
      default: return 'Unknown';
    }
  };

  return (
    <Card className={`relative bg-black overflow-hidden ${className}`}>
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        playsInline
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onLoadedMetadata={() => console.log('📺 Video metadata loaded')}
      />

      {/* Stream Info Overlay */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
        <div className="flex items-center space-x-3">
          <div className={`px-2 py-1 rounded text-xs font-bold text-white ${getStatusColor()}`}>
            {getStatusText()}
          </div>
          <div className="flex items-center space-x-2 text-white">
            <Users size={16} />
            <span className="text-sm font-medium">{viewerCount.toLocaleString()}</span>
          </div>
          {latency && (
            <div className="text-xs text-white bg-black bg-opacity-50 px-2 py-1 rounded">
              {Math.round(latency / 1000)}s delay
            </div>
          )}
        </div>
      </div>

      {/* Title Overlay */}
      <div className="absolute bottom-16 left-4 right-4">
        <div className="bg-black bg-opacity-70 p-3 rounded">
          <h3 className="text-white font-semibold text-lg">{title}</h3>
          <p className="text-gray-300 text-sm">{streamerName}</p>
        </div>
      </div>

      {/* Controls Overlay */}
      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/70 to-transparent p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={togglePlay}
                className="text-white hover:bg-white/20"
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </Button>

              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  className="text-white hover:bg-white/20"
                >
                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </Button>
                <div className="w-20">
                  <Slider
                    value={volume}
                    onValueChange={handleVolumeChange}
                    max={100}
                    step={1}
                    className="cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={quality}
                onChange={(e) => changeQuality(e.target.value)}
                className="bg-black/50 text-white text-sm border border-white/30 rounded px-2 py-1"
              >
                {getQualityOptions().map(q => (
                  <option key={q} value={q}>
                    {q === 'auto' ? 'Auto' : `${q}p`}
                  </option>
                ))}
              </select>

              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="text-white hover:bg-white/20"
              >
                <Maximize size={20} />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Connection Error State */}
      {connectionStatus === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center text-white">
            <div className="text-red-400 mb-2">
              <Settings size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Connection Error</h3>
            <p className="text-gray-300 mb-4">Unable to load the stream</p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-black"
            >
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Offline State */}
      {connectionStatus === 'offline' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-center text-white">
            <div className="text-gray-400 mb-4">
              <Users size={64} className="mx-auto" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{streamerName} is offline</h3>
            <p className="text-gray-400">Check back later for the next stream!</p>
          </div>
        </div>
      )}

      {/* Click to show/hide controls */}
      <div
        className="absolute inset-0 cursor-pointer"
        onClick={() => setShowControls(!showControls)}
      />
    </Card>
  );
};
