/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent 
} from '@/components/ui/chart';
import { 
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Clock, DollarSign, Download, MapPin, PlayCircle, RefreshCw, Smartphone, TrendingDown, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import api from '@/services/api';

// Colors for charts
const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

// Metric Card Component
const MetricCard: React.FC<{
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  subtitle?: string;
}> = ({ title, value, change, icon, subtitle }) => {
  const isPositive = change && change > 0;
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mb-1">
            {subtitle}
          </p>
        )}
        {change !== undefined && (
          <div className="flex items-center text-xs">
            {isPositive ? (
              <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
            )}
            <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
              {isPositive ? '+' : ''}{change}%
            </span>
            <span className="text-muted-foreground ml-1">from last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Cost Comparison Component
const CostComparison: React.FC<{ data: unknown }> = ({ data }) => {
  const traditional = 2500;
  const current = data?.total_cost || 0;
  const savings = traditional - current;
  const savingsPercentage = (savings / traditional) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cost Analysis</CardTitle>
        <CardDescription>Traditional vs BigfootLive</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm">Traditional Streaming</span>
            <span className="text-sm text-red-600">${traditional.toFixed(2)}/mo</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">BigfootLive Platform</span>
            <span className="text-sm text-green-600">${current.toFixed(2)}/mo</span>
          </div>
        </div>
        <div className="border-t pt-4">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Monthly Savings</span>
            <div className="text-right">
              <div className="font-semibold text-green-600">${savings.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">{savingsPercentage.toFixed(1)}% reduction</div>
            </div>
          </div>
        </div>
        <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
          <AlertDescription className="text-green-800 dark:text-green-200">
            💡 You're saving ${(savings * 12).toFixed(0)} annually with event containers!
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

const chartConfig = {
  viewers: {
    label: "Total Viewers",
    color: "hsl(var(--chart-1))"},
  uniqueViewers: {
    label: "Unique Viewers",
    color: "hsl(var(--chart-2))"},
  streams: {
    label: "Streams",
    color: "hsl(var(--chart-3))"},
  avgViewers: {
    label: "Avg Viewers",
    color: "hsl(var(--chart-4))"},
  engagement: {
    label: "Engagement Rate",
    color: "hsl(var(--chart-5))"}};

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('monthly');
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<unknown>({});
  const [viewershipData, setViewershipData] = useState<unknown[]>([]);
  const [revenueBreakdown, setRevenueBreakdown] = useState<unknown>({});
  const [performanceSummary, setPerformanceSummary] = useState<unknown>({});
  const [audienceData, setAudienceData] = useState<unknown>({});

  // Fetch analytics data
  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [overview, viewership, revenue, performance, audience] = await Promise.all([
        api.get('/analytics/overview'),
        api.get('/analytics/viewership?days=30'),
        api.get('/analytics/revenue/breakdown'),
        api.get('/analytics/performance/summary'),
        api.get('/analytics/audience')
      ]);

      setAnalyticsData(overview.data || {});
      setViewershipData(viewership.data?.data || []);
      setRevenueBreakdown(revenue.data || {});
      setPerformanceSummary(performance.data || {});
      setAudienceData(audience.data || {});
    } catch (error) { void error;
      console.error('Failed to fetch analytics:', error);
      // Set default empty data to prevent errors
      setAnalyticsData({});
      setViewershipData([]);
      setRevenueBreakdown({});
      setPerformanceSummary({});
      setAudienceData({});
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  // Revenue source data for pie chart
  const revenueSourceData = Object.entries(revenueBreakdown.revenue_by_source || {}).map(
    ([name, value], index) => ({ name, value, fill: COLORS[index % COLORS.length] })
  );

  // Device data from audience analytics
  const deviceData = audienceData.device_breakdown ? [
    { name: 'Desktop', value: audienceData.device_breakdown.desktop, fill: COLORS[0] },
    { name: 'Mobile', value: audienceData.device_breakdown.mobile, fill: COLORS[1] },
    { name: 'Tablet', value: audienceData.device_breakdown.tablet, fill: COLORS[2] },
    { name: 'TV', value: audienceData.device_breakdown.tv, fill: COLORS[3] },
  ] : [];

  if (loading) {
    return (
      <div className="p-8 space-y-8">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }
  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Track your streaming performance and audience insights</p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchAnalytics}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Revenue"
          value={`$${analyticsData?.total_revenue?.toFixed(2) || '0'}`}
          change={performanceSummary?.trends?.revenue_growth}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          subtitle="This period"
        />
        <MetricCard
          title="Total Viewers"
          value={analyticsData?.total_views?.toLocaleString() || '0'}
          change={performanceSummary?.trends?.viewer_growth}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Active Streams"
          value={analyticsData?.total_streams || '0'}
          change={performanceSummary?.trends?.stream_growth}
          icon={<PlayCircle className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Avg Watch Time"
          value={`${analyticsData?.avg_watch_time || '0'}m`}
          icon={<Clock className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      {/* Tabs for different views */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">

          <div className="grid gap-4 md:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Viewership Trends</CardTitle>
                <CardDescription>Viewer count over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={viewershipData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                        className="text-xs"
                      />
                      <YAxis className="text-xs" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Area
                        type="monotone"
                        dataKey="total_viewers"
                        name="Total Viewers"
                        stroke="var(--color-viewers)"
                        fill="var(--color-viewers)"
                        fillOpacity={0.3}
                      />
                      <Area
                        type="monotone"
                        dataKey="unique_viewers"
                        name="Unique Viewers"
                        stroke="var(--color-uniqueViewers)"
                        fill="var(--color-uniqueViewers)"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Cost Comparison */}
            <div className="col-span-3">
              <CostComparison data={performanceSummary?.summary} />
            </div>
          </div>

          {/* Recent Streams */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Streams</CardTitle>
              <CardDescription>Your most viewed streams this period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { title: 'Q4 Earnings Call', viewers: 5678, duration: '45:32', revenue: 125.50 },
                  { title: 'Product Launch Event', viewers: 4532, duration: '1:23:45', revenue: 98.75 },
                  { title: 'Weekly Team Standup', viewers: 3421, duration: '32:10', revenue: 72.25 },
                  { title: 'Tech Talk: AI Integration', viewers: 2890, duration: '58:22', revenue: 65.00 },
                  { title: 'Customer Success Stories', viewers: 2345, duration: '40:15', revenue: 52.80 },
                ].map((stream, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex-1">
                      <p className="font-medium">{stream.title}</p>
                      <p className="text-sm text-muted-foreground">{stream.duration}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{stream.viewers.toLocaleString()} views</p>
                      <p className="text-sm text-green-600">${stream.revenue.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Revenue by Source */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Source</CardTitle>
                <CardDescription>Income distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Pie
                        data={revenueSourceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {revenueSourceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Daily Revenue */}
            <Card>
              <CardHeader>
                <CardTitle>Daily Revenue Trend</CardTitle>
                <CardDescription>Last 14 days</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={Object.entries(revenueBreakdown.daily_revenue || {})
                        .slice(-14)
                        .map(([date, revenue]) => ({ date, revenue }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                        className="text-xs"
                      />
                      <YAxis className="text-xs" />
                      <ChartTooltip
                        content={<ChartTooltipContent />}
                        formatter={(value: unknown) => `$${value.toFixed(2)}`}
                      />
                      <Bar dataKey="revenue" fill="var(--color-streams)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Summary</CardTitle>
              <CardDescription>Financial performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">
                    ${revenueBreakdown.total_revenue?.toFixed(2) || '0'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg per Stream</p>
                  <p className="text-2xl font-bold">
                    ${revenueBreakdown.average_revenue_per_stream?.toFixed(2) || '0'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Profit Margin</p>
                  <p className="text-2xl font-bold text-green-600">
                    {performanceSummary.summary?.profit_margin?.toFixed(1) || '0'}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cost per Viewer</p>
                  <p className="text-2xl font-bold">
                    ${performanceSummary.efficiency?.cost_per_viewer?.toFixed(4) || '0'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audience Tab */}
        <TabsContent value="audience" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Geographic Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Geographic Distribution
                </CardTitle>
                <CardDescription>Viewers by location</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {audienceData.geographic_distribution?.map((item: unknown) => (
                    <div key={item.country} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{item.country}</span>
                        <span className="text-sm font-medium">
                          {item.viewers.toLocaleString()} ({item.percentage}%)
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Device Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  Device Breakdown
                </CardTitle>
                <CardDescription>Viewers by device type</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Pie
                        data={deviceData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {deviceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
                <div className="mt-4 space-y-2">
                  {deviceData.map((device) => (
                    <div key={device.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: device.fill }}
                        />
                        <span className="text-sm">{device.name}</span>
                      </div>
                      <span className="text-sm font-medium">{device.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Age Groups */}
          <Card>
            <CardHeader>
              <CardTitle>Age Demographics</CardTitle>
              <CardDescription>Viewer age distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {audienceData.age_groups?.map((group: unknown) => (
                  <div key={group.range} className="text-center">
                    <div className="text-2xl font-bold">{group.percentage}%</div>
                    <div className="text-sm text-muted-foreground">{group.range}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          {/* AI Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Recommendations</CardTitle>
              <CardDescription>Optimize your streaming strategy</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {performanceSummary.recommendations?.map((rec: string, index: number) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="mt-1">
                      <TrendingUp className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-sm">{rec}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Platform Efficiency */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Efficiency</CardTitle>
              <CardDescription>Cost and performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {performanceSummary.efficiency?.savings_vs_traditional?.toFixed(1) || '0'}%
                  </div>
                  <p className="text-sm text-muted-foreground">Cost Savings</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">
                    ${performanceSummary.efficiency?.revenue_per_viewer?.toFixed(3) || '0'}
                  </div>
                  <p className="text-sm text-muted-foreground">Revenue/Viewer</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">
                    {performanceSummary.summary?.average_viewers_per_stream?.toFixed(0) || '0'}
                  </div>
                  <p className="text-sm text-muted-foreground">Avg Viewers</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    ${performanceSummary.summary?.net_profit?.toFixed(0) || '0'}
                  </div>
                  <p className="text-sm text-muted-foreground">Net Profit</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

    </div>
  );
}