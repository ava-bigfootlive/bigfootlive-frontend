# BigfootLive UI Component Migration Scripts

This directory contains a comprehensive set of codemod scripts to migrate legacy UI components to shadcn/ui equivalents while ensuring proper theme token integration and accessibility compliance.

## 🚀 Quick Start

```bash
# Run complete migration with backup and accessibility fixes
node scripts/migrate-ui-system.js src/ --fix-a11y

# Dry run to see what would be changed
node scripts/migrate-ui-system.js --dry-run --verbose

# Run individual scripts
node scripts/codemods/migrate-ui-components.js src/
node scripts/codemods/integrate-theme-tokens.js src/
node scripts/codemods/audit-accessibility.js src/ --fix
```

## 📁 Directory Structure

```
scripts/
├── migrate-ui-system.js           # Master migration orchestrator
├── codemods/
│   ├── migrate-ui-components.js   # Replace legacy components with shadcn/ui
│   ├── integrate-theme-tokens.js  # Wire components to design tokens
│   └── audit-accessibility.js     # Ensure WCAG 2.1 AA compliance
└── README.md                      # This file
```

## 🛠️ Scripts Overview

### 1. Master Migration Script (`migrate-ui-system.js`)

The main orchestrator that runs all migration steps in the correct order.

**Features:**
- Automatic backup creation
- Step-by-step migration with rollback capability
- Validation checks (TypeScript, linting, tests)
- Comprehensive reporting
- Dry-run mode for safe preview

**Usage:**
```bash
node scripts/migrate-ui-system.js [directory] [options]

Options:
  --dry-run     Show what would be changed without making changes
  --verbose     Show detailed output during migration
  --skip-backup Do not create backup of files before migration
  --fix-a11y    Automatically fix accessibility issues
  --help, -h    Show help message
```

**Examples:**
```bash
# Full migration with accessibility fixes
node scripts/migrate-ui-system.js src/ --fix-a11y

# Preview changes without modifying files
node scripts/migrate-ui-system.js --dry-run --verbose

# Migrate specific directory
node scripts/migrate-ui-system.js src/components/
```

### 2. Component Migration (`codemods/migrate-ui-components.js`)

Replaces legacy UI components with shadcn/ui equivalents.

**What it migrates:**
- `Button` → shadcn `Button` with loading state support
- `Input` → shadcn `Input` with error/success states
- `Dialog` → shadcn `Dialog` with size variants
- `Tooltip` → shadcn `Tooltip` with theme variants
- `Dropdown` → shadcn `DropdownMenu` with proper structure

**Features:**
- Preserves all accessibility attributes (`aria-*`, `role`, etc.)
- Maintains existing props and event handlers
- Updates import statements automatically
- Validates accessibility preservation

**Usage:**
```bash
node scripts/codemods/migrate-ui-components.js [directory]
```

### 3. Theme Token Integration (`codemods/integrate-theme-tokens.js`)

Replaces hardcoded styles with design token references.

**What it does:**
- Converts hardcoded hex colors to CSS custom properties
- Maps Tailwind classes to token-based equivalents
- Replaces hardcoded shadows and border radius
- Adds theme token imports where needed
- Validates remaining hardcoded values

**Token Mappings:**
```javascript
// Colors
'#6366f1' → 'hsl(var(--primary))'
'#ef4444' → 'hsl(var(--destructive))'
'#10b981' → 'hsl(var(--success))'

// Tailwind Classes
'bg-blue-500' → 'bg-primary'
'text-red-500' → 'text-destructive'
'border-gray-200' → 'border-border'
```

**Usage:**
```bash
node scripts/codemods/integrate-theme-tokens.js [directory]
```

### 4. Accessibility Audit (`codemods/audit-accessibility.js`)

Ensures WCAG 2.1 AA compliance and proper accessibility attributes.

**What it checks:**
- Missing `alt` text for images
- Missing `aria-label` for icon buttons
- Missing form labels and descriptions
- Proper heading hierarchy (h1 → h2 → h3)
- Keyboard navigation support
- Color-only information issues
- Interactive element roles

**Features:**
- Automatic fixing of common issues
- WCAG compliance level reporting
- Keyboard navigation validation
- Screen reader compatibility checks
- Detailed accessibility report

**Usage:**
```bash
# Audit only (no changes)
node scripts/codemods/audit-accessibility.js [directory]

# Audit and fix issues
node scripts/codemods/audit-accessibility.js [directory] --fix

# Verbose output with file-by-file details
node scripts/codemods/audit-accessibility.js [directory] --verbose
```

## 🎯 Migration Components

### Button Migration

**Before:**
```jsx
import Button from 'some-ui-library';

<Button onClick={handleClick} disabled={loading}>
  Submit
</Button>
```

**After:**
```jsx
import { Button } from '@/components/ui/button';

<Button onClick={handleClick} loading={loading}>
  Submit
</Button>
```

**New Features:**
- Built-in loading state with spinner
- Enhanced accessibility with `aria-disabled`
- Theme token integration
- Consistent focus styles

### Input Migration

**Before:**
```jsx
import Input from 'some-ui-library';

<Input placeholder="Enter text" error={hasError} />
```

**After:**
```jsx
import { Input } from '@/components/ui/input';

<Input placeholder="Enter text" error={hasError} aria-invalid={hasError} />
```

**New Features:**
- Error/success state variants
- Automatic `aria-invalid` attributes
- Theme-consistent styling
- Size variants (sm, default, lg)

### Dialog Migration

**Before:**
```jsx
import Dialog from 'some-ui-library';

<Dialog open={isOpen} onClose={handleClose}>
  <div>Content</div>
</Dialog>
```

**After:**
```jsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent size="default">
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
    </DialogHeader>
    <div>Content</div>
  </DialogContent>
</Dialog>
```

**New Features:**
- Proper semantic structure
- Size variants (sm, default, lg, xl, full)
- Enhanced accessibility with `aria-modal`
- Consistent animations and theming

## 🧪 Testing & Validation

The migration system includes comprehensive validation:

### Automatic Checks
- TypeScript compilation (`npm run type-check`)
- ESLint validation (`npm run lint`)
- Unit tests (`npm run test`)

### Manual Testing Checklist
- [ ] Components render correctly
- [ ] Accessibility with screen readers
- [ ] Keyboard navigation works
- [ ] Theme switching functions
- [ ] Interactive states (hover, focus, disabled)
- [ ] Form validation and submission
- [ ] Modal and dialog behavior

### Accessibility Testing
```bash
# Run accessibility audit
node scripts/codemods/audit-accessibility.js src/ --verbose

# Fix accessibility issues
node scripts/codemods/audit-accessibility.js src/ --fix
```

## 📊 Reports & Analysis

### Migration Report
Generated automatically after each migration run:
- Step-by-step completion status
- Files modified and validation results
- Next steps and recommendations
- Links to relevant documentation

### Accessibility Report
Comprehensive WCAG compliance analysis:
- Issue count by severity (errors/warnings)
- Compliance level (A/AA/AAA)
- Specific recommendations
- Testing tool suggestions

## 🚨 Troubleshooting

### Common Issues

**Import Resolution Errors:**
```bash
# Ensure TypeScript paths are configured
npm run type-check
```

**Accessibility Validation Failures:**
```bash
# Run focused accessibility audit
node scripts/codemods/audit-accessibility.js src/ --fix --verbose
```

**Theme Token Not Applied:**
```bash
# Re-run theme integration
node scripts/codemods/integrate-theme-tokens.js src/
```

### Recovery

**Restore from Backup:**
```bash
# Backups are created automatically as backup-ui-migration-[timestamp]/
cp -r backup-ui-migration-[timestamp]/src/* src/
```

**Partial Migration:**
```bash
# Run individual steps
node scripts/codemods/migrate-ui-components.js src/components/
node scripts/codemods/integrate-theme-tokens.js src/components/
```

## 🔧 Customization

### Adding New Component Mappings

Edit `codemods/migrate-ui-components.js`:

```javascript
const COMPONENT_MAPPINGS = {
  'MyComponent': {
    from: /import\s+.*MyComponent.*from\s+['"]legacy-lib['"];?/g,
    to: "import { MyComponent } from '@/components/ui/my-component';",
    transforms: [
      // Add component-specific transformations
    ]
  }
};
```

### Custom Theme Token Mappings

Edit `codemods/integrate-theme-tokens.js`:

```javascript
const TOKEN_MAPPINGS = {
  colors: {
    '#custom-color': 'hsl(var(--custom-token))',
    // Add more mappings
  }
};
```

### Accessibility Rule Customization

Edit `codemods/audit-accessibility.js`:

```javascript
const ACCESSIBILITY_FIXES = {
  customRule: {
    pattern: /your-pattern/gi,
    fix: (match) => 'your-fix',
    severity: 'error',
    description: 'Your description'
  }
};
```

## 📚 Resources

### Documentation
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Radix UI Primitives](https://www.radix-ui.com/primitives)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [React Accessibility](https://reactjs.org/docs/accessibility.html)

### Testing Tools
- [axe-core](https://github.com/dequelabs/axe-core) - Accessibility testing
- [WAVE](https://wave.webaim.org/) - Web accessibility evaluation
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Performance and accessibility

### Design System
- [BigfootLive Design Tokens](../src/styles/themeTokens.ts)
- [Theme Configuration](../src/lib/theme-config.ts)
- [Utility Functions](../src/lib/utils.ts)

## 🤝 Contributing

When adding new migration patterns:

1. **Test thoroughly** - Run on sample components first
2. **Preserve accessibility** - Never remove aria-* attributes
3. **Update documentation** - Add examples and explanations
4. **Add validation** - Include checks in the audit script
5. **Consider edge cases** - Handle complex component structures

## 📝 License

These migration scripts are part of the BigfootLive project and follow the same licensing terms.
