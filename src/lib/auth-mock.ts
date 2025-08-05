// AuthUser type is now defined in auth.ts to avoid circular imports
export interface AuthUser {
  username: string;
  email: string;
  name?: string;
  sub?: string;
  idToken?: string;
  attributes?: Record<string, string>;
}

// Mock user for local development
const MOCK_USER: AuthUser = {
  username: 'apvantaio@gmail.com',
  email: 'apvantaio@gmail.com',
  name: 'Demo User',
  sub: 'mock-user-id-123',
  idToken: 'mock-token-12345',
  attributes: {
    email: 'apvantaio@gmail.com',
    name: 'Demo User',
    email_verified: 'true'
  }
};

// Mock credentials for testing
const MOCK_CREDENTIALS = {
  email: 'apvantaio@gmail.com',
  password: 'DisneyDemo2025#'
};

export const mockAuthService = {
  signUp: async (email: string, password: string): Promise<unknown> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (email === MOCK_CREDENTIALS.email) {
      return { success: true };
    }
    throw new Error('Invalid email for mock service');
  },

  confirmSignUp: async (email: string, code: string): Promise<unknown> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
  },

  resendConfirmationCode: async (email: string): Promise<unknown> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
  },

  signIn: async (email: string, password: string): Promise<any> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (email === MOCK_CREDENTIALS.email && password === MOCK_CREDENTIALS.password) {
      // Store mock session
      localStorage.setItem('idToken', MOCK_USER.idToken!);
      localStorage.setItem('mockUser', JSON.stringify(MOCK_USER));
      return { success: true };
    }
    
    throw new Error('Invalid credentials');
  },

  signOut: (): void => {
    localStorage.removeItem('idToken');
    localStorage.removeItem('mockUser');
  },

  getCurrentUser: async (): Promise<AuthUser | null> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const token = localStorage.getItem('idToken');
    const storedUser = localStorage.getItem('mockUser');
    
    if (token && storedUser) {
      try {
        return JSON.parse(storedUser) as AuthUser;
      } catch {
        return null;
      }
    }
    
    return null;
  },

  getAccessToken: async (): Promise<string | null> => {
    const token = localStorage.getItem('idToken');
    return token || null;
  }
};
