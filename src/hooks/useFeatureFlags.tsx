import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FeatureFlags, getDefaultFeatureFlags } from '@/config/features';
import { apiService } from '@/services/api';

interface FeatureFlagsContextType {
  flags: FeatureFlags;
  isLoading: boolean;
  updateFlags: (newFlags: Partial<FeatureFlags>) => void;
  isFeatureEnabled: (path: string) => boolean;
}

const FeatureFlagsContext = createContext<FeatureFlagsContextType | undefined>(undefined);

interface FeatureFlagsProviderProps {
  children: ReactNode;
  tenantId?: string;
}

export const FeatureFlagsProvider: React.FC<FeatureFlagsProviderProps> = ({ 
  children, 
  tenantId 
}) => {
  const [flags, setFlags] = useState<FeatureFlags>(getDefaultFeatureFlags());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFeatureFlags();
  }, [tenantId]);

  const loadFeatureFlags = async () => {
    setIsLoading(true);
    
    try {
      // Try to load feature flags from API (tenant-specific if tenantId provided)
      let response;
      if (tenantId) {
        response = await apiService.getTenantFeatureFlags(tenantId);
      } else {
        response = await apiService.getFeatureFlags();
      }
      
      if (response.success && response.data) {
        setFlags({
          ...getDefaultFeatureFlags(),
          ...response.data
        });
      }
    } catch (error) {
      console.warn('Failed to load feature flags from API, using defaults:', error);
      // Use default flags if API call fails
      setFlags(getDefaultFeatureFlags());
    } finally {
      setIsLoading(false);
    }
  };

  const updateFlags = async (newFlags: Partial<FeatureFlags>) => {
    try {
      const updatedFlags = { ...flags, ...newFlags };
      
      // Update on server if possible
      if (tenantId) {
        await apiService.updateTenantFeatureFlags(tenantId, newFlags);
      } else {
        await apiService.updateFeatureFlags(newFlags);
      }
      
      setFlags(updatedFlags);
    } catch (error) {
      console.error('Failed to update feature flags:', error);
      // Still update locally even if server update fails
      setFlags({ ...flags, ...newFlags });
    }
  };

  // Helper function to check if a feature is enabled using dot notation
  // e.g., isFeatureEnabled('monetization.superChat')
  const isFeatureEnabled = (path: string): boolean => {
    const keys = path.split('.');
    let current: any = flags;
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return false;
      }
    }
    
    return Boolean(current);
  };

  const value: FeatureFlagsContextType = {
    flags,
    isLoading,
    updateFlags,
    isFeatureEnabled,
  };

  return (
    <FeatureFlagsContext.Provider value={value}>
      {children}
    </FeatureFlagsContext.Provider>
  );
};

// Hook to use feature flags
export const useFeatureFlags = (): FeatureFlagsContextType => {
  const context = useContext(FeatureFlagsContext);
  if (context === undefined) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagsProvider');
  }
  return context;
};

// Convenience hooks for specific feature categories
export const useMonetizationFlags = () => {
  const { flags } = useFeatureFlags();
  return flags.monetization;
};

export const useEnterpriseFlags = () => {
  const { flags } = useFeatureFlags();
  return flags.enterprise;
};

export const useStreamingFlags = () => {
  const { flags } = useFeatureFlags();
  return flags.streaming;
};

export const useUserFlags = () => {
  const { flags } = useFeatureFlags();
  return flags.users;
};

export const useChatFlags = () => {
  const { flags } = useFeatureFlags();
  return flags.chat;
};

export const useMobileFlags = () => {
  const { flags } = useFeatureFlags();
  return flags.mobile;
};

// HOC for feature-gated components
export function withFeatureFlag<P extends object>(
  Component: React.ComponentType<P>,
  featurePath: string,
  fallback?: React.ComponentType<P> | null
) {
  return function FeatureGatedComponent(props: P) {
    const { isFeatureEnabled } = useFeatureFlags();
    
    if (!isFeatureEnabled(featurePath)) {
      if (fallback) {
        const FallbackComponent = fallback;
        return <FallbackComponent {...props} />;
      }
      return null;
    }
    
    return <Component {...props} />;
  };
}

// Component for conditional rendering based on feature flags
interface FeatureGateProps {
  feature: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({ 
  feature, 
  fallback = null, 
  children 
}) => {
  const { isFeatureEnabled } = useFeatureFlags();
  
  if (!isFeatureEnabled(feature)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};
