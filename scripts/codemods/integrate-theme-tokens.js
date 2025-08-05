#!/usr/bin/env node

/**
 * BigfootLive Theme Token Integration Codemod
 * 
 * This script ensures all components are properly wired to use design tokens
 * and replaces hardcoded colors/styles with theme token references.
 * 
 * Usage:
 *   node scripts/codemods/integrate-theme-tokens.js [directory]
 */

const fs = require('fs');
const path = require('path');

// Theme token mappings
const TOKEN_MAPPINGS = {
  // Color mappings
  colors: {
    // Primary colors
    '#6366f1': 'hsl(var(--primary))',
    '#4f46e5': 'hsl(var(--primary))',
    '#3730a3': 'hsl(var(--primary))',
    
    // Destructive/Error colors
    '#ef4444': 'hsl(var(--destructive))',
    '#dc2626': 'hsl(var(--destructive))',
    '#b91c1c': 'hsl(var(--destructive))',
    
    // Success colors
    '#10b981': 'hsl(var(--success))',
    '#059669': 'hsl(var(--success))',
    '#047857': 'hsl(var(--success))',
    
    // Warning colors
    '#f59e0b': 'hsl(var(--warning))',
    '#d97706': 'hsl(var(--warning))',
    '#b45309': 'hsl(var(--warning))',
    
    // Neutral colors
    '#ffffff': 'hsl(var(--background))',
    '#000000': 'hsl(var(--foreground))',
    '#f8fafc': 'hsl(var(--background))',
    '#1e293b': 'hsl(var(--foreground))',
    
    // Border colors
    '#e2e8f0': 'hsl(var(--border))',
    '#cbd5e1': 'hsl(var(--border))',
    '#94a3b8': 'hsl(var(--border))',
  },
  
  // Shadow mappings
  shadows: {
    '0 1px 2px 0 rgb(0 0 0 / 0.05)': 'var(--shadow-xs)',
    '0 1px 3px 0 rgb(0 0 0 / 0.1)': 'var(--shadow-sm)',
    '0 4px 6px -1px rgb(0 0 0 / 0.1)': 'var(--shadow-md)',
    '0 10px 15px -3px rgb(0 0 0 / 0.1)': 'var(--shadow-lg)',
    '0 20px 25px -5px rgb(0 0 0 / 0.1)': 'var(--shadow-xl)',
  },
  
  // Border radius mappings
  borderRadius: {
    '0.125rem': 'var(--radius-xs)',
    '0.25rem': 'var(--radius-sm)',
    '0.375rem': 'var(--radius)',
    '0.5rem': 'var(--radius-md)',
    '0.75rem': 'var(--radius-lg)',
    '1rem': 'var(--radius-xl)',
  }
};

// Tailwind class mappings to design tokens
const TAILWIND_MAPPINGS = {
  // Background colors
  'bg-blue-500': 'bg-primary',
  'bg-blue-600': 'bg-primary',
  'bg-indigo-500': 'bg-primary',
  'bg-indigo-600': 'bg-primary',
  'bg-red-500': 'bg-destructive',
  'bg-red-600': 'bg-destructive',
  'bg-green-500': 'bg-success',
  'bg-green-600': 'bg-success',
  'bg-yellow-500': 'bg-warning',
  'bg-amber-500': 'bg-warning',
  'bg-white': 'bg-background',
  'bg-black': 'bg-foreground',
  'bg-gray-50': 'bg-muted',
  'bg-gray-100': 'bg-muted',
  
  // Text colors
  'text-blue-500': 'text-primary',
  'text-blue-600': 'text-primary',
  'text-indigo-500': 'text-primary',
  'text-indigo-600': 'text-primary',
  'text-red-500': 'text-destructive',
  'text-red-600': 'text-destructive',
  'text-green-500': 'text-success',
  'text-green-600': 'text-success',
  'text-yellow-500': 'text-warning',
  'text-amber-500': 'text-warning',
  'text-white': 'text-primary-foreground',
  'text-black': 'text-foreground',
  'text-gray-500': 'text-muted-foreground',
  'text-gray-600': 'text-muted-foreground',
  
  // Border colors
  'border-gray-200': 'border-border',
  'border-gray-300': 'border-border',
  'border-slate-200': 'border-border',
  'border-blue-500': 'border-primary',
  'border-red-500': 'border-destructive',
  'border-green-500': 'border-success',
  
  // Ring colors (focus states)
  'ring-blue-500': 'ring-ring',
  'ring-indigo-500': 'ring-ring',
  'focus:ring-blue-500': 'focus:ring-ring',
  'focus:ring-indigo-500': 'focus:ring-ring',
};

/**
 * Read all CSS and component files recursively
 */
function getStyleFiles(dir) {
  const files = [];
  
  function traverse(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        traverse(fullPath);
      } else if (entry.isFile() && /\.(tsx?|jsx?|css|scss)$/.test(entry.name)) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

/**
 * Transform CSS properties to use design tokens
 */
function transformCSSProperties(code) {
  let transformedCode = code;
  let hasChanges = false;
  
  // Replace hardcoded colors
  for (const [hardcoded, token] of Object.entries(TOKEN_MAPPINGS.colors)) {
    const regex = new RegExp(hardcoded.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    if (regex.test(transformedCode)) {
      transformedCode = transformedCode.replace(regex, token);
      hasChanges = true;
    }
  }
  
  // Replace hardcoded shadows
  for (const [hardcoded, token] of Object.entries(TOKEN_MAPPINGS.shadows)) {
    const regex = new RegExp(hardcoded.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    if (regex.test(transformedCode)) {
      transformedCode = transformedCode.replace(regex, token);
      hasChanges = true;
    }
  }
  
  // Replace hardcoded border radius
  for (const [hardcoded, token] of Object.entries(TOKEN_MAPPINGS.borderRadius)) {
    const regex = new RegExp(`border-radius:\\s*${hardcoded.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'gi');
    if (regex.test(transformedCode)) {
      transformedCode = transformedCode.replace(regex, `border-radius: ${token}`);
      hasChanges = true;
    }
  }
  
  return { code: transformedCode, hasChanges };
}

/**
 * Transform Tailwind classes to use design tokens
 */
function transformTailwindClasses(code) {
  let transformedCode = code;
  let hasChanges = false;
  
  // Replace Tailwind classes with token-based equivalents
  for (const [oldClass, newClass] of Object.entries(TAILWIND_MAPPINGS)) {
    const regex = new RegExp(`\\b${oldClass.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
    if (regex.test(transformedCode)) {
      transformedCode = transformedCode.replace(regex, newClass);
      hasChanges = true;
    }
  }
  
  return { code: transformedCode, hasChanges };
}

/**
 * Add theme token imports where needed
 */
function ensureThemeTokenImports(code, filePath) {
  let transformedCode = code;
  let hasChanges = false;
  
  // Check if file uses theme tokens but doesn't import them
  const usesThemeTokens = /hsl\(var\(--[^)]+\)\)|var\(--[^)]+\)/.test(code);
  const hasThemeImport = /import.*themeTokens.*from.*@\/styles\/themeTokens/.test(code);
  
  if (usesThemeTokens && !hasThemeImport && /\.(tsx?|jsx?)$/.test(filePath)) {
    // Find the position to insert the import
    const lastImportMatch = code.match(/import\s+.*from\s+['"][^'"]*['"];?\s*\n/g);
    if (lastImportMatch) {
      const lastImport = lastImportMatch[lastImportMatch.length - 1];
      const insertPos = code.lastIndexOf(lastImport) + lastImport.length;
      transformedCode = code.slice(0, insertPos) + 
        "import { themeTokens } from '@/styles/themeTokens';\n" + 
        code.slice(insertPos);
      hasChanges = true;
    }
  }
  
  return { code: transformedCode, hasChanges };
}

/**
 * Process a single file
 */
function processFile(filePath) {
  try {
    const originalCode = fs.readFileSync(filePath, 'utf8');
    let transformedCode = originalCode;
    let hasChanges = false;
    
    // Apply CSS property transformations
    const cssResult = transformCSSProperties(transformedCode);
    transformedCode = cssResult.code;
    hasChanges = hasChanges || cssResult.hasChanges;
    
    // Apply Tailwind class transformations
    const tailwindResult = transformTailwindClasses(transformedCode);
    transformedCode = tailwindResult.code;
    hasChanges = hasChanges || tailwindResult.hasChanges;
    
    // Ensure theme token imports
    const importResult = ensureThemeTokenImports(transformedCode, filePath);
    transformedCode = importResult.code;
    hasChanges = hasChanges || importResult.hasChanges;
    
    if (hasChanges) {
      fs.writeFileSync(filePath, transformedCode);
      console.log(`✅ Updated theme tokens in ${filePath}`);
      return { processed: true };
    }
    
    return { processed: false };
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return { processed: false, error: true };
  }
}

/**
 * Validate theme token usage
 */
function validateThemeTokenUsage(dir) {
  const files = getStyleFiles(dir);
  const issues = [];
  
  for (const filePath of files) {
    const code = fs.readFileSync(filePath, 'utf8');
    
    // Check for hardcoded colors that should use tokens
    const hardcodedColors = code.match(/#[0-9a-f]{3,6}/gi) || [];
    const rgbColors = code.match(/rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/gi) || [];
    
    if (hardcodedColors.length > 0 || rgbColors.length > 0) {
      issues.push({
        file: filePath,
        hardcodedColors: hardcodedColors.length,
        rgbColors: rgbColors.length
      });
    }
  }
  
  if (issues.length > 0) {
    console.log('\n🔍 Theme Token Usage Report:');
    issues.forEach(issue => {
      console.log(`   ${issue.file}:`);
      if (issue.hardcodedColors > 0) {
        console.log(`     - ${issue.hardcodedColors} hardcoded hex colors`);
      }
      if (issue.rgbColors > 0) {
        console.log(`     - ${issue.rgbColors} hardcoded RGB colors`);
      }
    });
  }
  
  return issues;
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
  
  console.log(`🎨 Starting theme token integration in ${targetDir}...`);
  console.log('');
  
  const styleFiles = getStyleFiles(targetDir);
  let processedCount = 0;
  let errorCount = 0;
  
  for (const filePath of styleFiles) {
    const result = processFile(filePath);
    
    if (result.processed) {
      processedCount++;
    }
    
    if (result.error) {
      errorCount++;
    }
  }
  
  console.log('');
  console.log('📊 Theme Token Integration Summary:');
  console.log(`   Files scanned: ${styleFiles.length}`);
  console.log(`   Files updated: ${processedCount}`);
  console.log(`   Errors: ${errorCount}`);
  
  // Validate remaining hardcoded values
  const issues = validateThemeTokenUsage(targetDir);
  
  if (issues.length === 0) {
    console.log('');
    console.log('✨ All theme tokens are properly integrated!');
  } else {
    console.log('');
    console.log('⚠️  Some files still contain hardcoded values that could use theme tokens.');
    console.log('   Consider updating these manually for full design system consistency.');
  }
}

// Run the integration
if (require.main === module) {
  main();
}

module.exports = {
  transformCSSProperties,
  transformTailwindClasses,
  TOKEN_MAPPINGS,
  TAILWIND_MAPPINGS
};
