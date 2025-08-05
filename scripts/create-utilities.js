#!/usr/bin/env node

import fs from 'fs';

// Create unified utility CSS content
const utilityCSS = `/* Generated CSS Utilities - Conflict Resolution */

/* Stream Card Utilities */
.stream-card-base {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  background: var(--bg-card);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.stream-card-base:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px -8px rgba(147, 51, 234, 0.2);
}

/* Chart Container Utilities */
.chart-container-base {
  background: var(--bg-card);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 24px;
}

/* Button Utilities */
.btn-primary-base {
  background: var(--gradient-purple);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
  cursor: pointer;
}

.btn-primary-base:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(147, 51, 234, 0.3);
}

/* Tooltip Utilities */
.tooltip-base {
  position: relative;
}

.tooltip-content-base {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  font-size: 12px;
  border-radius: 6px;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 50;
}

.tooltip-base:hover .tooltip-content-base {
  opacity: 1;
  transform: translateX(-50%) translateY(-2px);
}

/* Scrollbar Theme Utilities */
.scrollbar-theme::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.scrollbar-theme::-webkit-scrollbar-track {
  background-color: rgba(255, 255, 255, 0.05);
}

.scrollbar-theme::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.scrollbar-theme::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

/* Apply scrollbar theme globally to common elements */
body, 
main, 
.sidebar, 
.content-wrapper,
.overflow-auto,
.overflow-y-auto {
  @apply scrollbar-theme;
}
`;

console.log('📦 Creating CSS utility classes...');

// Create the utility file
fs.writeFileSync('src/styles/conflict-resolved-utilities.css', utilityCSS);

console.log('✅ Created src/styles/conflict-resolved-utilities.css');

// Update index.css to include the new utilities
const indexCssPath = 'src/index.css';
let content = fs.readFileSync(indexCssPath, 'utf8');

const utilityImport = "@import './styles/conflict-resolved-utilities.css';";

if (!content.includes(utilityImport)) {
  const lines = content.split('\n');
  // Insert after existing theme imports but before tailwind directives
  const insertIndex = lines.findIndex(line => line.includes('@tailwind'));
  
  if (insertIndex > 0) {
    lines.splice(insertIndex, 0, utilityImport, '');
  } else {
    lines.unshift(utilityImport, '');
  }
  
  content = lines.join('\n');
  fs.writeFileSync(indexCssPath, content);
  console.log('✅ Updated src/index.css with utility imports');
}

console.log('\n🎯 Utility classes created! You can now:');
console.log('1. Replace .stream-card with .stream-card-base');
console.log('2. Replace .chart-container with .chart-container-base');
console.log('3. Replace .btn-primary with .btn-primary-base');
console.log('4. Replace .tooltip with .tooltip-base and .tooltip-content with .tooltip-content-base');
console.log('5. Add .scrollbar-theme to elements that need custom scrollbars');
