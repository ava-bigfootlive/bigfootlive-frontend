import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Users, MessageCircle, Globe } from 'lucide-react';
import { analyticsService } from '@/services/analyticsService';
import type { RealTimeAnalytics } from '@/types/analytics';

interface RealTimeMonitorProps {
  streamId: string;
}

export const RealTimeMonitor: React.FC<RealTimeMonitorProps> = ({ streamId }) => {
  const [realTimeData, setRealTimeData] = useState<RealTimeAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRealTimeData = async () => {
      try {
        const data = await analyticsService.getRealTimeAnalytics(streamId);
        setRealTimeData(data);
      } catch (error) {
        console.error('Failed to fetch real-time analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRealTimeData();
    const interval = setInterval(fetchRealTimeData, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [streamId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full w-6 h-6 border-b-2 border-blue-600"></div>
          <span className="text-muted-foreground">Loading real-time data...</span>
        </div>
      </div>
    );
  }

  if (!realTimeData) {
    return <div>No real-time data available</div>;
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="space-y-6">
      {/* Real-time Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-full">
                <Activity className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Live Viewers</p>
                <p className="text-2xl font-bold">{formatNumber(realTimeData.currentViewers)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <MessageCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Chat Activity</p>
                <p className="text-2xl font-bold">
                  {realTimeData.chatActivity.length > 0 
                    ? realTimeData.chatActivity[realTimeData.chatActivity.length - 1].messages 
                    : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-full">
                <Globe className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Countries</p>
                <p className="text-2xl font-bold">
                  {Object.keys(realTimeData.geographicDistribution).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-full">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Devices</p>
                <p className="text-2xl font-bold">
                  {Object.values(realTimeData.deviceDistribution).reduce((a, b) => a + b, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Viewer Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Live Viewer Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={realTimeData.viewersOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(time) => new Date(time).toLocaleTimeString()}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(time) => new Date(time).toLocaleTimeString()}
              />
              <Area 
                type="monotone" 
                dataKey="viewers" 
                stroke="#8884d8" 
                fill="#8884d8" 
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Geographic and Device Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Countries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(realTimeData.geographicDistribution)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([country, viewers]) => (
                  <div key={country} className="flex items-center justify-between">
                    <span className="font-medium">{country}</span>
                    <Badge variant="secondary">{formatNumber(viewers)}</Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Device Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(realTimeData.deviceDistribution)
                .sort(([,a], [,b]) => b - a)
                .map(([device, count]) => (
                  <div key={device} className="flex items-center justify-between">
                    <span className="font-medium capitalize">{device}</span>
                    <Badge variant="secondary">{formatNumber(count)}</Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
