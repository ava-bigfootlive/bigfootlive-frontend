#!/usr/bin/env node

/**
 * BigfootLive UI System Migration Script
 * 
 * This master script orchestrates the complete migration from legacy UI components
 * to shadcn/ui with full theme token integration and accessibility compliance.
 * 
 * Usage:
 *   node scripts/migrate-ui-system.js [directory] [options]
 * 
 * Options:
 *   --dry-run     Show what would be changed without making changes
 *   --verbose     Show detailed output during migration
 *   --skip-backup Do not create backup of files before migration
 *   --fix-a11y    Automatically fix accessibility issues
 * 
 * Examples:
 *   node scripts/migrate-ui-system.js src/
 *   node scripts/migrate-ui-system.js --dry-run --verbose
 *   node scripts/migrate-ui-system.js src/components/ --fix-a11y
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Import our codemod modules
const componentMigrator = require('./codemods/migrate-ui-components');
const themeIntegrator = require('./codemods/integrate-theme-tokens');
const accessibilityAuditor = require('./codemods/audit-accessibility');

/**
 * Configuration for the migration process
 */
const MIGRATION_CONFIG = {
  // Steps to execute in order
  steps: [
    {
      name: 'Component Migration',
      description: 'Replace legacy UI components with shadcn/ui equivalents',
      script: './scripts/codemods/migrate-ui-components.js',
      required: true
    },
    {
      name: 'Theme Integration',
      description: 'Integrate design tokens and replace hardcoded styles',
      script: './scripts/codemods/integrate-theme-tokens.js',
      required: true
    },
    {
      name: 'Accessibility Audit',
      description: 'Audit and fix accessibility issues',
      script: './scripts/codemods/audit-accessibility.js',
      required: false
    }
  ],
  
  // Files to backup before migration
  backupPatterns: ['src/**/*.{ts,tsx,js,jsx,css,scss}'],
  
  // Validation checks after migration
  validationChecks: [
    'npm run type-check',
    'npm run lint -- --max-warnings 0',
    'npm run test -- --passWithNoTests'
  ]
};

/**
 * Create backup of files before migration
 */
function createBackup(targetDir, skipBackup = false) {
  if (skipBackup) {
    console.log('⚠️  Skipping backup creation');
    return null;
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = `backup-ui-migration-${timestamp}`;
  
  console.log(`📦 Creating backup in ${backupDir}...`);
  
  try {
    // Create backup directory
    fs.mkdirSync(backupDir, { recursive: true });
    
    // Copy files to backup
    execSync(`cp -r ${targetDir} ${backupDir}/`, { stdio: 'pipe' });
    
    console.log(`✅ Backup created successfully`);
    return backupDir;
  } catch (error) {
    console.error(`❌ Failed to create backup:`, error.message);
    return null;
  }
}

/**
 * Run validation checks after migration
 */
function runValidationChecks(checks) {
  console.log('\n🔍 Running validation checks...');
  
  const results = [];
  
  for (const check of checks) {
    console.log(`   Running: ${check}`);
    
    try {
      execSync(check, { stdio: 'pipe' });
      console.log(`   ✅ ${check} - PASSED`);
      results.push({ check, status: 'passed' });
    } catch (error) {
      console.log(`   ❌ ${check} - FAILED`);
      console.log(`      ${error.message.split('\n')[0]}`);
      results.push({ check, status: 'failed', error: error.message });
    }
  }
  
  return results;
}

/**
 * Generate migration report
 */
function generateMigrationReport(results, backupDir, validationResults) {
  const reportPath = `migration-report-${new Date().toISOString().split('T')[0]}.md`;
  
  const report = `# BigfootLive UI System Migration Report

## Migration Summary

**Date:** ${new Date().toISOString()}
**Backup Location:** ${backupDir || 'None (--skip-backup used)'}

## Steps Completed

${results.map(result => `
### ${result.step.name}
- **Status:** ${result.success ? '✅ Success' : '❌ Failed'}
- **Description:** ${result.step.description}
${result.error ? `- **Error:** ${result.error}` : ''}
${result.summary ? `- **Summary:** ${result.summary}` : ''}
`).join('\n')}

## Validation Results

${validationResults.map(result => `
- **${result.check}:** ${result.status === 'passed' ? '✅ PASSED' : '❌ FAILED'}
${result.error ? `  - Error: ${result.error.split('\n')[0]}` : ''}
`).join('\n')}

## Next Steps

${results.every(r => r.success) && validationResults.every(r => r.status === 'passed') ? `
✅ **Migration completed successfully!**

1. Test your application thoroughly
2. Update documentation if needed
3. Train team on new component patterns
4. Consider setting up accessibility testing in CI/CD
` : `
⚠️ **Migration completed with issues**

1. Review and fix any failed validation checks
2. Check the backup if you need to restore any files
3. Run tests manually to ensure everything works
4. Consider running individual codemod scripts to address specific issues
`}

## Resources

- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [BigfootLive Design System](./src/styles/themeTokens.ts)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [React Accessibility](https://reactjs.org/docs/accessibility.html)

Generated on ${new Date().toISOString()}
`;

  fs.writeFileSync(reportPath, report);
  console.log(`\n📄 Migration report saved to: ${reportPath}`);
  
  return reportPath;
}

/**
 * Execute a migration step
 */
function executeMigrationStep(step, targetDir, options) {
  console.log(`\n🔄 Executing: ${step.name}`);
  console.log(`   ${step.description}`);
  
  try {
    let command = `node ${step.script} ${targetDir}`;
    
    // Add options based on step type
    if (step.name === 'Accessibility Audit' && options.fixA11y) {
      command += ' --fix';
    }
    
    if (options.verbose) {
      command += ' --verbose';
    }
    
    if (options.dryRun) {
      console.log(`   🔍 DRY RUN: Would execute: ${command}`);
      return { success: true, summary: 'Dry run completed' };
    }
    
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    
    console.log(`   ✅ ${step.name} completed successfully`);
    
    // Extract summary from output if available
    const summaryMatch = output.match(/Files (?:scanned|migrated|updated): \d+/g);
    const summary = summaryMatch ? summaryMatch.join(', ') : 'Completed';
    
    return { success: true, summary, output };
  } catch (error) {
    console.error(`   ❌ ${step.name} failed:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Main migration function
 */
function runMigration(targetDir, options = {}) {
  console.log('🚀 BigfootLive UI System Migration');
  console.log('==================================');
  console.log(`Target directory: ${targetDir}`);
  console.log(`Options: ${JSON.stringify(options, null, 2)}`);
  console.log('');
  
  // Validate target directory
  if (!fs.existsSync(targetDir)) {
    console.error(`❌ Directory ${targetDir} does not exist`);
    process.exit(1);
  }
  
  // Check for required dependencies
  if (!fs.existsSync('package.json')) {
    console.error('❌ package.json not found. Run this script from the project root.');
    process.exit(1);
  }
  
  // Create backup
  const backupDir = createBackup(targetDir, options.skipBackup);
  
  // Execute migration steps
  const results = [];
  
  for (const step of MIGRATION_CONFIG.steps) {
    if (!step.required && !options.fixA11y && step.name === 'Accessibility Audit') {
      console.log(`\n⏭️  Skipping: ${step.name} (use --fix-a11y to enable)`);
      continue;
    }
    
    const result = executeMigrationStep(step, targetDir, options);
    results.push({ step, ...result });
    
    // Stop on failure if step is required
    if (!result.success && step.required) {
      console.error(`\n❌ Migration failed at step: ${step.name}`);
      console.error('   Please fix the issues and try again');
      
      if (backupDir) {
        console.log(`\n💡 You can restore from backup: ${backupDir}`);
      }
      
      process.exit(1);
    }
  }
  
  // Run validation checks (only if not dry run)
  let validationResults = [];
  if (!options.dryRun) {
    validationResults = runValidationChecks(MIGRATION_CONFIG.validationChecks);
  }
  
  // Generate report
  const reportPath = generateMigrationReport(results, backupDir, validationResults);
  
  // Final summary
  const successfulSteps = results.filter(r => r.success).length;
  const totalSteps = results.length;
  const validationPassed = validationResults.filter(r => r.status === 'passed').length;
  const totalValidations = validationResults.length;
  
  console.log('\n🏁 Migration Summary');
  console.log('===================');
  console.log(`Steps completed: ${successfulSteps}/${totalSteps}`);
  console.log(`Validations passed: ${validationPassed}/${totalValidations}`);
  console.log(`Report: ${reportPath}`);
  
  if (successfulSteps === totalSteps && (options.dryRun || validationPassed === totalValidations)) {
    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Test your application thoroughly');
    console.log('   2. Update any custom styles that may need adjustment');
    console.log('   3. Train your team on the new component patterns');
    console.log('   4. Set up accessibility testing in your CI/CD pipeline');
  } else {
    console.log('\n⚠️  Migration completed with issues');
    console.log('   Please review the report and address any failures');
    
    if (backupDir) {
      console.log(`   Backup available at: ${backupDir}`);
    }
  }
}

/**
 * Main execution function
 */
function main() {
  const args = process.argv.slice(2);
  const targetDir = args.find(arg => !arg.startsWith('--')) || 'src';
  
  const options = {
    dryRun: args.includes('--dry-run'),
    verbose: args.includes('--verbose'),
    skipBackup: args.includes('--skip-backup'),
    fixA11y: args.includes('--fix-a11y')
  };
  
  // Show help if requested
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
BigfootLive UI System Migration Script

Usage:
  node scripts/migrate-ui-system.js [directory] [options]

Options:
  --dry-run     Show what would be changed without making changes
  --verbose     Show detailed output during migration
  --skip-backup Do not create backup of files before migration
  --fix-a11y    Automatically fix accessibility issues
  --help, -h    Show this help message

Examples:
  node scripts/migrate-ui-system.js src/
  node scripts/migrate-ui-system.js --dry-run --verbose
  node scripts/migrate-ui-system.js src/components/ --fix-a11y
    `);
    process.exit(0);
  }
  
  runMigration(targetDir, options);
}

// Run the migration
if (require.main === module) {
  main();
}

module.exports = {
  runMigration,
  createBackup,
  runValidationChecks,
  generateMigrationReport
};
