// API Configuration
const API_ENDPOINTS = {
  production: 'https://api.bigfootlive.io',
  development: 'https://dev.bigfootlive.io',
  local: 'http://localhost:8001'
};

// Determine the API URL based on the environment
export const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === 'production' 
    ? API_ENDPOINTS.production 
    : import.meta.env.MODE === 'development'
    ? API_ENDPOINTS.development
    : API_ENDPOINTS.local);

// API Paths
export const API_PATHS = {
  // Auth endpoints
  auth: {
    me: '/auth/me',
    verify: '/auth/verify'
  },
  
  // Stream endpoints
  streams: {
    list: '/streams',
    create: '/streams',
    get: (id: string) => `/streams/${id}`,
    update: (id: string) => `/streams/${id}`,
    delete: (id: string) => `/streams/${id}`,
    start: (id: string) => `/streams/${id}/start`,
    stop: (id: string) => `/streams/${id}/stop`
  },
  
  // Analytics endpoints
  analytics: {
    overview: '/analytics/overview',
    viewership: '/analytics/viewership',
    audience: '/analytics/audience',
    streams: (id: string) => `/analytics/streams/${id}`
  },
  
  // User endpoints
  users: {
    list: '/users',
    get: (id: string) => `/users/${id}`,
    update: (id: string) => `/users/${id}`
  },
  
  // WebSocket endpoints
  ws: {
    chat: (streamId: string) => `/ws/chat/${streamId}`,
    notifications: '/ws/notifications'
  },
  
  // Viewer endpoints
  viewers: {
    list: '/viewers',
    get: (id: string) => `/viewers/${id}`,
    update: (id: string) => `/viewers/${id}`,
    delete: (id: string) => `/viewers/${id}`
  },
  
  // Settings endpoints
  settings: {
    global: '/settings/global',
    updateGlobal: '/settings/global',
    notifications: '/settings/notifications',
    updateNotifications: '/settings/notifications',
    api: '/settings/api',
    updateApi: '/settings/api',
    theme: '/settings/theme',
    privacy: '/settings/privacy',
    updatePrivacy: '/settings/privacy'
  }
};

// WebSocket configuration
export const WS_URL = API_URL.replace(/^http/, 'ws');

// Helper function to build full API URLs
export const buildApiUrl = (path: string): string => {
  // Ensure path starts with /api/v1 if not already present
  const normalizedPath = path.startsWith('/api/v1') ? path : `/api/v1${path}`;
  return `${API_URL}${normalizedPath}`;
};

// Helper function to get auth headers
export const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('idToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};