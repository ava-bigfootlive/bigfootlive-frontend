import React, { useState } from 'react';
import { useLocation, Outlet, useNavigate } from 'react-router-dom';
import { BarChart3, Bell, Calendar, ChevronRight, FileText, FolderOpen, Heart, HelpCircle, LayoutDashboard, LogOut, Menu, MessageSquare, Moon, PlayCircle, Search, Settings, Shield, Sun, Target, Upload, User, Users, Video, X, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/store/auth';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href: string;
  badge?: string;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/tenant'
  },
  {
    id: 'live-control',
    label: 'Live Control Center',
    icon: Zap,
    href: '/tenant/live',
    badge: '2',
    children: [
      { id: 'active-streams', label: 'Active Streams', icon: PlayCircle, href: '/tenant/live/active' },
      { id: 'scheduler', label: 'Stream Scheduler', icon: Calendar, href: '/tenant/live/schedule' },
      { id: 'templates', label: 'Stream Templates', icon: FileText, href: '/tenant/live/templates' }
    ]
  },
  {
    id: 'content',
    label: 'Content Library',
    icon: FolderOpen,
    href: '/tenant/content',
    children: [
      { id: 'vod', label: 'VOD Management', icon: Video, href: '/tenant/content/vod' },
      { id: 'simlive', label: 'SimLive Creation', icon: Zap, href: '/tenant/content/simlive' },
      { id: 'playlists', label: 'Playlists & Collections', icon: FolderOpen, href: '/tenant/content/playlists' }
    ]
  },
  {
    id: 'analytics',
    label: 'Analytics Hub',
    icon: BarChart3,
    href: '/tenant/analytics',
    badge: 'NEW',
    children: [
      { id: 'realtime', label: 'Real-time Metrics', icon: Zap, href: '/tenant/analytics' },
      { id: 'reports', label: 'Historical Reports', icon: FileText, href: '/tenant/analytics' },
      { id: 'revenue', label: 'Revenue Analytics', icon: BarChart3, href: '/tenant/analytics' }
    ]
  },
  {
    id: 'interactive',
    label: 'Interactive Features',
    icon: Zap,
    href: '/tenant/interactive',
    children: [
      { id: 'polls', label: 'Polls & Voting', icon: BarChart3, href: '/tenant/interactive' },
      { id: 'qa', label: 'Q&A Sessions', icon: MessageSquare, href: '/tenant/interactive' },
      { id: 'reactions', label: 'Reactions', icon: Heart, href: '/tenant/interactive' },
      { id: 'checkpoints', label: 'Checkpoints', icon: Target, href: '/tenant/interactive' }
    ]
  },
  {
    id: 'team',
    label: 'Team & Access',
    icon: Users,
    href: '/tenant/team',
    children: [
      { id: 'users', label: 'User Management', icon: Users, href: '/tenant/team/users' },
      { id: 'roles', label: 'Roles & Permissions', icon: Shield, href: '/tenant/team/roles' },
      { id: 'api', label: 'API Access', icon: Zap, href: '/tenant/team/api' }
    ]
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    href: '/tenant/settings'
  },
  {
    id: 'documentation',
    label: 'Documentation',
    icon: FileText,
    href: '/tenant/docs'
  }
];

const quickActions = [
  { label: 'Go Live', icon: Zap, action: 'go-live', variant: 'default' as const },
  { label: 'Schedule Event', icon: Calendar, action: 'schedule', variant: 'secondary' as const },
  { label: 'Upload VOD', icon: Upload, action: 'upload', variant: 'secondary' as const }
];

export default function TenantDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user: authUser, signOut } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedItems, setExpandedItems] = useState<string[]>(['live-control', 'content']);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get user from auth store with fallback
  const user = {
    name: authUser?.name || authUser?.username || 'User',
    email: authUser?.email || 'user@example.com',
    avatar: '',
    role: 'Admin',
    tenantId: 'tenant-123'
  };

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const isActiveRoute = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'go-live':
        navigate('/tenant/live/start');
        break;
      case 'schedule':
        navigate('/tenant/live/schedule/new');
        break;
      case 'upload':
        navigate('/tenant/content/vod/upload');
        break;
    }
  };

  return (
    <div className="flex h-screen dashboard-layout">
      {/* Sidebar */}
      <aside
        className={cn(
          "sidebar flex flex-col transition-all duration-300",
          sidebarOpen ? "w-60" : "w-16"
        )}
      >
        {/* Logo Area */}
        <div className="sidebar-header flex items-center justify-between">
          {sidebarOpen && (
            <h1 className="text-xl font-bold">BigfootLive</h1>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-auto"
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1">
          <nav className="sidebar-nav">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.href);
              const isExpanded = expandedItems.includes(item.id);
              const hasChildren = item.children && item.children.length > 0;

              return (
                <div key={item.id}>
                  <button
                    onClick={() => {
                      if (hasChildren) {
                        toggleExpanded(item.id);
                      } else {
                        navigate(item.href);
                      }
                    }}
                    className={cn(
                      "w-full sidebar-item",
                      isActive && "sidebar-item-active",
                      !sidebarOpen && "justify-center px-2"
                    )}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    {sidebarOpen && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-auto">
                            {item.badge}
                          </Badge>
                        )}
                        {hasChildren && (
                          <ChevronRight
                            className={cn(
                              "h-4 w-4 transition-transform",
                              isExpanded && "rotate-90"
                            )}
                          />
                        )}
                      </>
                    )}
                  </button>
                  
                  {/* Child Navigation */}
                  {sidebarOpen && hasChildren && isExpanded && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.children!.map((child) => {
                        const ChildIcon = child.icon;
                        const isChildActive = isActiveRoute(child.href);
                        
                        return (
                          <button
                            key={child.id}
                            onClick={() => {
                              navigate(child.href);
                            }}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
                              isChildActive
                                ? "bg-accent text-accent-foreground"
                                : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"
                            )}
                          >
                            <ChildIcon className="h-3 w-3" />
                            <span>{child.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Quick Actions */}
          {sidebarOpen && (
            <>
              <Separator className="my-4" />
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground px-3">
                  QUICK ACTIONS
                </p>
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Button
                      key={action.action}
                      variant={action.variant}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => handleQuickAction(action.action)}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {action.label}
                    </Button>
                  );
                })}
              </div>
            </>
          )}
        </ScrollArea>

        {/* Footer Links */}
        {sidebarOpen && (
          <div className="border-t p-3 space-y-1">
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <FileText className="h-4 w-4 mr-2" />
              Documentation
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <Shield className="h-4 w-4 mr-2" />
              Compliance
            </Button>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="main-header">
          <div className="header-content">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search streams, content, users..."
                className="pl-10 bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-muted-foreground"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>

            {/* Help */}
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <HelpCircle className="h-4 w-4" />
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative text-muted-foreground">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-danger" />
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => {
                  navigate('/tenant/settings');
                }}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  navigate('/tenant/settings');
                }}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => {
                  signOut();
                  navigate('/login');
                }}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto main-content">
          <div className="content-wrapper">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}