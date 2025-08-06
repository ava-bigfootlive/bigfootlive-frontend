// Theme and Branding System Types for BigfootLive

export interface ThemeConfig {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  isDefault: boolean;
  isCustom: boolean;
  version: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Color palette
  colors: ColorPalette;
  
  // Typography settings
  typography: TypographyConfig;
  
  // Component styling
  components: ComponentStyles;
  
  // Layout settings
  layout: LayoutConfig;
  
  // Branding assets
  branding: BrandingAssets;
  
  // Custom CSS
  customCSS?: string;
  
  // Theme metadata
  metadata?: Record<string, any>;
}

export interface ColorPalette {
  // Primary brand colors
  primary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string; // Main primary
    600: string;
    700: string;
    800: string;
    900: string;
    950: string;
  };
  
  // Secondary colors
  secondary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    950: string;
  };
  
  // Accent colors
  accent: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    950: string;
  };
  
  // Semantic colors
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Neutral colors
  background: string;
  foreground: string;
  muted: string;
  mutedForeground: string;
  border: string;
  input: string;
  ring: string;
  
  // Card colors
  card: string;
  cardForeground: string;
  
  // Popover colors
  popover: string;
  popoverForeground: string;
  
  // Destructive colors
  destructive: string;
  destructiveForeground: string;
}

export interface TypographyConfig {
  // Font families
  fontFamily: {
    sans: string[];
    serif: string[];
    mono: string[];
    display?: string[];
  };
  
  // Font sizes
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
    '5xl': string;
    '6xl': string;
    '7xl': string;
    '8xl': string;
    '9xl': string;
  };
  
  // Font weights
  fontWeight: {
    thin: number;
    extralight: number;
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
    extrabold: number;
    black: number;
  };
  
  // Line heights
  lineHeight: {
    none: number;
    tight: number;
    snug: number;
    normal: number;
    relaxed: number;
    loose: number;
  };
  
  // Letter spacing
  letterSpacing: {
    tighter: string;
    tight: string;
    normal: string;
    wide: string;
    wider: string;
    widest: string;
  };
}

export interface ComponentStyles {
  // Button styles
  button: {
    borderRadius: string;
    fontWeight: string;
    padding: {
      sm: string;
      md: string;
      lg: string;
    };
  };
  
  // Input styles
  input: {
    borderRadius: string;
    borderWidth: string;
    padding: string;
    fontSize: string;
  };
  
  // Card styles
  card: {
    borderRadius: string;
    borderWidth: string;
    shadow: string;
    padding: string;
  };
  
  // Navigation styles
  navigation: {
    height: string;
    padding: string;
    borderRadius: string;
  };
  
  // Modal/Dialog styles
  modal: {
    borderRadius: string;
    backdropBlur: string;
    shadow: string;
  };
}

export interface LayoutConfig {
  // Container settings
  container: {
    maxWidth: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
      '2xl': string;
    };
    padding: string;
  };
  
  // Spacing scale
  spacing: {
    px: string;
    0: string;
    0.5: string;
    1: string;
    1.5: string;
    2: string;
    2.5: string;
    3: string;
    3.5: string;
    4: string;
    5: string;
    6: string;
    7: string;
    8: string;
    9: string;
    10: string;
    11: string;
    12: string;
    14: string;
    16: string;
    20: string;
    24: string;
    28: string;
    32: string;
    36: string;
    40: string;
    44: string;
    48: string;
    52: string;
    56: string;
    60: string;
    64: string;
    72: string;
    80: string;
    96: string;
  };
  
  // Border radius scale
  borderRadius: {
    none: string;
    sm: string;
    DEFAULT: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    full: string;
  };
  
  // Shadow scale
  boxShadow: {
    sm: string;
    DEFAULT: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    inner: string;
    none: string;
  };
}

export interface BrandingAssets {
  // Logo variants
  logo: {
    primary: string; // Main logo URL
    white: string; // White version for dark backgrounds
    mark: string; // Icon/mark only
    text: string; // Text only version
    favicon: string; // Favicon URL
  };
  
  // Brand colors (hex values)
  brandColors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  
  // Background images/patterns
  backgrounds: {
    hero?: string;
    login?: string;
    dashboard?: string;
    pattern?: string;
  };
  
  // Custom assets
  customAssets: Record<string, string>;
}

export interface ThemePreset {
  id: string;
  name: string;
  displayName: string;
  description: string;
  preview: string; // Preview image URL
  category: 'light' | 'dark' | 'colorful' | 'minimal' | 'corporate';
  isPremium: boolean;
  config: Partial<ThemeConfig>;
}

export interface BrandingSettings {
  // Company information
  company: {
    name: string;
    tagline?: string;
    description?: string;
    website?: string;
    contactEmail?: string;
    supportEmail?: string;
  };
  
  // Platform customization
  platform: {
    name: string; // e.g., "Acme Live" instead of "BigfootLive"
    description: string;
    welcomeMessage?: string;
    footerText?: string;
  };
  
  // Navigation customization
  navigation: {
    showBranding: boolean;
    showPoweredBy: boolean;
    customLinks: NavigationLink[];
  };
  
  // Email templates
  emailTemplates: {
    headerColor: string;
    footerText: string;
    logo: string;
  };
  
  // Legal pages
  legal: {
    privacyPolicyUrl?: string;
    termsOfServiceUrl?: string;
    cookiePolicyUrl?: string;
    customPages: CustomPage[];
  };
  
  // Social media
  socialMedia: {
    twitter?: string;
    linkedin?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
  };
}

export interface NavigationLink {
  id: string;
  label: string;
  url: string;
  openInNewTab: boolean;
  position: 'header' | 'footer' | 'sidebar';
  order: number;
  isActive: boolean;
}

export interface CustomPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  isPublic: boolean;
  showInNav: boolean;
  order: number;
}

// Theme management types
export interface ThemeProvider {
  currentTheme: ThemeConfig;
  availableThemes: ThemeConfig[];
  presets: ThemePreset[];
  branding: BrandingSettings;
  
  // Methods
  setTheme: (themeId: string) => Promise<void>;
  createCustomTheme: (baseTheme: string, customizations: Partial<ThemeConfig>) => Promise<ThemeConfig>;
  updateTheme: (themeId: string, updates: Partial<ThemeConfig>) => Promise<ThemeConfig>;
  deleteTheme: (themeId: string) => Promise<void>;
  exportTheme: (themeId: string) => Promise<string>;
  importTheme: (themeData: string) => Promise<ThemeConfig>;
  resetToDefault: () => Promise<void>;
  
  // Branding methods
  updateBranding: (branding: Partial<BrandingSettings>) => Promise<BrandingSettings>;
  uploadAsset: (file: File, type: string) => Promise<string>;
  removeAsset: (assetId: string) => Promise<void>;
}

// CSS generation utilities
export interface CSSGenerator {
  generateCSS: (theme: ThemeConfig) => string;
  generateTailwindConfig: (theme: ThemeConfig) => object;
  generateColorVariables: (colors: ColorPalette) => Record<string, string>;
  generateTypographyVariables: (typography: TypographyConfig) => Record<string, string>;
}

// Theme validation
export interface ThemeValidator {
  validateTheme: (theme: ThemeConfig) => ValidationResult;
  validateColors: (colors: ColorPalette) => ValidationResult;
  validateContrast: (foreground: string, background: string) => number;
  validateAccessibility: (theme: ThemeConfig) => AccessibilityReport;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface AccessibilityReport {
  score: number; // 0-100
  issues: AccessibilityIssue[];
  recommendations: string[];
}

export interface AccessibilityIssue {
  type: 'contrast' | 'color_blindness' | 'readability';
  severity: 'low' | 'medium' | 'high';
  description: string;
  affectedComponents: string[];
  suggestion: string;
}

// Default theme configurations
export const DEFAULT_LIGHT_THEME: Partial<ThemeConfig> = {
  name: 'default-light',
  displayName: 'Default Light',
  description: 'Clean and modern light theme'
};

export const DEFAULT_DARK_THEME: Partial<ThemeConfig> = {
  name: 'default-dark',
  displayName: 'Default Dark',
  description: 'Elegant dark theme for low-light environments'
};

export const ENTERPRISE_THEME: Partial<ThemeConfig> = {
  name: 'enterprise',
  displayName: 'Enterprise',
  description: 'Professional theme optimized for business environments'
};
