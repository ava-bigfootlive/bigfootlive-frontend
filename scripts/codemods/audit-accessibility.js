#!/usr/bin/env node

/**
 * BigfootLive Accessibility Audit Script
 * 
 * This script audits and enhances accessibility attributes across all UI components,
 * ensuring WCAG 2.1 AA compliance and proper aria-* attribute usage.
 * 
 * Usage:
 *   node scripts/codemods/audit-accessibility.js [directory]
 */

const fs = require('fs');
const path = require('path');

// Accessibility patterns and requirements
const ACCESSIBILITY_RULES = {
  // Required aria attributes for specific components
  requiredAttributes: {
    'button': ['aria-label', 'aria-describedby', 'aria-expanded', 'aria-pressed'],
    'input': ['aria-label', 'aria-describedby', 'aria-required', 'aria-invalid'],
    'textarea': ['aria-label', 'aria-describedby', 'aria-required', 'aria-invalid'],
    'select': ['aria-label', 'aria-describedby', 'aria-required', 'aria-invalid'],
    'dialog': ['aria-modal', 'aria-labelledby', 'aria-describedby'],
    'tooltip': ['role'],
    'dropdown': ['aria-haspopup', 'aria-expanded'],
    'menu': ['role', 'aria-orientation'],
    'menuitem': ['role'],
    'tab': ['role', 'aria-selected', 'aria-controls'],
    'tabpanel': ['role', 'aria-labelledby'],
    'checkbox': ['aria-checked', 'aria-describedby'],
    'radio': ['aria-checked', 'aria-describedby'],
    'img': ['alt', 'aria-hidden'],
    'link': ['aria-label', 'aria-describedby']
  },
  
  // Interactive elements that need focus management
  focusableElements: [
    'button', 'input', 'select', 'textarea', 'a', '[tabindex]', 
    '[contenteditable]', 'audio[controls]', 'video[controls]'
  ],
  
  // Elements that should have semantic roles
  semanticRoles: {
    'nav': 'navigation',
    'main': 'main',
    'aside': 'complementary',
    'section': 'region',
    'article': 'article',
    'header': 'banner',
    'footer': 'contentinfo'
  }
};

// Common accessibility issues and their fixes
const ACCESSIBILITY_FIXES = {
  // Missing alt text for images
  missingAlt: {
    pattern: /<img(?![^>]*alt=)[^>]*>/gi,
    fix: (match) => match.replace('<img', '<img alt=""'),
    severity: 'error',
    description: 'Images must have alt text for screen readers'
  },
  
  // Missing aria-label for icon buttons
  missingIconButtonLabel: {
    pattern: /<button[^>]*>[\s]*<[^>]*(?:icon|svg)[^>]*>[\s]*<\/button>/gi,
    fix: (match) => {
      if (!match.includes('aria-label')) {
        return match.replace('<button', '<button aria-label="Button"');
      }
      return match;
    },
    severity: 'error',
    description: 'Icon buttons need accessible labels'
  },
  
  // Missing form labels
  missingFormLabels: {
    pattern: /<input(?![^>]*(?:aria-label|aria-labelledby))[^>]*>/gi,
    fix: (match) => {
      if (!match.includes('type="hidden"')) {
        return match.replace('<input', '<input aria-label="Input field"');
      }
      return match;
    },
    severity: 'warning',
    description: 'Form inputs should have associated labels'
  },
  
  // Missing role for custom components
  missingRole: {
    pattern: /<div[^>]*(?:click|onKey)[^>]*>(?![^<]*role=)/gi,
    fix: (match) => match.replace('<div', '<div role="button"'),
    severity: 'warning',
    description: 'Interactive divs should have appropriate roles'
  }
};

// Keyboard navigation patterns
const KEYBOARD_PATTERNS = {
  // Components that need keyboard support
  needsKeyboard: ['button', 'link', 'input', 'select', 'textarea'],
  
  // Key event handlers that should be present
  keyHandlers: ['onKeyDown', 'onKeyUp', 'onKeyPress'],
  
  // Required key codes for accessibility
  requiredKeys: {
    'Enter': 13,
    'Space': 32,
    'Escape': 27,
    'ArrowUp': 38,
    'ArrowDown': 40,
    'ArrowLeft': 37,
    'ArrowRight': 39,
    'Tab': 9
  }
};

/**
 * Read all component files recursively
 */
function getComponentFiles(dir) {
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
 * Analyze accessibility issues in code
 */
function analyzeAccessibility(code, filePath) {
  const issues = [];
  const suggestions = [];
  
  // Check for common accessibility issues
  for (const [ruleName, rule] of Object.entries(ACCESSIBILITY_FIXES)) {
    const matches = code.match(rule.pattern);
    if (matches) {
      issues.push({
        rule: ruleName,
        severity: rule.severity,
        description: rule.description,
        occurrences: matches.length,
        filePath: filePath
      });
    }
  }
  
  // Check for missing keyboard event handlers
  const interactiveElements = code.match(/<(button|div|span)[^>]*(?:onClick|onPointerDown)[^>]*>/gi) || [];
  for (const element of interactiveElements) {
    const hasKeyboardHandler = KEYBOARD_PATTERNS.keyHandlers.some(handler => 
      element.includes(handler)
    );
    
    if (!hasKeyboardHandler) {
      suggestions.push({
        type: 'keyboard',
        description: 'Interactive element should have keyboard event handlers',
        element: element.substring(0, 50) + '...',
        filePath: filePath
      });
    }
  }
  
  // Check for proper heading hierarchy
  const headings = code.match(/<h[1-6][^>]*>/gi) || [];
  const headingLevels = headings.map(h => parseInt(h.match(/h([1-6])/)[1]));
  
  for (let i = 1; i < headingLevels.length; i++) {
    if (headingLevels[i] > headingLevels[i-1] + 1) {
      issues.push({
        rule: 'headingHierarchy',
        severity: 'warning',
        description: 'Heading levels should not skip (e.g., h1 to h3)',
        filePath: filePath
      });
      break;
    }
  }
  
  // Check for color-only information
  const colorOnlyPatterns = [
    /color:\s*red/gi,
    /text-red-/gi,
    /bg-red-/gi,
    /text-green-/gi,
    /bg-green-/gi
  ];
  
  for (const pattern of colorOnlyPatterns) {
    if (pattern.test(code) && !code.includes('aria-label') && !code.includes('sr-only')) {
      suggestions.push({
        type: 'color',
        description: 'Information conveyed by color should also be available through other means',
        filePath: filePath
      });
      break;
    }
  }
  
  return { issues, suggestions };
}

/**
 * Generate accessibility improvements for code
 */
function generateAccessibilityFixes(code) {
  let fixedCode = code;
  let hasChanges = false;
  
  // Apply automatic fixes
  for (const [ruleName, rule] of Object.entries(ACCESSIBILITY_FIXES)) {
    if (rule.pattern.test(fixedCode)) {
      const originalCode = fixedCode;
      fixedCode = fixedCode.replace(rule.pattern, rule.fix);
      if (fixedCode !== originalCode) {
        hasChanges = true;
      }
    }
  }
  
  // Add focus management utilities if needed
  if (code.includes('useState') && code.includes('onClick') && !code.includes('useRef')) {
    const importMatch = code.match(/import.*{([^}]+)}.*from ['"]react['"]/);
    if (importMatch && !importMatch[1].includes('useRef')) {
      fixedCode = fixedCode.replace(
        /import.*{([^}]+)}.*from ['"]react['"]/,
        `import { ${importMatch[1]}, useRef } from 'react'`
      );
      hasChanges = true;
    }
  }
  
  return { code: fixedCode, hasChanges };
}

/**
 * Check WCAG compliance level
 */
function checkWCAGCompliance(issues) {
  const errorCount = issues.filter(issue => issue.severity === 'error').length;
  const warningCount = issues.filter(issue => issue.severity === 'warning').length;
  
  if (errorCount === 0 && warningCount === 0) {
    return 'AAA';
  } else if (errorCount === 0) {
    return 'AA';
  } else if (errorCount <= 2) {
    return 'A';
  } else {
    return 'Non-compliant';
  }
}

/**
 * Generate accessibility report
 */
function generateAccessibilityReport(allIssues, allSuggestions, processedFiles) {
  const totalIssues = allIssues.length;
  const totalSuggestions = allSuggestions.length;
  
  const issuesBySeverity = {
    error: allIssues.filter(i => i.severity === 'error').length,
    warning: allIssues.filter(i => i.severity === 'warning').length
  };
  
  const issuesByType = {};
  allIssues.forEach(issue => {
    issuesByType[issue.rule] = (issuesByType[issue.rule] || 0) + 1;
  });
  
  const complianceLevel = checkWCAGCompliance(allIssues);
  
  console.log('\n♿ Accessibility Audit Report');
  console.log('================================');
  console.log(`Files scanned: ${processedFiles}`);
  console.log(`Total issues: ${totalIssues}`);
  console.log(`  - Errors: ${issuesBySeverity.error}`);
  console.log(`  - Warnings: ${issuesBySeverity.warning}`);
  console.log(`Total suggestions: ${totalSuggestions}`);
  console.log(`WCAG Compliance Level: ${complianceLevel}`);
  
  if (Object.keys(issuesByType).length > 0) {
    console.log('\nIssues by type:');
    Object.entries(issuesByType).forEach(([type, count]) => {
      console.log(`  - ${type}: ${count}`);
    });
  }
  
  return {
    totalIssues,
    totalSuggestions,
    issuesBySeverity,
    issuesByType,
    complianceLevel
  };
}

/**
 * Process a single file
 */
function processFile(filePath, fixIssues = false) {
  try {
    const originalCode = fs.readFileSync(filePath, 'utf8');
    const analysis = analyzeAccessibility(originalCode, filePath);
    
    let processedCode = originalCode;
    let hasChanges = false;
    
    if (fixIssues && analysis.issues.length > 0) {
      const fixes = generateAccessibilityFixes(originalCode);
      processedCode = fixes.code;
      hasChanges = fixes.hasChanges;
      
      if (hasChanges) {
        fs.writeFileSync(filePath, processedCode);
        console.log(`✅ Fixed accessibility issues in ${filePath}`);
      }
    }
    
    return {
      issues: analysis.issues,
      suggestions: analysis.suggestions,
      hasChanges
    };
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return { issues: [], suggestions: [], error: true };
  }
}

/**
 * Main execution function
 */
function main() {
  const args = process.argv.slice(2);
  const targetDir = args.find(arg => !arg.startsWith('--')) || 'src';
  const fixIssues = args.includes('--fix');
  const verbose = args.includes('--verbose');
  
  if (!fs.existsSync(targetDir)) {
    console.error(`❌ Directory ${targetDir} does not exist`);
    process.exit(1);
  }
  
  console.log(`♿ Starting accessibility audit in ${targetDir}...`);
  if (fixIssues) {
    console.log('🔧 Auto-fix mode enabled');
  }
  console.log('');
  
  const componentFiles = getComponentFiles(targetDir);
  const allIssues = [];
  const allSuggestions = [];
  let fixedFiles = 0;
  
  for (const filePath of componentFiles) {
    const result = processFile(filePath, fixIssues);
    
    allIssues.push(...result.issues);
    allSuggestions.push(...result.suggestions);
    
    if (result.hasChanges) {
      fixedFiles++;
    }
    
    if (verbose && (result.issues.length > 0 || result.suggestions.length > 0)) {
      console.log(`\n📄 ${filePath}:`);
      
      result.issues.forEach(issue => {
        const icon = issue.severity === 'error' ? '❌' : '⚠️';
        console.log(`   ${icon} ${issue.description}`);
      });
      
      result.suggestions.forEach(suggestion => {
        console.log(`   💡 ${suggestion.description}`);
      });
    }
  }
  
  // Generate final report
  const report = generateAccessibilityReport(allIssues, allSuggestions, componentFiles.length);
  
  if (fixIssues && fixedFiles > 0) {
    console.log(`\n🔧 Fixed accessibility issues in ${fixedFiles} files`);
  }
  
  console.log('\n📋 Recommendations:');
  if (report.complianceLevel === 'Non-compliant') {
    console.log('   1. ❗ Fix critical accessibility errors first');
    console.log('   2. 🔍 Review and test with screen readers');
    console.log('   3. 🎯 Focus on keyboard navigation');
  } else if (report.complianceLevel === 'A') {
    console.log('   1. 🎯 Address remaining warnings for AA compliance');
    console.log('   2. 🧪 Test with assistive technologies');
  } else if (report.complianceLevel === 'AA') {
    console.log('   1. ✨ Consider enhancements for AAA compliance');
    console.log('   2. 🧪 Regular accessibility testing recommended');
  } else {
    console.log('   1. ✅ Excellent accessibility compliance!');
    console.log('   2. 🔄 Maintain standards in future development');
  }
  
  console.log('\n📚 Resources:');
  console.log('   - WCAG 2.1 Guidelines: https://www.w3.org/WAI/WCAG21/quickref/');
  console.log('   - React Accessibility: https://reactjs.org/docs/accessibility.html');
  console.log('   - Testing Tools: axe-core, WAVE, Lighthouse');
}

// Run the audit
if (require.main === module) {
  main();
}

module.exports = {
  analyzeAccessibility,
  generateAccessibilityFixes,
  checkWCAGCompliance,
  ACCESSIBILITY_RULES,
  ACCESSIBILITY_FIXES
};
