/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, ArrowDown, ArrowUp, BarChart3, Calendar, Clock, DollarSign, Eye, Radio, Star, Users, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApiData } from '@/hooks/useApiData';
import api from '@/services/api';
import { cn } from '@/lib/utils';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
};

interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  icon: React.ComponentType<{ className?: string }>;
  trend: 'up' | 'down';
  color: string;
  subtitle?: string;
}

// interface LiveStream {
//   id: string;
//   title: string;
//   thumbnail: string;
//   viewers: number;
//   category: string;
//   startTime: string;
//   duration: string;
//   isLive: boolean;
//   streamer: {
//     name: string;
//     avatar: string;
//   };
// }

export default function DashboardEnhanced() {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [showWelcome, setShowWelcome] = useState(true);
  
  // Fetch data
  const { data: analyticsData } = useApiData(
    () => api.analytics.getOverview({ period: selectedPeriod }),
    [selectedPeriod]
  );
  
  // Live streams data - commented out as not currently used
  // const { data: liveStreams } = useApiData(
  //   () => api.streams.getLive(),
  //   []
  // );
  
  // Process metrics
  const metrics: MetricCard[] = [
    {
      title: 'Total Viewers',
      value: analyticsData?.totalViewers || '12,543',
      change: 12.5,
      icon: Users,
      trend: 'up',
      color: 'text-blue-600',
      subtitle: 'Across all streams'
    },
    {
      title: 'Revenue',
      value: `$${analyticsData?.revenue || '8,456'}`,
      change: 18.2,
      icon: DollarSign,
      trend: 'up',
      color: 'text-green-600',
      subtitle: 'This period'
    },
    {
      title: 'Engagement Rate',
      value: `${analyticsData?.engagement || '67.8'}%`,
      change: -2.1,
      icon: Activity,
      trend: 'down',
      color: 'text-purple-600',
      subtitle: 'Average watch time'
    },
    {
      title: 'Active Streams',
      value: analyticsData?.activeStreams || '24',
      change: 5,
      icon: Radio,
      trend: 'up',
      color: 'text-red-600',
      subtitle: 'Currently live'
    }
  ];
  
  return (
    <motion.div 
      className="p-8 max-w-7xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Welcome Banner */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8 p-6 rounded-2xl gradient-mesh relative overflow-hidden"
          >
            <div className="relative z-10">
              <h1 className="text-4xl font-bold mb-2">Welcome back! 👋</h1>
              <p className="text-lg text-muted-foreground">
                Your streams are performing great. Here's what's happening today.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4"
              onClick={() => setShowWelcome(false)}
            >
              ✕
            </Button>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Period Selector */}
      <motion.div variants={itemVariants} className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold">Analytics Overview</h2>
          <p className="text-muted-foreground">Track your streaming performance</p>
        </div>
        <div className="flex gap-2">
          {['24h', '7d', '30d', '90d'].map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
              className="min-w-[60px]"
            >
              {period}
            </Button>
          ))}
        </div>
      </motion.div>
      
      {/* Metrics Grid */}
      <motion.div 
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8"
        variants={containerVariants}
      >
        {metrics.map((metric) => (
          <motion.div key={metric.title} variants={itemVariants}>
            <Card className="hover-lift overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full -mr-16 -mt-16" />
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <metric.icon className={cn("h-5 w-5", metric.color)} />
                  <Badge 
                    variant={metric.trend === 'up' ? 'default' : 'secondary'}
                    className="flex items-center gap-1"
                  >
                    {metric.trend === 'up' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                    {Math.abs(metric.change)}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="text-2xl font-bold">{metric.value}</p>
                  <p className="text-xs text-muted-foreground">{metric.title}</p>
                  {metric.subtitle && (
                    <p className="text-xs text-muted-foreground/70">{metric.subtitle}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
      
      {/* Live Streams Section */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <span className="relative">
                <span className="absolute inset-0 bg-red-500 rounded-full animate-pulse-live" />
                <Radio className="h-6 w-6 relative z-10" />
              </span>
              Live Now
            </h3>
            <p className="text-muted-foreground">Active streams on your platform</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/streams')}>
            View All
          </Button>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card className="stream-card cursor-pointer overflow-hidden">
                <div className="relative aspect-video bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <Badge variant="destructive" className="animate-pulse-live">
                      <Radio className="h-3 w-3 mr-1" />
                      LIVE
                    </Badge>
                    <Badge variant="secondary" className="bg-black/50 text-white">
                      <Eye className="h-3 w-3 mr-1" />
                      {1234 + i * 567}
                    </Badge>
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <Badge variant="secondary" className="bg-black/50 text-white">
                      <Clock className="h-3 w-3 mr-1" />
                      {45 + i * 15}:23
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2 line-clamp-1">
                    Stream Title {i}: Amazing Content Here
                  </h4>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Streamer {i}</p>
                      <p className="text-xs text-muted-foreground">Gaming</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
      
      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-3">
        <Card className="hover-lift gradient-primary text-primary-foreground">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Quick Start
            </CardTitle>
            <CardDescription className="text-primary-foreground/80">
              Go live in seconds
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              size="lg" 
              variant="secondary"
              className="w-full"
              onClick={() => navigate('/streams/new')}
            >
              Start Streaming
            </Button>
          </CardContent>
        </Card>
        
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Schedule
            </CardTitle>
            <CardDescription>
              Plan upcoming streams
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              size="lg" 
              variant="outline"
              className="w-full"
              onClick={() => navigate('/streams/schedule')}
            >
              Schedule Stream
            </Button>
          </CardContent>
        </Card>
        
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Analytics
            </CardTitle>
            <CardDescription>
              Deep dive into metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              size="lg" 
              variant="outline"
              className="w-full"
              onClick={() => navigate('/analytics')}
            >
              View Analytics
            </Button>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Achievement Banner */}
      <motion.div 
        variants={itemVariants}
        className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20"
      >
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <Star className="h-6 w-6 text-yellow-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold">Milestone Achieved! 🎉</h4>
            <p className="text-sm text-muted-foreground">
              You've reached 10,000 total viewers this month
            </p>
          </div>
          <Button variant="outline" size="sm">
            View Achievements
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}