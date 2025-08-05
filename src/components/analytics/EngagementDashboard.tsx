import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import type { ChatAnalytics, AudienceInsights, AnalyticsTrends } from '@/types/analytics';
import { ChartWrapper } from './ChartWrapper';

interface EngagementDashboardProps {
  chat?: ChatAnalytics;
  audience?: AudienceInsights;
  trends?: AnalyticsTrends;
  aggregated?: any;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export const EngagementDashboard: React.FC<EngagementDashboardProps> = React.memo(({ chat, audience, trends, aggregated }) => {
  // Memoize expensive data transformations
  const topChattersData = useMemo(() => {
    return chat?.topChatters.slice(0, 10).map(chatter => ({
      name: chatter.username,
      messages: chatter.messageCount,
    })) || [
      { name: 'User1', messages: 120 },
      { name: 'User2', messages: 110 },
      { name: 'User3', messages: 95 },
      { name: 'User4', messages: 80 },
      { name: 'User5', messages: 72 },
    ];
  }, [chat?.topChatters]);

  const sentimentData = useMemo(() => {
    return chat?.sentiment ? [
      { name: 'Positive', value: chat.sentiment.positive, color: '#00C49F' },
      { name: 'Neutral', value: chat.sentiment.neutral, color: '#FFBB28' },
      { name: 'Negative', value: chat.sentiment.negative, color: '#FF8042' },
    ] : [
      { name: 'Positive', value: 75, color: '#00C49F' },
      { name: 'Neutral', value: 15, color: '#FFBB28' },
      { name: 'Negative', value: 10, color: '#FF8042' },
    ];
  }, [chat?.sentiment]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Top Chatters</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartWrapper>
            <BarChart data={topChattersData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="messages" fill="#8884d8" name="Messages" />
            </BarChart>
          </ChartWrapper>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Chat Sentiment</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartWrapper>
            <PieChart>
              <Pie
                data={sentimentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {sentimentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ChartWrapper>
        </CardContent>
      </Card>
    </div>
  );
});
