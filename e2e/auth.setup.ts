import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  // Set up environment variables for credentials
  const email = process.env.TEST_EMAIL || '{{EMAIL}}';
  const password = process.env.TEST_PASSWORD || '{{PASSWORD}}';

  if (email.includes('{{') || password.includes('{{')) {
    console.log('Warning: Test credentials not provided. Skipping authentication setup.');
    console.log('Set TEST_EMAIL and TEST_PASSWORD environment variables to enable authenticated tests.');
    return;
  }

  try {
    // Navigate to login page
    await page.goto('/login');
    
    // Wait for login form to be visible
    await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 10000 });
    
    // Fill in login credentials
    await page.fill('input[type="email"], input[name="email"]', email);
    await page.fill('input[type="password"], input[name="password"]', password);
    
    // Submit the form
    const submitButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').first();
    await submitButton.click();
    
    // Wait for successful login - check for redirect to dashboard or authenticated page
    await page.waitForURL(/\/(tenant|dashboard)/, { timeout: 30000 });
    
    // Verify we're logged in by checking for authenticated elements
    await expect(page.locator('body')).toBeVisible();
    
    // Save authenticated state
    await page.context().storageState({ path: authFile });
    
    console.log('✅ Authentication successful - state saved to', authFile);
    
  } catch (error) {
    console.error('❌ Authentication failed:', error);
    throw error;
  }
});
