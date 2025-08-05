import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Test against production domain with CloudFront CDN
const BASE_URL = 'https://bigfootlive.io';

test.beforeAll(async () => {
  // Testing against production CloudFront distribution
});

test.describe.skip('Accessibility Audit', () => {
  // Test Landing Page
  test('Landing page accessibility - Light Mode', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Ensure we're in light mode
    await page.locator('html').evaluate(() => {
      document.documentElement.classList.remove('dark');
    });
    
    // Run accessibility scan
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    // Check for violations
    expect(accessibilityScanResults.violations).toEqual([]);
    
    // Additional manual checks for color contrast
    await expect(page).toHaveScreenshot('landing-light-mode.png');
  });

  test('Landing page accessibility - Dark Mode', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Switch to dark mode
    await page.locator('html').evaluate(() => {
      document.documentElement.classList.add('dark');
    });
    
    // Wait for theme to apply
    await page.waitForTimeout(500);
    
    // Run accessibility scan
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    // Check for violations
    expect(accessibilityScanResults.violations).toEqual([]);
    
    // Additional manual checks for color contrast
    await expect(page).toHaveScreenshot('landing-dark-mode.png');
  });

  // Test Dashboard Pages (Note: These require authentication, so we'll test what we can)
  test('Dashboard streams page accessibility - Light Mode', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/streams`);
    
    // Wait for page to load (may redirect to login)
    await page.waitForLoadState('networkidle');
    
    // If redirected to login, test that instead
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      // Test login page accessibility
      const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
      expect(accessibilityScanResults.violations).toEqual([]);
      
      await expect(page).toHaveScreenshot('login-light-mode.png');
    } else {
      // Test dashboard page
      const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
      expect(accessibilityScanResults.violations).toEqual([]);
      
      await expect(page).toHaveScreenshot('dashboard-streams-light-mode.png');
    }
  });

  test('Dashboard streams page accessibility - Dark Mode', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/streams`);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Switch to dark mode
    await page.locator('html').evaluate(() => {
      document.documentElement.classList.add('dark');
    });
    
    // Wait for theme to apply
    await page.waitForTimeout(500);
    
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      // Test login page accessibility in dark mode
      const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
      expect(accessibilityScanResults.violations).toEqual([]);
      
      await expect(page).toHaveScreenshot('login-dark-mode.png');
    } else {
      // Test dashboard page in dark mode
      const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
      expect(accessibilityScanResults.violations).toEqual([]);
      
      await expect(page).toHaveScreenshot('dashboard-streams-dark-mode.png');
    }
  });

  // Test Tenant Dashboard
  test('Tenant dashboard accessibility - Light Mode', async ({ page }) => {
    await page.goto(`${BASE_URL}/tenant`);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Ensure we're in light mode
    await page.locator('html').evaluate(() => {
      document.documentElement.classList.remove('dark');
    });
    
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      // Test login page accessibility (already covered above, but ensure consistency)
      const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
      expect(accessibilityScanResults.violations).toEqual([]);
    } else {
      // Test tenant dashboard page
      const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
      expect(accessibilityScanResults.violations).toEqual([]);
      
      await expect(page).toHaveScreenshot('tenant-dashboard-light-mode.png');
    }
  });

  test('Tenant dashboard accessibility - Dark Mode', async ({ page }) => {
    await page.goto(`${BASE_URL}/tenant`);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Switch to dark mode
    await page.locator('html').evaluate(() => {
      document.documentElement.classList.add('dark');
    });
    
    // Wait for theme to apply
    await page.waitForTimeout(500);
    
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      // Skip this test as it's covered above
      return;
    } else {
      // Test tenant dashboard page in dark mode
      const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
      expect(accessibilityScanResults.violations).toEqual([]);
      
      await expect(page).toHaveScreenshot('tenant-dashboard-dark-mode.png');
    }
  });
});
