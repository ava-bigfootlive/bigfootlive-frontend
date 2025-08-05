#!/usr/bin/env node

/**
 * BigfootLive UI Component Migration Codemod
 * 
 * This script automatically migrates legacy UI components to shadcn/ui equivalents
 * while preserving all accessibility props and ensuring proper theme token integration.
 * 
 * Usage:
 *   node scripts/codemods/migrate-ui-components.js [directory]
 * 
 * Examples:
 *   node scripts/codemods/migrate-ui-components.js src/
 *   node scripts/codemods/migrate-ui-components.js src/components/
 */

const fs = require('fs');
const path = require('path');
const { transformSync } = require('@babel/core');

// Component mapping from legacy to shadcn/ui
const COMPONENT_MAPPINGS = {
  // Legacy Button patterns to shadcn Button
  'Button': {
    from: /import\s+.*Button.*from\s+['"](?!@\/components\/ui\/button).*['"];?/g,
    to: "import { Button } from '@/components/ui/button';",
    transforms: [
      // Add loading prop support
      {
        pattern: /<Button(\s+[^>]*?)loading={([^}]+)}([^>]*?)>/g,
        replacement: '<Button$1loading={$2}$3>'
      },
      // Preserve all aria-* attributes
      {
        pattern: /<Button(\s+[^>]*?)(aria-[^=]+=[^>\s]+)([^>]*?)>/g,
        replacement: '<Button$1$2$3>'
      }
    ]
  },
  
  // Legacy Input patterns to shadcn Input
  'Input': {
    from: /import\s+.*Input.*from\s+['"](?!@\/components\/ui\/input).*['"];?/g,
    to: "import { Input } from '@/components/ui/input';",
    transforms: [
      // Add error/success state support
      {
        pattern: /<Input(\s+[^>]*?)error={([^}]+)}([^>]*?)>/g,
        replacement: '<Input$1error={$2}$3>'
      },
      {
        pattern: /<Input(\s+[^>]*?)success={([^}]+)}([^>]*?)>/g,
        replacement: '<Input$1success={$2}$3>'
      },
      // Preserve htmlFor and other accessibility attributes
      {
        pattern: /<Input(\s+[^>]*?)(aria-[^=]+=[^>\s]+|htmlFor=[^>\s]+)([^>]*?)>/g,
        replacement: '<Input$1$2$3>'
      }
    ]
  },
  
  // Legacy Dialog patterns to shadcn Dialog
  'Dialog': {
    from: /import\s+.*Dialog.*from\s+['"](?!@\/components\/ui\/dialog).*['"];?/g,
    to: "import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/dialog';",
    transforms: [
      // Add size prop support
      {
        pattern: /<Dialog(\s+[^>]*?)size={(['"][^'"]*['"])}([^>]*?)>/g,
        replacement: '<Dialog$1$3>\n  <DialogContent size={$2}>'
      },
      // Preserve role and aria-modal attributes
      {
        pattern: /<Dialog(\s+[^>]*?)(role=[^>\s]+|aria-modal=[^>\s]+)([^>]*?)>/g,
        replacement: '<Dialog$1$2$3>'
      }
    ]
  },
  
  // Legacy Tooltip patterns to shadcn Tooltip
  'Tooltip': {
    from: /import\s+.*Tooltip.*from\s+['"](?!@\/components\/ui\/tooltip).*['"];?/g,
    to: "import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';",
    transforms: [
      // Add variant support
      {
        pattern: /<Tooltip(\s+[^>]*?)variant={(['"][^'"]*['"])}([^>]*?)>/g,
        replacement: '<Tooltip$1$3>\n  <TooltipContent variant={$2}>'
      },
      // Preserve role attributes
      {
        pattern: /<Tooltip(\s+[^>]*?)(role=[^>\s]+)([^>]*?)>/g,
        replacement: '<Tooltip$1$2$3>'
      }
    ]
  },
  
  // Legacy Dropdown patterns to shadcn DropdownMenu
  'Dropdown': {
    from: /import\s+.*(?:Dropdown|DropdownMenu).*from\s+['"](?!@\/components\/ui\/dropdown-menu).*['"];?/g,
    to: "import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';",
    transforms: [
      // Rename Dropdown to DropdownMenu
      {
        pattern: /<Dropdown(\s|>)/g,
        replacement: '<DropdownMenu$1'
      },
      {
        pattern: /<\/Dropdown>/g,
        replacement: '</DropdownMenu>'
      },
      // Add size prop support
      {
        pattern: /<DropdownMenuContent(\s+[^>]*?)size={(['"][^'"]*['"])}([^>]*?)>/g,
        replacement: '<DropdownMenuContent$1size={$2}$3>'
      }
    ]
  }
};

// Accessibility attributes to preserve
const ACCESSIBILITY_ATTRIBUTES = [
  'aria-label',
  'aria-labelledby',
  'aria-describedby',
  'aria-expanded',
  'aria-hidden',
  'aria-disabled',
  'aria-checked',
  'aria-selected',
  'aria-current',
  'aria-invalid',
  'aria-required',
  'aria-live',
  'aria-atomic',
  'aria-busy',
  'role',
  'tabIndex',
  'htmlFor'
];

/**
 * Read all TypeScript/JavaScript files recursively
 */
function getSourceFiles(dir) {
  const files = [];
  
  function traverse(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        traverse(fullPath);
      } else if (entry.isFile() && /\.(tsx?|jsx?)$/.test(entry.name)) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

/**
 * Apply component transformations to source code
 */
function transformCode(sourceCode, filePath) {
  let transformedCode = sourceCode;
  let hasChanges = false;
  
  // Track imports to avoid duplicates
  const existingImports = new Set();
  const newImports = new Set();
  
  // Extract existing imports
  const importMatches = sourceCode.match(/import\s+.*from\s+['"][^'"]*['"];?/g) || [];
  importMatches.forEach(imp => existingImports.add(imp.trim()));
  
  // Apply transformations for each component type
  for (const [componentName, config] of Object.entries(COMPONENT_MAPPINGS)) {
    // Check if this component is used in the file
    const componentRegex = new RegExp(`<${componentName}[\\s>]`, 'g');
    if (!componentRegex.test(sourceCode)) {
      continue;
    }
    
    // Replace import statements
    if (config.from.test(transformedCode)) {
      transformedCode = transformedCode.replace(config.from, '');
      newImports.add(config.to);
      hasChanges = true;
    }
    
    // Apply component-specific transformations
    if (config.transforms) {
      for (const transform of config.transforms) {
        if (transform.pattern.test(transformedCode)) {
          transformedCode = transformedCode.replace(transform.pattern, transform.replacement);
          hasChanges = true;
        }
      }
    }
  }
  
  // Add new imports at the top of the file
  if (newImports.size > 0) {
    const importStatements = Array.from(newImports).join('\n');
    
    // Find the position to insert imports (after existing imports or at the top)
    const lastImportMatch = transformedCode.match(/import\s+.*from\s+['"][^'"]*['"];?\s*\n/g);
    if (lastImportMatch) {
      const lastImport = lastImportMatch[lastImportMatch.length - 1];
      const insertPos = transformedCode.lastIndexOf(lastImport) + lastImport.length;
      transformedCode = transformedCode.slice(0, insertPos) + importStatements + '\n' + transformedCode.slice(insertPos);
    } else {
      transformedCode = importStatements + '\n\n' + transformedCode;
    }
  }
  
  return { code: transformedCode, hasChanges };
}

/**
 * Validate that accessibility attributes are preserved
 */
function validateAccessibility(originalCode, transformedCode, filePath) {
  const issues = [];
  
  for (const attr of ACCESSIBILITY_ATTRIBUTES) {
    const originalMatches = (originalCode.match(new RegExp(`${attr}=`, 'g')) || []).length;
    const transformedMatches = (transformedCode.match(new RegExp(`${attr}=`, 'g')) || []).length;
    
    if (originalMatches > transformedMatches) {
      issues.push(`${attr} attribute may have been lost`);
    }
  }
  
  if (issues.length > 0) {
    console.warn(`⚠️  Accessibility concerns in ${filePath}:`);
    issues.forEach(issue => console.warn(`   - ${issue}`));
  }
  
  return issues.length === 0;
}

/**
 * Process a single file
 */
function processFile(filePath) {
  try {
    const originalCode = fs.readFileSync(filePath, 'utf8');
    const { code: transformedCode, hasChanges } = transformCode(originalCode, filePath);
    
    if (hasChanges) {
      // Validate accessibility
      const accessibilityOk = validateAccessibility(originalCode, transformedCode, filePath);
      
      // Write the transformed code
      fs.writeFileSync(filePath, transformedCode);
      
      console.log(`✅ Migrated ${filePath}`);
      
      if (!accessibilityOk) {
        console.log(`   ⚠️  Please review accessibility attributes`);
      }
      
      return { processed: true, accessibilityIssues: !accessibilityOk };
    }
    
    return { processed: false, accessibilityIssues: false };
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return { processed: false, error: true };
  }
}

/**
 * Main execution function
 */
function main() {
  const targetDir = process.argv[2] || 'src';
  
  if (!fs.existsSync(targetDir)) {
    console.error(`❌ Directory ${targetDir} does not exist`);
    process.exit(1);
  }
  
  console.log(`🚀 Starting UI component migration in ${targetDir}...`);
  console.log('');
  
  const sourceFiles = getSourceFiles(targetDir);
  let processedCount = 0;
  let accessibilityIssuesCount = 0;
  let errorCount = 0;
  
  for (const filePath of sourceFiles) {
    const result = processFile(filePath);
    
    if (result.processed) {
      processedCount++;
    }
    
    if (result.accessibilityIssues) {
      accessibilityIssuesCount++;
    }
    
    if (result.error) {
      errorCount++;
    }
  }
  
  console.log('');
  console.log('📊 Migration Summary:');
  console.log(`   Files scanned: ${sourceFiles.length}`);
  console.log(`   Files migrated: ${processedCount}`);
  console.log(`   Files with accessibility concerns: ${accessibilityIssuesCount}`);
  console.log(`   Errors: ${errorCount}`);
  
  if (processedCount > 0) {
    console.log('');
    console.log('✨ Migration completed! Next steps:');
    console.log('   1. Run your tests to ensure everything works');
    console.log('   2. Review files with accessibility concerns');
    console.log('   3. Update any custom styling if needed');
    console.log('   4. Commit your changes');
  }
}

// Run the migration
if (require.main === module) {
  main();
}

module.exports = {
  transformCode,
  validateAccessibility,
  COMPONENT_MAPPINGS
};
