/**
 * Debug utilities that only work in development
 * Never affects production code
 */

export const debug = {
  log: (...args: unknown[]) => {
    if (import.meta.env.DEV) {
      console.log('[DEBUG]', ...args);
    }
  },
  
  error: (...args: unknown[]) => {
    if (import.meta.env.DEV) {
      console.error('[ERROR]', ...args);
    }
  },
  
  table: (data: unknown) => {
    if (import.meta.env.DEV) {
      console.table(data);
    }
  },
  
  time: (label: string) => {
    if (import.meta.env.DEV) {
      console.time(label);
    }
  },
  
  timeEnd: (label: string) => {
    if (import.meta.env.DEV) {
      console.timeEnd(label);
    }
  },
  
  // Component render tracking
  track: (componentName: string, props?: unknown) => {
    if (import.meta.env.DEV) {
      console.log(`[RENDER] ${componentName}`, props || '');
    }
  },
  
  // API call debugging
  api: (method: string, url: string, data?: unknown) => {
    if (import.meta.env.DEV) {
      console.groupCollapsed(`[API] ${method} ${url}`);
      if (data) console.log('Data:', data);
      console.groupEnd();
    }
  },
  
  // Auth state debugging
  auth: (action: string, state: unknown) => {
    if (import.meta.env.DEV) {
      console.log(`[AUTH] ${action}:`, state);
    }
  },
  
  // Performance measurement
  measure: async <T>(label: string, fn: () => Promise<T>): Promise<T> => {
    if (import.meta.env.DEV) {
      console.time(label);
      try {
        const result = await fn();
        console.timeEnd(label);
        return result;
      } catch (error) { void error;
        console.timeEnd(label);
        throw error;
      }
    }
    return fn();
  }
};

// Global debug helpers (dev only)
if (import.meta.env.DEV) {
  (window as "file" | "url" | "simlive").debug = {
    // Toggle auth bypass
    bypassAuth: (enabled = true) => {
      localStorage.setItem('DEBUG_BYPASS_AUTH', String(enabled));
      console.log(`Auth bypass ${enabled ? 'enabled' : 'disabled'}. Reload page to apply.`);
    },
    
    // Toggle API mocking
    mockApi: (enabled = true) => {
      localStorage.setItem('DEBUG_MOCK_API', String(enabled));
      console.log(`API mocking ${enabled ? 'enabled' : 'disabled'}. Reload page to apply.`);
    },
    
    // Clear all storage
    clearStorage: () => {
      localStorage.clear();
      sessionStorage.clear();
      console.log('All storage cleared. Reload page.');
    },
    
    // Show current auth state
    authState: () => {
      const token = localStorage.getItem('accessToken');
      const user = localStorage.getItem('user');
      console.table({
        hasToken: !!token,
        hasUser: !!user,
        tokenLength: token?.length || 0,
        user: user ? JSON.parse(user) : null
      });
    },
    
    // Enable verbose logging
    verbose: (enabled = true) => {
      localStorage.setItem('DEBUG_VERBOSE', String(enabled));
      console.log(`Verbose logging ${enabled ? 'enabled' : 'disabled'}.`);
    }
  };
  
  console.log('🛠️ Debug helpers available. Type "debug" in console to see commands.');
}