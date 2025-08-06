// User Management Types for BigfootLive

export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  bio?: string;
  title?: string;
  department?: string;
  location?: string;
  timezone?: string;
  phone?: string;
  
  // Account status
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  emailVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Enterprise fields
  employeeId?: string;
  manager?: string;
  costCenter?: string;
  
  // Roles and permissions
  roles: Role[];
  permissions: Permission[];
  groups: UserGroup[];
  
  // Settings
  preferences: UserPreferences;
  
  // Metadata
  metadata?: Record<string, any>;
  tags?: string[];
}

export interface Role {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  color?: string;
  icon?: string;
  isSystem: boolean;
  isDefault: boolean;
  permissions: Permission[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  resource: string; // e.g., 'streams', 'users', 'analytics'
  action: string;   // e.g., 'create', 'read', 'update', 'delete'
  scope?: string;   // e.g., 'own', 'team', 'organization'
  isSystem: boolean;
}

export interface UserGroup {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  color?: string;
  type: 'department' | 'team' | 'project' | 'custom';
  members: User[];
  roles: Role[];
  permissions: Permission[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  notifications: NotificationPreferences;
  privacy: PrivacyPreferences;
  accessibility: AccessibilityPreferences;
}

export interface NotificationPreferences {
  email: {
    streamStart: boolean;
    streamEnd: boolean;
    chatMentions: boolean;
    systemUpdates: boolean;
    securityAlerts: boolean;
  };
  push: {
    streamStart: boolean;
    streamEnd: boolean;
    chatMentions: boolean;
    systemUpdates: boolean;
  };
  inApp: {
    streamStart: boolean;
    streamEnd: boolean;
    chatMentions: boolean;
    systemUpdates: boolean;
  };
}

export interface PrivacyPreferences {
  profileVisibility: 'public' | 'organization' | 'private';
  showOnlineStatus: boolean;
  showLastLogin: boolean;
  allowDirectMessages: boolean;
  allowMentions: boolean;
}

export interface AccessibilityPreferences {
  fontSize: 'small' | 'medium' | 'large';
  contrast: 'normal' | 'high';
  reducedMotion: boolean;
  screenReader: boolean;
}

// API Response Types
export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  title?: string;
  department?: string;
  roles?: string[];
  groups?: string[];
  sendInvite?: boolean;
}

export interface UpdateUserRequest {
  displayName?: string;
  firstName?: string;
  lastName?: string;
  title?: string;
  department?: string;
  bio?: string;
  location?: string;
  phone?: string;
  avatar?: string;
  status?: User['status'];
  roles?: string[];
  groups?: string[];
  preferences?: Partial<UserPreferences>;
  metadata?: Record<string, any>;
  tags?: string[];
}

export interface UserSearchFilters {
  query?: string;
  status?: User['status'][];
  roles?: string[];
  groups?: string[];
  departments?: string[];
  tags?: string[];
  lastLoginBefore?: Date;
  lastLoginAfter?: Date;
  createdBefore?: Date;
  createdAfter?: Date;
}

export interface UserActivity {
  id: string;
  userId: string;
  type: 'login' | 'logout' | 'stream_start' | 'stream_end' | 'profile_update' | 'password_change' | 'role_change';
  description: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

export interface UserSession {
  id: string;
  userId: string;
  token: string;
  device?: string;
  browser?: string;
  location?: string;
  ipAddress: string;
  lastActivity: Date;
  createdAt: Date;
  expiresAt: Date;
  isActive: boolean;
}

// Predefined system roles
export const SYSTEM_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  STREAMER: 'streamer',
  VIEWER: 'viewer',
  GUEST: 'guest'
} as const;

// Predefined permissions
export const PERMISSIONS = {
  // User management
  USERS_CREATE: 'users:create',
  USERS_READ: 'users:read',
  USERS_UPDATE: 'users:update',
  USERS_DELETE: 'users:delete',
  USERS_INVITE: 'users:invite',
  USERS_MANAGE_ROLES: 'users:manage_roles',
  
  // Stream management
  STREAMS_CREATE: 'streams:create',
  STREAMS_READ: 'streams:read',
  STREAMS_UPDATE: 'streams:update',
  STREAMS_DELETE: 'streams:delete',
  STREAMS_MODERATE: 'streams:moderate',
  
  // Analytics
  ANALYTICS_VIEW: 'analytics:view',
  ANALYTICS_EXPORT: 'analytics:export',
  
  // System administration
  SYSTEM_CONFIG: 'system:config',
  SYSTEM_LOGS: 'system:logs',
  SYSTEM_BACKUP: 'system:backup',
  
  // Content management
  CONTENT_CREATE: 'content:create',
  CONTENT_UPDATE: 'content:update',
  CONTENT_DELETE: 'content:delete',
  CONTENT_MODERATE: 'content:moderate',
} as const;
