# Real-Time Analytics Setup Guide

## Overview

Your BigFoot Live streaming platform now has comprehensive real-time analytics integration with live data instead of just mock data. This document explains how to set up the backend services to make everything work with real streaming infrastructure.

## Current Implementation

### ✅ What's Already Built

1. **Real-Time Analytics Hook** (`src/hooks/useRealTimeAnalytics.ts`)
   - WebSocket connections for live data updates
   - Polling fallback when WebSocket is unavailable
   - Merges data from multiple analytics sources
   - Handles connection state management

2. **Real-Time Dashboard Component** (`src/components/analytics/RealTimeDashboard.tsx`)
   - Live viewer counts and metrics
   - Device and geographic distribution charts
   - Performance monitoring with real data
   - Connection status indicators

3. **Enhanced Analytics Pages**
   - **Performance Analytics** (`src/pages/tenant/AnalyticsPerformance.tsx`)
   - **Audience Analytics** (`src/pages/tenant/AnalyticsAudience.tsx`)
   - **Real-Time Overview** (`src/pages/tenant/AnalyticsRealTime.tsx`)

4. **Service Layer Integration**
   - `analyticsService` - Comprehensive analytics data fetching
   - `eventService` - Stream event management with WebSocket metrics
   - `streamingService` - Infrastructure management and monitoring

## Backend Services Setup

### 1. WebSocket Endpoints Required

Your backend needs to implement these WebSocket endpoints:

```typescript
// Real-time analytics data
GET /api/ws/analytics/realtime?token=${auth_token}

// Stream-specific metrics  
GET /api/ws/streams/${streamId}/metrics?token=${auth_token}

// Container status updates (for infrastructure monitoring)
GET /api/ws/container/${containerId}
```

### 2. REST API Endpoints

```typescript
// Analytics endpoints
GET /api/v1/analytics/streams/${streamId}/metrics
GET /api/v1/analytics/real-time/${streamId}
GET /api/v1/analytics/comprehensive/${streamId}
GET /api/v1/analytics/historical/${channelId}

// Stream management
GET /api/streams
GET /api/streams/${id}
POST /api/streams/${id}/start
POST /api/streams/${id}/stop

// Container management
POST /api/containers/launch/${eventId}
POST /api/containers/stop/${containerId}
GET /api/containers/status/${containerId}
```

### 3. Environment Variables

Add these to your `.env` file:

```bash
# API Configuration
VITE_API_URL=https://api.bigfootlive.io
VITE_WS_URL=wss://api.bigfootlive.io

# Analytics Configuration
VITE_USE_MOCK_ANALYTICS=false
VITE_USE_MOCK_API=false

# Development mode (for localhost testing)
VITE_API_URL=http://localhost:8001
VITE_WS_URL=ws://localhost:8001
```

## Data Structures

### Real-Time Analytics Data

```typescript
interface RealTimeAnalyticsState {
  // Core metrics
  currentViewers: number;
  peakViewers: number;
  totalViews: number;
  avgViewDuration: number;
  
  // Performance metrics
  bandwidth: number;
  latency: number;
  errorRate: number;
  uptime: number;
  
  // Engagement metrics
  chatMessages: number;
  reactions: number;
  shares: number;
  
  // Geographic and device data
  geographicDistribution: Record<string, number>;
  deviceDistribution: Record<string, number>;
  
  // Time series data
  viewerTimeline: Array<{
    timestamp: Date;
    viewers: number;
    chatActivity: number;
  }>;
  
  // Status
  isConnected: boolean;
  lastUpdated: Date | null;
  error: string | null;
}
```

### WebSocket Message Format

```typescript
// Analytics updates
{
  type: 'analytics',
  data: {
    totalViewers: number,
    activeStreams: number,
    revenueToday: number,
    avgEngagement: number,
    errorRate: number,
    serverLoad: number
  }
}

// Stream metrics updates
{
  type: 'metrics',
  data: {
    currentViewers: number,
    peakViewers: number,
    totalViews: number,
    avgViewDuration: number,
    chatMessages: number,
    bandwidth: number,
    quality: number,
    buffering: number,
    errors: number
  }
}
```

## Integration Steps

### 1. Set up WebSocket Server

You'll need a WebSocket server that can:
- Handle authentication via JWT tokens
- Broadcast real-time analytics data every 5-30 seconds
- Handle heartbeat messages for connection management
- Support room-based subscriptions (per stream)

### 2. Analytics Data Pipeline

Set up a data pipeline that:
- Collects metrics from your streaming infrastructure (RTMP/HLS servers)
- Aggregates data in real-time
- Stores historical data for trend analysis
- Pushes updates via WebSocket

### 3. Stream Management

Integrate with your streaming infrastructure:
- RTMP server status monitoring
- HLS segment generation tracking
- CDN performance metrics
- Viewer session tracking

## Testing Without Real Backend

The system includes fallbacks for development:

1. **Mock Data Mode**: Set `VITE_USE_MOCK_ANALYTICS=true`
2. **Polling Fallback**: Automatically used when WebSocket fails
3. **Graceful Degradation**: Shows offline status when backend unavailable

## Usage Examples

### Basic Real-Time Dashboard

```typescript
import RealTimeDashboard from '@/components/analytics/RealTimeDashboard';

function AnalyticsPage() {
  return (
    <RealTimeDashboard 
      streamId="your-stream-id"
      refreshInterval={5000}
      autoRefresh={true}
    />
  );
}
```

### Custom Analytics Hook

```typescript
import { useRealTimeAnalytics } from '@/hooks/useRealTimeAnalytics';

function CustomAnalytics() {
  const {
    data,
    isConnected,
    refresh,
    getActiveStreams
  } = useRealTimeAnalytics({
    streamId: 'stream-123',
    enabled: true,
    enableWebSocket: true
  });

  return (
    <div>
      <p>Viewers: {data.currentViewers}</p>
      <p>Status: {isConnected ? 'Live' : 'Offline'}</p>
    </div>
  );
}
```

## Next Steps

1. **Set up your WebSocket server** with the required endpoints
2. **Configure environment variables** to point to your backend
3. **Test the real-time connection** using browser dev tools
4. **Add authentication** to protect your analytics endpoints
5. **Implement data persistence** for historical analytics
6. **Set up monitoring** for the WebSocket connections themselves

## Troubleshooting

### Common Issues

1. **WebSocket connection fails**
   - Check CORS settings on your WebSocket server
   - Verify JWT token is valid and not expired
   - Check firewall/proxy settings

2. **Data not updating**
   - Verify WebSocket messages are being sent from server
   - Check browser console for parsing errors
   - Ensure data format matches expected structure

3. **Performance issues**
   - Consider rate limiting WebSocket updates
   - Implement client-side data aggregation
   - Use connection pooling for multiple streams

The frontend is now ready for live data - you just need to implement the backend services described above!
