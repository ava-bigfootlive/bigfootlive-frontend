import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Eye, Clock, TrendingUp, TrendingDown, DollarSign, MessageCircle } from 'lucide-react';
import type { StreamingMetrics } from '@/types/analytics';

interface OverviewStatsProps {
  overview: StreamingMetrics | any; // any for aggregated data
}

export const OverviewStats: React.FC<OverviewStatsProps> = ({ overview }) => {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getGrowthIcon = (value: number) => {
    return value >= 0 ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    );
  };

  const getGrowthColor = (value: number) => {
    return value >= 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Viewers */}
      <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Total Viewers</CardTitle>
          <div className="p-2 bg-blue-100 rounded-full">
            <Users className="h-4 w-4 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">
            {formatNumber(overview.totalViewers || overview.totalViews || 0)}
          </div>
          {overview.viewerGrowth !== undefined && (
            <div className={`flex items-center text-xs mt-2 ${getGrowthColor(overview.viewerGrowth)}`}>
              {getGrowthIcon(overview.viewerGrowth)}
              <span className="ml-1">{formatPercentage(overview.viewerGrowth)} from last period</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Peak Viewers */}
      <Card className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Peak Viewers</CardTitle>
          <div className="p-2 bg-purple-100 rounded-full">
            <Eye className="h-4 w-4 text-purple-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">
            {formatNumber(overview.peakViewers || overview.averageViewers || 0)}
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            Avg: {formatNumber(overview.averageViewers || overview.totalViewers / (overview.totalStreams || 1) || 0)}
          </div>
        </CardContent>
      </Card>

      {/* Watch Time */}
      <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Total Watch Time</CardTitle>
          <div className="p-2 bg-green-100 rounded-full">
            <Clock className="h-4 w-4 text-green-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">
            {formatDuration(overview.averageViewTime || overview.totalHoursStreamed * 3600 || 0)}
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            {overview.uniqueViewers ? `${formatNumber(overview.uniqueViewers)} unique viewers` : 
             overview.totalStreams ? `${overview.totalStreams} streams` : 'This period'}
          </div>
        </CardContent>
      </Card>

      {/* Revenue or Engagement */}
      <Card className="border-l-4 border-l-pink-500 hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            {overview.totalRevenue ? 'Revenue' : 'Engagement'}
          </CardTitle>
          <div className={`p-2 ${overview.totalRevenue ? 'bg-pink-100' : 'bg-yellow-100'} rounded-full`}>
            {overview.totalRevenue ? (
              <DollarSign className="h-4 w-4 text-pink-600" />
            ) : (
              <MessageCircle className="h-4 w-4 text-yellow-600" />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">
            {overview.totalRevenue ? (
              `$${formatNumber(overview.totalRevenue)}`
            ) : (
              `${overview.averageEngagementRate || overview.chatMessages || 0}${overview.averageEngagementRate ? '%' : ''}`
            )}
          </div>
          {(overview.engagementGrowth !== undefined || overview.growthRate !== undefined) && (
            <div className={`flex items-center text-xs mt-2 ${getGrowthColor(overview.engagementGrowth || overview.growthRate || 0)}`}>
              {getGrowthIcon(overview.engagementGrowth || overview.growthRate || 0)}
              <span className="ml-1">{formatPercentage(overview.engagementGrowth || overview.growthRate || 0)} growth</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
