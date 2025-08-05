import { buildApiUrl, getAuthHeaders, API_PATHS } from '@/config/api';
import { mockApiResponses, mockDelay } from '@/config/api.mock';

// Generic API response type
interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
  status: number;
}

// Check if we should use mock data
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true';

// Generic API request function
async function apiRequest<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  // Use mock data if enabled
  if (USE_MOCK_API) {
    // Strip query parameters for mock data lookup
    const pathWithoutQuery = path.split('?')[0];
    const mockResponse = mockApiResponses[pathWithoutQuery as keyof typeof mockApiResponses];
    if (mockResponse) {
      await mockDelay();
      return {
        data: mockResponse as T,
        status: 200
      };
    }
  }
  
  try {
    const response = await fetch(buildApiUrl(path), {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers}});

    let data = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    }

    if (!response.ok) {
      return {
        error: data?.error || data?.message || `HTTP ${response.status} error`,
        status: response.status,
        data: undefined
      };
    }

    return {
      data,
      status: response.status
    };
  } catch (error) { void error;
    console.error('API request error:', error);
    
    // Fallback to mock data if available
    if (import.meta.env.DEV) {
      const mockResponse = mockApiResponses[path as keyof typeof mockApiResponses];
      if (mockResponse) {
        console.log('Using mock data for:', path);
        await mockDelay();
        return {
          data: mockResponse as T,
          status: 200
        };
      }
    }
    
    return {
      error: error instanceof Error ? error.message : 'Network error',
      status: 0
    };
  }
}

// API service methods
export const api = {
  // Generic methods
  get: <T = unknown>(path: string) => {
    // Remove duplicate /api/v1 if present
    const cleanPath = path.startsWith('/api/v1') ? path.substring(7) : path;
    return apiRequest<T>(cleanPath, { method: 'GET' });
  },
  post: <T = unknown>(path: string, body?: unknown) => 
    apiRequest<T>(path, { 
      method: 'POST', 
      body: body ? JSON.stringify(body) : undefined 
    }),
  put: <T = unknown>(path: string, body?: unknown) => 
    apiRequest<T>(path, { 
      method: 'PUT', 
      body: body ? JSON.stringify(body) : undefined 
    }),
  delete: <T = unknown>(path: string) => apiRequest<T>(path, { method: 'DELETE' }),

  // Auth specific methods
  auth: {
    login: (email: string, password: string) => 
      api.post(API_PATHS.auth.login, { email, password }),
    
    register: (data: { email: string; password: string; name: string; organizationName?: string }) =>
      api.post(API_PATHS.auth.register, data),
    
    verify: (email: string, code: string) =>
      api.post(API_PATHS.auth.verify, { email, code }),
    
    logout: () => api.post(API_PATHS.auth.logout),
    
    getProfile: () => api.get(API_PATHS.auth.profile),
    
    refreshToken: () => api.post(API_PATHS.auth.refresh)
  },

  // Streams
  streams: {
    list: () => api.get(API_PATHS.streams.list),
    
    getLive: () => api.get(API_PATHS.streams.list + '?status=live'),
    
    create: (data: Record<string, unknown>) => api.post(API_PATHS.streams.create, data),
    
    get: (id: string) => api.get(API_PATHS.streams.get(id)),
    
    update: (id: string, data: Record<string, unknown>) => api.put(API_PATHS.streams.update(id), data),
    
    delete: (id: string) => api.delete(API_PATHS.streams.delete(id)),
    
    start: (id: string) => api.post(API_PATHS.streams.start(id)),
    
    stop: (id: string) => api.post(API_PATHS.streams.stop(id)),
    
    getAnalytics: (id: string) => api.get(API_PATHS.streams.analytics(id))
  },

  // Analytics
  analytics: {
    getOverview: (params?: { period?: string }) => {
      const queryParams = params ? `?${new URLSearchParams(params).toString()}` : '';
      return api.get(API_PATHS.analytics.overview + queryParams);
    },
    
    getStreams: () => api.get(API_PATHS.analytics.streams),
    
    getAudience: () => api.get(API_PATHS.analytics.audience),
    
    getEngagement: () => api.get(API_PATHS.analytics.engagement)
  },

  // Viewers
  viewers: {
    list: () => api.get(API_PATHS.viewers.list),
    
    get: (id: string) => api.get(API_PATHS.viewers.get(id)),
    
    block: (id: string) => api.post(API_PATHS.viewers.block(id)),
    
    unblock: (id: string) => api.post(API_PATHS.viewers.unblock(id))
  },

  // Settings
  settings: {
    getProfile: () => api.get(API_PATHS.settings.profile),
    
    updateProfile: (data: Record<string, unknown>) => api.put(API_PATHS.settings.profile, data),
    
    getNotifications: () => api.get(API_PATHS.settings.notifications),
    
    updateNotifications: (data: Record<string, unknown>) => api.put(API_PATHS.settings.notifications, data),
    
    getStreaming: () => api.get(API_PATHS.settings.streaming),
    
    updateStreaming: (data: Record<string, unknown>) => api.put(API_PATHS.settings.streaming, data),
    
    getBilling: () => api.get(API_PATHS.settings.billing),
    
    getSecurity: () => api.get(API_PATHS.settings.security),
    
    updateSecurity: (data: Record<string, unknown>) => api.put(API_PATHS.settings.security, data)
  }
};

// Export for use in components
export default api;