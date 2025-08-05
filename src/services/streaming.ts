/**
 * Streaming Service
 * Handles all streaming-related API calls and WebSocket connections
 */

import { api } from '@/lib/api';

interface StreamConfig {
  expected_viewers: number;
  audience_regions: string[];
  recording_enabled: boolean;
  quality_settings: {
    resolution: string;
    bitrate: number;
    fps: number;
  };
}

interface ContainerMetrics {
  cpu_usage: string;
  memory_usage: string;
  network_in: string;
  network_out: string;
  active_connections: string;
}

interface ContainerStatus {
  container_id: string;
  status: string;
  health: string;
  uptime: string;
  metrics: ContainerMetrics;
}

interface RTMPEndpoint {
  type: string;
  url: string;
  latency: number | string;
  description: string;
}

interface HLSEndpoint {
  type: string;
  url: string;
  cdn_enabled: boolean;
  description: string;
}

interface LaunchResponse {
  container_id: string;
  status: string;
  resources: {
    cpu: string;
    memory: string;
    instance_type: string;
  };
  rtmp_endpoints: RTMPEndpoint[];
  hls_endpoints: HLSEndpoint[];
  estimated_cost: string;
  message: string;
}

interface LogEntry {
  timestamp: string;
  message: string;
}

class StreamingService {
  private static instance: StreamingService;
  private wsConnection: WebSocket | null = null;
  private streamStatusCallbacks: Map<string, (status: unknown) => void> = new Map();
  
  static getInstance(): StreamingService {
    if (!StreamingService.instance) {
      StreamingService.instance = new StreamingService();
    }
    return StreamingService.instance;
  }

  /**
   * Launch a new event container
   */
  async launchContainer(eventId: string, config: StreamConfig): Promise<LaunchResponse> {
    try {
      const response = await api.post(`/containers/launch/${eventId}`, config);
      return response;
    } catch (error) {
      console.error('Failed to launch container:', error);
      throw new Error('Failed to launch streaming container');
    }
  }

  /**
   * Stop an event container
   */
  async stopContainer(containerId: string): Promise<{
    container_id: string;
    status: string;
    duration: string;
    estimated_cost: string;
    message: string;
  }> {
    try {
      const response = await api.post(`/containers/stop/${containerId}`);
      return response;
    } catch (error) {
      console.error('Failed to stop container:', error);
      throw new Error('Failed to stop streaming container');
    }
  }

  /**
   * Get container status
   */
  async getContainerStatus(containerId: string): Promise<ContainerStatus> {
    try {
      const response = await api.get(`/containers/status/${containerId}`);
      return response;
    } catch (error) {
      console.error('Failed to get container status:', error);
      throw new Error('Failed to get container status');
    }
  }

  /**
   * Get container logs
   */
  async getContainerLogs(containerId: string, lines: number = 100): Promise<{
    container_id: string;
    logs: LogEntry[];
  }> {
    try {
      const response = await api.get(`/containers/logs/${containerId}?lines=${lines}`);
      return response;
    } catch (error) {
      console.error('Failed to get container logs:', error);
      throw new Error('Failed to get container logs');
    }
  }

  /**
   * Initialize WebSocket connection for real-time updates
   */
  initializeWebSocket(containerId: string): void {
    if (this.wsConnection) {
      this.wsConnection.close();
    }

    const wsUrl = `${import.meta.env.VITE_WS_URL || 'ws://localhost:8000'}/ws/container/${containerId}`;
    
    try {
      this.wsConnection = new WebSocket(wsUrl);
      
      this.wsConnection.onopen = () => {
        console.log(`WebSocket connected for container ${containerId}`);
      };
      
      this.wsConnection.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as { type: string; container_id: string; payload: unknown };
          this.handleWebSocketMessage(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };
      
      this.wsConnection.onclose = () => {
        console.log(`WebSocket disconnected for container ${containerId}`);
        // Auto-reconnect after 5 seconds
        setTimeout(() => {
          if (this.streamStatusCallbacks.size > 0) {
            this.initializeWebSocket(containerId);
          }
        }, 5000);
      };
      
      this.wsConnection.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleWebSocketMessage(data: unknown): void {
    const message = data as { type: string; container_id: string; payload: unknown };
    const { type, container_id, payload } = message;
    
    switch (type) {
      case 'container_status':
        this.notifyStatusCallbacks(container_id, payload);
        break;
      case 'viewer_count':
        this.notifyStatusCallbacks(container_id, { type: 'viewers', data: payload });
        break;
      case 'stream_health':
        this.notifyStatusCallbacks(container_id, { type: 'health', data: payload });
        break;
      default:
        console.log('Unknown WebSocket message type:', type);
    }
  }

  /**
   * Subscribe to container status updates
   */
  subscribeToContainerUpdates(containerId: string, callback: (status: unknown) => void): void {
    this.streamStatusCallbacks.set(containerId, callback);
    if (!this.wsConnection || this.wsConnection.readyState !== WebSocket.OPEN) {
      this.initializeWebSocket(containerId);
    }
  }

  /**
   * Unsubscribe from container status updates
   */
  unsubscribeFromContainerUpdates(containerId: string): void {
    this.streamStatusCallbacks.delete(containerId);
    if (this.streamStatusCallbacks.size === 0 && this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
  }

  /**
   * Notify all registered callbacks
   */
  private notifyStatusCallbacks(containerId: string, status: unknown): void {
    const callback = this.streamStatusCallbacks.get(containerId);
    if (callback) {
      callback(status);
    }
  }

  /**
   * Close WebSocket connection
   */
  disconnect(): void {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
    this.streamStatusCallbacks.clear();
  }

  /**
   * Generate stream key for OBS/streaming software
   */
  generateStreamKey(): string {
    return `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Validate RTMP URL format
   */
  validateRTMPUrl(url: string): boolean {
    const rtmpRegex = /^rtmp:\/\/[\w.-]+(\/[\w.-]*)*\/?$/;
    return rtmpRegex.test(url);
  }

  /**
   * Validate HLS URL format
   */
  validateHLSUrl(url: string): boolean {
    const hlsRegex = /^https?:\/\/[\w.-]+(\/[\w.-]*)*.m3u8$/;
    return hlsRegex.test(url);
  }

  /**
   * Get quality recommendations based on expected viewers
   */
  getQualityRecommendations(expectedViewers: number): {
    resolution: string;
    bitrate: number;
    fps: number;
  }[] {
    if (expectedViewers < 100) {
      return [
        { resolution: '720p', bitrate: 2500, fps: 30 },
        { resolution: '480p', bitrate: 1200, fps: 30 }
      ];
    } else if (expectedViewers < 1000) {
      return [
        { resolution: '1080p', bitrate: 4500, fps: 30 },
        { resolution: '720p', bitrate: 2500, fps: 30 },
        { resolution: '480p', bitrate: 1200, fps: 30 }
      ];
    } else {
      return [
        { resolution: '1080p', bitrate: 6000, fps: 60 },
        { resolution: '1080p', bitrate: 4500, fps: 30 },
        { resolution: '720p', bitrate: 2500, fps: 30 },
        { resolution: '480p', bitrate: 1200, fps: 30 }
      ];
    }
  }
}

export const streamingService = StreamingService.getInstance();
export type { StreamConfig, ContainerStatus, RTMPEndpoint, HLSEndpoint, LaunchResponse };
