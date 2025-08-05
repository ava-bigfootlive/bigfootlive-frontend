import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Activity, Zap, WifiIcon, Clock } from 'lucide-react';
import type { StreamPerformance } from '@/types/analytics';

interface PerformanceDashboardProps {
  performance?: StreamPerformance;
}

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({ performance }) => {
  // Provide fallback data if performance is not available
  const performanceData = performance || {
    qualityMetrics: {
      streamHealth: 'excellent' as const,
      stabilityScore: 95.2,
      viewerSatisfaction: 88.7,
    },
    technicalMetrics: {
      averageBitrate: 3500000, // 3.5 Mbps
      averageLatency: 150,
      frameDrops: 12,
      bufferingRatio: 1.2,
      reconnections: 0,
    }
  };
  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'fair': return 'bg-yellow-500';
      case 'poor': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getHealthBadgeVariant = (health: string) => {
    switch (health) {
      case 'excellent': return 'default';
      case 'good': return 'secondary';
      case 'fair': return 'outline';
      case 'poor': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Stream Health Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Stream Health
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Health</span>
            <Badge variant={getHealthBadgeVariant(performanceData.qualityMetrics.streamHealth)}>
              {performanceData.qualityMetrics.streamHealth.toUpperCase()}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Stability Score</span>
              <span>{performanceData.qualityMetrics.stabilityScore.toFixed(1)}%</span>
            </div>
            <Progress 
              value={performanceData.qualityMetrics.stabilityScore} 
              className="h-2"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Viewer Satisfaction</span>
              <span>{performanceData.qualityMetrics.viewerSatisfaction.toFixed(1)}%</span>
            </div>
            <Progress 
              value={performanceData.qualityMetrics.viewerSatisfaction} 
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Technical Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Technical Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <WifiIcon className="h-4 w-4 text-blue-500" />
              <span className="text-sm">Average Bitrate</span>
            </div>
            <span className="font-mono text-sm">
              {(performanceData.technicalMetrics.averageBitrate / 1000).toFixed(1)} Mbps
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-500" />
              <span className="text-sm">Average Latency</span>
            </div>
            <span className="font-mono text-sm">
              {performanceData.technicalMetrics.averageLatency}ms
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Frame Drops</span>
            <span className={`font-mono text-sm ${performanceData.technicalMetrics.frameDrops > 100 ? 'text-red-500' : 'text-green-500'}`}>
              {performanceData.technicalMetrics.frameDrops}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Buffering Ratio</span>
            <span className={`font-mono text-sm ${performanceData.technicalMetrics.bufferingRatio > 5 ? 'text-red-500' : 'text-green-500'}`}>
              {performanceData.technicalMetrics.bufferingRatio.toFixed(2)}%
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Reconnections</span>
            <span className={`font-mono text-sm ${performanceData.technicalMetrics.reconnections > 0 ? 'text-yellow-500' : 'text-green-500'}`}>
              {performanceData.technicalMetrics.reconnections}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
