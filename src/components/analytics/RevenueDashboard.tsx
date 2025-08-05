import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { RevenueMetrics, AnalyticsTrends } from '@/types/analytics';
import { ChartWrapper } from './ChartWrapper';

interface RevenueDashboardProps {
  revenue?: RevenueMetrics;
  trends?: AnalyticsTrends;
  aggregated?: any;
}

export const RevenueDashboard: React.FC<RevenueDashboardProps> = React.memo(({ revenue, trends, aggregated }) => {
  // Memoize expensive data transformations
  const revenueData = useMemo(() => {
    return revenue ? [
      { name: 'Donations', value: revenue.donations.total },
      { name: 'Super Chats', value: revenue.superChats.total },
      { name: 'Subscriptions', value: revenue.subscriptions.total },
      { name: 'Tips', value: revenue.tips.total },
    ] : [
      { name: 'Total Revenue', value: aggregated?.totalRevenue || 0 },
      { name: 'Donations', value: Math.floor((aggregated?.totalRevenue || 0) * 0.6) },
      { name: 'Subscriptions', value: Math.floor((aggregated?.totalRevenue || 0) * 0.3) },
      { name: 'Tips', value: Math.floor((aggregated?.totalRevenue || 0) * 0.1) },
    ];
  }, [revenue, aggregated?.totalRevenue]);

  // Use revenue trend data if available
  const revenueTrendData = useMemo(() => {
    return trends?.revenueTrend || [];
  }, [trends?.revenueTrend]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Revenue Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartWrapper>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" name="Total Revenue" />
            </BarChart>
          </ChartWrapper>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartWrapper>
            <AreaChart data={revenueTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
              <YAxis />
              <Tooltip labelFormatter={(date) => new Date(date).toLocaleString()} formatter={(value) => [`$${value}`, 'Revenue']} />
              <Legend />
              <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" name="Revenue" />
              <Area type="monotone" dataKey="donations" stroke="#82ca9d" fill="#82ca9d" name="Donations" />
            </AreaChart>
          </ChartWrapper>
        </CardContent>
      </Card>
    </div>
  );
});
