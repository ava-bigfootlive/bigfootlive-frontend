import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
// import { Tabs } from '@/components/ui/tabs';
import { Activity, BarChart3, DollarSign, Eye, Heart, Radio, Sparkles, Star, TrendingUp, Trophy, Users, Video, Zap, Flame } from 'lucide-react';
import EnhancedVideoPlayer from '@/components/video/EnhancedVideoPlayer';
import { cn } from '@/lib/utils';

export default function UIShowcase() {
  const [progress] = useState(65);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-5xl font-bold text-gradient">
          BigfootLive Design System
        </h1>
        <p className="text-xl text-muted-foreground">
          Modern UI components and patterns for streaming excellence
        </p>
      </motion.div>
      
      {/* Animation Examples */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Animations & Interactions</h2>
        
        <div className="grid gap-6 md:grid-cols-3">
          {/* Hover Effects */}
          <Card className="hover-lift cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                Hover Lift
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Smooth elevation on hover with shadow enhancement
              </p>
            </CardContent>
          </Card>
          
          {/* Gradient Card */}
          <Card className="gradient-mesh border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-600" />
                Gradient Mesh
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Beautiful gradient backgrounds with mesh effect
              </p>
            </CardContent>
          </Card>
          
          {/* Glass Morphism */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg opacity-50" />
            <Card className="glass relative">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Glass Effect
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>Frosted glass with backdrop blur</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Status Indicators */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Stream Status Indicators</h2>
        
        <div className="flex flex-wrap gap-4">
          <Badge variant="destructive" className="animate-pulse-live">
            <Radio className="h-3 w-3 mr-1" />
            LIVE
          </Badge>
          
          <Badge variant="secondary">
            <Users className="h-3 w-3 mr-1" />
            1,234 viewers
          </Badge>
          
          <Badge variant="outline" className="border-green-500 text-green-600">
            <Activity className="h-3 w-3 mr-1" />
            Active
          </Badge>
          
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
            <Trophy className="h-3 w-3 mr-1" />
            Top Stream
          </Badge>
          
          <Badge variant="outline" className="border-orange-500 text-orange-600">
            <Flame className="h-3 w-3 mr-1" />
            Trending
          </Badge>
        </div>
      </section>
      
      {/* Interactive Cards */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Interactive Stream Cards</h2>
        
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedCard(i)}
            >
              <Card className={cn(
                "stream-card cursor-pointer transition-all",
                selectedCard === i && "ring-2 ring-primary shadow-glow"
              )}>
                <div className="relative aspect-video bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-t-lg overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Video className="h-12 w-12 text-white/50" />
                  </div>
                  <div className="absolute top-3 left-3">
                    <Badge variant="destructive" className="animate-pulse-live">
                      <Radio className="h-3 w-3 mr-1" />
                      LIVE
                    </Badge>
                  </div>
                  <div className="absolute bottom-3 right-3 flex gap-2">
                    <Badge variant="secondary" className="bg-black/50 text-white">
                      <Eye className="h-3 w-3 mr-1" />
                      {1000 + i * 234}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-1">Amazing Stream #{i}</h3>
                  <p className="text-sm text-muted-foreground">
                    Click to see selection effect
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
      
      {/* Progress Indicators */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Progress & Loading States</h2>
        
        <Card>
          <CardHeader>
            <CardTitle>Stream Upload Progress</CardTitle>
            <CardDescription>Various progress indicator styles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Standard Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Standard Progress</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            
            {/* Animated Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Animated Progress</span>
                <span>Loading...</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                />
              </div>
            </div>
            
            {/* Skeleton Loading */}
            <div className="space-y-2">
              <span className="text-sm">Skeleton Loading</span>
              <div className="space-y-3">
                <div className="h-4 bg-secondary rounded skeleton" />
                <div className="h-4 bg-secondary rounded skeleton w-3/4" />
                <div className="h-4 bg-secondary rounded skeleton w-1/2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
      
      {/* Metric Cards */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Analytics & Metrics</h2>
        
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { icon: TrendingUp, label: 'Views', value: '24.5K', change: '+12%', color: 'text-green-600' },
            { icon: Users, label: 'Followers', value: '8.2K', change: '+5%', color: 'text-blue-600' },
            { icon: DollarSign, label: 'Revenue', value: '$3,456', change: '+18%', color: 'text-purple-600' },
            { icon: BarChart3, label: 'Engagement', value: '67%', change: '-2%', color: 'text-orange-600' },
          ].map((metric, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="hover-lift">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <metric.icon className={cn("h-5 w-5", metric.color)} />
                    <span className={cn(
                      "text-sm font-medium",
                      metric.change.startsWith('+') ? "text-green-600" : "text-red-600"
                    )}>
                      {metric.change}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{metric.value}</p>
                  <p className="text-xs text-muted-foreground">{metric.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
      
      {/* Video Player Demo */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Enhanced Video Player</h2>
        
        <Card className="overflow-hidden">
          <EnhancedVideoPlayer
            src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
            isLive={false}
            title="Sample Stream Playback"
            viewers={1234}
          />
        </Card>
      </section>
      
      {/* Button Variations */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Button Styles</h2>
        
        <Card>
          <CardHeader>
            <CardTitle>Button Variations</CardTitle>
            <CardDescription>Different button styles and states</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Button size="sm">Small</Button>
              <Button>Default</Button>
              <Button size="lg">Large</Button>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Button className="gradient-primary">
                <Sparkles className="h-4 w-4 mr-2" />
                Gradient
              </Button>
              <Button className="shadow-glow">
                <Zap className="h-4 w-4 mr-2" />
                Glow Effect
              </Button>
              <Button variant="outline" className="hover-lift">
                <Heart className="h-4 w-4 mr-2" />
                Hover Lift
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
      
      {/* Color Palette */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Color System</h2>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { name: 'Primary', class: 'bg-primary' },
            { name: 'Secondary', class: 'bg-secondary' },
            { name: 'Accent', class: 'bg-accent' },
            { name: 'Muted', class: 'bg-muted' },
            { name: 'Success', class: 'bg-green-500' },
            { name: 'Warning', class: 'bg-yellow-500' },
            { name: 'Error', class: 'bg-red-500' },
            { name: 'Info', class: 'bg-blue-500' },
          ].map((color) => (
            <Card key={color.name} className="overflow-hidden">
              <div className={cn("h-24", color.class)} />
              <CardContent className="p-4">
                <p className="font-medium">{color.name}</p>
                <p className="text-sm text-muted-foreground">{color.class}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}