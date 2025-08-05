/* eslint-disable @typescript-eslint/no-unused-vars */
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { BarChart3, BookOpen, Calendar, ChevronLeft, ChevronRight, Crown, DollarSign, Gamepad2, HelpCircle, LayoutDashboard, LogOut, Music, Palette, PlayCircle, Plus, Radio, Settings, Users, Video } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState } from 'react';

const mainNavigation = [
  { name: 'Dashboard', href: '/tenant', icon: LayoutDashboard, badge: null },
  { name: 'Live Control Center', href: '/tenant/live-control', icon: Radio, badge: { text: 'LIVE', variant: 'destructive' as const } },
  { name: 'Content Library', href: '/tenant/content', icon: Video, badge: null },
  { name: 'Analytics Hub', href: '/tenant/analytics', icon: BarChart3, badge: null },
  { name: 'Interactive Features', href: '/tenant/interactive', icon: Users, badge: null },
];

const quickActions = [
  { name: 'Go Live', icon: Radio, action: '/streams/new', color: 'text-red-500' },
  { name: 'Upload Video', icon: Plus, action: '/upload', color: 'text-blue-500' },
  { name: 'Create Clip', icon: PlayCircle, action: '/clips/new', color: 'text-purple-500' },
];

const recommendedChannels = [
  { 
    name: 'ProGamer42', 
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ProGamer42',
    category: 'Gaming',
    viewers: 15420,
    isLive: true
  },
  { 
    name: 'ArtistAlice', 
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ArtistAlice',
    category: 'Art',
    viewers: 8932,
    isLive: true
  },
  { 
    name: 'TechTalks', 
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TechTalks',
    category: 'Technology',
    viewers: 0,
    isLive: false
  },
  { 
    name: 'MusicMaestro', 
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MusicMaestro',
    category: 'Music',
    viewers: 3456,
    isLive: true
  },
];

const categories = [
  { name: 'Gaming', icon: Gamepad2, color: 'from-purple-500 to-purple-600' },
  { name: 'Music', icon: Music, color: 'from-green-500 to-green-600' },
  { name: 'Art', icon: Palette, color: 'from-pink-500 to-pink-600' },
  { name: 'Education', icon: BookOpen, color: 'from-blue-500 to-blue-600' },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Mock user stats
  const userStats = {
    level: 42,
    levelProgress: 65,
    followers: 125432,
    subscriber: true,
    streamerPlus: true
  };

  return (
    <div className={cn(
      "sidebar flex h-full flex-col transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="sidebar-header flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600">
              <Radio className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              BigfootLive
            </span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="ml-auto"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <ScrollArea className="flex-1">
        {/* User Profile Section */}
        <div className={cn("p-4 border-b border-white/10", isCollapsed && "px-2")}>
          <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
            <div className="relative">
              <Avatar className={cn("ring-2 ring-purple-500", isCollapsed ? "h-8 w-8" : "h-10 w-10")}>
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`} />
                <AvatarFallback>{user?.username?.[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              {userStats.streamerPlus && (
                <div className="absolute -top-1 -right-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full p-1">
                  <Crown className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
            {!isCollapsed && (
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm">{user?.username}</p>
                  <Badge variant="secondary" className="text-xs px-1 py-0">
                    LVL {userStats.level}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {(userStats.followers / 1000).toFixed(1)}K followers
                </p>
                <Progress value={userStats.levelProgress} className="h-1 mt-1" />
              </div>
            )}
          </div>
          
          {!isCollapsed && (
            <div className="grid grid-cols-3 gap-2 mt-4">
              {quickActions.map((action) => (
                <Button
                  key={action.name}
                  variant="outline"
                  size="sm"
                  className="flex-col gap-1 h-auto py-2 border-white/10 hover:bg-white/5"
                  onClick={() => navigate(action.action)}
                >
                  <action.icon className={cn("h-4 w-4", action.color)} />
                  <span className="text-xs">{action.name}</span>
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Main Navigation */}
        <nav className="sidebar-nav">
          {mainNavigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'sidebar-item',
                  isActive && 'sidebar-item-active',
                  isCollapsed && "justify-center px-2"
                )}
              >
                <item.icon className={cn("h-4 w-4", isActive && "text-purple-400")} />
                {!isCollapsed && (
                  <>
                    <span className="flex-1">{item.name}</span>
                    {item.badge && (
                      <Badge variant={item.badge.variant} className="ml-auto h-5 px-1.5 text-xs">
                        {item.badge.text}
                      </Badge>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {!isCollapsed && (
          <>
            <Separator className="my-4 bg-white/10" />

            {/* Browse Categories */}
            <div className="px-4 mb-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Browse Categories
              </h3>
            </div>
            <div className="px-2 space-y-1">
              {categories.map((category) => (
                <Button
                  key={category.name}
                  variant="ghost"
                  className="w-full justify-start gap-3 text-sm"
                  onClick={() => navigate(`/browse/${category.name.toLowerCase()}`)}
                >
                  <div className={cn("p-1.5 rounded-lg bg-gradient-to-br", category.color)}>
                    <category.icon className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-muted-foreground">{category.name}</span>
                </Button>
              ))}
            </div>

            <Separator className="my-4 bg-white/10" />

            {/* Recommended Channels */}
            <div className="px-4 mb-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Recommended Channels
              </h3>
            </div>
            <div className="px-2 space-y-1">
              {recommendedChannels.map((channel) => (
                <Button
                  key={channel.name}
                  variant="ghost"
                  className="w-full justify-start gap-3 text-sm p-2"
                  onClick={() => navigate(`/channel/${channel.name.toLowerCase()}`)}
                >
                  <div className="relative">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={channel.avatar} />
                      <AvatarFallback>{channel.name[0]}</AvatarFallback>
                    </Avatar>
                    {channel.isLive && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-background" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-xs">{channel.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {channel.isLive ? (
                        <span className="flex items-center gap-1">
                          <span className="text-red-500">LIVE</span>
                          <span>• {(channel.viewers / 1000).toFixed(1)}K</span>
                        </span>
                      ) : (
                        channel.category
                      )}
                    </p>
                  </div>
                </Button>
              ))}
            </div>
          </>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-white/10 p-2">
        {!isCollapsed && (
          <div className="px-2 mb-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Stream Health</span>
              <span className="text-green-500 font-medium">Excellent</span>
            </div>
            <Progress value={95} className="h-1" />
          </div>
        )}
        
        <div className={cn("flex gap-1", isCollapsed && "flex-col")}>
          <Button
            variant="ghost"
            size={isCollapsed ? "icon" : "sm"}
            className="flex-1"
            onClick={() => navigate('/settings')}
          >
            <Settings className="h-4 w-4" />
            {!isCollapsed && <span className="ml-2">Settings</span>}
          </Button>
          <Button
            variant="ghost"
            size={isCollapsed ? "icon" : "sm"}
            className="flex-1"
            onClick={() => navigate('/help')}
          >
            <HelpCircle className="h-4 w-4" />
            {!isCollapsed && <span className="ml-2">Help</span>}
          </Button>
          <Button
            variant="ghost"
            size={isCollapsed ? "icon" : "sm"}
            className="flex-1 text-red-500 hover:text-red-400"
            onClick={signOut}
          >
            <LogOut className="h-4 w-4" />
            {!isCollapsed && <span className="ml-2">Sign Out</span>}
          </Button>
        </div>
      </div>
    </div>
  );
}