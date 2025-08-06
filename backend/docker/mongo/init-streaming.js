// MongoDB initialization script for BigFoot Live streaming database
// This script is run when the MongoDB container starts for the first time

db = db.getSiblingDB('bigfootlive_streaming');

// Create collections for streaming data
db.createCollection('streams');
db.createCollection('events');
db.createCollection('analytics');
db.createCollection('recordings');
db.createCollection('webhooks');
db.createCollection('chat_messages');

// Create indexes for better query performance
db.streams.createIndex({ "streamId": 1 }, { unique: true });
db.streams.createIndex({ "eventId": 1 });
db.streams.createIndex({ "status": 1 });
db.streams.createIndex({ "createdAt": 1 });

db.events.createIndex({ "eventId": 1 }, { unique: true });
db.events.createIndex({ "tenantId": 1 });
db.events.createIndex({ "status": 1 });
db.events.createIndex({ "scheduledAt": 1 });

db.analytics.createIndex({ "streamId": 1 });
db.analytics.createIndex({ "eventId": 1 });
db.analytics.createIndex({ "timestamp": 1 });
db.analytics.createIndex({ "metricType": 1 });

db.recordings.createIndex({ "streamId": 1 });
db.recordings.createIndex({ "eventId": 1 });
db.recordings.createIndex({ "createdAt": 1 });
db.recordings.createIndex({ "status": 1 });

db.webhooks.createIndex({ "streamId": 1 });
db.webhooks.createIndex({ "eventType": 1 });
db.webhooks.createIndex({ "timestamp": 1 });

db.chat_messages.createIndex({ "streamId": 1 });
db.chat_messages.createIndex({ "timestamp": 1 });
db.chat_messages.createIndex({ "userId": 1 });

// Create a test stream document
db.streams.insertOne({
    streamId: "test-stream-001",
    eventId: "test-event-001",
    tenantId: "tenant-001",
    title: "Test Stream",
    description: "Initial test stream for development",
    status: "created",
    rtmpUrl: "rtmp://srs:1935/live/test-stream-001",
    hlsUrl: "http://nginx-streaming/live/test-stream-001/master.m3u8",
    settings: {
        maxBitrate: "5000k",
        resolution: "1920x1080",
        framerate: 30,
        audioCodec: "aac",
        videoCodec: "h264"
    },
    createdAt: new Date(),
    updatedAt: new Date()
});

// Create a test event document
db.events.insertOne({
    eventId: "test-event-001",
    tenantId: "tenant-001",
    name: "Test Live Event",
    description: "Development testing event",
    type: "live_stream",
    status: "scheduled",
    scheduledAt: new Date(Date.now() + 3600000), // 1 hour from now
    settings: {
        autoRecord: true,
        chatEnabled: true,
        maxViewers: 1000,
        streamDelay: 10
    },
    metadata: {
        category: "test",
        tags: ["development", "testing"],
        presenter: "Development Team"
    },
    createdAt: new Date(),
    updatedAt: new Date()
});

print('✅ BigFoot Live streaming database initialized successfully');
print('Created collections: streams, events, analytics, recordings, webhooks, chat_messages');
print('Created indexes for optimal query performance');
print('Added test documents for development');
