const io = require('socket.io-client');

console.log('🔌 Testing WebSocket connection...');

const socket = io('http://localhost:3000', {
  transports: ['websocket']
});

socket.on('connect', () => {
  console.log('✅ Connected to WebSocket!');
  
  // Join an event room
  socket.emit('join:event', { eventId: 'test-event-123' });
  
  // Send a test chat message
  setTimeout(() => {
    socket.emit('chat:message', { 
      eventId: 'test-event-123',
      username: 'TestUser',
      message: 'Hello BigfootLive! 🚀'
    });
  }, 1000);
  
  // Test stream start
  setTimeout(() => {
    socket.emit('stream:start', { eventId: 'test-event-123' });
  }, 2000);
  
  // Disconnect after tests
  setTimeout(() => {
    console.log('🎯 WebSocket tests completed!');
    socket.disconnect();
    process.exit(0);
  }, 3000);
});

socket.on('joined:event', (data) => {
  console.log('🚪 Joined event room:', data);
});

socket.on('chat:message', (data) => {
  console.log('💬 Chat message received:', data);
});

socket.on('stream:started', (data) => {
  console.log('🎬 Stream started:', data);
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected from WebSocket');
});

socket.on('error', (error) => {
  console.error('💥 WebSocket error:', error);
});
