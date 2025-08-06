// Feature flags configuration for BigfootLive
// This allows enabling/disabling features per tenant or globally

export interface FeatureFlags {
  // Monetization features (consumer-focused)
  monetization: {
    superChat: boolean;
    subscriptions: boolean;
    donations: boolean;
    tipping: boolean;
  };
  
  // Enterprise features
  enterprise: {
    customBranding: boolean;
    sso: boolean;
    analytics: boolean;
    multiTenant: boolean;
    apiAccess: boolean;
    webhooks: boolean;
    customDomains: boolean;
    whiteLabeling: boolean;
  };
  
  // Core streaming features
  streaming: {
    hls: boolean;
    webrtc: boolean;
    recording: boolean;
    transcoding: boolean;
    cdn: boolean;
  };
  
  // User management
  users: {
    profiles: boolean;
    roles: boolean;
    permissions: boolean;
    moderation: boolean;
  };
  
  // Chat and interaction
  chat: {
    enabled: boolean;
    moderation: boolean;
    emotes: boolean;
    mentions: boolean;
  };
  
  // Mobile features
  mobile: {
    responsiveStreaming: boolean;
    pushNotifications: boolean;
    offlineViewing: boolean;
  };
}

// Default feature flags for different tenant types
export const DEFAULT_ENTERPRISE_FLAGS: FeatureFlags = {
  monetization: {
    superChat: false,
    subscriptions: false,
    donations: false,
    tipping: false,
  },
  enterprise: {
    customBranding: true,
    sso: true,
    analytics: true,
    multiTenant: true,
    apiAccess: true,
    webhooks: true,
    customDomains: true,
    whiteLabeling: true,
  },
  streaming: {
    hls: true,
    webrtc: true,
    recording: true,
    transcoding: true,
    cdn: true,
  },
  users: {
    profiles: true,
    roles: true,
    permissions: true,
    moderation: true,
  },
  chat: {
    enabled: true,
    moderation: true,
    emotes: true,
    mentions: true,
  },
  mobile: {
    responsiveStreaming: true,
    pushNotifications: true,
    offlineViewing: true,
  },
};

export const DEFAULT_CONSUMER_FLAGS: FeatureFlags = {
  monetization: {
    superChat: true,
    subscriptions: true,
    donations: true,
    tipping: true,
  },
  enterprise: {
    customBranding: false,
    sso: false,
    analytics: true,
    multiTenant: false,
    apiAccess: false,
    webhooks: false,
    customDomains: false,
    whiteLabeling: false,
  },
  streaming: {
    hls: true,
    webrtc: true,
    recording: false,
    transcoding: true,
    cdn: true,
  },
  users: {
    profiles: true,
    roles: false,
    permissions: false,
    moderation: true,
  },
  chat: {
    enabled: true,
    moderation: true,
    emotes: true,
    mentions: true,
  },
  mobile: {
    responsiveStreaming: true,
    pushNotifications: true,
    offlineViewing: false,
  },
};

// Development flags (all features enabled for testing)
export const DEVELOPMENT_FLAGS: FeatureFlags = {
  monetization: {
    superChat: true,
    subscriptions: true,
    donations: true,
    tipping: true,
  },
  enterprise: {
    customBranding: true,
    sso: true,
    analytics: true,
    multiTenant: true,
    apiAccess: true,
    webhooks: true,
    customDomains: true,
    whiteLabeling: true,
  },
  streaming: {
    hls: true,
    webrtc: true,
    recording: true,
    transcoding: true,
    cdn: true,
  },
  users: {
    profiles: true,
    roles: true,
    permissions: true,
    moderation: true,
  },
  chat: {
    enabled: true,
    moderation: true,
    emotes: true,
    mentions: true,
  },
  mobile: {
    responsiveStreaming: true,
    pushNotifications: true,
    offlineViewing: true,
  },
};

// Environment-based feature flag selection
export const getDefaultFeatureFlags = (): FeatureFlags => {
  const env = process.env.NODE_ENV;
  const tenantType = process.env.VITE_TENANT_TYPE || 'enterprise';
  
  if (env === 'development') {
    return DEVELOPMENT_FLAGS;
  }
  
  switch (tenantType) {
    case 'consumer':
      return DEFAULT_CONSUMER_FLAGS;
    case 'enterprise':
    default:
      return DEFAULT_ENTERPRISE_FLAGS;
  }
};
