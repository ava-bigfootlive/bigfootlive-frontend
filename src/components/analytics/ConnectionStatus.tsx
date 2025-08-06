import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Wifi, WifiOff, RefreshCw, AlertCircle, CheckCircle,
  Activity, Settings, Info, Bug
} from 'lucide-react';
import { realTimeAnalyticsService } from '@/services/realTimeAnalytics';

export default function ConnectionStatus() {
  const [connectionStatus, setConnectionStatus] = useState<any>(null);
  const [messages, setMessages] = useState<Array<{ time: Date; type: string; data: any }>>([]);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // Subscribe to connection events
    const unsubscribeConnection = realTimeAnalyticsService.subscribe('connection', (data) => {
      console.log('Connection event:', data);
      setMessages(prev => [...prev, { time: new Date(), type: 'connection', data }].slice(-20));
      updateStatus();
    });

    // Subscribe to analytics data
    const unsubscribeAnalytics = realTimeAnalyticsService.subscribe('analytics', (data) => {
      console.log('Analytics data:', data);
      setMessages(prev => [...prev, { time: new Date(), type: 'analytics', data }].slice(-20));
    });

    // Subscribe to metrics data
    const unsubscribeMetrics = realTimeAnalyticsService.subscribe('metrics', (data) => {
      console.log('Metrics data:', data);
      setMessages(prev => [...prev, { time: new Date(), type: 'metrics', data }].slice(-20));
    });

    // Initial status update
    updateStatus();

    // Update status every 5 seconds
    const statusInterval = setInterval(updateStatus, 5000);

    return () => {
      unsubscribeConnection();
      unsubscribeAnalytics();
      unsubscribeMetrics();
      clearInterval(statusInterval);
    };
  }, []);

  const updateStatus = () => {
    const status = realTimeAnalyticsService.getConnectionStatus();
    setConnectionStatus(status);
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await realTimeAnalyticsService.connect();
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    realTimeAnalyticsService.disconnect();
    updateStatus();
  };

  const getStatusColor = (status: any) => {
    if (!status) return 'text-gray-500';
    
    switch (status.readyState) {
      case WebSocket.CONNECTING:
        return 'text-yellow-500';
      case WebSocket.OPEN:
        return 'text-green-500';
      case WebSocket.CLOSING:
        return 'text-orange-500';
      case WebSocket.CLOSED:
      default:
        return 'text-red-500';
    }
  };

  const getStatusText = (status: any) => {
    if (!status) return 'Unknown';
    
    switch (status.readyState) {
      case WebSocket.CONNECTING:
        return 'Connecting';
      case WebSocket.OPEN:
        return 'Connected';
      case WebSocket.CLOSING:
        return 'Closing';
      case WebSocket.CLOSED:
      default:
        return 'Disconnected';
    }
  };

  const formatMessage = (message: any) => {
    try {
      return JSON.stringify(message, null, 2);
    } catch {
      return String(message);
    }
  };

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'connection':
        return 'text-blue-600';
      case 'analytics':
        return 'text-green-600';
      case 'metrics':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Connection Status</h2>
          <p className="text-muted-foreground">Monitor and test real-time analytics connections</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleConnect}
            disabled={isConnecting || connectionStatus?.readyState === WebSocket.OPEN}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isConnecting ? 'animate-spin' : ''}`} />
            {isConnecting ? 'Connecting...' : 'Connect'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDisconnect}
            disabled={connectionStatus?.readyState !== WebSocket.OPEN}
          >
            <WifiOff className="h-4 w-4 mr-2" />
            Disconnect
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connection Status</CardTitle>
            {connectionStatus?.readyState === WebSocket.OPEN ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getStatusColor(connectionStatus)}`}>
              {getStatusText(connectionStatus)}
            </div>
            {connectionStatus?.reconnectAttempts > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Reconnect attempts: {connectionStatus.reconnectAttempts}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">WebSocket URL</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-mono break-all">
              {connectionStatus?.url || 'Not connected'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Environment</CardTitle>
            <Info className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-sm">
              <div>API: {import.meta.env.VITE_API_URL || 'Not configured'}</div>
              <div>WS: {import.meta.env.VITE_WS_URL || 'Not configured'}</div>
              <Badge variant="outline" className="text-xs">
                {import.meta.env.MODE}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Environment Variables */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Environment Configuration
          </CardTitle>
          <CardDescription>Current environment variables and settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 text-sm font-mono">
            <div className="flex justify-between">
              <span>VITE_API_URL:</span>
              <span className="text-muted-foreground">{import.meta.env.VITE_API_URL || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span>VITE_WS_URL:</span>
              <span className="text-muted-foreground">{import.meta.env.VITE_WS_URL || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span>VITE_USE_MOCK_ANALYTICS:</span>
              <span className="text-muted-foreground">{import.meta.env.VITE_USE_MOCK_ANALYTICS || 'false'}</span>
            </div>
            <div className="flex justify-between">
              <span>VITE_DEBUG_ANALYTICS:</span>
              <span className="text-muted-foreground">{import.meta.env.VITE_DEBUG_ANALYTICS || 'false'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messages and Debugging */}
      <Tabs defaultValue="messages" className="space-y-4">
        <TabsList>
          <TabsTrigger value="messages">Live Messages</TabsTrigger>
          <TabsTrigger value="test">Test Connection</TabsTrigger>
          <TabsTrigger value="help">Setup Help</TabsTrigger>
        </TabsList>

        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Real-Time Messages
              </CardTitle>
              <CardDescription>Live WebSocket messages and events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No messages received yet. Try connecting to see live data.
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div key={index} className="border rounded p-3 text-sm">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className={getMessageTypeColor(message.type)}>
                          {message.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {message.time.toLocaleTimeString()}
                        </span>
                      </div>
                      <pre className="text-xs text-muted-foreground overflow-x-auto">
                        {formatMessage(message.data)}
                      </pre>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Connection Test</CardTitle>
              <CardDescription>Test different connection scenarios</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Current status: <strong>{getStatusText(connectionStatus)}</strong>
                  {connectionStatus?.readyState === WebSocket.OPEN && (
                    <span className="text-green-600"> - Real-time data should be flowing</span>
                  )}
                </AlertDescription>
              </Alert>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2">Quick Tests</h4>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" onClick={handleConnect} className="w-full">
                      Test Connection
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="w-full">
                      Refresh Page
                    </Button>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Debug Info</h4>
                  <div className="text-sm space-y-1">
                    <div>Ready State: {connectionStatus?.readyState ?? 'Unknown'}</div>
                    <div>Reconnect Attempts: {connectionStatus?.reconnectAttempts ?? 0}</div>
                    <div>Messages Received: {messages.length}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="help" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bug className="h-5 w-5" />
                Setup Troubleshooting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Backend Not Ready?</strong> Set <code>VITE_USE_MOCK_ANALYTICS=true</code> in your .env file to use mock data during development.
                  </AlertDescription>
                </Alert>

                <div>
                  <h4 className="font-medium mb-2">Common Issues:</h4>
                  <ul className="text-sm space-y-1 ml-4">
                    <li>• WebSocket connection refused: Check if backend is running</li>
                    <li>• Authentication errors: Verify JWT token is valid</li>
                    <li>• CORS issues: Configure WebSocket server to allow your domain</li>
                    <li>• Firewall blocking: Check network/proxy settings</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Next Steps:</h4>
                  <ul className="text-sm space-y-1 ml-4">
                    <li>• Check the browser console for detailed error messages</li>
                    <li>• Verify environment variables are set correctly</li>
                    <li>• Test with mock data first by setting VITE_USE_MOCK_ANALYTICS=true</li>
                    <li>• Refer to REAL_TIME_ANALYTICS_SETUP.md for backend setup</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
