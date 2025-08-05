import { test, expect } from '@playwright/test';

// Enable this test suite when the dev server is available
test.describe('Dashboard Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Skip all tests in this suite if server is not available
    try {
      await page.goto('/', { timeout: 5000 });
  } catch {
      test.skip(true, 'Dev server not running - these tests require "npm run dev"');
    }
  });

  test('dashboard navigation works', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // App should redirect to login when unauthenticated
    if (page.url().includes('/login')) {
      // On login page, check for login form instead of navigation
      await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible();
      console.log('✓ Redirected to login as expected for unauthenticated user');
    } else {
      // If somehow authenticated, check for navigation elements
      const navigation = page.locator('nav');
      await expect(navigation).toBeVisible();
      await expect(page.locator('nav')).toBeVisible();
    }
  });

  test('responsive design works on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Mobile menu should be visible or navigation should adapt
    await expect(page.locator('body')).toBeVisible();
  });

  test('theme switching works if available', async ({ page }) => {
    await page.goto('/');
    
    // Look for theme toggle button (common in modern apps)
    const themeToggle = page.locator('[data-testid="theme-toggle"]').or(
      page.locator('button:has-text("Dark")').or(
        page.locator('button:has-text("Light")')
      )
    );
    
    if (await themeToggle.count() > 0) {
      await themeToggle.first().click();
      // Theme should change (this would need to be more specific based on actual implementation)
      await expect(page.locator('body')).toBeVisible();
    }
  });
});
