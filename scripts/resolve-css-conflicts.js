#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { analyzeCSSConflicts } from './detect-css-conflicts.js';

// High-priority conflicts to resolve first
const PRIORITY_CONFLICTS = [
  '.stream-card',
  '.chart-container', 
  '.btn-primary',
  '.go-live-btn',
  '.tooltip',
  '.tooltip-content',
  '::-webkit-scrollbar'
];

// Create unified utility classes for common patterns
const UTILITY_CLASSES = {
  '.stream-card-base': {
    position: 'relative',
    'border-radius': '16px',
    overflow: 'hidden',
    background: 'var(--bg-card)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer'
  },
  '.stream-card-hover': {
    transform: 'translateY(-4px)',
    'box-shadow': '0 12px 24px -8px rgba(147, 51, 234, 0.2)'
  },
  '.chart-container-base': {
    background: 'var(--bg-card)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    'border-radius': '16px',
    padding: '24px'
  },
  '.btn-primary-base': {
    background: 'var(--gradient-purple)',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    'border-radius': '8px',
    'font-weight': '600',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  },
  '.btn-primary-hover': {
    transform: 'translateY(-2px)',
    'box-shadow': '0 8px 24px rgba(147, 51, 234, 0.3)'
  },
  '.tooltip-base': {
    position: 'relative'
  },
  '.tooltip-content-base': {
    position: 'absolute',
    bottom: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '8px 12px',
    background: 'rgba(0, 0, 0, 0.9)',
    color: 'white',
    'font-size': '12px',
    'border-radius': '6px',
    'white-space': 'nowrap',
    'pointer-events': 'none',
    opacity: '0',
    transition: 'opacity 0.2s ease',
    'z-index': '50'
  },
  '.scrollbar-theme': {
    '&::-webkit-scrollbar': {
      width: '8px',
      height: '8px'
    },
    '&::-webkit-scrollbar-track': {
      'background-color': 'rgba(255, 255, 255, 0.05)'
    },
    '&::-webkit-scrollbar-thumb': {
      'background-color': 'rgba(255, 255, 255, 0.2)',
      'border-radius': '4px'
    },
    '&::-webkit-scrollbar-thumb:hover': {
      'background-color': 'rgba(255, 255, 255, 0.3)'
    }
  }
};

async function createUtilityFile() {
  console.log('📦 Creating CSS utility classes...');
  
  let utilityCSS = '/* Generated CSS Utilities - Conflict Resolution */\n\n';
  
  // Add utility classes
  for (const [selector, properties] of Object.entries(UTILITY_CLASSES)) {
    utilityCSS += `${selector} {\n`;
    for (const [prop, value] of Object.entries(properties)) {
      if (typeof value === 'object') {
        // Handle nested selectors like &::-webkit-scrollbar
        for (const [nestedSelector, nestedProps] of Object.entries(value)) {
          utilityCSS += `${nestedSelector.replace('&', selector)} {\n`;
          for (const [nestedProp, nestedValue] of Object.entries(nestedProps)) {
            utilityCSS += `  ${nestedProp}: ${nestedValue};\n`;
          }
          utilityCSS += '}\n\n';
        }
      } else {
        utilityCSS += `  ${prop}: ${value};\n`;
      }
    }
    utilityCSS += '}\n\n';
  }
  
  // Add hover states
  utilityCSS += '.stream-card:hover {\n  @apply stream-card-hover;\n}\n\n';
  utilityCSS += '.btn-primary:hover {\n  @apply btn-primary-hover;\n}\n\n';
  utilityCSS += '.tooltip:hover .tooltip-content {\n  opacity: 1;\n  transform: translateX(-50%) translateY(-2px);\n}\n\n';
  
  // Write the utility file
  fs.writeFileSync('src/styles/conflict-resolved-utilities.css', utilityCSS);
  console.log('✅ Created src/styles/conflict-resolved-utilities.css');
}

async function main() {
  console.log('🚀 Starting CSS conflict resolution...\n');
  
  try {
    // Create utility classes
    await createUtilityFile();
    
    console.log('\n✨ CSS conflict resolution complete!');
    
  } catch (error) {
    console.error('❌ Error during conflict resolution:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { main as resolveConflicts };
