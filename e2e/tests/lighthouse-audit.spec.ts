import { test, expect, chromium } from '@playwright/test';
import lighthouse from 'lighthouse';
import { writeFileSync } from 'fs';
import { join } from 'path';

test.describe.skip('Lighthouse Performance Audits', () => {
  
  test('Desktop Performance Audit', async () => {
    const browser = await chromium.launch({
      args: ['--remote-debugging-port=9222', '--disable-dev-shm-usage'],
    });
    
    const page = await browser.newPage();
    await page.goto('http://localhost:4173');
    await page.waitForLoadState('networkidle');
    
    try {
      // Run Lighthouse audit
      const result = await lighthouse('http://localhost:4173', {
        port: 9222,
        output: 'json',
        logLevel: 'info',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
        settings: {
          preset: 'desktop',
        },
      });
      
      const { lhr } = result!;
      
      // Performance assertions
      expect(lhr.categories.performance.score).toBeGreaterThanOrEqual(0.8); // 80% or better
      expect(lhr.categories.accessibility.score).toBeGreaterThanOrEqual(0.9); // 90% or better
      expect(lhr.categories['best-practices'].score).toBeGreaterThanOrEqual(0.8); // 80% or better
      expect(lhr.categories.seo.score).toBeGreaterThanOrEqual(0.8); // 80% or better
      
      // Core Web Vitals checks
      const fcp = lhr.audits['first-contentful-paint'].numericValue!;
      const lcp = lhr.audits['largest-contentful-paint'].numericValue!;
      const cls = lhr.audits['cumulative-layout-shift'].numericValue!;
      const fid = lhr.audits['max-potential-fid']?.numericValue || 0;
      
      expect(fcp).toBeLessThan(2000); // FCP under 2s
      expect(lcp).toBeLessThan(2500); // LCP under 2.5s
      expect(cls).toBeLessThan(0.1);  // CLS under 0.1
      expect(fid).toBeLessThan(100);  // FID under 100ms
      
      // Save detailed report
      const reportPath = join(process.cwd(), 'lighthouse-reports', 'desktop-report.json');
      writeFileSync(reportPath, JSON.stringify(lhr, null, 2));
      console.log(`Desktop Lighthouse report saved to: ${reportPath}`);
      
    } catch (error) {
      console.error('Lighthouse audit failed:', error);
      throw error;
    } finally {
      await browser.close();
    }
  });

  test('Mobile Performance Audit', async () => {
    const browser = await chromium.launch({
      args: ['--remote-debugging-port=9223', '--disable-dev-shm-usage'],
    });
    
    const page = await browser.newPage();
    await page.goto('http://localhost:4173');
    await page.waitForLoadState('networkidle');
    
    try {
      // Run Lighthouse mobile audit
      const result = await lighthouse('http://localhost:4173', {
        port: 9223,
        output: 'json',
        logLevel: 'info',
        onlyCategories: ['performance', 'accessibility', 'best-practices'],
        settings: {
          preset: 'mobile',
          throttling: {
            rttMs: 150,
            throughputKbps: 1638.4,
            cpuSlowdownMultiplier: 4,
          },
        },
      });
      
      const { lhr } = result!;
      
      // Mobile performance is typically lower, so adjust thresholds
      expect(lhr.categories.performance.score).toBeGreaterThanOrEqual(0.7); // 70% or better for mobile
      expect(lhr.categories.accessibility.score).toBeGreaterThanOrEqual(0.9); // 90% or better
      expect(lhr.categories['best-practices'].score).toBeGreaterThanOrEqual(0.8); // 80% or better
      
      // Mobile Core Web Vitals (more lenient)
      const fcp = lhr.audits['first-contentful-paint'].numericValue!;
      const lcp = lhr.audits['largest-contentful-paint'].numericValue!;
      const cls = lhr.audits['cumulative-layout-shift'].numericValue!;
      
      expect(fcp).toBeLessThan(3000); // FCP under 3s on mobile
      expect(lcp).toBeLessThan(4000); // LCP under 4s on mobile
      expect(cls).toBeLessThan(0.1);  // CLS under 0.1
      
      // Save detailed report
      const reportPath = join(process.cwd(), 'lighthouse-reports', 'mobile-report.json');
      writeFileSync(reportPath, JSON.stringify(lhr, null, 2));
      console.log(`Mobile Lighthouse report saved to: ${reportPath}`);
      
    } catch (error) {
      console.error('Mobile Lighthouse audit failed:', error);
      throw error;
    } finally {
      await browser.close();
    }
  });

  test('Progressive Web App Audit', async () => {
    const browser = await chromium.launch({
      args: ['--remote-debugging-port=9224', '--disable-dev-shm-usage'],
    });
    
    const page = await browser.newPage();
    await page.goto('http://localhost:4173');
    await page.waitForLoadState('networkidle');
    
    try {
      // Run PWA-focused audit
      const result = await lighthouse('http://localhost:4173', {
        port: 9224,
        output: 'json',
        logLevel: 'info',
        onlyCategories: ['pwa'],
      });
      
      const { lhr } = result!;
      
      // PWA score (may be lower if not implemented yet)
      console.log(`PWA Score: ${lhr.categories.pwa.score}`);
      
      // Check key PWA features
      const serviceWorker = lhr.audits['service-worker'];
      const manifest = lhr.audits['installable-manifest'];
      const httpsUsage = lhr.audits['is-on-https'];
      
      console.log('PWA Audit Results:', {
        serviceWorker: serviceWorker.score,
        manifest: manifest.score,
        https: httpsUsage.score,
      });
      
      // Save PWA report
      const reportPath = join(process.cwd(), 'lighthouse-reports', 'pwa-report.json');
      writeFileSync(reportPath, JSON.stringify(lhr, null, 2));
      console.log(`PWA Lighthouse report saved to: ${reportPath}`);
      
    } catch (error) {
      console.error('PWA audit failed:', error);
      throw error;
    } finally {
      await browser.close();
    }
  });
});
