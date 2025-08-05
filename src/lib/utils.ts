import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines clsx and tailwind-merge for optimal class merging
 * Ensures BigfootLive design tokens work seamlessly with shadcn/ui components
 * 
 * @param inputs - Class values to merge
 * @returns Merged and deduplicated class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Type-safe color token utility for BigfootLive design system
 * Ensures consistent usage of CSS custom properties
 */
export const colors = {
  // Core system colors using CSS variables from bigfootlive-theme.css
  primary: 'hsl(var(--primary))',
  accent: 'hsl(var(--accent))',
  background: 'hsl(var(--background))',
  foreground: 'hsl(var(--foreground))',
  card: 'hsl(var(--card))',
  border: 'hsl(var(--border))',
  input: 'hsl(var(--input))',
  ring: 'hsl(var(--ring))',
  
  // Semantic colors
  success: 'hsl(var(--success))',
  warning: 'hsl(var(--warning))',
  danger: 'hsl(var(--destructive))',
  info: 'hsl(var(--info))',
  
  // Streaming-specific colors
  live: 'hsl(var(--live))',
  offline: 'hsl(var(--offline))',
  scheduled: 'hsl(var(--scheduled))',
} as const

export type BigfootLiveColors = keyof typeof colors
