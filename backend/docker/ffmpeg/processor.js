const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const Redis = require('redis');
const winston = require('winston');
const cron = require('node-cron');
const chokidar = require('chokidar');
const { execSync, spawn } = require('child_process');

// Logger configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: '/app/logs/processor.log' })
  ]
});

// Redis client
const redis = Redis.createClient({
  host: process.env.REDIS_HOST || 'redis',
  port: process.env.REDIS_PORT || 6379
});

redis.on('error', (err) => {
  logger.error('Redis connection error:', err);
});

// Express app for health checks and API
const app = express();
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Environment variables
const INPUT_DIR = process.env.INPUT_DIR || '/input';
const OUTPUT_DIR = process.env.OUTPUT_DIR || '/output';
const TEMP_DIR = process.env.TEMP_DIR || '/tmp/processing';

// Ensure directories exist
fs.ensureDirSync(INPUT_DIR);
fs.ensureDirSync(OUTPUT_DIR);
fs.ensureDirSync(TEMP_DIR);
fs.ensureDirSync('/app/logs');

class FFmpegProcessor {
  constructor() {
    this.activeJobs = new Map();
    this.setupFileWatcher();
  }

  setupFileWatcher() {
    // Watch for new recording files
    const watcher = chokidar.watch(INPUT_DIR, {
      ignored: /^\./,
      persistent: true,
      awaitWriteFinish: {
        stabilityThreshold: 2000,
        pollInterval: 100
      }
    });

    watcher
      .on('add', (filePath) => this.handleNewFile(filePath))
      .on('change', (filePath) => this.handleFileChange(filePath))
      .on('error', (error) => logger.error('File watcher error:', error));

    logger.info('File watcher started for directory:', INPUT_DIR);
  }

  async handleNewFile(filePath) {
    try {
      const fileName = path.basename(filePath);
      const fileExt = path.extname(fileName).toLowerCase();
      
      // Only process video files
      if (!['.mp4', '.flv', '.ts', '.avi', '.mov'].includes(fileExt)) {
        return;
      }

      logger.info('New file detected:', fileName);
      
      // Parse filename for stream info
      const streamInfo = this.parseStreamInfo(fileName);
      
      if (streamInfo) {
        await this.processRecording(filePath, streamInfo);
      }
    } catch (error) {
      logger.error('Error handling new file:', error);
    }
  }

  parseStreamInfo(fileName) {
    // Expected format: streamId_eventId_timestamp.ext
    const parts = fileName.split('_');
    if (parts.length >= 3) {
      return {
        streamId: parts[0],
        eventId: parts[1],
        timestamp: parts[2].split('.')[0]
      };
    }
    return null;
  }

  async processRecording(inputPath, streamInfo) {
    const jobId = `${streamInfo.streamId}_${Date.now()}`;
    
    try {
      this.activeJobs.set(jobId, { status: 'processing', startTime: Date.now() });
      
      logger.info(`Starting processing job ${jobId} for stream ${streamInfo.streamId}`);
      
      // Create output directory structure
      const outputDir = path.join(OUTPUT_DIR, streamInfo.streamId, streamInfo.timestamp);
      await fs.ensureDir(outputDir);
      
      // Process video file
      await this.generateMultipleBitrates(inputPath, outputDir, streamInfo);
      await this.generateThumbnails(inputPath, outputDir, streamInfo);
      await this.generateMetadata(inputPath, outputDir, streamInfo);
      
      // Update job status
      this.activeJobs.set(jobId, { 
        status: 'completed', 
        completedTime: Date.now(),
        outputPath: outputDir
      });
      
      // Notify via Redis
      await redis.publish('stream:processed', JSON.stringify({
        jobId,
        streamId: streamInfo.streamId,
        eventId: streamInfo.eventId,
        outputPath: outputDir,
        status: 'completed'
      }));
      
      logger.info(`Processing job ${jobId} completed successfully`);
      
    } catch (error) {
      logger.error(`Processing job ${jobId} failed:`, error);
      
      this.activeJobs.set(jobId, { 
        status: 'failed', 
        error: error.message,
        failedTime: Date.now()
      });
      
      // Notify failure via Redis
      await redis.publish('stream:processed', JSON.stringify({
        jobId,
        streamId: streamInfo.streamId,
        eventId: streamInfo.eventId,
        status: 'failed',
        error: error.message
      }));
    }
  }

  async generateMultipleBitrates(inputPath, outputDir, streamInfo) {
    const qualities = [
      { name: '1080p', width: 1920, height: 1080, bitrate: '5000k' },
      { name: '720p', width: 1280, height: 720, bitrate: '2500k' },
      { name: '480p', width: 854, height: 480, bitrate: '1000k' },
      { name: '360p', width: 640, height: 360, bitrate: '500k' }
    ];
    
    const promises = qualities.map(quality => 
      this.transcodeVideo(inputPath, outputDir, quality, streamInfo)
    );
    
    await Promise.all(promises);
    
    // Generate HLS master playlist
    await this.generateHLSPlaylist(outputDir, qualities, streamInfo);
  }

  async transcodeVideo(inputPath, outputDir, quality, streamInfo) {
    const outputPath = path.join(outputDir, `${quality.name}.mp4`);
    const hlsPath = path.join(outputDir, `${quality.name}`);
    await fs.ensureDir(hlsPath);
    
    return new Promise((resolve, reject) => {
      const args = [
        '-i', inputPath,
        '-c:v', 'libx264',
        '-preset', 'medium',
        '-crf', '23',
        '-c:a', 'aac',
        '-b:a', '128k',
        '-vf', `scale=${quality.width}:${quality.height}`,
        '-b:v', quality.bitrate,
        '-maxrate', quality.bitrate,
        '-bufsize', `${parseInt(quality.bitrate) * 2}k`,
        '-hls_time', '6',
        '-hls_list_size', '0',
        '-hls_segment_filename', path.join(hlsPath, 'segment_%03d.ts'),
        path.join(hlsPath, 'playlist.m3u8')
      ];
      
      const ffmpeg = spawn('ffmpeg', args);
      
      ffmpeg.stderr.on('data', (data) => {
        logger.debug(`FFmpeg ${quality.name}:`, data.toString());
      });
      
      ffmpeg.on('close', (code) => {
        if (code === 0) {
          logger.info(`${quality.name} transcoding completed`);
          resolve();
        } else {
          reject(new Error(`FFmpeg process exited with code ${code}`));
        }
      });
      
      ffmpeg.on('error', reject);
    });
  }

  async generateHLSPlaylist(outputDir, qualities, streamInfo) {
    const masterPlaylist = ['#EXTM3U', '#EXT-X-VERSION:6'];
    
    qualities.forEach(quality => {
      const bitrate = parseInt(quality.bitrate) * 1000; // Convert to bps
      masterPlaylist.push(
        `#EXT-X-STREAM-INF:BANDWIDTH=${bitrate},RESOLUTION=${quality.width}x${quality.height}`,
        `${quality.name}/playlist.m3u8`
      );
    });
    
    const playlistPath = path.join(outputDir, 'master.m3u8');
    await fs.writeFile(playlistPath, masterPlaylist.join('\n'));
    
    logger.info('HLS master playlist generated:', playlistPath);
  }

  async generateThumbnails(inputPath, outputDir, streamInfo) {
    const thumbnailDir = path.join(outputDir, 'thumbnails');
    await fs.ensureDir(thumbnailDir);
    
    return new Promise((resolve, reject) => {
      const args = [
        '-i', inputPath,
        '-vf', 'fps=1/10,scale=320:180',
        '-q:v', '2',
        path.join(thumbnailDir, 'thumb_%03d.jpg')
      ];
      
      const ffmpeg = spawn('ffmpeg', args);
      
      ffmpeg.on('close', (code) => {
        if (code === 0) {
          logger.info('Thumbnails generated successfully');
          resolve();
        } else {
          reject(new Error(`Thumbnail generation failed with code ${code}`));
        }
      });
      
      ffmpeg.on('error', reject);
    });
  }

  async generateMetadata(inputPath, outputDir, streamInfo) {
    try {
      // Get video metadata using ffprobe
      const metadata = JSON.parse(
        execSync(`ffprobe -v quiet -print_format json -show_format -show_streams "${inputPath}"`)
      );
      
      const videoStream = metadata.streams.find(s => s.codec_type === 'video');
      const audioStream = metadata.streams.find(s => s.codec_type === 'audio');
      
      const processedMetadata = {
        streamInfo,
        duration: parseFloat(metadata.format.duration),
        fileSize: parseInt(metadata.format.size),
        bitRate: parseInt(metadata.format.bit_rate),
        video: videoStream ? {
          codec: videoStream.codec_name,
          width: videoStream.width,
          height: videoStream.height,
          frameRate: videoStream.r_frame_rate,
          bitRate: videoStream.bit_rate
        } : null,
        audio: audioStream ? {
          codec: audioStream.codec_name,
          channels: audioStream.channels,
          sampleRate: audioStream.sample_rate,
          bitRate: audioStream.bit_rate
        } : null,
        processedAt: new Date().toISOString()
      };
      
      const metadataPath = path.join(outputDir, 'metadata.json');
      await fs.writeFile(metadataPath, JSON.stringify(processedMetadata, null, 2));
      
      logger.info('Metadata generated:', metadataPath);
      
    } catch (error) {
      logger.error('Error generating metadata:', error);
    }
  }

  async handleFileChange(filePath) {
    // Handle file updates if needed
    logger.debug('File changed:', filePath);
  }
}

// API endpoints
app.get('/jobs', (req, res) => {
  const jobs = Array.from(processor.activeJobs.entries()).map(([id, job]) => ({
    id,
    ...job
  }));
  res.json({ jobs });
});

app.get('/jobs/:jobId', (req, res) => {
  const job = processor.activeJobs.get(req.params.jobId);
  if (job) {
    res.json({ jobId: req.params.jobId, ...job });
  } else {
    res.status(404).json({ error: 'Job not found' });
  }
});

// Cleanup completed jobs every hour
cron.schedule('0 * * * *', () => {
  const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago
  
  for (const [jobId, job] of processor.activeJobs.entries()) {
    const jobTime = job.completedTime || job.failedTime || job.startTime;
    if (jobTime < cutoff) {
      processor.activeJobs.delete(jobId);
      logger.info(`Cleaned up old job: ${jobId}`);
    }
  }
});

// Initialize processor
const processor = new FFmpegProcessor();

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`FFmpeg processor service listening on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down gracefully');
  await redis.quit();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down gracefully');
  await redis.quit();
  process.exit(0);
});
