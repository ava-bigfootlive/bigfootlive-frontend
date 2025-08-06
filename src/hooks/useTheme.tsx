import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeConfig, BrandingSettings, ThemeProvider as ThemeProviderType } from '@/types/theme';
import { apiService } from '@/services/api';

// Default theme configurations
const DEFAULT_THEME: ThemeConfig = {
  id: 'default-light',
  name: 'default-light',
  displayName: 'Default Light',
  description: 'Clean and modern light theme',
  isDefault: true,
  isCustom: false,
  version: '1.0.0',
  createdAt: new Date(),
  updatedAt: new Date(),
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
      950: '#172554'
    },
    secondary: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
      950: '#020617'
    },
    accent: {
      50: '#fdf4ff',
      100: '#fae8ff',
      200: '#f5d0fe',
      300: '#f0abfc',
      400: '#e879f9',
      500: '#d946ef',
      600: '#c026d3',
      700: '#a21caf',
      800: '#86198f',
      900: '#701a75',
      950: '#4a044e'
    },
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    background: '#ffffff',
    foreground: '#0f172a',
    muted: '#f1f5f9',
    mutedForeground: '#64748b',
    border: '#e2e8f0',
    input: '#e2e8f0',
    ring: '#3b82f6',
    card: '#ffffff',
    cardForeground: '#0f172a',
    popover: '#ffffff',
    popoverForeground: '#0f172a',
    destructive: '#ef4444',
    destructiveForeground: '#ffffff'
  },
  typography: {
    fontFamily: {
      sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      serif: ['ui-serif', 'Georgia', 'serif'],
      mono: ['ui-monospace', 'SFMono-Regular', 'monospace']
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem',
      '7xl': '4.5rem',
      '8xl': '6rem',
      '9xl': '8rem'
    },
    fontWeight: {
      thin: 100,
      extralight: 200,
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900
    },
    lineHeight: {
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2
    },
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em'
    }
  },
  components: {
    button: {
      borderRadius: '0.375rem',
      fontWeight: '500',
      padding: {
        sm: '0.5rem 0.875rem',
        md: '0.625rem 1.25rem',
        lg: '0.75rem 1.5rem'
      }
    },
    input: {
      borderRadius: '0.375rem',
      borderWidth: '1px',
      padding: '0.625rem 0.75rem',
      fontSize: '0.875rem'
    },
    card: {
      borderRadius: '0.5rem',
      borderWidth: '1px',
      shadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
      padding: '1.5rem'
    },
    navigation: {
      height: '4rem',
      padding: '0 1.5rem',
      borderRadius: '0'
    },
    modal: {
      borderRadius: '0.75rem',
      backdropBlur: '8px',
      shadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)'
    }
  },
  layout: {
    container: {
      maxWidth: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px'
      },
      padding: '1rem'
    },
    spacing: {
      px: '1px',
      0: '0px',
      0.5: '0.125rem',
      1: '0.25rem',
      1.5: '0.375rem',
      2: '0.5rem',
      2.5: '0.625rem',
      3: '0.75rem',
      3.5: '0.875rem',
      4: '1rem',
      5: '1.25rem',
      6: '1.5rem',
      7: '1.75rem',
      8: '2rem',
      9: '2.25rem',
      10: '2.5rem',
      11: '2.75rem',
      12: '3rem',
      14: '3.5rem',
      16: '4rem',
      20: '5rem',
      24: '6rem',
      28: '7rem',
      32: '8rem',
      36: '9rem',
      40: '10rem',
      44: '11rem',
      48: '12rem',
      52: '13rem',
      56: '14rem',
      60: '15rem',
      64: '16rem',
      72: '18rem',
      80: '20rem',
      96: '24rem'
    },
    borderRadius: {
      none: '0',
      sm: '0.125rem',
      DEFAULT: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      '2xl': '1rem',
      '3xl': '1.5rem',
      full: '9999px'
    },
    boxShadow: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
      inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
      none: '0 0 #0000'
    }
  },
  branding: {
    logo: {
      primary: '/logo.svg',
      white: '/logo-white.svg',
      mark: '/logo-mark.svg',
      text: '/logo-text.svg',
      favicon: '/favicon.ico'
    },
    brandColors: {
      primary: '#3b82f6',
      secondary: '#64748b',
      accent: '#d946ef'
    },
    backgrounds: {},
    customAssets: {}
  }
};

const DEFAULT_BRANDING: BrandingSettings = {
  company: {
    name: 'BigfootLive',
    tagline: 'Enterprise Live Streaming Platform',
    description: 'Professional live streaming for modern organizations'
  },
  platform: {
    name: 'BigfootLive',
    description: 'Enterprise Live Streaming Platform'
  },
  navigation: {
    showBranding: true,
    showPoweredBy: false,
    customLinks: []
  },
  emailTemplates: {
    headerColor: '#3b82f6',
    footerText: 'Powered by BigfootLive',
    logo: '/logo.svg'
  },
  legal: {
    customPages: []
  },
  socialMedia: {}
};

interface ThemeContextType extends ThemeProviderType {
  isLoading: boolean;
  applyTheme: (theme: ThemeConfig) => void;
  generateCSS: (theme: ThemeConfig) => string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  tenantId?: string;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  tenantId 
}) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(DEFAULT_THEME);
  const [availableThemes, setAvailableThemes] = useState<ThemeConfig[]>([]);
  const [presets, setPresets] = useState([]);
  const [branding, setBranding] = useState<BrandingSettings>(DEFAULT_BRANDING);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadThemeData();
  }, [tenantId]);

  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme]);

  const loadThemeData = async () => {
    setIsLoading(true);
    try {
      // Load theme configuration
      let themeResponse;
      if (tenantId) {
        themeResponse = await apiService.getTenantTheme(tenantId);
      } else {
        themeResponse = await apiService.getCurrentTheme();
      }

      if (themeResponse.success && themeResponse.data) {
        setCurrentTheme({ ...DEFAULT_THEME, ...themeResponse.data });
      }

      // Load available themes
      const themesResponse = await apiService.getAvailableThemes();
      if (themesResponse.success) {
        setAvailableThemes(themesResponse.data);
      }

      // Load branding settings
      let brandingResponse;
      if (tenantId) {
        brandingResponse = await apiService.getTenantBranding(tenantId);
      } else {
        brandingResponse = await apiService.getBrandingSettings();
      }

      if (brandingResponse.success && brandingResponse.data) {
        setBranding({ ...DEFAULT_BRANDING, ...brandingResponse.data });
      }

      // Load theme presets
      const presetsResponse = await apiService.getThemePresets();
      if (presetsResponse.success) {
        setPresets(presetsResponse.data);
      }
    } catch (error) {
      console.warn('Failed to load theme data, using defaults:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyTheme = (theme: ThemeConfig) => {
    // Generate CSS custom properties
    const css = generateCSS(theme);
    
    // Create or update style element
    let styleElement = document.getElementById('theme-variables');
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'theme-variables';
      document.head.appendChild(styleElement);
    }
    
    styleElement.textContent = css;

    // Update document title and meta tags if branding is customized
    if (branding.platform.name !== 'BigfootLive') {
      document.title = branding.platform.name;
    }

    // Update favicon
    const favicon = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
    if (favicon && theme.branding.logo.favicon) {
      favicon.href = theme.branding.logo.favicon;
    }
  };

  const generateCSS = (theme: ThemeConfig): string => {
    const { colors, typography, layout, components } = theme;
    
    let css = ':root {\n';
    
    // Color variables
    Object.entries(colors).forEach(([key, value]) => {
      if (typeof value === 'object') {
        Object.entries(value).forEach(([shade, color]) => {
          css += `  --color-${key}-${shade}: ${color};\n`;
        });
      } else {
        css += `  --color-${key}: ${value};\n`;
      }
    });
    
    // Typography variables
    css += '\n  /* Typography */\n';
    css += `  --font-sans: ${typography.fontFamily.sans.join(', ')};\n`;
    css += `  --font-serif: ${typography.fontFamily.serif.join(', ')};\n`;
    css += `  --font-mono: ${typography.fontFamily.mono.join(', ')};\n`;
    
    // Font sizes
    Object.entries(typography.fontSize).forEach(([key, value]) => {
      css += `  --text-${key}: ${value};\n`;
    });
    
    // Layout variables
    css += '\n  /* Layout */\n';
    Object.entries(layout.spacing).forEach(([key, value]) => {
      css += `  --spacing-${key}: ${value};\n`;
    });
    
    Object.entries(layout.borderRadius).forEach(([key, value]) => {
      const varName = key === 'DEFAULT' ? 'radius' : `radius-${key}`;
      css += `  --${varName}: ${value};\n`;
    });
    
    // Component variables
    css += '\n  /* Components */\n';
    css += `  --button-radius: ${components.button.borderRadius};\n`;
    css += `  --input-radius: ${components.input.borderRadius};\n`;
    css += `  --card-radius: ${components.card.borderRadius};\n`;
    
    css += '}\n';

    // Dark mode overrides (if theme supports it)
    if (theme.name.includes('dark')) {
      css += '\n@media (prefers-color-scheme: dark) {\n';
      css += '  :root {\n';
      // Add dark mode color overrides here
      css += '  }\n';
      css += '}\n';
    }

    // Custom CSS
    if (theme.customCSS) {
      css += '\n' + theme.customCSS + '\n';
    }

    return css;
  };

  const setTheme = async (themeId: string): Promise<void> => {
    try {
      const theme = availableThemes.find(t => t.id === themeId);
      if (theme) {
        setCurrentTheme(theme);
        
        // Save theme preference
        if (tenantId) {
          await apiService.updateTenantTheme(tenantId, themeId);
        } else {
          await apiService.setCurrentTheme(themeId);
        }
      }
    } catch (error) {
      console.error('Failed to set theme:', error);
    }
  };

  const createCustomTheme = async (
    baseTheme: string, 
    customizations: Partial<ThemeConfig>
  ): Promise<ThemeConfig> => {
    try {
      const response = await apiService.createCustomTheme({
        baseTheme,
        customizations
      });
      
      if (response.success) {
        setAvailableThemes([...availableThemes, response.data]);
        return response.data;
      }
      
      throw new Error('Failed to create theme');
    } catch (error) {
      console.error('Failed to create custom theme:', error);
      throw error;
    }
  };

  const updateTheme = async (
    themeId: string, 
    updates: Partial<ThemeConfig>
  ): Promise<ThemeConfig> => {
    try {
      const response = await apiService.updateTheme(themeId, updates);
      
      if (response.success) {
        const updatedThemes = availableThemes.map(theme => 
          theme.id === themeId ? response.data : theme
        );
        setAvailableThemes(updatedThemes);
        
        if (currentTheme.id === themeId) {
          setCurrentTheme(response.data);
        }
        
        return response.data;
      }
      
      throw new Error('Failed to update theme');
    } catch (error) {
      console.error('Failed to update theme:', error);
      throw error;
    }
  };

  const deleteTheme = async (themeId: string): Promise<void> => {
    try {
      await apiService.deleteTheme(themeId);
      setAvailableThemes(availableThemes.filter(theme => theme.id !== themeId));
      
      if (currentTheme.id === themeId) {
        setCurrentTheme(DEFAULT_THEME);
      }
    } catch (error) {
      console.error('Failed to delete theme:', error);
      throw error;
    }
  };

  const exportTheme = async (themeId: string): Promise<string> => {
    try {
      const response = await apiService.exportTheme(themeId);
      if (response.success) {
        return JSON.stringify(response.data, null, 2);
      }
      throw new Error('Failed to export theme');
    } catch (error) {
      console.error('Failed to export theme:', error);
      throw error;
    }
  };

  const importTheme = async (themeData: string): Promise<ThemeConfig> => {
    try {
      const parsedTheme = JSON.parse(themeData);
      const response = await apiService.importTheme(parsedTheme);
      
      if (response.success) {
        setAvailableThemes([...availableThemes, response.data]);
        return response.data;
      }
      
      throw new Error('Failed to import theme');
    } catch (error) {
      console.error('Failed to import theme:', error);
      throw error;
    }
  };

  const resetToDefault = async (): Promise<void> => {
    try {
      setCurrentTheme(DEFAULT_THEME);
      
      if (tenantId) {
        await apiService.resetTenantTheme(tenantId);
      } else {
        await apiService.resetTheme();
      }
    } catch (error) {
      console.error('Failed to reset theme:', error);
    }
  };

  const updateBranding = async (
    brandingUpdates: Partial<BrandingSettings>
  ): Promise<BrandingSettings> => {
    try {
      const updatedBranding = { ...branding, ...brandingUpdates };
      setBranding(updatedBranding);
      
      let response;
      if (tenantId) {
        response = await apiService.updateTenantBranding(tenantId, brandingUpdates);
      } else {
        response = await apiService.updateBrandingSettings(brandingUpdates);
      }
      
      if (response.success) {
        return response.data;
      }
      
      return updatedBranding;
    } catch (error) {
      console.error('Failed to update branding:', error);
      throw error;
    }
  };

  const uploadAsset = async (file: File, type: string): Promise<string> => {
    try {
      const response = await apiService.uploadBrandingAsset(file, type);
      if (response.success) {
        return response.data.url;
      }
      throw new Error('Failed to upload asset');
    } catch (error) {
      console.error('Failed to upload asset:', error);
      throw error;
    }
  };

  const removeAsset = async (assetId: string): Promise<void> => {
    try {
      await apiService.removeBrandingAsset(assetId);
    } catch (error) {
      console.error('Failed to remove asset:', error);
      throw error;
    }
  };

  const contextValue: ThemeContextType = {
    currentTheme,
    availableThemes,
    presets,
    branding,
    isLoading,
    setTheme,
    createCustomTheme,
    updateTheme,
    deleteTheme,
    exportTheme,
    importTheme,
    resetToDefault,
    updateBranding,
    uploadAsset,
    removeAsset,
    applyTheme,
    generateCSS
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook to use theme
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Convenience hooks
export const useCurrentTheme = () => {
  const { currentTheme } = useTheme();
  return currentTheme;
};

export const useBranding = () => {
  const { branding } = useTheme();
  return branding;
};

export const useThemeColors = () => {
  const { currentTheme } = useTheme();
  return currentTheme.colors;
};

export const useThemeTypography = () => {
  const { currentTheme } = useTheme();
  return currentTheme.typography;
};
