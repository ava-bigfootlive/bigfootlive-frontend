# BigfootLive Design Tokens Implementation

This directory contains the complete design token system for the BigfootLive streaming platform, providing a comprehensive foundation for consistent UI design and development.

## 📁 Files Structure

```
src/styles/
├── themes/
│   └── bigfootlive-theme.css      # CSS variables for light/dark themes
├── themeTokens.ts                 # TypeScript interface and token exports
├── themeUtils.ts                  # Utility functions for token access
├── DESIGN_TOKENS.md               # Comprehensive documentation
└── README.md                      # This file
```

## ✅ Implementation Status

### Core Design Tokens
- **✅ Color Palette**: Complete brand, accent, neutral, and semantic colors
- **✅ Typography Scale**: Font sizes, line heights, and font families
- **✅ Border Radius**: Comprehensive radius scale with CSS variable support
- **✅ Shadow System**: Standard and custom shadows (glow, neon effects)
- **✅ Z-Index Scale**: Semantic layering system
- **✅ Spacing Scale**: Extended spacing with half-sizes

### Theme Support
- **✅ Light & Dark Modes**: CSS variables with automatic switching
- **✅ CSS Variables**: All colors use CSS custom properties
- **✅ Streaming-Specific**: Live indicators, stream status colors
- **✅ Animation System**: Custom animations for streaming platform

### TypeScript Integration
- **✅ Type Definitions**: Complete TypeScript interfaces
- **✅ Token Exports**: All tokens available for JS consumption
- **✅ Utility Functions**: Helper functions for accessing tokens
- **✅ Type Safety**: Full TypeScript support with IntelliSense

## 🎨 Design Token Categories

### Colors
- **Brand Colors**: Purple (271° 91% 65%) - Primary brand identity
- **Accent Colors**: Pink/Magenta (328° 85% 70%) - Call-to-action elements
- **Neutral Colors**: Gray scale (0° 0% 4% to 98%) - Text and subtle elements
- **Semantic Colors**: Success (Green), Warning (Yellow), Danger (Red), Info (Blue)
- **Streaming Colors**: Live (Red), Offline (Gray), Scheduled (Yellow), Quality indicators

### Typography
- **Font Sizes**: xs (12px) to 8xl (96px) with optimized line heights
- **Font Families**: Inter (sans), JetBrains Mono (mono), Inter Display (headings)
- **Line Heights**: Consistent spacing for better readability

### Layout
- **Border Radius**: xs (2px) to 3xl (32px) + CSS variable-based responsive radius
- **Shadows**: Standard shadows + custom effects (glow, neon, soft)
- **Z-Index**: Semantic layering (dropdown: 1000, modal: 1050, tooltip: 1090)
- **Spacing**: Extended scale with half-sizes (0.5 = 2px to 96 = 384px)

### Animations
- **Keyframes**: Live pulse, slide-in, fade-in, scale-in, blob, skeleton loading
- **Durations**: Fast (150ms), normal (300ms), slow (500ms)
- **Delays**: 75ms to 4000ms for staggered animations

## 🛠 Usage Examples

### Tailwind CSS Classes
```tsx
// Brand colors
className="bg-brand-500 text-brand-foreground hover:bg-brand-600"

// Semantic colors
className="bg-success-500 text-success-foreground"
className="border-warning-200 text-warning-600"

// Streaming-specific
className="bg-live text-live-foreground shadow-neon-live"
className="text-stream-offline" // Gray for offline streams

// Typography
className="text-2xl font-display leading-tight"

// Layout
className="rounded-radius shadow-glow p-4 z-modal"

// Animations
className="animate-live-pulse delay-200"
```

### TypeScript/JavaScript
```tsx
import { themeTokens, getColor, streamingColors } from '../styles/themeTokens'
import { hslVar, colorCombinations } from '../styles/themeUtils'

// Access tokens directly
const brandColor = themeTokens.colors.brand[500]
const fontSize = themeTokens.fontSize['2xl']

// Use utility functions
const primaryColor = getColor('brand', 'DEFAULT')
const liveColor = streamingColors.live()

// CSS-in-JS styling
const buttonStyle = {
  backgroundColor: colorCombinations.button.primary.background,
  borderRadius: themeTokens.borderRadius.md,
  boxShadow: themeTokens.boxShadow.glow,
}
```

### CSS Variables
```css
/* Automatic theme switching */
.my-component {
  background-color: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  border-radius: var(--radius);
}

/* With opacity */
.overlay {
  background-color: hsl(var(--background) / 0.8);
}
```

## 🔄 Theme Switching

The system supports automatic light/dark mode switching through CSS classes:

```tsx
// Dark theme (default)
<html className="dark">
  <!-- Dark theme active -->
</html>

// Light theme
<html className="light">
  <!-- Light theme active -->
</html>
```

## 🎯 Streaming Platform Features

### Live Stream Indicators
```tsx
// Pulsing live indicator
<div className="w-3 h-3 bg-live rounded-full live-indicator animate-live-pulse" />

// Live badge with glow
<span className="bg-live text-live-foreground px-2 py-1 rounded-full shadow-neon-live">
  LIVE
</span>
```

### Stream Status Colors
```tsx
<span className="text-live">LIVE</span>           // Red
<span className="text-stream-offline">Offline</span>     // Gray
<span className="text-stream-scheduled">Scheduled</span> // Yellow
<span className="text-stream-viewers">1.2K viewers</span> // Green
```

### Quality Badges
```tsx
<span className="quality-badge-4k">4K</span>     // Purple/Pink gradient
<span className="quality-badge-hd">HD</span>     // Blue gradient
<span className="quality-badge-sd">SD</span>     // Gray gradient
```

## 📱 Responsive Design

All tokens work seamlessly with Tailwind's responsive prefixes:

```tsx
className="text-sm md:text-base lg:text-lg"
className="p-4 md:p-6 lg:p-8"
className="rounded-md md:rounded-lg lg:rounded-xl"
```

## 🔧 Customization

To modify tokens, update the appropriate files:

1. **Colors**: Edit `src/styles/themes/bigfootlive-theme.css`
2. **Tailwind Config**: Update `tailwind.config.js`
3. **TypeScript Types**: Modify `src/styles/themeTokens.ts`
4. **Utilities**: Extend `src/styles/themeUtils.ts`

## 🎨 Design Philosophy

- **Consistency**: All colors, spacing, and typography follow systematic scales
- **Accessibility**: High contrast ratios and semantic color usage
- **Performance**: CSS variables enable efficient theme switching
- **Developer Experience**: TypeScript support with IntelliSense
- **Streaming Focus**: Specialized tokens for live streaming interfaces

## 📚 Documentation

- **[DESIGN_TOKENS.md](./DESIGN_TOKENS.md)**: Complete usage guide with examples
- **[themeTokens.ts](./themeTokens.ts)**: TypeScript interfaces and exports
- **[themeUtils.ts](./themeUtils.ts)**: Utility functions and helpers

This design token system provides a solid foundation for building a consistent, accessible, and visually appealing streaming platform interface that scales with the project's needs.
