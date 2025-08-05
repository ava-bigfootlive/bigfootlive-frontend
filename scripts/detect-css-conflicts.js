#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// Parse CSS and extract selectors with their properties
function parseCSS(cssContent, filename) {
  const selectors = new Map();
  const lines = cssContent.split('\n');
  
  let currentSelector = '';
  let currentProperties = [];
  let inRuleBlock = false;
  let braceCount = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.includes('{')) {
      braceCount += (line.match(/{/g) || []).length;
      if (!inRuleBlock && line.includes('{')) {
        currentSelector = line.split('{')[0].trim();
        inRuleBlock = true;
        currentProperties = [];
      }
    }
    
    if (line.includes('}')) {
      braceCount -= (line.match(/}/g) || []).length;
      if (braceCount === 0 && inRuleBlock) {
        if (currentSelector && currentProperties.length > 0) {
          if (!selectors.has(currentSelector)) {
            selectors.set(currentSelector, []);
          }
          selectors.get(currentSelector).push({
            file: filename,
            line: i + 1,
            properties: [...currentProperties]
          });
        }
        inRuleBlock = false;
        currentSelector = '';
        currentProperties = [];
      }
    }
    
    // Extract CSS properties
    if (inRuleBlock && line.includes(':') && !line.includes('{') && !line.includes('}')) {
      const property = line.split(':')[0].trim();
      if (property && !property.startsWith('/*') && !property.startsWith('//')) {
        currentProperties.push(property);
      }
    }
  }
  
  return selectors;
}

// Find conflicts between selectors
function findConflicts(allSelectors) {
  const conflicts = [];
  const duplicates = [];
  
  for (const [selector, occurrences] of allSelectors) {
    if (occurrences.length > 1) {
      duplicates.push({
        selector,
        occurrences,
        conflictType: 'duplicate'
      });
      
      // Check for property conflicts
      const propertyConflicts = new Map();
      
      for (const occurrence of occurrences) {
        for (const property of occurrence.properties) {
          if (!propertyConflicts.has(property)) {
            propertyConflicts.set(property, []);
          }
          propertyConflicts.get(property).push(occurrence);
        }
      }
      
      for (const [property, propOccurrences] of propertyConflicts) {
        if (propOccurrences.length > 1) {
          conflicts.push({
            selector,
            property,
            occurrences: propOccurrences,
            conflictType: 'property-override'
          });
        }
      }
    }
  }
  
  return { conflicts, duplicates };
}

// Calculate specificity (simplified)
function calculateSpecificity(selector) {
  let ids = (selector.match(/#/g) || []).length;
  let classes = (selector.match(/\./g) || []).length;
  let attributes = (selector.match(/\[/g) || []).length;
  let pseudos = (selector.match(/:/g) || []).length;
  let elements = selector.split(/[\s>+~]/).length - 1;
  
  return {
    inline: 0,
    ids: ids,
    classes: classes + attributes + pseudos,
    elements: elements,
    specificity: ids * 100 + (classes + attributes + pseudos) * 10 + elements
  };
}

// Main analysis function
async function analyzeCSSConflicts() {
  console.log('🔍 Analyzing CSS conflicts...\n');
  
  const cssFiles = await glob('src/**/*.css', { ignore: ['node_modules/**', 'dist/**'] });
  const allSelectors = new Map();
  
  // Parse all CSS files
  for (const file of cssFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const selectors = parseCSS(content, file);
    
    for (const [selector, occurrences] of selectors) {
      if (!allSelectors.has(selector)) {
        allSelectors.set(selector, []);
      }
      allSelectors.get(selector).push(...occurrences);
    }
  }
  
  const { conflicts, duplicates } = findConflicts(allSelectors);
  
  console.log(`📊 Analysis Results:`);
  console.log(`   CSS Files analyzed: ${cssFiles.length}`);
  console.log(`   Unique selectors: ${allSelectors.size}`);
  console.log(`   Duplicate selectors: ${duplicates.length}`);
  console.log(`   Property conflicts: ${conflicts.length}\n`);
  
  // Report duplicates with specificity
  if (duplicates.length > 0) {
    console.log('🔄 DUPLICATE SELECTORS:');
    console.log('='.repeat(50));
    
    for (const duplicate of duplicates) {
      const specificity = calculateSpecificity(duplicate.selector);
      console.log(`\n📍 Selector: ${duplicate.selector}`);
      console.log(`   Specificity: ${specificity.specificity} (${specificity.ids}:${specificity.classes}:${specificity.elements})`);
      console.log(`   Occurrences: ${duplicate.occurrences.length}`);
      
      for (const occurrence of duplicate.occurrences) {
        console.log(`   - ${occurrence.file}:${occurrence.line}`);
        console.log(`     Properties: ${occurrence.properties.join(', ')}`);
      }
    }
  }
  
  // Report property conflicts
  if (conflicts.length > 0) {
    console.log('\n⚠️  PROPERTY CONFLICTS:');
    console.log('='.repeat(50));
    
    for (const conflict of conflicts) {
      console.log(`\n🔥 Selector: ${conflict.selector}`);
      console.log(`   Property: ${conflict.property}`);
      console.log(`   Conflicts in ${conflict.occurrences.length} files:`);
      
      for (const occurrence of conflict.occurrences) {
        console.log(`   - ${occurrence.file}:${occurrence.line}`);
      }
    }
  }
  
  // Generate conflict matrix data
  const conflictMatrix = generateConflictMatrix(duplicates, conflicts);
  fs.writeFileSync('css-conflict-matrix.json', JSON.stringify(conflictMatrix, null, 2));
  
  console.log('\n📋 Conflict matrix saved to: css-conflict-matrix.json');
  
  return conflictMatrix;
}

function generateConflictMatrix(duplicates, conflicts) {
  const matrix = {
    summary: {
      totalDuplicates: duplicates.length,
      totalConflicts: conflicts.length,
      analysisDate: new Date().toISOString()
    },
    recommendations: [],
    duplicates: duplicates.map(dup => ({
      selector: dup.selector,
      occurrences: dup.occurrences.length,
      files: dup.occurrences.map(o => o.file),
      recommendation: generateRecommendation(dup),
      specificity: calculateSpecificity(dup.selector)
    })),
    conflicts: conflicts.map(conf => ({
      selector: conf.selector,
      property: conf.property,
      occurrences: conf.occurrences.length,
      files: conf.occurrences.map(o => o.file),
      recommendation: generateConflictRecommendation(conf)
    }))
  };
  
  return matrix;
}

function generateRecommendation(duplicate) {
  const fileCount = new Set(duplicate.occurrences.map(o => o.file)).size;
  const totalOccurrences = duplicate.occurrences.length;
  
  if (fileCount === 1) {
    return {
      action: 'delete',
      reason: 'Multiple definitions in same file - remove duplicates',
      priority: 'high'
    };
  } else if (totalOccurrences > 3) {
    return {
      action: 'refactor-utility',
      reason: 'High usage across multiple files - convert to utility class',
      priority: 'medium'
    };
  } else {
    return {
      action: 'override-single',
      reason: 'Low usage - consolidate into single definition',
      priority: 'low'
    };
  }
}

function generateConflictRecommendation(conflict) {
  const fileCount = new Set(conflict.occurrences.map(o => o.file)).size;
  
  if (fileCount > 2) {
    return {
      action: 'refactor-utility',
      reason: 'Property conflicts across multiple files - create utility class',
      priority: 'high'
    };
  } else {
    return {
      action: 'override-single',
      reason: 'Conflicts in few files - establish single source of truth',
      priority: 'medium'
    };
  }
}

// Run analysis if called directly
analyzeCSSConflicts().catch(console.error);

export { analyzeCSSConflicts };
