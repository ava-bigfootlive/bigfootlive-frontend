import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { AudienceInsights, StreamingMetrics, AnalyticsTrends } from '@/types/analytics';
import { ChartWrapper } from './ChartWrapper';

interface ViewershipDashboardProps {
  audience?: AudienceInsights;
  overview?: StreamingMetrics;
  trends?: AnalyticsTrends;
  aggregated?: any;
}

export const ViewershipDashboard: React.FC<ViewershipDashboardProps> = React.memo(({ audience, overview, trends, aggregated }) => {
  // Memoize expensive data transformations
  const demographicsData = useMemo(() => {
    return audience?.demographics?.countries 
      ? Object.entries(audience.demographics.countries).map(([name, value]) => ({ name, value }))
      : [
          { name: 'United States', value: 4500 },
          { name: 'United Kingdom', value: 2300 },
          { name: 'Canada', value: 1800 },
          { name: 'Germany', value: 1200 },
          { name: 'France', value: 900 }
        ];
  }, [audience?.demographics?.countries]);

  // Use viewership trend data if available
  const viewershipData = useMemo(() => {
    return trends?.viewershipTrend || [];
  }, [trends?.viewershipTrend]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Viewers Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartWrapper>
            <AreaChart data={viewershipData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
              <YAxis />
              <Tooltip labelFormatter={(date) => new Date(date).toLocaleString()} />
              <Legend />
              <Area type="monotone" dataKey="viewers" stroke="#8884d8" fill="#8884d8" name="Viewers" />
              <Area type="monotone" dataKey="uniqueViewers" stroke="#82ca9d" fill="#82ca9d" name="Unique Viewers" />
            </AreaChart>
          </ChartWrapper>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Viewers by Country</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartWrapper>
            <BarChart data={demographicsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#82ca9d" name="Viewers" />
            </BarChart>
          </ChartWrapper>
        </CardContent>
      </Card>
    </div>
  );
});
