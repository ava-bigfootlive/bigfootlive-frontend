export { ThemeCustomizer } from './ThemeCustomizer';

// Re-export theme types and hooks
export type { 
  ThemeConfig, 
  ColorPalette, 
  BrandingSettings, 
  ThemePreset,
  TypographyConfig,
  ComponentStyles,
  LayoutConfig,
  BrandingAssets
} from '@/types/theme';

export { 
  useTheme, 
  useCurrentTheme, 
  useBranding, 
  useThemeColors, 
  useThemeTypography,
  ThemeProvider 
} from '@/hooks/useTheme';
