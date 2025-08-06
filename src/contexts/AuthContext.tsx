import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { 
  User, 
  AuthSession, 
  AuthRequest, 
  AuthResponse, 
  MFAMethod, 
  AuthAuditEvent,
  SSOProvider,
  SecurityPolicy 
} from '../types/auth';

// Auth State Interface
export interface AuthState {
  // Authentication state
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  session: AuthSession | null;
  
  // MFA state
  requiresMFA: boolean;
  mfaMethods: MFAMethod[];
  mfaChallengeId: string | null;
  
  // SSO state
  ssoProviders: SSOProvider[];
  activeSSOProvider: SSOProvider | null;
  
  // Security state
  securityPolicy: SecurityPolicy | null;
  trustedDevices: string[];
  
  // Error state
  error: string | null;
  errorCode: string | null;
  
  // Session management
  activeSessions: AuthSession[];
  sessionWarning: boolean; // Session about to expire
  
  // Audit
  auditEvents: AuthAuditEvent[];
}

// Auth Actions
export type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; session: AuthSession; token: string } }
  | { type: 'AUTH_FAILURE'; payload: { error: string; errorCode?: string } }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'AUTH_CLEAR_ERROR' }
  | { type: 'MFA_REQUIRED'; payload: { methods: MFAMethod[]; challengeId: string } }
  | { type: 'MFA_SUCCESS' }
  | { type: 'MFA_FAILURE'; payload: { error: string } }
  | { type: 'SSO_REDIRECT'; payload: { provider: SSOProvider; redirectUrl: string } }
  | { type: 'SET_SSO_PROVIDERS'; payload: SSOProvider[] }
  | { type: 'SET_SECURITY_POLICY'; payload: SecurityPolicy }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'SET_SESSIONS'; payload: AuthSession[] }
  | { type: 'SESSION_WARNING'; payload: boolean }
  | { type: 'ADD_AUDIT_EVENT'; payload: AuthAuditEvent }
  | { type: 'SET_AUDIT_EVENTS'; payload: AuthAuditEvent[] }
  | { type: 'DEVICE_TRUSTED'; payload: string }
  | { type: 'DEVICE_REVOKED'; payload: string };

// Initial state
const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: false,
  user: null,
  session: null,
  requiresMFA: false,
  mfaMethods: [],
  mfaChallengeId: null,
  ssoProviders: [],
  activeSSOProvider: null,
  securityPolicy: null,
  trustedDevices: [],
  error: null,
  errorCode: null,
  activeSessions: [],
  sessionWarning: false,
  auditEvents: []
};

// Auth reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
        errorCode: null
      };
      
    case 'AUTH_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        isLoading: false,
        user: action.payload.user,
        session: action.payload.session,
        requiresMFA: false,
        mfaMethods: [],
        mfaChallengeId: null,
        error: null,
        errorCode: null
      };
      
    case 'AUTH_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        isLoading: false,
        user: null,
        session: null,
        error: action.payload.error,
        errorCode: action.payload.errorCode || null
      };
      
    case 'AUTH_LOGOUT':
      return {
        ...initialState,
        ssoProviders: state.ssoProviders, // Keep SSO providers
        securityPolicy: state.securityPolicy // Keep security policy
      };
      
    case 'AUTH_CLEAR_ERROR':
      return {
        ...state,
        error: null,
        errorCode: null
      };
      
    case 'MFA_REQUIRED':
      return {
        ...state,
        isLoading: false,
        requiresMFA: true,
        mfaMethods: action.payload.methods,
        mfaChallengeId: action.payload.challengeId
      };
      
    case 'MFA_SUCCESS':
      return {
        ...state,
        requiresMFA: false,
        mfaMethods: [],
        mfaChallengeId: null
      };
      
    case 'MFA_FAILURE':
      return {
        ...state,
        error: action.payload.error
      };
      
    case 'SSO_REDIRECT':
      return {
        ...state,
        activeSSOProvider: action.payload.provider,
        isLoading: true
      };
      
    case 'SET_SSO_PROVIDERS':
      return {
        ...state,
        ssoProviders: action.payload
      };
      
    case 'SET_SECURITY_POLICY':
      return {
        ...state,
        securityPolicy: action.payload
      };
      
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null
      };
      
    case 'SET_SESSIONS':
      return {
        ...state,
        activeSessions: action.payload
      };
      
    case 'SESSION_WARNING':
      return {
        ...state,
        sessionWarning: action.payload
      };
      
    case 'ADD_AUDIT_EVENT':
      return {
        ...state,
        auditEvents: [action.payload, ...state.auditEvents.slice(0, 99)] // Keep last 100 events
      };
      
    case 'SET_AUDIT_EVENTS':
      return {
        ...state,
        auditEvents: action.payload
      };
      
    case 'DEVICE_TRUSTED':
      return {
        ...state,
        trustedDevices: [...state.trustedDevices, action.payload]
      };
      
    case 'DEVICE_REVOKED':
      return {
        ...state,
        trustedDevices: state.trustedDevices.filter(deviceId => deviceId !== action.payload)
      };
      
    default:
      return state;
  }
}

// Context interface
export interface AuthContextType extends AuthState {
  // Authentication methods
  login: (request: AuthRequest) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  
  // MFA methods
  setupMFA: (method: MFAMethod['type']) => Promise<{ secret?: string; qrCode?: string; backupCodes?: string[] }>;
  verifyMFA: (code: string, methodId?: string) => Promise<boolean>;
  disableMFA: (methodId: string) => Promise<void>;
  
  // SSO methods
  loginWithSSO: (providerId: string, returnUrl?: string) => Promise<void>;
  handleSSOCallback: (providerId: string, data: any) => Promise<AuthResponse>;
  
  // Session management
  refreshSessions: () => Promise<void>;
  revokeSession: (sessionId: string) => Promise<void>;
  revokeAllSessions: () => Promise<void>;
  
  // Security
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  
  // Device management
  trustDevice: (deviceId: string) => Promise<void>;
  revokeDevice: (deviceId: string) => Promise<void>;
  
  // Audit
  refreshAuditEvents: (limit?: number) => Promise<void>;
  
  // Utility
  clearError: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  checkSecurityPolicy: (action: string) => boolean;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth API service (connects to backend)
class AuthService {
  private baseUrl = import.meta.env.VITE_API_URL || process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
  
  async login(request: AuthRequest): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: request.identifier,
        password: request.password,
        deviceId: request.deviceId,
        rememberMe: request.rememberMe
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }
    
    // Transform backend response to match frontend interface
    return {
      success: data.success,
      user: data.user ? {
        ...data.user,
        currentSession: {
          id: 'temp-session', // Backend doesn't return session in login response
          userId: data.user.id,
          token: data.token,
          ipAddress: '',
          userAgent: navigator.userAgent,
          device: request.deviceId || '',
          expiresAt: new Date(Date.now() + (data.expiresIn * 1000))
        }
      } : undefined,
      token: data.token,
      refreshToken: data.refreshToken,
      expiresIn: data.expiresIn,
      requiresMFA: data.requiresMFA,
      mfaMethods: data.mfaMethods,
      mfaChallengeId: data.mfaChallengeId,
      error: data.error,
      errorCode: data.errorCode
    };
  }
  
  async logout(sessionId: string): Promise<void> {
    await fetch(`${this.baseUrl}/auth/logout`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`
      },
      body: JSON.stringify({ sessionId })
    });
  }
  
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Token refresh failed');
    }
    
    // Transform backend response to match frontend interface
    return {
      success: data.success,
      user: data.user ? {
        ...data.user,
        currentSession: {
          id: 'refreshed-session',
          userId: data.user.id,
          token: data.token,
          ipAddress: '',
          userAgent: navigator.userAgent,
          device: '',
          expiresAt: new Date(Date.now() + (data.expiresIn * 1000))
        }
      } : undefined,
      token: data.token,
      expiresIn: data.expiresIn
    };
  }
  
  async setupMFA(userId: string, method: MFAMethod['type']): Promise<{ secret?: string; qrCode?: string; backupCodes?: string[] }> {
    const response = await fetch(`${this.baseUrl}/auth/mfa/setup`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`
      },
      body: JSON.stringify({ userId, method })
    });
    
    return response.json();
  }
  
  async verifyMFA(challengeId: string, code: string): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/auth/mfa/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ challengeId, code })
    });
    
    const result = await response.json();
    return result.success;
  }
  
  async getSSOProviders(): Promise<SSOProvider[]> {
    try {
      const response = await fetch(`${this.baseUrl}/tenant/sso-providers`);
      if (!response.ok) {
        // If endpoint doesn't exist, return empty array
        return [];
      }
      return response.json();
    } catch (error) {
      console.warn('Failed to load SSO providers:', error);
      return [];
    }
  }
  
  async initiateSSO(providerId: string, returnUrl?: string): Promise<{ redirectUrl: string }> {
    const response = await fetch(`${this.baseUrl}/auth/sso/initiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ providerId, returnUrl })
    });
    
    return response.json();
  }
  
  async getSessions(userId: string): Promise<AuthSession[]> {
    const response = await fetch(`${this.baseUrl}/auth/sessions/${userId}`, {
      headers: { 'Authorization': `Bearer ${this.getToken()}` }
    });
    
    return response.json();
  }
  
  async getSecurityPolicy(): Promise<SecurityPolicy> {
    const response = await fetch(`${this.baseUrl}/auth/security-policy`, {
      headers: { 'Authorization': `Bearer ${this.getToken()}` }
    });
    
    return response.json();
  }
  
  async getAuditEvents(userId?: string, limit?: number): Promise<AuthAuditEvent[]> {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (limit) params.append('limit', limit.toString());
    
    const response = await fetch(`${this.baseUrl}/auth/audit?${params}`, {
      headers: { 'Authorization': `Bearer ${this.getToken()}` }
    });
    
    return response.json();
  }
  
  private getToken(): string | null {
    return localStorage.getItem('auth_token');
  }
  
  private setToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }
  
  private removeToken(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
  }
}

// Auth Provider Component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const authService = new AuthService();
  
  // Initialize auth state on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (token && refreshToken) {
      // Validate token and restore session
      authService.refreshToken(refreshToken)
        .then((response) => {
          if (response.success && response.user) {
            dispatch({
              type: 'AUTH_SUCCESS',
              payload: {
                user: response.user,
                session: response.user.currentSession!,
                token: response.token!
              }
            });
          }
        })
        .catch(() => {
          // Token refresh failed, clear tokens
          localStorage.removeItem('auth_token');
          localStorage.removeItem('refresh_token');
        });
    }
    
    // Load SSO providers
    authService.getSSOProviders()
      .then(providers => {
        dispatch({ type: 'SET_SSO_PROVIDERS', payload: providers });
      })
      .catch(() => {
        // Fail silently for SSO providers
      });
      
    // Load security policy
    authService.getSecurityPolicy()
      .then(policy => {
        dispatch({ type: 'SET_SECURITY_POLICY', payload: policy });
      })
      .catch(() => {
        // Fail silently for security policy
      });
  }, []);
  
  // Session timeout warning
  useEffect(() => {
    if (state.session && state.isAuthenticated) {
      const timeUntilExpiry = new Date(state.session.expiresAt).getTime() - Date.now();
      const warningTime = 5 * 60 * 1000; // 5 minutes before expiry
      
      if (timeUntilExpiry > warningTime) {
        const timeout = setTimeout(() => {
          dispatch({ type: 'SESSION_WARNING', payload: true });
        }, timeUntilExpiry - warningTime);
        
        return () => clearTimeout(timeout);
      } else if (timeUntilExpiry > 0) {
        dispatch({ type: 'SESSION_WARNING', payload: true });
      }
    }
  }, [state.session, state.isAuthenticated]);
  
  // Authentication methods
  const login = useCallback(async (request: AuthRequest): Promise<AuthResponse> => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const response = await authService.login(request);
      
      if (response.success && response.user) {
        localStorage.setItem('auth_token', response.token!);
        if (response.refreshToken) {
          localStorage.setItem('refresh_token', response.refreshToken);
        }
        
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: response.user,
            session: response.user.currentSession!,
            token: response.token!
          }
        });
      } else if (response.requiresMFA) {
        dispatch({
          type: 'MFA_REQUIRED',
          payload: {
            methods: response.mfaMethods || [],
            challengeId: response.mfaChallengeId!
          }
        });
      } else {
        dispatch({
          type: 'AUTH_FAILURE',
          payload: {
            error: response.error || 'Login failed',
            errorCode: response.errorCode
          }
        });
      }
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      dispatch({
        type: 'AUTH_FAILURE',
        payload: { error: errorMessage }
      });
      throw error;
    }
  }, []);
  
  const logout = useCallback(async (): Promise<void> => {
    if (state.session) {
      try {
        await authService.logout(state.session.id);
      } catch (error) {
        // Log out locally even if server logout fails
        console.error('Server logout failed:', error);
      }
    }
    
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    dispatch({ type: 'AUTH_LOGOUT' });
  }, [state.session]);
  
  const refreshToken = useCallback(async (): Promise<boolean> => {
    const refreshTokenValue = localStorage.getItem('refresh_token');
    if (!refreshTokenValue) return false;
    
    try {
      const response = await authService.refreshToken(refreshTokenValue);
      if (response.success && response.user) {
        localStorage.setItem('auth_token', response.token!);
        if (response.refreshToken) {
          localStorage.setItem('refresh_token', response.refreshToken);
        }
        
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: response.user,
            session: response.user.currentSession!,
            token: response.token!
          }
        });
        return true;
      }
    } catch (error) {
      // Token refresh failed
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      dispatch({ type: 'AUTH_LOGOUT' });
    }
    
    return false;
  }, []);
  
  // MFA methods
  const setupMFA = useCallback(async (method: MFAMethod['type']): Promise<{ secret?: string; qrCode?: string; backupCodes?: string[] }> => {
    if (!state.user) throw new Error('User not authenticated');
    return authService.setupMFA(state.user.id, method);
  }, [state.user]);
  
  const verifyMFA = useCallback(async (code: string, methodId?: string): Promise<boolean> => {
    if (!state.mfaChallengeId) throw new Error('No MFA challenge');
    
    try {
      const success = await authService.verifyMFA(state.mfaChallengeId, code);
      if (success) {
        dispatch({ type: 'MFA_SUCCESS' });
      } else {
        dispatch({ type: 'MFA_FAILURE', payload: { error: 'Invalid MFA code' } });
      }
      return success;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'MFA verification failed';
      dispatch({ type: 'MFA_FAILURE', payload: { error: errorMessage } });
      return false;
    }
  }, [state.mfaChallengeId]);
  
  // SSO methods
  const loginWithSSO = useCallback(async (providerId: string, returnUrl?: string): Promise<void> => {
    const provider = state.ssoProviders.find(p => p.id === providerId);
    if (!provider) throw new Error('SSO provider not found');
    
    const { redirectUrl } = await authService.initiateSSO(providerId, returnUrl);
    dispatch({ type: 'SSO_REDIRECT', payload: { provider, redirectUrl } });
    
    // Redirect to SSO provider
    window.location.href = redirectUrl;
  }, [state.ssoProviders]);
  
  // Utility methods
  const clearError = useCallback(() => {
    dispatch({ type: 'AUTH_CLEAR_ERROR' });
  }, []);
  
  const hasPermission = useCallback((permission: string): boolean => {
    return state.user?.permissions.includes(permission) || false;
  }, [state.user]);
  
  const hasRole = useCallback((role: string): boolean => {
    return state.user?.roles.includes(role) || false;
  }, [state.user]);
  
  const checkSecurityPolicy = useCallback((action: string): boolean => {
    // Implement security policy checks based on action
    // This is a placeholder implementation
    return true;
  }, [state.securityPolicy]);
  
  // Placeholder implementations for remaining methods
  const disableMFA = useCallback(async (methodId: string): Promise<void> => {
    // Implementation would call API to disable MFA method
    console.log('Disable MFA:', methodId);
  }, []);
  
  const handleSSOCallback = useCallback(async (providerId: string, data: any): Promise<AuthResponse> => {
    // Implementation would handle SSO callback
    return { success: false, error: 'Not implemented' };
  }, []);
  
  const refreshSessions = useCallback(async (): Promise<void> => {
    if (state.user) {
      const sessions = await authService.getSessions(state.user.id);
      dispatch({ type: 'SET_SESSIONS', payload: sessions });
    }
  }, [state.user]);
  
  const revokeSession = useCallback(async (sessionId: string): Promise<void> => {
    // Implementation would revoke specific session
    console.log('Revoke session:', sessionId);
  }, []);
  
  const revokeAllSessions = useCallback(async (): Promise<void> => {
    // Implementation would revoke all sessions
    console.log('Revoke all sessions');
  }, []);
  
  const changePassword = useCallback(async (oldPassword: string, newPassword: string): Promise<void> => {
    // Implementation would change password
    console.log('Change password');
  }, []);
  
  const resetPassword = useCallback(async (email: string): Promise<void> => {
    // Implementation would initiate password reset
    console.log('Reset password for:', email);
  }, []);
  
  const trustDevice = useCallback(async (deviceId: string): Promise<void> => {
    dispatch({ type: 'DEVICE_TRUSTED', payload: deviceId });
  }, []);
  
  const revokeDevice = useCallback(async (deviceId: string): Promise<void> => {
    dispatch({ type: 'DEVICE_REVOKED', payload: deviceId });
  }, []);
  
  const refreshAuditEvents = useCallback(async (limit?: number): Promise<void> => {
    const events = await authService.getAuditEvents(state.user?.id, limit);
    dispatch({ type: 'SET_AUDIT_EVENTS', payload: events });
  }, [state.user]);
  
  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    refreshToken,
    setupMFA,
    verifyMFA,
    disableMFA,
    loginWithSSO,
    handleSSOCallback,
    refreshSessions,
    revokeSession,
    revokeAllSessions,
    changePassword,
    resetPassword,
    trustDevice,
    revokeDevice,
    refreshAuditEvents,
    clearError,
    hasPermission,
    hasRole,
    checkSecurityPolicy
  };
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Higher-order component for protected routes
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth();
    
    if (isLoading) {
      return <div>Loading...</div>;
    }
    
    if (!isAuthenticated) {
      return <div>Please log in to access this page.</div>;
    }
    
    return <Component {...props} />;
  };
}

// Hook for permission-based access
export function usePermissions(requiredPermissions: string[]) {
  const { hasPermission, user } = useAuth();
  
  const hasAllPermissions = requiredPermissions.every(permission => hasPermission(permission));
  const hasAnyPermission = requiredPermissions.some(permission => hasPermission(permission));
  
  return {
    hasAllPermissions,
    hasAnyPermission,
    permissions: user?.permissions || []
  };
}

// Hook for role-based access
export function useRoles(requiredRoles: string[]) {
  const { hasRole, user } = useAuth();
  
  const hasAllRoles = requiredRoles.every(role => hasRole(role));
  const hasAnyRole = requiredRoles.some(role => hasRole(role));
  
  return {
    hasAllRoles,
    hasAnyRole,
    roles: user?.roles || []
  };
}
