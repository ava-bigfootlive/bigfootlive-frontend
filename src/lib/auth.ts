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

const mockAuthService = {
  signUp: async (email: string, password: string): Promise<unknown> => {
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
    await new Promise(resolve => setTimeout(resolve, 500));
    if (email === MOCK_CREDENTIALS.email && password === MOCK_CREDENTIALS.password) {
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

const poolData = {
  UserPoolId: import.meta.env.VITE_AWS_USER_POOL_ID || '',
  ClientId: import.meta.env.VITE_AWS_USER_POOL_WEB_CLIENT_ID || ''
};

const USE_MOCK_AUTH = import.meta.env.MODE === 'development' && (!poolData.UserPoolId || !poolData.ClientId);

let authService: any;

if (USE_MOCK_AUTH) {
  console.log('🔐 Using mock authentication service (no Cognito credentials found)');
  authService = mockAuthService;
} else {
  console.log('🔐 Using AWS Cognito authentication service');
  // Create Cognito service synchronously to avoid async import issues
  authService = {
    signUp: async (email: string, password: string): Promise<unknown> => {
      const { CognitoUserPool } = await import('amazon-cognito-identity-js');
      const userPool = new CognitoUserPool(poolData);
      return new Promise((resolve, reject) => {
        userPool.signUp(email, password, [], [], (err, result) => {
          if (err) reject(err); else resolve(result);
        });
      });
    },

    confirmSignUp: async (email: string, code: string): Promise<unknown> => {
      const { CognitoUserPool, CognitoUser } = await import('amazon-cognito-identity-js');
      const userPool = new CognitoUserPool(poolData);
      const cognitoUser = new CognitoUser({ Username: email, Pool: userPool });
      return new Promise((resolve, reject) => {
        cognitoUser.confirmRegistration(code, true, (err, result) => {
          if (err) reject(err); else resolve(result);
        });
      });
    },

    resendConfirmationCode: async (email: string): Promise<unknown> => {
      const { CognitoUserPool, CognitoUser } = await import('amazon-cognito-identity-js');
      const userPool = new CognitoUserPool(poolData);
      const cognitoUser = new CognitoUser({ Username: email, Pool: userPool });
      return new Promise((resolve, reject) => {
        cognitoUser.resendConfirmationCode((err, result) => {
          if (err) reject(err); else resolve(result);
        });
      });
    },

    signIn: async (email: string, password: string): Promise<any> => {
      const { CognitoUserPool, CognitoUser, AuthenticationDetails } = await import('amazon-cognito-identity-js');
      const userPool = new CognitoUserPool(poolData);
      const authenticationDetails = new AuthenticationDetails({ Username: email, Password: password });
      const cognitoUser = new CognitoUser({ Username: email, Pool: userPool });
      
      return new Promise((resolve, reject) => {
        cognitoUser.authenticateUser(authenticationDetails, {
          onSuccess: (result) => {
            localStorage.setItem('idToken', result.getIdToken().getJwtToken());
            resolve(result);
          },
          onFailure: reject
        });
      });
    },

    signOut: async (): Promise<void> => {
      const { CognitoUserPool } = await import('amazon-cognito-identity-js');
      const userPool = new CognitoUserPool(poolData);
      const currentUser = userPool.getCurrentUser();
      if (currentUser) {
        currentUser.signOut();
        localStorage.removeItem('idToken');
      }
    },

    getCurrentUser: async (): Promise<AuthUser | null> => {
      try {
        const { CognitoUserPool } = await import('amazon-cognito-identity-js');
        const userPool = new CognitoUserPool(poolData);
        const currentUser = userPool.getCurrentUser();
        if (!currentUser) return null;

        return new Promise((resolve) => {
          currentUser.getSession((err: any, session: any) => {
            if (err || !session || !session.isValid()) {
              resolve(null);
              return;
            }

            const idToken = session.getIdToken().getJwtToken();
            localStorage.setItem('idToken', idToken);
            
            currentUser.getUserAttributes((err: any, attributes: any) => {
              if (err) {
                resolve({
                  username: currentUser.getUsername(),
                  email: session.getIdToken().payload.email,
                  name: currentUser.getUsername(),
                  sub: session.getIdToken().payload.sub,
                  idToken: idToken
                });
              } else {
                const attrs: Record<string, string> = {};
                attributes?.forEach((attr: any) => {
                  attrs[attr.getName()] = attr.getValue();
                });
                resolve({
                  username: currentUser.getUsername(),
                  email: attrs.email || session.getIdToken().payload.email,
                  name: attrs.name || currentUser.getUsername(),
                  sub: session.getIdToken().payload.sub,
                  idToken: idToken,
                  attributes: attrs
                });
              }
            });
          });
        });
      } catch (error) {
        console.warn('Cognito getCurrentUser failed:', error);
        return null;
      }
    },

    getAccessToken: async (): Promise<string | null> => {
      try {
        const { CognitoUserPool } = await import('amazon-cognito-identity-js');
        const userPool = new CognitoUserPool(poolData);
        const currentUser = userPool.getCurrentUser();
        if (!currentUser) return null;

        return new Promise((resolve) => {
          currentUser.getSession((err: any, session: any) => {
            if (err || !session || !session.isValid()) {
              resolve(null);
              return;
            }
            resolve(session.getAccessToken().getJwtToken());
          });
        });
      } catch (error) {
        console.warn('Cognito getAccessToken failed:', error);
        return null;
      }
    }
  };
}

export { authService };
