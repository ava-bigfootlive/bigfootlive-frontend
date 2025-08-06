# 🚀 BigfootLive Frontend Integration Guide

## Backend URLs
- **REST API**: `http://localhost:3000/api`
- **WebSocket**: `ws://localhost:3000`
- **Health Check**: `http://localhost:3000/health`

## 🔥 Core API Endpoints

### Authentication
```javascript
// Register
POST /api/auth/register
{
  "username": "streamer123",
  "email": "user@example.com", 
  "password": "password"
}

// Login
POST /api/auth/login
{
  "username": "streamer123",
  "password": "password"
}
```

### Events Management
```javascript
// Get all events
GET /api/events

// Create new event
POST /api/events
{
  "title": "My Epic Stream",
  "description": "Going live!",
  "category": "gaming"
}

// Get streaming config
GET /api/streaming/events/{eventId}/stream
```

### User Profiles
```javascript
// Get user profile
GET /api/users/{userId}

// Analytics
GET /api/analytics/events/{eventId}
```

## 🔌 WebSocket Integration

### React Hook Example
```javascript
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const useWebSocket = (eventId) => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);

    // Join event room
    newSocket.emit('join:event', { eventId });

    // Listen for chat messages
    newSocket.on('chat:message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    // Listen for stream events
    newSocket.on('stream:started', (data) => {
      console.log('Stream started!', data);
    });

    return () => newSocket.close();
  }, [eventId]);

  const sendMessage = (message) => {
    socket?.emit('chat:message', {
      eventId,
      username: 'CurrentUser',
      message
    });
  };

  return { socket, messages, sendMessage };
};
```

### Key WebSocket Events
- `join:event` - Join event room
- `chat:message` - Send/receive chat
- `stream:start` - Notify stream started
- `stream:stop` - Notify stream stopped

## 🎯 Quick Frontend Setup

### 1. Install Dependencies
```bash
npm install socket.io-client axios
```

### 2. API Client Setup
```javascript
// api.js
import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData)
};

export const eventsAPI = {
  getAll: () => api.get('/events'),
  create: (eventData) => api.post('/events', eventData),
  getStreamConfig: (eventId) => api.get(`/streaming/events/${eventId}/stream`)
};
```

### 3. Environment Variables (.env)
```bash
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_WS_URL=ws://localhost:3000
```

## 🚀 Ready to Connect!

Your BigfootLive backend is fully operational and ready for frontend integration!

### Test Commands
```bash
# Test API
curl http://localhost:3000/api/health

# Test event creation
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Stream","category":"gaming"}'
```

🔥 **READY TO DOMINATE THE STREAMING WORLD!** 🔥
