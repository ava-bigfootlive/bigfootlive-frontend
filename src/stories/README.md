# BigfootLive Design System - Storybook

This directory contains the Storybook stories for the BigfootLive design system, showcasing all UI components and streaming-specific components in both light and dark themes.

## 🚀 Getting Started

### Running Storybook

```bash
# Start the development server
npm run storybook

# Build static Storybook for production
npm run build-storybook
```

### Visual Regression Testing with Chromatic

```bash
# Run visual regression tests
npm run chromatic
```

## 📁 Structure

```
src/stories/
├── ui/                    # Core UI component stories
│   ├── Button.stories.tsx
│   ├── Card.stories.tsx
│   ├── Badge.stories.tsx
│   ├── Avatar.stories.tsx
│   ├── Input.stories.tsx
│   ├── Alert.stories.tsx
│   └── Skeleton.stories.tsx
├── video/                 # Video-related component stories
│   └── LiveIndicator.stories.tsx
├── streaming/             # Streaming-specific component stories
│   └── StreamViewer.stories.tsx
├── Overview.stories.tsx   # Complete design system overview
└── README.md             # This file
```

## 🎨 Features

### Theme Support
- **Light Theme**: Default light theme with BigfootLive branding
- **Dark Theme**: Comprehensive dark mode support
- **Theme Toggle**: Switch between themes using the toolbar

### Component Categories

#### UI Components
- **Button**: All variants (default, secondary, outline, ghost, link, destructive)
- **Card**: With headers, content, footers, and actions
- **Badge**: Status indicators and labels
- **Avatar**: User profile pictures with fallbacks
- **Input**: Form inputs with validation states
- **Alert**: Information and error messages
- **Skeleton**: Loading state placeholders

#### Video Components
- **LiveIndicator**: Shows live streaming status with viewer counts

#### Streaming Components
- **StreamViewer**: Complete streaming interface with chat and controls

### Responsive Design
All components are tested across different viewport sizes:
- Mobile (375px)
- Tablet (768px)
- Desktop (1024px+)

## 🔧 Addons Enabled

- **Docs**: Auto-generated documentation
- **Themes**: Light/dark theme switching
- **A11y**: Accessibility testing
- **Vitest**: Component testing integration
- **Chromatic**: Visual regression testing

## 📊 Visual Regression Testing

### Setup Chromatic

1. Create a Chromatic account at [chromatic.com](https://chromatic.com)
2. Link your repository
3. Replace `YOUR_PROJECT_TOKEN_HERE` in `chromatic.config.json` with your project token
4. Run `npm run chromatic` to publish stories

### Configuration

The `chromatic.config.json` includes:
- **onlyChanged**: Only test changed stories
- **exitZeroOnChanges**: Don't fail CI on visual changes
- **ignoreLastBuildOnBranch**: Ignore changes on main branch
- **externals**: Exclude fonts and images from snapshots

## 🎯 Design System Guidelines

### Colors
- **Primary**: Brand purple (#8B5CF6)
- **Accent**: Pink/magenta (#EC4899)
- **Destructive**: Red (#EF4444)
- **Success**: Green (#10B981)
- **Warning**: Orange (#F59E0B)
- **Info**: Blue (#3B82F6)

### Typography
- **Font Family**: Inter (sans-serif)
- **Font Scale**: 12px, 14px, 16px, 18px, 20px, 24px, 30px, 36px, 48px
- **Font Weights**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

### Spacing
- **Scale**: 0.125rem to 24rem (2px to 384px)
- **Gap System**: 0.5, 1, 1.5, 2, 2.5, 3, 4, 6, 8, 12, 16, 20, 24
- **Container**: Max-width 1400px with 2rem padding

### Border Radius
- **xs**: 2px
- **sm**: 4px  
- **default**: 6px
- **md**: 8px (CSS variable based)
- **lg**: 12px
- **xl**: 16px
- **full**: 9999px

## 🧪 Testing Stories

### Accessibility Testing
All stories include accessibility checks via the A11y addon:
- Color contrast validation
- Keyboard navigation testing
- Screen reader compatibility
- Focus management

### Responsive Testing
Use the viewport addon to test components at different screen sizes:
- iPhone SE (375px)
- iPad (768px)
- Desktop (1024px)
- Large Desktop (1440px)

### Interactive Testing
Stories include interactive controls for:
- Prop manipulation
- State changes
- Event handling
- Theme switching

## 📝 Writing New Stories

### Basic Story Structure
```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { YourComponent } from '@/components/ui/your-component';

const meta = {
  title: 'UI/YourComponent',
  component: YourComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Description of your component.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    // Define controls here
  },
} satisfies Meta<typeof YourComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Default props
  },
};
```

### Best Practices
1. **Include all variants** of your component
2. **Add streaming-specific examples** when relevant
3. **Test both light and dark themes**
4. **Include accessibility considerations**
5. **Provide meaningful descriptions** in docs
6. **Use semantic story names**

## 🚀 Deployment

### Chromatic
Stories are automatically deployed to Chromatic on every push to track visual changes and maintain a living style guide.

### Static Build
Generate a static Storybook build for hosting:
```bash
npm run build-storybook
```

The build will be created in `storybook-static/` directory.

## 🤝 Contributing

When adding new components:
1. Create stories in the appropriate category
2. Include all component variants
3. Add streaming-specific examples if applicable
4. Test in both light and dark themes
5. Ensure accessibility compliance
6. Update this README if needed

## 📖 Resources

- [Storybook Documentation](https://storybook.js.org/docs)
- [Chromatic Documentation](https://www.chromatic.com/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/docs)
