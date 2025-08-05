import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface MigrationPage {
  name: string;
  path: string;
  status: 'completed' | 'in-progress' | 'pending';
  description: string;
  deprecatedClasses?: string[];
  newUtilities?: string[];
}

const migrationPages: MigrationPage[] = [
  {
    name: 'Dashboard Home',
    path: '/tenant/dashboard',
    status: 'completed',
    description: 'Main dashboard page with metrics and stream overview',
    deprecatedClasses: ['enhanced-card', 'metric-card', 'page-header', 'action-button'],
    newUtilities: ['card-enhanced', 'card-metric', 'page-header', 'action-button']
  },
  {
    name: 'Streamer Dashboard',
    path: '/tenant',
    status: 'completed',
    description: 'Tenant dashboard with live streams and quick actions',
    deprecatedClasses: ['enhanced-card', 'panel', 'hover-glow', 'status-live'],
    newUtilities: ['card-enhanced', 'panel', 'hover-glow', 'status-live']
  },
  {
    name: 'Settings Page',
    path: '/tenant/settings',
    status: 'completed',
    description: 'Platform configuration and user preferences',
    deprecatedClasses: ['tabs-enhanced', 'settings-section', 'color-preset'],
    newUtilities: ['tabs-enhanced', 'settings-section', 'color-preset']
  },
  {
    name: 'Stream Viewer',
    path: '/streams/:id',
    status: 'completed',
    description: 'Video player and stream viewing interface',
    deprecatedClasses: ['stream-card', 'viewer-count', 'live-indicator'],
    newUtilities: ['stream-card', 'viewer-count', 'live-indicator']
  }
];

const MigrationStatus: React.FC = () => {
  const completedPages = migrationPages.filter(page => page.status === 'completed').length;
  const totalPages = migrationPages.length;
  const progressPercentage = (completedPages / totalPages) * 100;

  const getStatusIcon = (status: MigrationPage['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: MigrationPage['status']) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
      case 'in-progress':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">In Progress</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Pending</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Theme Migration Status</CardTitle>
        <CardDescription>
          Progress on migrating application pages from SCSS to Tailwind utility classes
        </CardDescription>
        <div className="flex items-center gap-4 mt-4">
          <div className="flex-1">
            <Progress value={progressPercentage} className="h-2" />
          </div>
          <span className="text-sm font-medium">
            {completedPages}/{totalPages} ({Math.round(progressPercentage)}%)
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {migrationPages.map((page, index) => (
            <div 
              key={index} 
              className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex-shrink-0 mt-1">
                {getStatusIcon(page.status)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium">{page.name}</h4>
                  {getStatusBadge(page.status)}
                </div>
                <p className="text-sm text-muted-foreground mb-2">{page.description}</p>
                <code className="text-xs bg-muted px-2 py-1 rounded">{page.path}</code>
                
                {page.status === 'completed' && page.deprecatedClasses && (
                  <div className="mt-3 space-y-2">
                    <div>
                      <span className="text-xs font-medium text-red-600">Deprecated:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {page.deprecatedClasses.map((cls, idx) => (
                          <code key={idx} className="text-xs bg-red-50 text-red-700 px-1.5 py-0.5 rounded">
                            .{cls}
                          </code>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-green-600">New Utilities:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {page.newUtilities?.map((cls, idx) => (
                          <code key={idx} className="text-xs bg-green-50 text-green-700 px-1.5 py-0.5 rounded">
                            .{cls}
                          </code>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {progressPercentage === 100 && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-800">Migration Complete!</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              All application pages have been successfully migrated to use Tailwind utility classes.
              Deprecated SCSS imports can now be safely removed.
            </p>
          </div>
        )}
        
        <div className="mt-6 text-sm text-muted-foreground">
          <h5 className="font-medium mb-2">Migration Features:</h5>
          <ul className="space-y-1 text-xs">
            <li>• Feature-flagged deprecated styles for gradual removal</li>
            <li>• New Tailwind utility classes with enhanced functionality</li>
            <li>• Backward compatibility during transition period</li>
            <li>• Improved theming system with CSS custom properties</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default MigrationStatus;
