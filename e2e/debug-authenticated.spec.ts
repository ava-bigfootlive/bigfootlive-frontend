import { test, expect } from '@playwright/test';

// Use authenticated state for all tests in this file
test.use({ storageState: 'playwright/.auth/user.json' });

test.describe('Debug Authenticated User Interface', () => {
  test('investigate authenticated user dashboard', async ({ page }) => {
    console.log('🔍 Investigating authenticated user interface...');
    
    // Navigate to tenant dashboard
    await page.goto('/tenant');
    
    console.log('Current URL:', page.url());
    console.log('Page title:', await page.title());
    
    // Take a screenshot
    await page.screenshot({ path: 'debug-authenticated-dashboard.png', fullPage: true });
    
    // Get all text content
    const bodyText = await page.locator('body').textContent();
    console.log('Page content (first 500 chars):', bodyText?.slice(0, 500));
    
    // Check for navigation elements
    const navElements = await page.locator('nav').count();
    console.log('Number of nav elements:', navElements);
    
    if (navElements > 0) {
      const navText = await page.locator('nav').first().textContent();
      console.log('Navigation content:', navText);
    }
    
    // Check for common dashboard elements
    const dashboardElements = [
      'text="Dashboard"',
      'text="Analytics"', 
      'text="Live Control"',
      'text="Settings"',
      'text="Content"',
      'text="Team"',
      'text="Profile"',
      'text="Streaming"',
      'text="Live"',
      'button',
      'a[href]',
      'h1',
      'h2',
      '.dashboard',
      '.nav',
      '[role="navigation"]'
    ];
    
    console.log('🔍 Element investigation:');
    for (const selector of dashboardElements) {
      try {
        const count = await page.locator(selector).count();
        if (count > 0) {
          console.log(`✅ Found ${count} elements for: ${selector}`);
          if (count <= 5) {
            // Get text content for small numbers of elements
            for (let i = 0; i < count; i++) {
              const text = await page.locator(selector).nth(i).textContent();
              console.log(`   - Element ${i}: "${text}"`);
            }
          }
        }
      } catch (error) {
        console.log(`❌ Error checking ${selector}:`, error.message);
      }
    }
    
    // Check for links
    const links = await page.locator('a[href]').all();
    console.log(`🔗 Found ${links.length} links:`);
    for (let i = 0; i < Math.min(links.length, 10); i++) {
      const href = await links[i].getAttribute('href');
      const text = await links[i].textContent();
      console.log(`   - "${text}" -> ${href}`);
    }
    
    // Check for buttons
    const buttons = await page.locator('button').all();
    console.log(`🔘 Found ${buttons.length} buttons:`);
    for (let i = 0; i < Math.min(buttons.length, 10); i++) {
      const text = await buttons[i].textContent();
      const ariaLabel = await buttons[i].getAttribute('aria-label');
      console.log(`   - "${text}" (aria-label: "${ariaLabel}")`);
    }
    
    // Check for forms and inputs
    const inputs = await page.locator('input').count();
    const textareas = await page.locator('textarea').count();
    const selects = await page.locator('select').count();
    console.log(`📝 Form elements: ${inputs} inputs, ${textareas} textareas, ${selects} selects`);
    
    // This test always passes - it's just for investigation
    expect(true).toBeTruthy();
  });

  test('investigate specific authenticated routes', async ({ page }) => {
    const routes = ['/tenant', '/tenant/analytics', '/tenant/live-control', '/tenant/content', '/tenant/team', '/tenant/settings'];
    
    for (const route of routes) {
      console.log(`\n🔍 Investigating route: ${route}`);
      
      try {
        await page.goto(route);
        console.log('Current URL:', page.url());
        
        if (page.url().includes('/login')) {
          console.log('❌ Redirected to login - authentication may have expired');
          continue;
        }
        
        const title = await page.title();
        console.log('Page title:', title);
        
        // Get main content
        const h1Count = await page.locator('h1').count();
        const h2Count = await page.locator('h2').count();
        console.log(`Headers: ${h1Count} h1, ${h2Count} h2`);
        
        if (h1Count > 0) {
          const h1Text = await page.locator('h1').first().textContent();
          console.log('Main heading:', h1Text);
        }
        
        // Check for key elements
        const buttonCount = await page.locator('button').count();
        const linkCount = await page.locator('a[href]').count();
        console.log(`Interactive elements: ${buttonCount} buttons, ${linkCount} links`);
        
      } catch (error) {
        console.log('❌ Error accessing route:', error.message);
      }
    }
    
    expect(true).toBeTruthy();
  });
});
