#!/usr/bin/env node

/**
 * Comprehensive Quality Assurance Test Suite
 * 
 * This script runs all QA tests including:
 * - Cross-browser testing (Chrome, Firefox, Safari, Edge, Mobile)
 * - Lighthouse performance audits
 * - Accessibility testing with Axe
 * - CSS optimization and analysis
 * 
 * Usage:
 *   node scripts/run-qa-suite.js [--skip-build] [--skip-lighthouse] [--browsers=chrome,firefox]
 */

import { execSync, spawn } from 'child_process';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { performance } from 'perf_hooks';

// Configuration
const CONFIG = {
  baseUrl: 'http://localhost:5173',
  reportDir: './qa-reports',
  lighthouseReportDir: './lighthouse-reports',
  browsers: ['chromium', 'firefox', 'webkit', 'Mobile Chrome', 'Mobile Safari', 'Microsoft Edge'],
  timeoutMs: 120000, // 2 minutes
};

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

class QASuite {
  constructor() {
    this.results = {
      startTime: performance.now(),
      tests: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
      },
    };
    
    this.parseArgs();
    this.setupDirectories();
  }

  parseArgs() {
    const args = process.argv.slice(2);
    this.options = {
      skipBuild: args.includes('--skip-build'),
      skipLighthouse: args.includes('--skip-lighthouse'),
      browsers: this.parseBrowsersArg(args),
      verbose: args.includes('--verbose'),
    };
  }

  parseBrowsersArg(args) {
    const browsersArg = args.find(arg => arg.startsWith('--browsers='));
    if (browsersArg) {
      return browsersArg.split('=')[1].split(',');
    }
    return CONFIG.browsers;
  }

  setupDirectories() {
    [CONFIG.reportDir, CONFIG.lighthouseReportDir].forEach(dir => {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
    });
  }

  log(message, color = 'reset') {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    console.log(`${colors[color]}[${timestamp}] ${message}${colors.reset}`);
  }

  async exec(command, options = {}) {
    return new Promise((resolve, reject) => {
      const startTime = performance.now();
      
      if (this.options.verbose) {
        this.log(`Executing: ${command}`, 'cyan');
      }

      try {
        const result = execSync(command, {
          encoding: 'utf8',
          timeout: CONFIG.timeoutMs,
          ...options,
        });
        
        const duration = performance.now() - startTime;
        if (this.options.verbose) {
          this.log(`Command completed in ${duration.toFixed(2)}ms`, 'green');
        }
        
        resolve(result);
      } catch (error) {
        const duration = performance.now() - startTime;
        this.log(`Command failed after ${duration.toFixed(2)}ms: ${error.message}`, 'red');
        reject(error);
      }
    });
  }

  async runTest(name, testFn) {
    this.log(`Starting: ${name}`, 'blue');
    const startTime = performance.now();
    
    try {
      const result = await testFn();
      const duration = performance.now() - startTime;
      
      this.results.tests.push({
        name,
        status: 'passed',
        duration: duration.toFixed(2),
        result,
      });
      
      this.results.summary.passed++;
      this.results.summary.total++;
      
      this.log(`✅ PASSED: ${name} (${duration.toFixed(2)}ms)`, 'green');
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      this.results.tests.push({
        name,
        status: 'failed',
        duration: duration.toFixed(2),
        error: error.message,
      });
      
      this.results.summary.failed++;
      this.results.summary.total++;
      
      this.log(`❌ FAILED: ${name} (${duration.toFixed(2)}ms)`, 'red');
      this.log(`Error: ${error.message}`, 'red');
      
      // Don't throw - continue with other tests
      return null;
    }
  }

  async buildProject() {
    if (this.options.skipBuild) {
      this.log('Skipping build step', 'yellow');
      return;
    }

    return this.runTest('Project Build', async () => {
      await this.exec('npm run build:production');
      return 'Build completed successfully';
    });
  }

  async startDevServer() {
    return new Promise((resolve, reject) => {
      this.log('Starting development server...', 'blue');
      
      const server = spawn('npm', ['run', 'dev'], {
        stdio: ['pipe', 'pipe', 'pipe'],
        detached: false,
      });

      let serverReady = false;
      const timeout = setTimeout(() => {
        if (!serverReady) {
          server.kill();
          reject(new Error('Server startup timeout'));
        }
      }, 30000); // 30 second timeout

      server.stdout.on('data', (data) => {
        const output = data.toString();
        if (output.includes('Local:') && output.includes('5173')) {
          serverReady = true;
          clearTimeout(timeout);
          this.log('Development server started', 'green');
          resolve(server);
        }
      });

      server.on('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });

      this.devServer = server;
    });
  }

  async runLintAndFormat() {
    return this.runTest('Linting and Formatting', async () => {
      await this.exec('npm run lint');
      await this.exec('npm run css:lint');
      return 'All linting checks passed';
    });
  }

  async runCSSOptimization() {
    return this.runTest('CSS Optimization', async () => {
      await this.exec('npm run css:analyze');
      await this.exec('npm run css:clean');
      
      // Check bundle size
      const bundleAnalysis = await this.exec('npm run build && du -sh dist/assets/*.css');
      
      return {
        message: 'CSS optimization completed',
        bundleAnalysis: bundleAnalysis.trim(),
      };
    });
  }

  async runUnitTests() {
    return this.runTest('Unit Tests', async () => {
      const result = await this.exec('npm run test:coverage -- --run');
      return 'Unit tests passed with coverage';
    });
  }

  async runAccessibilityAudit() {
    return this.runTest('Accessibility Audit', async () => {
      await this.exec('npm run ui:audit:a11y');
      return 'Accessibility audit completed';
    });
  }

  async runCrossBrowserTests() {
    return this.runTest('Cross-Browser Tests', async () => {
      const browserList = this.options.browsers.join(',');
      const result = await this.exec(`npx playwright test e2e/tests/cross-browser-quality.spec.ts --project=${browserList}`);
      
      return {
        message: 'Cross-browser tests completed',
        browsers: this.options.browsers,
        details: 'Check playwright-report for detailed results',
      };
    });
  }

  async runLighthouseAudits() {
    if (this.options.skipLighthouse) {
      this.log('Skipping Lighthouse audits', 'yellow');
      return;
    }

    return this.runTest('Lighthouse Performance Audits', async () => {
      await this.exec('npx playwright test e2e/tests/lighthouse-audit.spec.ts');
      
      return {
        message: 'Lighthouse audits completed',
        reports: [
          `${CONFIG.lighthouseReportDir}/desktop-report.json`,
          `${CONFIG.lighthouseReportDir}/mobile-report.json`,
          `${CONFIG.lighthouseReportDir}/pwa-report.json`,
        ],
      };
    });
  }

  async runVisualRegressionTests() {
    return this.runTest('Visual Regression Tests', async () => {
      // Build Storybook and run Chromatic if configured
      if (process.env.CHROMATIC_PROJECT_TOKEN) {
        await this.exec('npm run build-storybook');
        await this.exec('npm run chromatic');
        return 'Visual regression tests completed via Chromatic';
      } else {
        this.log('Chromatic token not found, skipping visual regression tests', 'yellow');
        return 'Visual regression tests skipped (no Chromatic token)';
      }
    });
  }

  async generateSummaryReport() {
    const totalDuration = performance.now() - this.results.startTime;
    
    const report = {
      timestamp: new Date().toISOString(),
      duration: `${(totalDuration / 1000).toFixed(2)}s`,
      summary: this.results.summary,
      tests: this.results.tests,
      environment: {
        node: process.version,
        platform: process.platform,
        browsers: this.options.browsers,
      },
      recommendations: this.generateRecommendations(),
    };

    const reportPath = join(CONFIG.reportDir, `qa-report-${Date.now()}.json`);
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    this.log(`Summary report saved: ${reportPath}`, 'cyan');
    return report;
  }

  generateRecommendations() {
    const recommendations = [];
    const failedTests = this.results.tests.filter(test => test.status === 'failed');
    
    if (failedTests.length > 0) {
      recommendations.push({
        type: 'critical',
        message: `${failedTests.length} tests failed - immediate attention required`,
        tests: failedTests.map(test => test.name),
      });
    }

    const slowTests = this.results.tests.filter(test => parseFloat(test.duration) > 30000);
    if (slowTests.length > 0) {
      recommendations.push({
        type: 'performance',
        message: 'Some tests are running slowly - consider optimization',
        tests: slowTests.map(test => `${test.name} (${test.duration}ms)`),
      });
    }

    if (this.results.summary.passed === this.results.summary.total) {
      recommendations.push({
        type: 'success',
        message: 'All tests passed - ready for deployment!',
      });
    }

    return recommendations;
  }

  printSummary(report) {
    console.log('\n' + '='.repeat(60));
    console.log(colors.bold + '🎯 QUALITY ASSURANCE SUMMARY' + colors.reset);
    console.log('='.repeat(60));
    
    console.log(`${colors.blue}Duration:${colors.reset} ${report.duration}`);
    console.log(`${colors.green}Passed:${colors.reset} ${report.summary.passed}`);
    console.log(`${colors.red}Failed:${colors.reset} ${report.summary.failed}`);
    console.log(`${colors.yellow}Total:${colors.reset} ${report.summary.total}`);
    
    if (report.recommendations.length > 0) {
      console.log('\n' + colors.bold + '📋 RECOMMENDATIONS:' + colors.reset);
      report.recommendations.forEach(rec => {
        const icon = rec.type === 'critical' ? '🚨' : rec.type === 'performance' ? '⚡' : '✅';
        console.log(`${icon} ${rec.message}`);
      });
    }
    
    console.log('\n' + '='.repeat(60));
  }

  async cleanup() {
    if (this.devServer) {
      this.log('Shutting down development server...', 'yellow');
      this.devServer.kill();
    }
  }

  async run() {
    try {
      this.log('🚀 Starting BigfootLive QA Suite', 'bold');
      
      // Build project
      await this.buildProject();
      
      // Start dev server for tests
      await this.startDevServer();
      
      // Wait for server to be fully ready
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Run all test suites
      await this.runLintAndFormat();
      await this.runCSSOptimization();
      await this.runUnitTests();
      await this.runAccessibilityAudit();
      await this.runCrossBrowserTests();
      await this.runLighthouseAudits();
      await this.runVisualRegressionTests();
      
      // Generate and display results
      const report = await this.generateSummaryReport();
      this.printSummary(report);
      
      // Exit with appropriate code
      const exitCode = report.summary.failed > 0 ? 1 : 0;
      process.exit(exitCode);
      
    } catch (error) {
      this.log(`Fatal error: ${error.message}`, 'red');
      process.exit(1);
    } finally {
      await this.cleanup();
    }
  }
}

// Handle process signals
process.on('SIGINT', async () => {
  console.log('\n\nReceived SIGINT, cleaning up...');
  process.exit(1);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, cleaning up...');
  process.exit(1);
});

// Run the QA suite
if (import.meta.url === `file://${process.argv[1]}`) {
  const qaSuite = new QASuite();
  qaSuite.run();
}

export default QASuite;
