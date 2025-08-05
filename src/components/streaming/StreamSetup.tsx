import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  Settings, 
  Globe, 
  Zap, 
  Users, 
  DollarSign, 
  Copy, 
  CheckCircle,
  AlertCircle,
  Loader2,
  Monitor,
  Wifi
} from 'lucide-react';
import { streamingService, type StreamConfig, type LaunchResponse } from '@/services/streaming';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface StreamSetupProps {
  eventId: string;
  streamKey: string;
  onLaunchSuccess: (response: LaunchResponse) => void;
  onLaunchError: (error: string) => void;
}

const REGIONS = [
  { value: 'us-west-1', label: 'US West (N. California)', latency: '10ms' },
  { value: 'us-west-2', label: 'US West (Oregon)', latency: '15ms' },
  { value: 'us-east-1', label: 'US East (N. Virginia)', latency: '20ms' },
  { value: 'eu-west-1', label: 'Europe (Ireland)', latency: '35ms' },
  { value: 'ap-southeast-1', label: 'Asia Pacific (Singapore)', latency: '45ms' },
];

const QUALITY_PRESETS = {
  'Ultra HD': { resolution: '1080p', bitrate: 6000, fps: 60 },
  'Full HD': { resolution: '1080p', bitrate: 4500, fps: 30 },
  'HD': { resolution: '720p', bitrate: 2500, fps: 30 },
  'SD': { resolution: '480p', bitrate: 1200, fps: 30 },
};

export function StreamSetup({ eventId, streamKey, onLaunchSuccess, onLaunchError }: StreamSetupProps) {
  const [config, setConfig] = useState<StreamConfig>({
    expected_viewers: 100,
    audience_regions: ['us-west-2'],
    recording_enabled: true,
    quality_settings: QUALITY_PRESETS['HD']
  });
  
  const [isLaunching, setIsLaunching] = useState(false);
  const [copiedStreamKey, setCopiedStreamKey] = useState(false);
  const [estimatedCost, setEstimatedCost] = useState('$5');
  const [resourceAllocation, setResourceAllocation] = useState({
    cpu: '512',
    memory: '1024',
    instance_type: 't3.micro'
  });
  
  const { toast } = useToast();

  // Update resource allocation based on expected viewers
  useEffect(() => {
    const getResources = (viewers: number) => {
      if (viewers < 100) return { cpu: '512', memory: '1024', instance_type: 't3.micro', cost: '$5' };
      if (viewers < 500) return { cpu: '1024', memory: '2048', instance_type: 't3.small', cost: '$15' };
      if (viewers < 1000) return { cpu: '2048', memory: '4096', instance_type: 't3.medium', cost: '$30' };
      if (viewers < 5000) return { cpu: '4096', memory: '8192', instance_type: 't3.large', cost: '$50' };
      return { cpu: '8192', memory: '16384', instance_type: 't3.xlarge', cost: '$100' };
    };
    
    const resources = getResources(config.expected_viewers);
    setResourceAllocation(resources);
    setEstimatedCost(resources.cost);
  }, [config.expected_viewers]);

  const handleLaunchStream = async () => {
    setIsLaunching(true);
    
    try {
      const response = await streamingService.launchContainer(eventId, config);
      
      toast({
        title: "Stream Container Launched",
        description: "Your streaming container is starting up. It will be ready in ~60 seconds.",
      });
      
      onLaunchSuccess(response);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to launch stream';
      
      toast({
        title: "Launch Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      onLaunchError(errorMessage);
    } finally {
      setIsLaunching(false);
    }
  };

  const copyStreamKey = async () => {
    try {
      await navigator.clipboard.writeText(streamKey);
      setCopiedStreamKey(true);
      toast({
        title: "Stream Key Copied",
        description: "Stream key has been copied to clipboard",
      });
      setTimeout(() => setCopiedStreamKey(false), 2000);
    } catch {
      toast({
        title: "Copy Failed",
        description: "Failed to copy stream key to clipboard",
        variant: "destructive",
      });
    }
  };

  const qualityRecommendations = streamingService.getQualityRecommendations(config.expected_viewers);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-500" />
            Configure Your Stream
          </CardTitle>
          <CardDescription>
            Set up your streaming container with optimal settings for your audience
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Stream Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Expected Viewers */}
            <div className="space-y-2">
              <Label htmlFor="viewers" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Expected Viewers
              </Label>
              <Input
                id="viewers"
                type="number"
                value={config.expected_viewers}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  expected_viewers: parseInt(e.target.value) || 0
                }))}
                min="1"
                max="50000"
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                This determines resource allocation and cost
              </p>
            </div>

            {/* Audience Regions */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Primary Audience Region
              </Label>
              <Select
                value={config.audience_regions[0]}
                onValueChange={(value) => setConfig(prev => ({
                  ...prev,
                  audience_regions: [value]
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REGIONS.map((region) => (
                    <SelectItem key={region.value} value={region.value}>
                      <div className="flex items-center justify-between w-full">
                        <span>{region.label}</span>
                        <Badge variant="secondary" className="ml-2">{region.latency}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quality Settings */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                Stream Quality
              </Label>
              <Select
                value={Object.keys(QUALITY_PRESETS).find(key => 
                  QUALITY_PRESETS[key as keyof typeof QUALITY_PRESETS].resolution === config.quality_settings.resolution &&
                  QUALITY_PRESETS[key as keyof typeof QUALITY_PRESETS].bitrate === config.quality_settings.bitrate
                ) || 'HD'}
                onValueChange={(value) => setConfig(prev => ({
                  ...prev,
                  quality_settings: QUALITY_PRESETS[value as keyof typeof QUALITY_PRESETS]
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(QUALITY_PRESETS).map(([name, settings]) => (
                    <SelectItem key={name} value={name}>
                      <div className="flex items-center justify-between w-full">
                        <span>{name}</span>
                        <Badge variant="outline" className="ml-2">
                          {settings.resolution}@{settings.fps}fps
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Bitrate: {config.quality_settings.bitrate.toLocaleString()} kbps
              </p>
            </div>

            {/* Recording */}
            <div className="flex items-center justify-between">
              <Label htmlFor="recording" className="flex items-center gap-2">
                <Wifi className="h-4 w-4" />
                Enable Recording
              </Label>
              <Switch
                id="recording"
                checked={config.recording_enabled}
                onCheckedChange={(checked) => setConfig(prev => ({
                  ...prev,
                  recording_enabled: checked
                }))}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Automatically save your stream for later viewing
            </p>
          </CardContent>
        </Card>

        {/* Summary Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Resource Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Resource Allocation */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">CPU Units</span>
                <Badge variant="secondary">{resourceAllocation.cpu}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Memory</span>
                <Badge variant="secondary">{resourceAllocation.memory} MB</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Instance Type</span>
                <Badge variant="secondary">{resourceAllocation.instance_type}</Badge>
              </div>
            </div>

            <Separator />

            {/* Cost Estimate */}
            <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <p className="text-sm text-muted-foreground">Estimated Cost per Event</p>
              <p className="text-2xl font-bold text-blue-600">{estimatedCost}</p>
              <p className="text-xs text-muted-foreground">98% cheaper than traditional streaming</p>
            </div>

            <Separator />

            {/* Quality Recommendations */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Recommended Qualities:</p>
              <div className="flex flex-wrap gap-1">
                {qualityRecommendations.map((quality, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {quality.resolution}@{quality.fps}fps
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stream Key */}
      <Card>
        <CardHeader>
          <CardTitle>Stream Key (OBS/Streaming Software)</CardTitle>
          <CardDescription>
            Use this key in your streaming software to connect to your event container
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Input
              value={streamKey}
              readOnly
              className="font-mono text-sm"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={copyStreamKey}
              className={cn(
                "transition-colors",
                copiedStreamKey && "bg-green-100 border-green-300"
              )}
            >
              {copiedStreamKey ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Launch Button */}
      <Card>
        <CardContent className="pt-6">
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your streaming container will take ~60 seconds to fully initialize. 
              You'll receive RTMP and HLS endpoints once it's ready.
            </AlertDescription>
          </Alert>
          
          <Button
            onClick={handleLaunchStream}
            disabled={isLaunching}
            size="lg"
            className="w-full"
          >
            {isLaunching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Launching Container...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Launch Streaming Container
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
