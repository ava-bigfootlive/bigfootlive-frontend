// Advanced Authentication System Types for BigfootLive

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  roles: string[];
  permissions: string[];
  
  // Enterprise fields
  employeeId?: string;
  department?: string;
  manager?: string;
  
  // Auth fields
  isActive: boolean;
  isVerified: boolean;
  lastLogin?: Date;
  loginCount: number;
  
  // MFA fields
  mfaEnabled: boolean;
  mfaMethods: MFAMethod[];
  backupCodes: string[];
  
  // Session info
  currentSession?: AuthSession;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

export interface AuthSession {
  id: string;
  userId: string;
  token: string;
  refreshToken?: string;
  expiresAt: Date;
  createdAt: Date;
  ipAddress: string;
  userAgent: string;
  device?: string;
  location?: string;
  isActive: boolean;
  
  // SSO session info
  ssoSessionId?: string;
  ssoProvider?: string;
  ssoAttributes?: Record<string, any>;
}

// SSO Configuration Types
export interface SSOProvider {
  id: string;
  name: string;
  displayName: string;
  type: 'saml' | 'oidc' | 'oauth2' | 'ldap' | 'active_directory';
  isEnabled: boolean;
  isDefault: boolean;
  
  // Provider configuration
  config: SSOConfig;
  
  // Attribute mappings
  attributeMapping: AttributeMapping;
  
  // Group/role mappings
  groupMapping: GroupMapping[];
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastSync?: Date;
}

export interface SSOConfig {
  // SAML Configuration
  saml?: {
    entryPoint: string; // SSO URL
    issuer: string; // Entity ID
    cert: string; // X.509 Certificate
    privateCert?: string; // Private key for signing
    signatureAlgorithm: 'sha1' | 'sha256';
    digestAlgorithm: 'sha1' | 'sha256';
    signRequest: boolean;
    encryptAssertion: boolean;
    wantAssertionsSigned: boolean;
    wantResponseSigned: boolean;
    skipRequestCompression: boolean;
    disableRequestedAuthnContext: boolean;
    authnContext?: string[];
    callbackUrl: string; // ACS URL
    logoutUrl?: string;
    metadataUrl?: string;
  };
  
  // OIDC Configuration
  oidc?: {
    issuer: string;
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    scope: string[];
    responseType: 'code' | 'id_token' | 'id_token token';
    responseMode: 'query' | 'fragment' | 'form_post';
    prompt?: 'none' | 'login' | 'consent' | 'select_account';
    maxAge?: number;
    uiLocales?: string[];
    acrValues?: string[];
    postLogoutRedirectUri?: string;
  };
  
  // OAuth2 Configuration
  oauth2?: {
    authorizationEndpoint: string;
    tokenEndpoint: string;
    userInfoEndpoint: string;
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    scope: string[];
    grantType: 'authorization_code' | 'implicit' | 'client_credentials';
    responseType: 'code' | 'token';
    pkce: boolean;
  };
  
  // LDAP Configuration
  ldap?: {
    url: string;
    bindDN: string;
    bindPassword: string;
    baseDN: string;
    userSearchFilter: string;
    groupSearchFilter: string;
    attributes: {
      mail: string;
      displayName: string;
      givenName: string;
      surname: string;
      memberOf: string;
    };
    tlsOptions?: {
      rejectUnauthorized: boolean;
      ca?: string[];
      cert?: string;
      key?: string;
    };
  };
  
  // Active Directory Configuration
  activeDirectory?: {
    url: string;
    baseDN: string;
    username: string;
    password: string;
    domain: string;
    domainController?: string;
    enableTLS: boolean;
    tlsOptions?: {
      rejectUnauthorized: boolean;
      ca?: string[];
    };
  };
}

export interface AttributeMapping {
  email: string; // Maps to email field
  username?: string; // Maps to username field
  firstName?: string; // Maps to firstName field
  lastName?: string; // Maps to lastName field
  displayName?: string; // Maps to displayName field
  employeeId?: string; // Maps to employeeId field
  department?: string; // Maps to department field
  manager?: string; // Maps to manager field
  groups?: string; // Maps to groups/roles
  customAttributes?: Record<string, string>; // Custom field mappings
}

export interface GroupMapping {
  ssoGroup: string; // Group name from SSO provider
  internalRole: string; // Internal role to map to
  permissions?: string[]; // Additional permissions to grant
}

// Multi-Factor Authentication Types
export interface MFAMethod {
  id: string;
  type: 'totp' | 'sms' | 'email' | 'hardware_token' | 'backup_codes';
  isEnabled: boolean;
  isPrimary: boolean;
  name: string;
  
  // TOTP specific
  secret?: string;
  qrCode?: string;
  
  // SMS/Email specific
  phoneNumber?: string;
  emailAddress?: string;
  
  // Hardware token specific
  serialNumber?: string;
  
  createdAt: Date;
  lastUsed?: Date;
}

export interface MFAChallenge {
  id: string;
  userId: string;
  method: MFAMethod['type'];
  code?: string; // For TOTP, SMS, Email
  challenge?: string; // For hardware tokens
  expiresAt: Date;
  attempts: number;
  maxAttempts: number;
  isUsed: boolean;
}

// Authentication Flow Types
export interface AuthRequest {
  email?: string;
  username?: string;
  password?: string;
  mfaCode?: string;
  mfaMethodId?: string;
  ssoProvider?: string;
  rememberMe?: boolean;
  deviceId?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  refreshToken?: string;
  expiresIn?: number;
  requiresMFA?: boolean;
  mfaMethods?: MFAMethod[];
  mfaChallengeId?: string;
  ssoRedirect?: string;
  error?: string;
  errorCode?: string;
}

export interface JWTPayload {
  sub: string; // user ID
  email: string;
  username: string;
  roles: string[];
  permissions: string[];
  sessionId: string;
  iat: number; // issued at
  exp: number; // expires at
  iss: string; // issuer
  aud: string; // audience
  
  // SSO claims
  sso?: {
    provider: string;
    sessionId: string;
    attributes?: Record<string, any>;
  };
  
  // Custom claims
  tenant?: string;
  department?: string;
  employeeId?: string;
}

// Security Policy Types
export interface SecurityPolicy {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  
  // Password policy
  passwordPolicy: {
    minLength: number;
    maxLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSymbols: boolean;
    preventReuse: number; // Number of previous passwords to prevent reuse
    maxAge: number; // Days before password expires
    lockoutAttempts: number; // Failed attempts before lockout
    lockoutDuration: number; // Minutes of lockout
  };
  
  // Session policy
  sessionPolicy: {
    maxDuration: number; // Minutes
    extendOnActivity: boolean;
    requireReauth: boolean; // Require re-auth for sensitive operations
    concurrentSessions: number; // Max concurrent sessions
    ipRestriction: boolean;
    allowedIPs?: string[]; // CIDR notation
  };
  
  // MFA policy
  mfaPolicy: {
    required: boolean;
    requiredForRoles: string[]; // Roles that must have MFA
    allowedMethods: MFAMethod['type'][];
    gracePeriod: number; // Days to set up MFA
    backupCodesRequired: boolean;
  };
  
  // Login policy
  loginPolicy: {
    allowEmailLogin: boolean;
    allowUsernameLogin: boolean;
    requireEmailVerification: boolean;
    maxFailedAttempts: number;
    lockoutDuration: number; // Minutes
    bruteForceProtection: boolean;
  };
  
  // Device policy
  devicePolicy: {
    allowDeviceRemembering: boolean;
    deviceTrustDuration: number; // Days
    maxTrustedDevices: number;
    requireDeviceApproval: boolean;
  };
}

// Audit and Compliance Types
export interface AuthAuditEvent {
  id: string;
  userId?: string;
  sessionId?: string;
  eventType: 'login' | 'logout' | 'login_failed' | 'mfa_setup' | 'mfa_used' | 'password_change' | 'account_locked' | 'sso_login' | 'permission_granted' | 'permission_denied';
  description: string;
  ipAddress: string;
  userAgent: string;
  location?: string;
  deviceId?: string;
  success: boolean;
  metadata?: Record<string, any>;
  timestamp: Date;
  
  // Compliance fields
  riskScore?: number;
  riskFactors?: string[];
  complianceFlags?: string[];
}

// API Response Types
export interface AuthProvider {
  // Core auth methods
  login: (request: AuthRequest) => Promise<AuthResponse>;
  logout: (sessionId: string) => Promise<void>;
  refreshToken: (refreshToken: string) => Promise<AuthResponse>;
  verifyToken: (token: string) => Promise<User | null>;
  
  // MFA methods
  setupMFA: (userId: string, method: MFAMethod['type']) => Promise<{ secret?: string; qrCode?: string; backupCodes?: string[] }>;
  verifyMFA: (challengeId: string, code: string) => Promise<boolean>;
  disableMFA: (userId: string, methodId: string) => Promise<void>;
  
  // SSO methods
  initiateSSO: (providerId: string, returnUrl?: string) => Promise<{ redirectUrl: string }>;
  handleSSOCallback: (providerId: string, data: any) => Promise<AuthResponse>;
  
  // Session management
  getSessions: (userId: string) => Promise<AuthSession[]>;
  revokeSession: (sessionId: string) => Promise<void>;
  revokeAllSessions: (userId: string) => Promise<void>;
  
  // Security
  changePassword: (userId: string, oldPassword: string, newPassword: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  validatePasswordStrength: (password: string) => Promise<{ score: number; feedback: string[] }>;
  
  // Audit
  getAuditEvents: (userId?: string, limit?: number) => Promise<AuthAuditEvent[]>;
  logAuditEvent: (event: Omit<AuthAuditEvent, 'id' | 'timestamp'>) => Promise<void>;
}

// Configuration Types for different enterprise scenarios
export interface EnterpriseAuthConfig {
  // Disney-style config
  disney?: {
    ssoProvider: 'saml';
    domain: 'disney.com';
    allowedDomains: string[];
    requireMFA: boolean;
    customClaims: Record<string, string>;
    sessionTimeout: number;
  };
  
  // Generic enterprise config
  enterprise?: {
    ssoRequired: boolean;
    allowLocalAuth: boolean;
    domainRestriction: string[];
    mfaRequired: boolean;
    sessionPolicy: SecurityPolicy['sessionPolicy'];
    auditRequired: boolean;
  };
}

// Constants for common enterprise configurations
export const ENTERPRISE_SSO_PROVIDERS = {
  AZURE_AD: 'azure_ad',
  OKTA: 'okta',
  PING_IDENTITY: 'ping_identity',
  AUTH0: 'auth0',
  GOOGLE_WORKSPACE: 'google_workspace',
  ACTIVE_DIRECTORY: 'active_directory',
  ONELOGIN: 'onelogin',
  SAML_GENERIC: 'saml_generic'
} as const;

export const MFA_METHODS = {
  TOTP: 'totp',
  SMS: 'sms',
  EMAIL: 'email',
  HARDWARE_TOKEN: 'hardware_token',
  BACKUP_CODES: 'backup_codes'
} as const;

export const AUTH_EVENTS = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  LOGIN_FAILED: 'login_failed',
  MFA_SETUP: 'mfa_setup',
  MFA_USED: 'mfa_used',
  PASSWORD_CHANGE: 'password_change',
  ACCOUNT_LOCKED: 'account_locked',
  SSO_LOGIN: 'sso_login',
  PERMISSION_GRANTED: 'permission_granted',
  PERMISSION_DENIED: 'permission_denied'
} as const;
