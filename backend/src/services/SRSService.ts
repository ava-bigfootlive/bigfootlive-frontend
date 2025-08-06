import { EventEmitter } from 'events';
import { exec, spawn, ChildProcess } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { logger } from '@/utils/logger';
import { redis } from '@/utils/redis';
import { Event, EventContainer } from '@/types';

/**
 * SRSService - Manages SRS (Simple Realtime Server) instances for event containers
 * 
 * Each live event gets its own SRS instance running in a container with:
 * - RTMP ingestion
 * - HLS delivery
 * - WebRTC support
 * - Real-time statistics
 * - Webhook callbacks
 */
export class SRSService extends EventEmitter {
  private srsInstances: Map<string, SRSInstance> = new Map();
  private basePort: number = 1935;
  private httpPort: number = 8080;

  constructor() {
    super();
  }

  /**
   * Start SRS instance for an event container
   */
  async startSRSForEvent(event: Event, container: EventContainer): Promise<SRSInstance> {
    const instanceId = `srs-${event.id}`;
    
    logger.info('Starting SRS instance for event', {
      eventId: event.id,
      containerId: container.id,
      instanceId
    });

    // Generate unique ports for this instance
    const rtmpPort = this.basePort + Math.floor(Math.random() * 1000);
    const httpApiPort = this.httpPort + Math.floor(Math.random() * 1000);
    const hlsPort = httpApiPort + 100;

    // Create SRS configuration
    const configPath = await this.generateSRSConfig({
      eventId: event.id,
      streamKey: event.streamKey,
      rtmpPort,
      httpApiPort,
      hlsPort,
      webhookUrl: `${process.env.API_URL}/api/streaming/events/${event.id}/webhook`
    });

    // Start SRS process
    const srsProcess = spawn('srs', ['-c', configPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        SRS_LOG_LEVEL: 'info'
      }
    });

    const instance: SRSInstance = {
      id: instanceId,
      eventId: event.id,
      containerId: container.id,
      process: srsProcess,
      config: {
        rtmpPort,
        httpApiPort,
        hlsPort,
        configPath,
        streamKey: event.streamKey
      },
      status: 'starting',
      startedAt: new Date(),
      endpoints: {
        rtmp: `rtmp://localhost:${rtmpPort}/live`,
        hls: `http://localhost:${hlsPort}/live/${event.streamKey}.m3u8`,
        api: `http://localhost:${httpApiPort}/api/v1`
      },
      stats: {
        bytesIn: 0,
        bytesOut: 0,
        clients: 0,
        streams: 0
      }
    };

    // Set up process event handlers
    this.setupSRSProcessHandlers(instance);

    // Store instance
    this.srsInstances.set(instanceId, instance);

    // Wait for SRS to be ready
    await this.waitForSRSReady(instance);

    instance.status = 'running';
    
    logger.info('SRS instance started successfully', {
      eventId: event.id,
      instanceId,
      endpoints: instance.endpoints
    });

    this.emit('srsStarted', instance);
    return instance;
  }

  /**
   * Stop SRS instance for an event
   */
  async stopSRSForEvent(eventId: string): Promise<void> {
    const instanceId = `srs-${eventId}`;
    const instance = this.srsInstances.get(instanceId);

    if (!instance) {
      logger.warn('SRS instance not found for event', { eventId });
      return;
    }

    logger.info('Stopping SRS instance', {
      eventId,
      instanceId: instance.id
    });

    try {
      // Gracefully terminate SRS process
      instance.process.kill('SIGTERM');
      
      // Wait for process to exit (with timeout)
      await this.waitForProcessExit(instance.process, 10000);
      
      instance.status = 'stopped';
      instance.stoppedAt = new Date();

      // Clean up config file
      try {
        await fs.unlink(instance.config.configPath);
      } catch (error) {
        logger.warn('Failed to cleanup SRS config file', {
          configPath: instance.config.configPath,
          error: error.message
        });
      }

      // Remove from instances map
      this.srsInstances.delete(instanceId);

      logger.info('SRS instance stopped successfully', {
        eventId,
        instanceId: instance.id
      });

      this.emit('srsStopped', instance);

    } catch (error) {
      logger.error('Failed to stop SRS instance', {
        eventId,
        instanceId: instance.id,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get SRS instance for an event
   */
  getSRSInstance(eventId: string): SRSInstance | undefined {
    const instanceId = `srs-${eventId}`;
    return this.srsInstances.get(instanceId);
  }

  /**
   * Get statistics for an SRS instance
   */
  async getSRSStats(eventId: string): Promise<any> {
    const instance = this.getSRSInstance(eventId);
    if (!instance || instance.status !== 'running') {
      return null;
    }

    try {
      // Query SRS HTTP API for statistics
      const response = await fetch(`${instance.endpoints.api}/streams`);
      const data = await response.json();
      
      return {
        ...instance.stats,
        streams: data.streams || [],
        clients: data.clients || [],
        server: data.server || {}
      };
    } catch (error) {
      logger.error('Failed to get SRS stats', {
        eventId,
        error: error.message
      });
      return instance.stats;
    }
  }

  /**
   * Generate SRS configuration file
   */
  private async generateSRSConfig(options: {
    eventId: string;
    streamKey: string;
    rtmpPort: number;
    httpApiPort: number;
    hlsPort: number;
    webhookUrl: string;
  }): Promise<string> {
    const { eventId, streamKey, rtmpPort, httpApiPort, hlsPort, webhookUrl } = options;
    
    const config = `
# SRS Configuration for Event: ${eventId}
# Auto-generated configuration - do not edit manually

listen              ${rtmpPort};
max_connections     1000;
srs_log_tank        file;
srs_log_level       info;

# HTTP API
http_api {
    enabled         on;
    listen          ${httpApiPort};
    crossdomain     on;
}

# HTTP Server for HLS
http_server {
    enabled         on;
    listen          ${hlsPort};
    dir             ./objs/nginx/html;
}

# Statistics
stats {
    network         0;
    disk            sda sdb xvda xvdb;
}

# WebRTC
rtc_server {
    enabled         on;
    listen          8000;
    candidate       $CANDIDATE;
}

# Vhost configuration
vhost __defaultVhost__ {
    # RTMP settings
    chunk_size      60000;
    
    # Authentication
    refer {
        enabled     on;
        all         play publish;
        publish     ${streamKey};
    }
    
    # HLS
    hls {
        enabled         on;
        hls_fragment    10;
        hls_window      60;
        hls_path        ./objs/nginx/html/live;
        hls_m3u8_file   [app]/[stream].m3u8;
        hls_ts_file     [app]/[stream]-[seq].ts;
    }
    
    # DVR (Recording)
    dvr {
        enabled      on;
        dvr_path     ./objs/nginx/html/dvr;
        dvr_plan     session;
        dvr_duration 30;
        dvr_wait_keyframe on;
        time_jitter  full;
    }
    
    # WebRTC
    rtc {
        enabled     on;
        rtmp_to_rtc on;
        rtc_to_rtmp on;
    }
    
    # Webhooks for real-time events
    http_hooks {
        enabled         on;
        on_connect      ${webhookUrl};
        on_close        ${webhookUrl};
        on_publish      ${webhookUrl};
        on_unpublish    ${webhookUrl};
        on_play         ${webhookUrl};
        on_stop         ${webhookUrl};
        on_dvr          ${webhookUrl};
        on_hls          ${webhookUrl};
    }
    
    # Security
    security {
        enabled         on;
        seo_enabled     on;
    }
    
    # Transcode for multiple qualities
    transcode {
        enabled     on;
        ffmpeg      ./objs/ffmpeg/bin/ffmpeg;
        
        engine hd {
            enabled          on;
            vcodec           libx264;
            vbitrate         1200;
            vfps             25;
            vwidth           1280;
            vheight          720;
            vthreads         2;
            vprofile         main;
            vpreset          medium;
            acodec           aac;
            abitrate         70;
            asample_rate     44100;
            achannels        2;
            aparams {
                profile:a    aac_low;
            }
            output           rtmp://127.0.0.1:${rtmpPort}/live/[stream]_hd;
        }
        
        engine sd {
            enabled          on;
            vcodec           libx264;
            vbitrate         800;
            vfps             25;
            vwidth           854;
            vheight          480;
            vthreads         1;
            vprofile         baseline;
            vpreset          faster;
            acodec           aac;
            abitrate         60;
            asample_rate     44100;
            achannels        2;
            output           rtmp://127.0.0.1:${rtmpPort}/live/[stream]_sd;
        }
    }
}

# Edge configuration for scaling
# vhost edge.srs.com {
#     cluster {
#         mode            remote;
#         origin          127.0.0.1:${rtmpPort};
#     }
# }
`;

    // Create config directory if it doesn't exist
    const configDir = path.join(process.cwd(), 'srs-configs');
    await fs.mkdir(configDir, { recursive: true });
    
    const configPath = path.join(configDir, `srs-${eventId}.conf`);
    await fs.writeFile(configPath, config.trim());
    
    return configPath;
  }

  /**
   * Set up event handlers for SRS process
   */
  private setupSRSProcessHandlers(instance: SRSInstance): void {
    const { process: srsProcess } = instance;

    srsProcess.stdout?.on('data', (data) => {
      const output = data.toString();
      logger.debug('SRS stdout', {
        instanceId: instance.id,
        eventId: instance.eventId,
        output
      });

      // Parse SRS output for statistics
      this.parseSRSOutput(instance, output);
    });

    srsProcess.stderr?.on('data', (data) => {
      const error = data.toString();
      logger.warn('SRS stderr', {
        instanceId: instance.id,
        eventId: instance.eventId,
        error
      });
    });

    srsProcess.on('exit', (code, signal) => {
      logger.info('SRS process exited', {
        instanceId: instance.id,
        eventId: instance.eventId,
        code,
        signal
      });

      instance.status = 'stopped';
      instance.stoppedAt = new Date();
      
      this.emit('srsExited', instance, { code, signal });
    });

    srsProcess.on('error', (error) => {
      logger.error('SRS process error', {
        instanceId: instance.id,
        eventId: instance.eventId,
        error: error.message
      });

      instance.status = 'error';
      this.emit('srsError', instance, error);
    });
  }

  /**
   * Parse SRS output for statistics
   */
  private parseSRSOutput(instance: SRSInstance, output: string): void {
    // Parse SRS log output to extract statistics
    // This is a simplified parser - you'd want to make this more robust
    
    if (output.includes('publish')) {
      instance.stats.streams++;
    }
    
    if (output.includes('client')) {
      // Update client count based on SRS output
    }
    
    // Store updated stats in Redis for real-time access
    redis.hSet(`srs_stats:${instance.eventId}`, {
      streams: instance.stats.streams.toString(),
      clients: instance.stats.clients.toString(),
      bytesIn: instance.stats.bytesIn.toString(),
      bytesOut: instance.stats.bytesOut.toString(),
      lastUpdate: Date.now().toString()
    });
  }

  /**
   * Wait for SRS to be ready
   */
  private async waitForSRSReady(instance: SRSInstance, timeoutMs = 30000): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
      try {
        const response = await fetch(`${instance.endpoints.api}/summaries`);
        if (response.ok) {
          return; // SRS is ready
        }
      } catch (error) {
        // Continue waiting
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    throw new Error(`SRS instance ${instance.id} did not start within ${timeoutMs}ms`);
  }

  /**
   * Wait for process to exit
   */
  private async waitForProcessExit(process: ChildProcess, timeoutMs: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        process.kill('SIGKILL'); // Force kill if graceful shutdown fails
        reject(new Error('Process did not exit gracefully'));
      }, timeoutMs);

      process.on('exit', () => {
        clearTimeout(timeout);
        resolve();
      });
    });
  }

  /**
   * Get all running SRS instances
   */
  getAllInstances(): SRSInstance[] {
    return Array.from(this.srsInstances.values());
  }

  /**
   * Get instance statistics
   */
  getInstanceStats() {
    const instances = this.getAllInstances();
    return {
      total: instances.length,
      running: instances.filter(i => i.status === 'running').length,
      starting: instances.filter(i => i.status === 'starting').length,
      stopped: instances.filter(i => i.status === 'stopped').length,
      error: instances.filter(i => i.status === 'error').length
    };
  }

  /**
   * Shutdown all SRS instances
   */
  async shutdown(): Promise<void> {
    logger.info('Shutting down all SRS instances');
    
    const instances = Array.from(this.srsInstances.values());
    const shutdownPromises = instances.map(instance => 
      this.stopSRSForEvent(instance.eventId).catch(error => {
        logger.error('Failed to stop SRS instance during shutdown', {
          instanceId: instance.id,
          error: error.message
        });
      })
    );

    await Promise.all(shutdownPromises);
    logger.info('All SRS instances shutdown completed');
  }
}

// Types
interface SRSInstance {
  id: string;
  eventId: string;
  containerId: string;
  process: ChildProcess;
  config: {
    rtmpPort: number;
    httpApiPort: number;
    hlsPort: number;
    configPath: string;
    streamKey: string;
  };
  status: 'starting' | 'running' | 'stopping' | 'stopped' | 'error';
  startedAt: Date;
  stoppedAt?: Date;
  endpoints: {
    rtmp: string;
    hls: string;
    api: string;
  };
  stats: {
    bytesIn: number;
    bytesOut: number;
    clients: number;
    streams: number;
  };
}

// Singleton instance
export const srsService = new SRSService();
