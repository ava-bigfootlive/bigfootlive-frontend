import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Eye, Zap, Activity } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  change?: string;
}

function MetricCard({ title, value, icon, change }: MetricCardProps) {
  return (
    <Card className="metric-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className="text-xs text-muted-foreground">{change}</p>
        )}
      </CardContent>
    </Card>
  );
}

interface MetricsGridProps {
  liveStreams?: number;
  totalViewers?: number;
  bandwidth?: string;
  uptime?: string;
}

export function MetricsGrid({ 
  liveStreams = 0, 
  totalViewers = 0, 
  bandwidth = "0 Mbps", 
  uptime = "100%" 
}: MetricsGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Live Streams"
        value={liveStreams.toString()}
        icon={<Activity className="h-4 w-4 text-red-500" />}
        change="+2 from last hour"
      />
      <MetricCard
        title="Total Viewers"
        value={totalViewers.toLocaleString()}
        icon={<Users className="h-4 w-4 text-blue-500" />}
        change="+12% from yesterday"
      />
      <MetricCard
        title="Bandwidth Usage"
        value={bandwidth}
        icon={<Zap className="h-4 w-4 text-yellow-500" />}
        change="Current usage"
      />
      <MetricCard
        title="Uptime"
        value={uptime}
        icon={<Eye className="h-4 w-4 text-green-500" />}
        change="Last 30 days"
      />
    </div>
  );
}
