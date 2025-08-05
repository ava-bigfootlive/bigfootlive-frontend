import { test, expect } from '@playwright/test';

test.describe('Debug Tests', () => {
  test('inspect homepage content', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'debug-homepage.png', fullPage: true });
    
    // Log the page title
    const title = await page.title();
    console.log('Page title:', title);
    
    // Log the URL after navigation
    console.log('Current URL:', page.url());
    
    // Get the full HTML content of the body
    const bodyContent = await page.locator('body').innerHTML();
    console.log('Body content (first 1000 chars):', bodyContent.substring(0, 1000));
    
    // Check for specific elements
    const hasNav = await page.locator('nav').count();
    const hasRoot = await page.locator('#root').count();
    const rootContent = await page.locator('#root').innerHTML();
    
    console.log('Has nav element:', hasNav > 0);
    console.log('Has #root element:', hasRoot > 0);
    console.log('Root content (first 500 chars):', rootContent.substring(0, 500));
    
    // Check for common text patterns
    const loginText = await page.locator('text=login').count();
    const dashboardText = await page.locator('text=dashboard').count();
    const errorText = await page.locator('text=error').count();
    
    console.log('Contains "login":', loginText > 0);
    console.log('Contains "dashboard":', dashboardText > 0);
    console.log('Contains "error":', errorText > 0);
    
    // Check for loading states
    const loadingText = await page.locator('text=loading').count();
    console.log('Contains "loading":', loadingText > 0);
    
    // This test should always pass, it's just for debugging
    expect(hasRoot).toBeGreaterThan(0);
  });

  test('inspect login page if redirected', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check if we got redirected to login
    const currentUrl = page.url();
    console.log('Final URL after goto(/):', currentUrl);
    
    if (currentUrl.includes('login') || currentUrl.includes('auth')) {
      console.log('Redirected to login/auth page');
      
      // Check for login form elements
      const emailInput = await page.locator('input[type="email"], input[name="email"]').count();
      const passwordInput = await page.locator('input[type="password"], input[name="password"]').count();
      const submitButton = await page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').count();
      
      console.log('Has email input:', emailInput > 0);
      console.log('Has password input:', passwordInput > 0);
      console.log('Has submit button:', submitButton > 0);
      
      // Take screenshot of login page
      await page.screenshot({ path: 'debug-login.png', fullPage: true });
    }
    
    expect(true).toBe(true); // Always pass
  });
});
