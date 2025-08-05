import { authService } from '@/lib/auth';

export interface StreamEvent {
  id: string;
  title: string;
  description?: string;
  status: 'scheduled' | 'live' | 'ended' | 'cancelled';
  stream_key: string;
  stream_url?: string;
  playback_url?: string;
  scheduled_start?: string;
  actual_start?: string;
  actual_end?: string;
  viewer_count: number;
  peak_viewers: number;
  total_views: number;
  created_at: string;
  updated_at: string;
  thumbnail_url?: string;
  tags: string[];
  category?: string;
  privacy: 'public' | 'unlisted' | 'private';
  chat_enabled: boolean;
  recording_enabled: boolean;
  donations_enabled: boolean;
  slug: string;
  tenant_id: string;
  user_id: string;
}

export interface CreateEventPayload {
  title: string;
  description?: string;
  scheduled_start?: string;
  tags?: string[];
  category?: string;
  privacy?: 'public' | 'unlisted' | 'private';
  chat_enabled?: boolean;
  recording_enabled?: boolean;
  donations_enabled?: boolean;
}

export interface EventMetrics {
  eventId: string;
  currentViewers: number;
  peakViewers: number;
  totalViews: number;
  avgViewDuration: number;
  chatMessages: number;
  likes: number;
  shares: number;
  bandwidth: number;
  quality: number;
  buffering: number;
  errors: number;
}

class EventService {
  private baseUrl = import.meta.env.VITE_API_URL || 'https://bigfootlive.io';

  private async getHeaders(): Promise<HeadersInit> {
    const token = await authService.getAccessToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  }

  async createEvent(payload: CreateEventPayload): Promise<StreamEvent> {
    const response = await fetch(`${this.baseUrl}/api/streams`, {
      method: 'POST',
      headers: await this.getHeaders(),
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Failed to create stream: ${response.statusText}`);
    }

    return response.json();
  }

  async getEvents(status?: 'scheduled' | 'live' | 'ended'): Promise<StreamEvent[]> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);

    const response = await fetch(`${this.baseUrl}/api/streams?${params}`, {
      headers: await this.getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch streams: ${response.statusText}`);
    }

    const data = await response.json();
    // Ensure we always return an array
    return Array.isArray(data) ? data : [];
  }

  async getEvent(eventId: string): Promise<StreamEvent> {
    const response = await fetch(`${this.baseUrl}/api/streams/${eventId}`, {
      headers: await this.getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch stream: ${response.statusText}`);
    }

    return response.json();
  }

  async startStream(eventId: string): Promise<{ status: string; stream_url: string; playback_url: string }> {
    const response = await fetch(`${this.baseUrl}/api/streams/${eventId}/start`, {
      method: 'POST',
      headers: await this.getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to start stream: ${response.statusText}`);
    }

    return response.json();
  }

  async endStream(eventId: string): Promise<{ status: string }> {
    const response = await fetch(`${this.baseUrl}/api/streams/${eventId}/stop`, {
      method: 'POST',
      headers: await this.getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to stop stream: ${response.statusText}`);
    }

    return response.json();
  }

  async updateEvent(eventId: string, updates: Partial<CreateEventPayload>): Promise<StreamEvent> {
    const response = await fetch(`${this.baseUrl}/api/streams/${eventId}`, {
      method: 'PATCH',
      headers: await this.getHeaders(),
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      throw new Error(`Failed to update stream: ${response.statusText}`);
    }

    return response.json();
  }

  async deleteEvent(eventId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/streams/${eventId}`, {
      method: 'DELETE',
      headers: await this.getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to delete stream: ${response.statusText}`);
    }
  }

  async getEventMetrics(eventId: string): Promise<EventMetrics> {
    const response = await fetch(`${this.baseUrl}/api/v1/analytics/streams/${eventId}`, {
      headers: await this.getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch metrics: ${response.statusText}`);
    }

    return response.json();
  }

  // WebSocket connection for real-time metrics
  connectToMetrics(eventId: string, onUpdate: (metrics: Partial<EventMetrics>) => void): () => void {
    const wsUrl = this.baseUrl.replace('http://', 'ws://').replace('https://', 'wss://');
    const token = authService.getAccessToken();
    const ws = new WebSocket(`${wsUrl}/api/ws/streams/${eventId}/metrics?token=${token}`);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'metrics') {
          onUpdate(data.data);
        }
      } catch (error) {
        console.error('Failed to parse metrics:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    // Send heartbeat every 25 seconds
    const heartbeatInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'heartbeat' }));
      }
    }, 25000);

    // Return cleanup function
    return () => {
      clearInterval(heartbeatInterval);
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }

  // Generate RTMP URL for streaming
  getRTMPUrl(streamKey: string): string {
    const isDev = import.meta.env.DEV;
    return isDev 
      ? `rtmp://localhost:1935/live/${streamKey}`
      : `rtmp://stream.bigfootlive.io/live/${streamKey}`;
  }

  // Generate HLS URL for playback
  getHLSUrl(streamKey: string): string {
    const isDev = import.meta.env.DEV;
    return isDev
      ? `http://localhost:8080/hls/${streamKey}/index.m3u8`
      : `https://stream.bigfootlive.io/hls/${streamKey}/index.m3u8`;
  }

  // Generate embed code
  getEmbedCode(eventId: string, width = 640, height = 360): string {
    return `<iframe src="https://bigfootlive.io/embed/${eventId}" width="${width}" height="${height}" frameborder="0" allowfullscreen></iframe>`;
  }
}

export const eventService = new EventService();