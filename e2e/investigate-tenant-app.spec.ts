import { test, expect } from '@playwright/test';

// Use authenticated state for all tests in this file
test.use({ storageState: 'playwright/.auth/user.json' });

test.describe('Investigate Tenant Application Rendering', () => {
  test('deep dive into tenant app loading', async ({ page }) => {
    console.log('🔍 Deep investigation of tenant application...');
    
    // Enable console logging
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    
    // Navigate to tenant dashboard
    await page.goto('/tenant', { waitUntil: 'networkidle' });
    
    console.log('Current URL:', page.url());
    console.log('Page title:', await page.title());
    
    // Wait for potential React app to load
    await page.waitForTimeout(3000);
    
    // Check if this is a SPA that needs time to load
    const rootDiv = page.locator('#root, #app, .app, .root');
    const rootCount = await rootDiv.count();
    console.log('Root containers found:', rootCount);
    
    if (rootCount > 0) {
      const rootContent = await rootDiv.first().innerHTML();
      console.log('Root container content (first 500 chars):', rootContent.slice(0, 500));
    }
    
    // Check for JavaScript errors or loading states
    const loadingElements = page.locator('text="Loading", text="Please wait", .loading, .spinner, .loading-spinner');
    const loadingCount = await loadingElements.count();
    console.log('Loading indicators found:', loadingCount);
    
    // Check for error messages
    const errorElements = page.locator('text="Error", text="404", text="Not Found", .error');
    const errorCount = await errorElements.count();
    console.log('Error indicators found:', errorCount);
    
    // Check the full page HTML to understand what's happening
    const pageContent = await page.content();
    console.log('Full page HTML length:', pageContent.length);
    
    // Look for script tags
    const scriptTags = await page.locator('script').count();
    console.log('Script tags found:', scriptTags);
    
    // Check if there are any React or Vue indicators
    const reactIndicators = [
      '[data-reactroot]',
      '[data-react]',
      '.react-app',
      '#react-root'
    ];
    
    for (const indicator of reactIndicators) {
      const count = await page.locator(indicator).count();
      if (count > 0) {
        console.log(`Found React indicator: ${indicator} (${count})`);
      }
    }
    
    // Check for any content that might be hidden or in unusual places
    const allDivs = await page.locator('div').count();
    const allSpans = await page.locator('span').count();
    console.log(`Total divs: ${allDivs}, Total spans: ${allSpans}`);
    
    // Look for any tenant-specific content
    const tenantContent = [
      'text*="tenant"',
      'text*="dashboard"',
      'text*="stream"',
      'text*="live"',
      'text*="analytics"',
      '[class*="tenant"]',
      '[class*="dashboard"]',
      '[id*="tenant"]'
    ];
    
    console.log('🔍 Searching for tenant-related content:');
    for (const selector of tenantContent) {
      try {
        const count = await page.locator(selector).count();
        if (count > 0) {
          console.log(`✅ Found ${count} elements matching: ${selector}`);
        }
      } catch {
        // Continue with other selectors
      }
    }
    
    // Take a screenshot
    await page.screenshot({ path: 'debug-tenant-investigation.png', fullPage: true });
    
    expect(true).toBeTruthy();
  });

  test('investigate page after authentication redirect', async ({ page }) => {
    console.log('🔍 Investigating post-authentication state...');
    
    // Start from login and see what happens after auth
    await page.goto('/login');
    
    // Check if we're already logged in (should redirect)
    await page.waitForTimeout(2000);
    
    console.log('URL after login page visit:', page.url());
    
    if (!page.url().includes('/login')) {
      console.log('✅ Already authenticated, redirected to:', page.url());
      
      // Now investigate what we see
      await page.waitForLoadState('networkidle');
      const bodyText = await page.locator('body').textContent();
      console.log('Body text content length:', bodyText?.length || 0);
      
      if (bodyText && bodyText.length > 100) {
        console.log('First 200 chars of body:', bodyText.slice(0, 200));
        console.log('Last 200 chars of body:', bodyText.slice(-200));
      }
      
      // Check for common authenticated app patterns
      const appPatterns = [
        'text="Welcome"',
        'text="Dashboard"',
        'text="Profile"',
        'text="Logout"',
        'text="Sign Out"',
        'nav',
        'header',
        'sidebar',
        '.nav',
        '.header',
        '.sidebar',
        '.main-content'
      ];
      
      console.log('🔍 Checking for authenticated app patterns:');
      for (const pattern of appPatterns) {
        const count = await page.locator(pattern).count();
        if (count > 0) {
          console.log(`✅ Found: ${pattern} (${count} elements)`);
          if (count === 1) {
            try {
              const text = await page.locator(pattern).textContent();
              console.log(`   Content: "${text?.slice(0, 100)}"`);
            } catch {
              // Skip if can't get text
            }
          }
        }
      }
      
    } else {
      console.log('❌ Still on login page - authentication might not be working');
    }
    
    expect(true).toBeTruthy();
  });
});
