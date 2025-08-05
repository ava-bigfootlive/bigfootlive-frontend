import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  DollarSign, 
  Radio,
  Video,
  Clock,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Calendar,
  Play
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const metrics = [
    {
      title: 'Total Viewers',
      value: '23,456',
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Active Streams',
      value: '8',
      change: '+2',
      trend: 'up',
      icon: Radio,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
    {
      title: 'Revenue Today',
      value: '$12,345',
      change: '+18.2%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Avg Watch Time',
      value: '42 min',
      change: '-5.1%',
      trend: 'down',
      icon: Clock,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
  ];

  const activeStreams = [
    { id: 1, title: 'Gaming Marathon 2024', viewers: 5234, duration: '2h 15m', status: 'live' },
    { id: 2, title: 'Tech Talk Tuesday', viewers: 1823, duration: '45m', status: 'live' },
    { id: 3, title: 'Music Concert Live', viewers: 8421, duration: '1h 30m', status: 'live' },
  ];

  const upcomingEvents = [
    { id: 1, title: 'Developer Conference', time: '2:00 PM', date: 'Today' },
    { id: 2, title: 'Product Launch', time: '10:00 AM', date: 'Tomorrow' },
    { id: 3, title: 'Community Q&A', time: '4:00 PM', date: 'Mar 15' },
  ];

  return (
    <div className="space-y-6 fade-in">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-description">Welcome back! Here's what's happening with your streams today.</p>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4 mb-6">
        <Link to="/tenant/live-control">
          <Button className="action-button bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg">
            <Radio className="mr-2 h-4 w-4" />
            Go Live Now
          </Button>
        </Link>
        <Link to="/tenant/content">
          <Button variant="outline" className="action-button">
            <Video className="mr-2 h-4 w-4" />
            Upload Content
          </Button>
        </Link>
        <Link to="/tenant/analytics">
          <Button variant="outline" className="action-button">
            <BarChart3 className="mr-2 h-4 w-4" />
            View Analytics
          </Button>
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="metric-grid">
        {metrics.map((metric, index) => (
          <Card key={index} className="enhanced-card metric-card hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                <metric.icon className={`h-4 w-4 ${metric.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center gap-1 mt-1">
                {metric.trend === 'up' ? (
                  <ArrowUp className="h-3 w-3 text-green-500" />
                ) : (
                  <ArrowDown className="h-3 w-3 text-red-500" />
                )}
                <span className={`text-xs ${metric.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                  {metric.change}
                </span>
                <span className="text-xs text-muted-foreground">from last period</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Active Streams */}
        <Card className="enhanced-card">
          <CardHeader className="panel-header">
            <div>
              <CardTitle className="section-title">Active Streams</CardTitle>
              <CardDescription>Currently broadcasting</CardDescription>
            </div>
            <Link to="/tenant/live-control">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeStreams.map((stream) => (
              <div key={stream.id} className="panel p-4 hover-glow cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium">{stream.title}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {stream.viewers.toLocaleString()} viewers
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {stream.duration}
                      </span>
                    </div>
                  </div>
                  <Badge className="status-live">
                    <Radio className="h-3 w-3 mr-1" />
                    LIVE
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className="enhanced-card">
          <CardHeader className="panel-header">
            <div>
              <CardTitle className="section-title">Upcoming Events</CardTitle>
              <CardDescription>Scheduled streams</CardDescription>
            </div>
            <Link to="/tenant/content">
              <Button variant="ghost" size="sm">Schedule</Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="panel p-4 hover-glow cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium">{event.title}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{event.date} at {event.time}</span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="hover-lift">
                    <Play className="h-3 w-3 mr-1" />
                    Start
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <Card className="enhanced-card">
        <CardHeader>
          <CardTitle className="section-title">Performance Overview</CardTitle>
          <CardDescription>Stream health and quality metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Stream Quality</span>
                <span className="text-sm text-muted-foreground">Excellent</span>
              </div>
              <Progress value={92} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Viewer Engagement</span>
                <span className="text-sm text-muted-foreground">78%</span>
              </div>
              <Progress value={78} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Server Load</span>
                <span className="text-sm text-muted-foreground">45%</span>
              </div>
              <Progress value={45} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;