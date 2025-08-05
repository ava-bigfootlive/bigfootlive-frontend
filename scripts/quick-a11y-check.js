#!/usr/bin/env node

/**
 * Quick Accessibility Check
 * A simple script to verify basic accessibility patterns in the codebase
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.join(__dirname, '../src');

// Patterns to check for good accessibility practices
const GOOD_PATTERNS = [
  { pattern: /aria-label=/gi, name: 'ARIA Labels', weight: 2 },
  { pattern: /aria-describedby=/gi, name: 'ARIA Descriptions', weight: 2 },
  { pattern: /role="/gi, name: 'ARIA Roles', weight: 2 },
  { pattern: /alt="/gi, name: 'Alt Text', weight: 3 },
  { pattern: /<h[1-6]/gi, name: 'Semantic Headings', weight: 1 },
  { pattern: /<nav/gi, name: 'Navigation Landmarks', weight: 2 },
  { pattern: /<main/gi, name: 'Main Landmarks', weight: 2 },
];

// Patterns that indicate potential accessibility issues
const WARNING_PATTERNS = [
  { pattern: /onClick.*div/gi, name: 'Clickable Divs (should be buttons)', severity: 'warning' },
  { pattern: /color:\s*#[0-9a-f]{3,6}/gi, name: 'Hardcoded Colors (check contrast)', severity: 'info' },
  { pattern: /<img(?![^>]*alt=)/gi, name: 'Images without Alt Text', severity: 'error' },
];

function getFiles(dir, extension = '.tsx') {
  const files = [];
  
  function traverse(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        traverse(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(extension)) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const results = {
    goodPatterns: {},
    warnings: [],
    filePath: filePath.replace(process.cwd(), '.')
  };
  
  // Check for good patterns
  for (const { pattern, name, weight } of GOOD_PATTERNS) {
    const matches = content.match(pattern) || [];
    if (matches.length > 0) {
      results.goodPatterns[name] = {
        count: matches.length,
        weight,
        score: matches.length * weight
      };
    }
  }
  
  // Check for potential issues
  for (const { pattern, name, severity } of WARNING_PATTERNS) {
    const matches = content.match(pattern) || [];
    if (matches.length > 0) {
      results.warnings.push({
        name,
        severity,
        count: matches.length
      });
    }
  }
  
  return results;
}

function generateReport(allResults) {
  console.log('\n🔍 Quick Accessibility Check Report');
  console.log('====================================\n');
  
  const totalFiles = allResults.length;
  const filesWithA11y = allResults.filter(r => Object.keys(r.goodPatterns).length > 0).length;
  const filesWithWarnings = allResults.filter(r => r.warnings.length > 0).length;
  
  console.log(`📊 Summary:`);
  console.log(`   Files scanned: ${totalFiles}`);
  console.log(`   Files with a11y features: ${filesWithA11y} (${Math.round(filesWithA11y/totalFiles*100)}%)`);
  console.log(`   Files with warnings: ${filesWithWarnings}`);
  
  // Aggregate good patterns
  const aggregatedPatterns = {};
  let totalScore = 0;
  
  for (const result of allResults) {
    for (const [name, data] of Object.entries(result.goodPatterns)) {
      if (!aggregatedPatterns[name]) {
        aggregatedPatterns[name] = { count: 0, score: 0 };
      }
      aggregatedPatterns[name].count += data.count;
      aggregatedPatterns[name].score += data.score;
      totalScore += data.score;
    }
  }
  
  console.log(`\n✅ Accessibility Features Found:`);
  for (const [name, data] of Object.entries(aggregatedPatterns)) {
    console.log(`   ${name}: ${data.count} occurrences (score: ${data.score})`);
  }
  
  // Show warnings
  const aggregatedWarnings = {};
  for (const result of allResults) {
    for (const warning of result.warnings) {
      if (!aggregatedWarnings[warning.name]) {
        aggregatedWarnings[warning.name] = { count: 0, severity: warning.severity };
      }
      aggregatedWarnings[warning.name].count += warning.count;
    }
  }
  
  if (Object.keys(aggregatedWarnings).length > 0) {
    console.log(`\n⚠️  Potential Issues:`);
    for (const [name, data] of Object.entries(aggregatedWarnings)) {
      const icon = data.severity === 'error' ? '❌' : data.severity === 'warning' ? '⚠️' : 'ℹ️';
      console.log(`   ${icon} ${name}: ${data.count} occurrences`);
    }
  }
  
  // Calculate accessibility score
  const maxPossibleScore = totalFiles * 20; // Rough estimate
  const accessibilityScore = Math.min(Math.round((totalScore / maxPossibleScore) * 100), 100);
  
  console.log(`\n🎯 Accessibility Score: ${accessibilityScore}%`);
  
  if (accessibilityScore >= 80) {
    console.log('   🌟 Excellent accessibility implementation!');
  } else if (accessibilityScore >= 60) {
    console.log('   👍 Good accessibility foundation, room for improvement');
  } else {
    console.log('   🚨 Accessibility needs attention');
  }
  
  console.log(`\n📚 Recommendations:`);
  console.log('   • Test with screen readers (NVDA, JAWS, VoiceOver)');
  console.log('   • Run Lighthouse accessibility audits');
  console.log('   • Use axe-core browser extension');
  console.log('   • Test keyboard navigation throughout the app');
  console.log('   • Verify color contrast ratios meet WCAG standards');
}

// Main execution
console.log('🚀 Starting accessibility check...');

const componentFiles = [
  ...getFiles(path.join(srcDir, 'components'), '.tsx'),
  ...getFiles(path.join(srcDir, 'pages'), '.tsx')
];

const results = componentFiles.map(analyzeFile);
generateReport(results);

console.log('\n✨ Accessibility check complete!');
