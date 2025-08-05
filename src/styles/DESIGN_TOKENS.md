# BigfootLive Design Tokens

This document outlines the comprehensive design token system for the BigfootLive streaming platform. These tokens provide a consistent, scalable foundation for all visual design decisions.

## Overview

The design token system supports:
- ✅ Light and dark themes with CSS variables
- ✅ Comprehensive color palette (brand, accent, neutral, semantic)
- ✅ Typography scale with consistent line heights
- ✅ Border radius, shadow, and spacing scales
- ✅ Z-index system for layering
- ✅ TypeScript exports for JavaScript consumption

## Color System

### Brand Colors (Purple)
Primary brand color with full scale from 50-950:
```tsx
// Tailwind CSS classes
className="bg-brand-500 text-brand-foreground"
className="bg-brand-50 border-brand-200"

// JavaScript/TypeScript
import { themeTokens } from '../styles/themeTokens'
const brandColor = themeTokens.colors.brand[500]
```

### Accent Colors (Pink/Magenta)
Accent color for highlights and call-to-action elements:
```tsx
className="bg-accent-500 hover:bg-accent-600"
className="text-accent-400 border-accent-200"
```

### Semantic Colors
#### Success (Green)
```tsx
className="bg-success-500 text-success-foreground"
className="text-success-600 border-success-200"
```

#### Warning (Yellow/Orange)
```tsx
className="bg-warning-500 text-warning-foreground"
className="text-warning-600 border-warning-200"
```

#### Danger/Destructive (Red)
```tsx
className="bg-danger-500 text-danger-foreground"
className="bg-destructive hover:bg-destructive/90"
```

#### Info (Blue)
```tsx
className="bg-info-500 text-info-foreground"
className="text-info-600 border-info-200"
```

### Neutral Colors
Gray scale for subtle elements:
```tsx
className="bg-neutral-50 text-neutral-900"
className="bg-neutral-800 text-neutral-100"
```

### Streaming-Specific Colors
```tsx
// Live streaming indicator
className="bg-live text-live-foreground"
className="shadow-neon-live" // Custom neon glow effect

// Stream status
className="text-stream-offline" // Gray for offline
className="text-stream-scheduled" // Yellow for scheduled
className="text-stream-quality" // Blue for quality indicators
className="text-stream-viewers" // Green for viewer count
```

## Typography Scale

### Font Sizes
All sizes include optimized line heights:
```tsx
className="text-xs" // 12px / 16px line-height
className="text-sm" // 14px / 20px line-height
className="text-base" // 16px / 24px line-height
className="text-lg" // 18px / 28px line-height
className="text-xl" // 20px / 28px line-height
// ... up to text-8xl (96px)
```

### Font Families
```tsx
className="font-sans" // Inter, system-ui, sans-serif
className="font-mono" // JetBrains Mono, monospace
className="font-display" // Inter, system-ui (for headings)
```

## Border Radius Scale

```tsx
className="rounded-xs" // 2px
className="rounded-sm" // 4px
className="rounded" // 6px (default)
className="rounded-md" // 8px
className="rounded-lg" // 12px
className="rounded-xl" // 16px
className="rounded-2xl" // 24px
className="rounded-3xl" // 32px
className="rounded-full" // 9999px

// CSS variable-based (responsive to theme)
className="rounded-radius" // var(--radius)
className="rounded-radius-sm" // calc(var(--radius) - 2px)
className="rounded-radius-lg" // calc(var(--radius) + 2px)
```

## Shadow System

### Standard Shadows
```tsx
className="shadow-xs" // Subtle
className="shadow-sm" // Small
className="shadow" // Default
className="shadow-md" // Medium
className="shadow-lg" // Large
className="shadow-xl" // Extra large
className="shadow-2xl" // Very large
```

### Custom Shadows
```tsx
className="shadow-glow" // Brand color glow
className="shadow-glow-accent" // Accent color glow
className="shadow-soft" // Soft, subtle shadow
className="shadow-neon" // Neon effect with brand colors
className="shadow-neon-live" // Neon effect for live indicators
```

## Z-Index System

Semantic z-index values for consistent layering:
```tsx
className="z-hide" // -1
className="z-base" // 0
className="z-docked" // 10 (for sticky elements)
className="z-dropdown" // 1000
className="z-overlay" // 1040
className="z-modal" // 1050
className="z-popover" // 1060
className="z-toast" // 1080
className="z-tooltip" // 1090
```

## Spacing Scale

Extended spacing scale with half-sizes:
```tsx
className="p-0.5" // 2px
className="p-1.5" // 6px
className="p-2.5" // 10px
className="p-3.5" // 14px
// ... includes all standard Tailwind spacing plus extras
```

## Animations

### Built-in Animations
```tsx
className="animate-live-pulse" // Pulsing effect for live indicators
className="animate-slide-in" // Slide in from bottom
className="animate-fade-in" // Fade in
className="animate-scale-in" // Scale and fade in
className="animate-blob" // Blob animation for auth pages
className="animate-viewer-count" // Bounce effect for viewer count updates
className="animate-skeleton" // Loading skeleton animation
```

### Animation Delays
```tsx
className="delay-75" // 75ms
className="delay-100" // 100ms
className="delay-200" // 200ms
className="delay-500" // 500ms
className="delay-1000" // 1s
className="delay-2000" // 2s
className="delay-4000" // 4s
```

## Custom Utility Classes

### Glass Morphism
```tsx
className="glass" // Backdrop blur with transparent background
```

### Gradient Text
```tsx
className="gradient-text" // Brand gradient text effect
```

### Live Indicator
```tsx
className="live-indicator" // Pulsating live dot
```

### Stream Card Effects
```tsx
className="stream-card-hover" // Hover effect for stream cards
```

### Video Quality Badges
```tsx
className="quality-badge-4k" // 4K quality badge
className="quality-badge-hd" // HD quality badge  
className="quality-badge-sd" // SD quality badge
```

### Scrollbar Styling
```tsx
className="custom-scrollbar" // Custom styled scrollbars
```

## Usage in TypeScript/JavaScript

```tsx
import { themeTokens, type ThemeTokens } from '../styles/themeTokens'

// Access colors
const primaryColor = themeTokens.colors.brand.DEFAULT
const accentColor = themeTokens.colors.accent[500]

// Access typography
const headingSize = themeTokens.fontSize['2xl']
const sansFont = themeTokens.fontFamily.sans

// Access shadows
const glowShadow = themeTokens.boxShadow.glow

// Use in styled components or inline styles
const buttonStyle = {
  backgroundColor: themeTokens.colors.brand.DEFAULT,
  borderRadius: themeTokens.borderRadius.md,
  boxShadow: themeTokens.boxShadow.glow,
}
```

## Theme Switching

The system supports automatic light/dark mode switching:

```tsx
// Toggle theme (assuming you have a theme provider)
const { theme, setTheme } = useTheme()

return (
  <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
    Toggle Theme
  </button>
)
```

## CSS Variables

All colors are CSS variables that automatically switch with themes:

```css
/* Dark theme (default) */
:root {
  --primary: 271 91% 65%;
  --accent: 328 85% 70%;
  --background: 0 0% 4%;
  /* ... */
}

/* Light theme */
.light {
  --primary: 271 91% 55%;
  --accent: 328 85% 60%;
  --background: 0 0% 100%;
  /* ... */
}
```

## Best Practices

1. **Use semantic tokens**: Prefer `success`, `warning`, `danger` over specific colors
2. **Leverage CSS variables**: Colors automatically adapt to theme changes
3. **Consistent spacing**: Use the spacing scale for margins, padding, gaps
4. **Typography hierarchy**: Use the font size scale consistently
5. **Layer with z-index**: Use semantic z-index values for predictable layering
6. **Animation performance**: Use the provided animations for consistent feel

## Streaming Platform Specific

### Live Indicators
```tsx
<div className="flex items-center gap-2">
  <div className="w-2 h-2 bg-live rounded-full live-indicator" />
  <span className="text-live-foreground">LIVE</span>
</div>
```

### Stream Status
```tsx
// Offline
<span className="text-stream-offline">Offline</span>

// Scheduled
<span className="text-stream-scheduled">Scheduled</span>

// Live with glow effect
<div className="bg-live text-live-foreground px-3 py-1 rounded-full shadow-neon-live">
  LIVE
</div>
```

### Quality Badges
```tsx
<span className="quality-badge-4k">4K</span>
<span className="quality-badge-hd">HD</span>
<span className="quality-badge-sd">SD</span>
```

This design token system provides a solid foundation for building a consistent, accessible, and visually appealing streaming platform interface.
