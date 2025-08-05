import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Info, TrendingDown, TrendingUp, X } from 'lucide-react';
import { analyticsService } from '@/services/analyticsService';
import type { AnalyticsAlert } from '@/types/analytics';

interface AlertsDashboardProps {
  channelId: string;
}

export const AlertsDashboard: React.FC<AlertsDashboardProps> = React.memo(({ channelId }) => {
  const [alerts, setAlerts] = useState<AnalyticsAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const data = await analyticsService.getAnalyticsAlerts(channelId);
        setAlerts(data);
      } catch (e) {
        setError('Failed to load alerts.');
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, [channelId]);

  const handleAcknowledgeAlert = useCallback(async (alertId: string) => {
    try {
      await analyticsService.acknowledgeAnalyticsAlert(alertId);
      setAlerts(alerts.map(alert => 
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      ));
    } catch (e) {
      console.error('Failed to acknowledge alert:', e);
    }
  }, [alerts]);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const getSeverityBadgeVariant = (severity: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (severity) {
      case 'error':
        return 'destructive';
      case 'warning':
        return 'outline';
      case 'info':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full w-6 h-6 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-muted-foreground">Loading alerts...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const unacknowledgedAlerts = useMemo(() => 
    alerts.filter(alert => !alert.acknowledged), [alerts]
  );
  const acknowledgedAlerts = useMemo(() => 
    alerts.filter(alert => alert.acknowledged), [alerts]
  );

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Alerts</p>
                <p className="text-2xl font-bold">{alerts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Unacknowledged</p>
                <p className="text-2xl font-bold">{unacknowledgedAlerts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Acknowledged</p>
                <p className="text-2xl font-bold">{acknowledgedAlerts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Unacknowledged Alerts */}
      {unacknowledgedAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Unacknowledged Alerts</CardTitle>
            <CardDescription>Alerts that require your attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {unacknowledgedAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-start space-x-3">
                    {getSeverityIcon(alert.severity)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium">{alert.title}</h4>
                        <Badge variant={getSeverityBadgeVariant(alert.severity)}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatTimestamp(alert.timestamp)}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAcknowledgeAlert(alert.id)}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Acknowledge
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Acknowledged Alerts */}
      {acknowledgedAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Acknowledged Alerts</CardTitle>
            <CardDescription>Previously acknowledged alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {acknowledgedAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start space-x-3 p-4 border rounded-lg opacity-60"
                >
                  {getSeverityIcon(alert.severity)}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium">{alert.title}</h4>
                      <Badge variant="outline">ACKNOWLEDGED</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatTimestamp(alert.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Alerts */}
      {alerts.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Active Alerts
            </h3>
            <p className="text-muted-foreground max-w-sm">
              Great! You currently have no analytics alerts. We'll notify you if anything needs your attention.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
});
