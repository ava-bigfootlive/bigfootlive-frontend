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
    streams: (id: string) => `/analytics/streams/${id}`,
    comprehensive: (streamId: string) => `/analytics/comprehensive/${streamId}`,
    historical: (channelId: string) => `/analytics/historical/${channelId}`,
    realTime: (streamId: string) => `/analytics/real-time/${streamId}`,
    goals: (channelId: string) => `/analytics/goals/${channelId}`,
    alerts: (channelId: string) => `/analytics/alerts/${channelId}`,
    alertAck: (alertId: string) => `/analytics/alerts/${alertId}/acknowledge`
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

// API Configuration constants
export const API_CONFIG = {
  TIMEOUTS: {
    DEFAULT: 10000, // 10 seconds
    REAL_TIME: 5000, // 5 seconds for real-time data
  },
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY: 1000, // 1 second base delay
    BACKOFF_MULTIPLIER: 2, // Exponential backoff
  },
  CACHE: {
    DEFAULT_TTL: 5 * 60 * 1000, // 5 minutes
    REAL_TIME_TTL: 30 * 1000, // 30 seconds
  }
};

// Helper function to get auth headers
export const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('idToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Helper function for retry logic with exponential backoff
export const withRetry = async <T>(
  fn: () => Promise<T>,
  maxAttempts: number = API_CONFIG.RETRY.MAX_ATTEMPTS
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxAttempts) {
        throw lastError;
      }
      
      // Exponential backoff delay
      const delay = API_CONFIG.RETRY.DELAY * Math.pow(API_CONFIG.RETRY.BACKOFF_MULTIPLIER, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
};
