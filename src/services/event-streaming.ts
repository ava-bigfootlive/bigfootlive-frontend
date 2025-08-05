/**
 * Event Streaming Service
 * Integrates with BigfootLive Lambda Event Orchestrator for TLS-enabled streaming
 */

export interface EventStreamingConfig {
  eventId: string;
  eventName?: string;
}

export interface StreamingEndpoints {
  rtmp: string;
  rtmps?: string;
  hls: string;
  hls_secure?: string;
  api: string;
  api_secure?: string;
}

export interface EventStreamResponse {
  message: string;
  event_id: string;
  event_name: string;
  task_arn: string;
  streaming_endpoints: StreamingEndpoints;
}

export interface ActiveEvent {
  task_arn: string;
  eventid?: string;
  eventname?: string;
  starttime?: string;
  private_ip?: string;
}

export interface ActiveEventsResponse {
  active_events: ActiveEvent[];
  count: number;
}

class EventStreamingService {
  private static instance: EventStreamingService;
  private apiGatewayUrl = 'https://8gs79em140.execute-api.us-west-1.amazonaws.com/prod';
  private streamingApiUrl = 'https://stream.bigfootlive.io';
    
  static getInstance(): EventStreamingService {
    if (!EventStreamingService.instance) {
      EventStreamingService.instance = new EventStreamingService();
    }
    return EventStreamingService.instance;
  }

  /**
   * Start a new streaming event
   */
  async startEvent(config: EventStreamingConfig): Promise<EventStreamResponse> {
    try {
      const response = await fetch(`${this.apiGatewayUrl}/events/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: config.eventId,
          eventName: config.eventName || `Event-${config.eventId.slice(0, 8)}`
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to start event: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      // Process endpoints to replace placeholder IPs with actual IPs
      if (data.streaming_endpoints) {
        data.streaming_endpoints = await this.resolveEndpointIPs(data.streaming_endpoints);
      }
      
      return data;
    } catch (error) {
      console.error('Failed to start streaming event:', error);
      throw new Error('Failed to start streaming event');
    }
  }

  /**
   * Stop a streaming event
   */
  async stopEvent(eventId: string, taskArn?: string): Promise<{
    message: string;
    event_id: string;
    task_arn: string;
  }> {
    try {
      const response = await fetch(`${this.apiGatewayUrl}/events/stop`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_id: eventId,
          task_arn: taskArn
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to stop event: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to stop streaming event:', error);
      throw new Error('Failed to stop streaming event');
    }
  }

  /**
   * List active streaming events
   */
  async listActiveEvents(): Promise<ActiveEventsResponse> {
    try {
      const response = await fetch(`${this.apiGatewayUrl}/events/list`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to list events: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to list active events:', error);
      throw new Error('Failed to list active events');
    }
  }

  /**
   * Get streaming health/status via secure API
   */
  async getStreamingHealth(): Promise<Record<string, unknown>> {
    try {
      const response = await fetch(`${this.streamingApiUrl}/api/v1/summaries`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get streaming health:', error);
      throw error;
    }
  }

  /**
   * Resolve placeholder IPs in streaming endpoints with actual task IPs
   */
  private async resolveEndpointIPs(endpoints: StreamingEndpoints): Promise<StreamingEndpoints> {
    // For now, return endpoints as-is since we'll use the load balancer
    // In production, you might want to resolve actual task IPs for direct connections
    
    // Replace placeholder with our load balancer endpoints
    const resolvedEndpoints = { ...endpoints };
    
    // Use our TLS-enabled load balancer endpoints
    if (resolvedEndpoints.rtmp) {
      resolvedEndpoints.rtmp = resolvedEndpoints.rtmp.replace('[TASK_IP]', 'rtmp.bigfootlive.io');
    }
    if (resolvedEndpoints.hls) {
      resolvedEndpoints.hls = resolvedEndpoints.hls.replace('[TASK_IP]', 'stream.bigfootlive.io');
      resolvedEndpoints.hls = resolvedEndpoints.hls.replace('http://', 'https://');
    }
    if (resolvedEndpoints.hls_secure) {
      resolvedEndpoints.hls_secure = resolvedEndpoints.hls_secure.replace('[TASK_IP]', 'stream.bigfootlive.io');
    }
    if (resolvedEndpoints.api) {
      resolvedEndpoints.api = resolvedEndpoints.api.replace('[TASK_IP]', 'stream.bigfootlive.io');
      resolvedEndpoints.api = resolvedEndpoints.api.replace('http://', 'https://');
    }
    if (resolvedEndpoints.api_secure) {
      resolvedEndpoints.api_secure = resolvedEndpoints.api_secure.replace('[TASK_IP]', 'stream.bigfootlive.io');
    }
    
    return resolvedEndpoints;
  }

  /**
   * Generate a unique event ID
   */
  generateEventId(): string {
    return `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get RTMP publish URL and stream key
   */
  getRTMPPublishInfo(endpoints: StreamingEndpoints): {
    publishUrl: string;
    streamKey: string;
  } {
    // Extract base URL and generate stream key
    const baseUrl = endpoints.rtmp.replace('/live', '');
    const streamKey = `live/${this.generateStreamKey()}`;
    
    return {
      publishUrl: baseUrl,
      streamKey: streamKey
    };
  }

  /**
   * Get HLS playback URL
   */
  getHLSPlaybackUrl(endpoints: StreamingEndpoints, streamKey: string): string {
    const secureEndpoint = endpoints.hls_secure || endpoints.hls;
    return secureEndpoint.replace('[STREAM_KEY]', streamKey);
  }

  /**
   * Generate stream key for OBS/streaming software
   */
  private generateStreamKey(): string {
    return `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Validate streaming endpoints
   */
  validateEndpoints(endpoints: StreamingEndpoints): boolean {
    return !!(
      endpoints.rtmp && 
      endpoints.hls && 
      endpoints.api
    );
  }

  /**
   * Get streaming instructions for OBS Studio
   */
  getOBSInstructions(endpoints: StreamingEndpoints): {
    server: string;
    streamKey: string;
    instructions: string[];
  } {
    const rtmpInfo = this.getRTMPPublishInfo(endpoints);
    
    return {
      server: rtmpInfo.publishUrl,
      streamKey: rtmpInfo.streamKey,
      instructions: [
        '1. Open OBS Studio',
        '2. Go to Settings → Stream',
        '3. Select "Custom" as Service',
        `4. Enter Server: ${rtmpInfo.publishUrl}`,
        `5. Enter Stream Key: ${rtmpInfo.streamKey}`,
        '6. Click OK and start streaming!'
      ]
    };
  }
}

export const eventStreamingService = EventStreamingService.getInstance();
export type { 
  EventStreamingConfig, 
  StreamingEndpoints, 
  EventStreamResponse, 
  ActiveEvent, 
  ActiveEventsResponse 
};
