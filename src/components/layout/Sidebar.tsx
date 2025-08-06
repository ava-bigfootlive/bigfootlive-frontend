import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Radio, 
  Video, 
  BarChart3, 
  Users, 
  Settings,
  HelpCircle,
  LogOut,
  ChevronDown,
  ChevronRight,
  Plus,
  Upload,
  Calendar,
  Gamepad2,
  Monitor
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState } from 'react';

// Main navigation structure with clear hierarchy
const navigationSections = [
  {
    title: null, // Main section without header
    items: [
      { name: 'Dashboard', href: '/tenant', icon: LayoutDashboard },
      { 
        name: 'Live Control Center', 
        href: '/tenant/live-control', 
        icon: Radio,
        badge: { text: 'LIVE', color: 'bg-red-500 text-white' },
        children: [
          { name: 'Active Streams', href: '/tenant/live-control/streams' },
          { name: 'Stream Scheduler', href: '/tenant/live-control/scheduler' },
          { name: 'Stream Templates', href: '/tenant/live-control/templates' },
        ]
      },
    ]
  },
  {
    title: 'Content Library',
    items: [
      { name: 'VOD Management', href: '/tenant/content', icon: Video },
      { name: 'Upload Content', href: '/tenant/content/upload', icon: Upload },
      { name: 'Playlists & Collections', href: '/tenant/content/playlists', icon: Calendar },
    ]
  },
  {
    title: 'Analytics Hub',
    items: [
      { name: 'Overview', href: '/tenant/analytics', icon: BarChart3 },
      { name: 'Performance', href: '/tenant/analytics/performance', icon: Monitor },
      { name: 'Audience', href: '/tenant/analytics/audience', icon: Users },
    ]
  },
  {
    title: 'Platform',
    items: [
      { name: 'Interactive Features', href: '/tenant/interactive', icon: Users },
      { name: 'Team & Access', href: '/tenant/team', icon: Users },
      { name: 'Settings', href: '/tenant/settings', icon: Settings },
    ]
  }
];

interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  badge?: { text: string; color: string };
  children?: { name: string; href: string }[];
}

interface NavigationSection {
  title: string | null;
  items: NavigationItem[];
}

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({ 'Live Control Center': true });

  const toggleSection = (sectionName: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  const isItemActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    const isActive = isItemActive(item.href);
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedSections[item.name];
    
    return (
      <div key={item.name}>
        <div className="flex items-center">
          <Link
            to={item.href}
            className={cn(
              "flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition-colors",
              "hover:bg-gray-100",
              level > 0 && "ml-6 pl-2",
              isActive && "bg-blue-50 text-blue-700 font-medium"
            )}
          >
            {level === 0 && item.icon && (
              <item.icon className={cn(
                "h-5 w-5 flex-shrink-0",
                isActive ? "text-blue-600" : "text-gray-500"
              )} />
            )}
            <span className="flex-1 truncate">{item.name}</span>
            {item.badge && (
              <span className={cn("px-2 py-0.5 text-xs font-medium rounded-full", item.badge.color)}>
                {item.badge.text}
              </span>
            )}
          </Link>
          {hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-auto ml-1"
              onClick={() => toggleSection(item.name)}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children!.map(child => (
              <Link
                key={child.href}
                to={child.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 ml-8 text-sm rounded-md transition-colors",
                  "hover:bg-gray-100",
                  isItemActive(child.href) && "bg-blue-50 text-blue-700 font-medium"
                )}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                <span className="truncate">{child.name}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-64 h-full bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
            <Radio className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              BigfootLive
            </h1>
            <p className="text-xs text-gray-500">Streaming Platform</p>
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`} />
            <AvatarFallback className="bg-blue-100 text-blue-700">
              {user?.username?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-gray-900 truncate">
              {user?.username}
            </p>
            <p className="text-xs text-gray-500">Content Creator</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 p-4">
        <nav className="space-y-6">
          {navigationSections.map((section, index) => (
            <div key={index}>
              {section.title && (
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  {section.title}
                </h3>
              )}
              <div className="space-y-1">
                {section.items.map(item => renderNavigationItem(item))}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 justify-start gap-2 text-gray-600"
            onClick={() => navigate('/tenant/settings')}
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 justify-start gap-2 text-gray-600"
            onClick={() => navigate('/help')}
          >
            <HelpCircle className="h-4 w-4" />
            <span>Help</span>
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 mt-2 text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={signOut}
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </Button>
      </div>
    </div>
  );
}
