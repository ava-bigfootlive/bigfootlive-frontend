import { themeTokens } from './themeTokens'

/**
 * Utility functions for working with BigfootLive design tokens
 */

// Type for available color variants
type ColorVariant = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 | 'DEFAULT' | 'foreground'

/**
 * Get a specific color from the theme tokens
 * @param colorName - The color name (e.g., 'brand', 'accent', 'success')
 * @param variant - The color variant (50-950, DEFAULT, foreground)
 * @returns The HSL color string
 */
export function getColor(colorName: keyof typeof themeTokens.colors, variant: ColorVariant = 'DEFAULT'): string {
  const colorGroup = themeTokens.colors[colorName]
  
  if (typeof colorGroup === 'string') {
    return colorGroup
  }
  
  if (typeof colorGroup === 'object' && colorGroup !== null) {
    return colorGroup[variant as keyof typeof colorGroup] || colorGroup.DEFAULT || ''
  }
  
  return ''
}

/**
 * Get a font size with its line height
 * @param size - The font size name (e.g., 'xs', 'sm', 'base', '2xl')
 * @returns An object with fontSize and lineHeight
 */
export function getFontSize(size: keyof typeof themeTokens.fontSize) {
  const [fontSize, { lineHeight }] = themeTokens.fontSize[size]
  return { fontSize, lineHeight }
}

/**
 * Get a font family array
 * @param family - The font family name ('sans', 'mono', 'display')
 * @returns The font family array
 */
export function getFontFamily(family: keyof typeof themeTokens.fontFamily): string[] {
  return themeTokens.fontFamily[family]
}

/**
 * Get a border radius value
 * @param radius - The radius name ('xs', 'sm', 'md', 'lg', etc.)
 * @returns The border radius string
 */
export function getBorderRadius(radius: keyof typeof themeTokens.borderRadius): string {
  return themeTokens.borderRadius[radius]
}

/**
 * Get a box shadow value
 * @param shadow - The shadow name ('xs', 'sm', 'lg', 'glow', 'neon', etc.)
 * @returns The box shadow string
 */
export function getBoxShadow(shadow: keyof typeof themeTokens.boxShadow): string {
  return themeTokens.boxShadow[shadow]
}

/**
 * Get a z-index value
 * @param layer - The z-index name ('dropdown', 'modal', 'tooltip', etc.)
 * @returns The z-index value
 */
export function getZIndex(layer: keyof typeof themeTokens.zIndex): string | number {
  return themeTokens.zIndex[layer]
}

/**
 * Get a spacing value
 * @param space - The spacing name ('0.5', '1.5', '2.5', etc.)
 * @returns The spacing string in rem
 */
export function getSpacing(space: keyof typeof themeTokens.spacing): string {
  return themeTokens.spacing[space]
}

/**
 * Create a CSS custom property (CSS variable) name
 * @param name - The property name
 * @returns The CSS custom property string
 */
export function cssVar(name: string): string {
  return `var(--${name})`
}

/**
 * Create an HSL color with CSS variable
 * @param variable - The CSS variable name (without --)
 * @returns HSL color string using CSS variable
 */
export function hslVar(variable: string): string {
  return `hsl(var(--${variable}))`
}

/**
 * Create an HSL color with CSS variable and opacity
 * @param variable - The CSS variable name (without --)
 * @param opacity - The opacity value (0-1)
 * @returns HSL color string with opacity
 */
export function hslVarWithOpacity(variable: string, opacity: number): string {
  return `hsl(var(--${variable}) / ${opacity})`
}

/**
 * Streaming-specific color helpers
 */
export const streamingColors = {
  live: () => hslVar('live'),
  liveGlow: () => hslVar('live-glow'),
  offline: () => hslVar('offline'),
  scheduled: () => hslVar('scheduled'),
  viewers: () => hslVar('viewer-count'),
  quality: () => hslVar('stream-quality'),
}

/**
 * Chart color helpers
 */
export const chartColors = {
  1: () => hslVar('chart-1'),
  2: () => hslVar('chart-2'),
  3: () => hslVar('chart-3'),
  4: () => hslVar('chart-4'),
  5: () => hslVar('chart-5'),
}

/**
 * Common color combinations for UI elements
 */
export const colorCombinations = {
  button: {
    primary: {
      background: getColor('brand', 'DEFAULT'),
      foreground: getColor('brand', 'foreground'),
      hover: getColor('brand', 600),
    },
    secondary: {
      background: getColor('secondary', 'DEFAULT'),
      foreground: getColor('secondary', 'foreground'),
      hover: getColor('accent', 'DEFAULT'),
    },
    success: {
      background: getColor('success', 'DEFAULT'),
      foreground: getColor('success', 'foreground'),
      hover: getColor('success', 600),
    },
    warning: {
      background: getColor('warning', 'DEFAULT'),
      foreground: getColor('warning', 'foreground'),
      hover: getColor('warning', 600),
    },
    danger: {
      background: getColor('destructive', 'DEFAULT'),
      foreground: getColor('destructive', 'foreground'),
      hover: getColor('destructive', 600),
    },
  },
  card: {
    background: hslVar('card'),
    foreground: hslVar('card-foreground'),
    border: hslVar('border'),
  },
  input: {
    background: hslVar('input'),
    foreground: hslVar('foreground'),
    border: hslVar('border'),
    ring: hslVar('ring'),
  },
}

/**
 * Animation utility
 */
export const animations = {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
}

/**
 * Responsive breakpoints (matching Tailwind defaults)
 */
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
}

export default {
  getColor,
  getFontSize,
  getFontFamily,
  getBorderRadius,
  getBoxShadow,
  getZIndex,
  getSpacing,
  cssVar,
  hslVar,
  hslVarWithOpacity,
  streamingColors,
  chartColors,
  colorCombinations,
  animations,
  breakpoints,
}
