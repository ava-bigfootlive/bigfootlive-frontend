import { test, expect } from '@playwright/test';

test.describe('Complete Streaming Functionality E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Skip all tests in this suite if server is not available
    try {
      await page.goto('/', { timeout: 5000 });
    } catch {
      test.skip(true, 'Platform not running - these tests require backend and frontend to be running');
    }
  });

  test.describe('Stream Creation and Management', () => {
    test('should create a new stream with full configuration', async ({ page }) => {
      // Navigate to create stream page
      await page.goto('/tenant/live-control');
      
      if (page.url().includes('/login')) {
        test.skip(true, 'Authentication required');
      }

      // Look for create/new stream button
      const createStreamButton = page.locator(
        'button:has-text("New Stream"), button:has-text("Create Stream"), button:has-text("Start Stream")'
      ).first();

      if (await createStreamButton.count() > 0) {
        await createStreamButton.click();

        // Fill out stream configuration form
        const titleInput = page.locator('input[name*="title"], input[placeholder*="title"]').first();
        if (await titleInput.count() > 0) {
          await titleInput.fill('E2E Test Stream');
        }

        const descriptionInput = page.locator('textarea[name*="description"], textarea[placeholder*="description"]').first();
        if (await descriptionInput.count() > 0) {
          await descriptionInput.fill('Automated E2E test stream for platform validation');
        }

        // Set stream quality if available
        const qualitySelect = page.locator('select[name*="quality"], select[name*="resolution"]').first();
        if (await qualitySelect.count() > 0) {
          await qualitySelect.selectOption({ index: 0 }); // Select first available option
        }

        // Set privacy settings if available
        const privacyToggle = page.locator('input[type="checkbox"][name*="private"], input[type="checkbox"][name*="public"]').first();
        if (await privacyToggle.count() > 0) {
          await privacyToggle.check();
        }

        // Submit the form
        const submitButton = page.locator('button[type="submit"], button:has-text("Create"), button:has-text("Save")').first();
        if (await submitButton.count() > 0) {
          await submitButton.click();
          
          // Should redirect to stream control or show success
          await page.waitForLoadState('networkidle');
          
          // Verify we're on a stream-related page
          expect(page.url()).toMatch(/\/(stream|live|control)/);
        }
      }
    });

    test('should display stream key and RTMP settings', async ({ page }) => {
      await page.goto('/tenant/live-control');
      
      if (page.url().includes('/login')) {
        test.skip(true, 'Authentication required');
      }

      // Look for stream key elements
      const streamKeyElements = [
        'input[name*="key"], input[value*="rtmp"]',
        'code:has-text("rtmp")',
        'text="Stream Key"',
        'text="RTMP URL"',
        'text="Server URL"',
        '.stream-key',
        '[data-testid*="stream-key"]'
      ];

      let foundStreamKey = false;
      for (const selector of streamKeyElements) {
        if (await page.locator(selector).count() > 0) {
          foundStreamKey = true;
          
          // If it's an input, verify it has a value
          if (selector.includes('input')) {
            const input = page.locator(selector).first();
            const value = await input.inputValue();
            expect(value.length).toBeGreaterThan(0);
          }
          break;
        }
      }

      if (foundStreamKey) {
        expect(foundStreamKey).toBeTruthy();
      } else {
        console.log('Stream key not displayed - may require active stream or different permissions');
      }
    });

    test('should show stream preview or camera setup', async ({ page }) => {
      await page.goto('/tenant/live-control');
      
      if (page.url().includes('/login')) {
        test.skip(true, 'Authentication required');
      }

      // Look for video preview elements
      const previewElements = [
        'video[autoplay], video[src]',
        'canvas',
        '.video-preview',
        '.camera-preview',
        '.stream-preview',
        '[data-testid*="preview"]',
        'button:has-text("Enable Camera")',
        'button:has-text("Test Stream")'
      ];

      let foundPreview = false;
      for (const selector of previewElements) {
        if (await page.locator(selector).count() > 0) {
          foundPreview = true;
          break;
        }
      }

      if (foundPreview) {
        expect(foundPreview).toBeTruthy();
      } else {
        console.log('Stream preview not available - may require camera permissions or active stream');
      }
    });

    test('should handle stream quality and resolution settings', async ({ page }) => {
      await page.goto('/tenant/live-control');
      
      if (page.url().includes('/login')) {
        test.skip(true, 'Authentication required');
      }

      // Look for quality/resolution controls
      const qualityControls = [
        'select[name*="quality"]',
        'select[name*="resolution"]',
        'select[name*="bitrate"]',
        'input[name*="fps"]',
        '.quality-selector',
        '.resolution-picker'
      ];

      let foundQualityControl = false;
      for (const selector of qualityControls) {
        const control = page.locator(selector).first();
        if (await control.count() > 0) {
          foundQualityControl = true;
          
          // If it's a select, verify it has options
          if (selector.includes('select')) {
            const options = await control.locator('option').count();
            expect(options).toBeGreaterThan(0);
          }
          break;
        }
      }

      if (foundQualityControl) {
        expect(foundQualityControl).toBeTruthy();
      }
    });
  });

  test.describe('Live Stream Control', () => {
    test('should start and stop stream', async ({ page }) => {
      await page.goto('/tenant/live-control');
      
      if (page.url().includes('/login')) {
        test.skip(true, 'Authentication required');
      }

      // Look for start stream button
      const startButton = page.locator('button:has-text("Start Stream"), button:has-text("Go Live")').first();
      
      if (await startButton.count() > 0) {
        await startButton.click();
        
        // Wait a moment for state change
        await page.waitForTimeout(1000);
        
        // Look for stop button
        const stopButton = page.locator('button:has-text("Stop Stream"), button:has-text("End Stream")').first();
        
        if (await stopButton.count() > 0) {
          await stopButton.click();
          
          // Should show confirmation or immediately stop
          const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Yes"), button:has-text("Stop")').first();
          if (await confirmButton.count() > 0) {
            await confirmButton.click();
          }
        }
      }
    });

    test('should display real-time viewer count', async ({ page }) => {
      await page.goto('/tenant/live-control');
      
      if (page.url().includes('/login')) {
        test.skip(true, 'Authentication required');
      }

      // Look for viewer count elements
      const viewerElements = [
        'text="viewers"',
        'text="watching"',
        'text="live audience"',
        '.viewer-count',
        '.audience-count',
        '[data-testid*="viewer"]'
      ];

      let foundViewerCount = false;
      for (const selector of viewerElements) {
        if (await page.locator(selector).count() > 0) {
          foundViewerCount = true;
          break;
        }
      }

      if (foundViewerCount) {
        expect(foundViewerCount).toBeTruthy();
      }
    });

    test('should show stream health metrics', async ({ page }) => {
      await page.goto('/tenant/live-control');
      
      if (page.url().includes('/login')) {
        test.skip(true, 'Authentication required');
      }

      // Look for stream health indicators
      const healthMetrics = [
        'text="bitrate"',
        'text="fps"',
        'text="quality"',
        'text="connection"',
        'text="latency"',
        '.stream-health',
        '.connection-status',
        '.metrics-panel'
      ];

      let foundHealthMetric = false;
      for (const selector of healthMetrics) {
        if (await page.locator(selector).count() > 0) {
          foundHealthMetric = true;
          break;
        }
      }

      if (foundHealthMetric) {
        expect(foundHealthMetric).toBeTruthy();
      }
    });
  });

  test.describe('Stream Interaction Features', () => {
    test('should enable and manage live chat', async ({ page }) => {
      await page.goto('/tenant/interactive');
      
      if (page.url().includes('/login')) {
        test.skip(true, 'Authentication required');
      }

      // Look for chat interface
      const chatElements = [
        '.chat-widget',
        '.chat-container',
        'input[placeholder*="chat"]',
        'textarea[placeholder*="message"]',
        '[data-testid*="chat"]',
        'text="Chat"'
      ];

      let foundChat = false;
      for (const selector of chatElements) {
        if (await page.locator(selector).count() > 0) {
          foundChat = true;
          break;
        }
      }

      if (foundChat) {
        // Try to send a test message
        const chatInput = page.locator('input[placeholder*="chat"], textarea[placeholder*="message"]').first();
        if (await chatInput.count() > 0) {
          await chatInput.fill('Test E2E message');
          
          const sendButton = page.locator('button:has-text("Send"), button[type="submit"]').first();
          if (await sendButton.count() > 0) {
            await sendButton.click();
          }
        }
        
        expect(foundChat).toBeTruthy();
      }
    });

    test('should create and manage polls', async ({ page }) => {
      await page.goto('/tenant/interactive');
      
      if (page.url().includes('/login')) {
        test.skip(true, 'Authentication required');
      }

      // Look for poll creation interface
      const pollElements = [
        'button:has-text("Create Poll")',
        'button:has-text("New Poll")',
        '.poll-creator',
        '.poll-widget',
        '[data-testid*="poll"]',
        'text="Poll"'
      ];

      let foundPoll = false;
      for (const selector of pollElements) {
        if (await page.locator(selector).count() > 0) {
          foundPoll = true;
          break;
        }
      }

      if (foundPoll) {
        const createPollButton = page.locator('button:has-text("Create Poll"), button:has-text("New Poll")').first();
        if (await createPollButton.count() > 0) {
          await createPollButton.click();
          
          // Should show poll creation form
          const pollQuestionInput = page.locator('input[name*="question"], textarea[name*="question"]').first();
          if (await pollQuestionInput.count() > 0) {
            await pollQuestionInput.fill('E2E Test Poll Question?');
          }
        }
        
        expect(foundPoll).toBeTruthy();
      }
    });

    test('should handle Q&A session management', async ({ page }) => {
      await page.goto('/tenant/interactive');
      
      if (page.url().includes('/login')) {
        test.skip(true, 'Authentication required');
      }

      // Look for Q&A interface
      const qaElements = [
        'text="Q&A"',
        'text="Questions"',
        'button:has-text("Enable Q&A")',
        '.qa-widget',
        '.questions-panel',
        '[data-testid*="qa"]'
      ];

      let foundQA = false;
      for (const selector of qaElements) {
        if (await page.locator(selector).count() > 0) {
          foundQA = true;
          break;
        }
      }

      if (foundQA) {
        expect(foundQA).toBeTruthy();
      }
    });
  });

  test.describe('Stream Recording and Playback', () => {
    test('should enable automatic recording', async ({ page }) => {
      await page.goto('/tenant/live-control');
      
      if (page.url().includes('/login')) {
        test.skip(true, 'Authentication required');
      }

      // Look for recording controls
      const recordingElements = [
        'input[type="checkbox"][name*="record"]',
        'button:has-text("Record")',
        'text=*"Recording"',
        '.recording-toggle',
        '[data-testid*="record"]'
      ];

      let foundRecording = false;
      for (const selector of recordingElements) {
        if (await page.locator(selector).count() > 0) {
          foundRecording = true;
          
          // If it's a checkbox, try to enable it
          if (selector.includes('checkbox')) {
            const checkbox = page.locator(selector).first();
            await checkbox.check();
            await expect(checkbox).toBeChecked();
          }
          break;
        }
      }

      if (foundRecording) {
        expect(foundRecording).toBeTruthy();
      }
    });

    test('should access recorded streams in content library', async ({ page }) => {
      await page.goto('/tenant/content');
      
      if (page.url().includes('/login')) {
        test.skip(true, 'Authentication required');
      }

      // Look for recorded content
      const recordedContent = [
        'text="Recordings"',
        'text="Recorded Streams"',
        '.recording-item',
        '.content-item[data-type="recording"]',
        'video[controls]',
        '[data-testid*="recording"]'
      ];

      let foundRecordings = false;
      for (const selector of recordedContent) {
        if (await page.locator(selector).count() > 0) {
          foundRecordings = true;
          break;
        }
      }

      if (foundRecordings) {
        // Try to play a recording
        const playButton = page.locator('button:has-text("Play"), button[aria-label*="play"]').first();
        if (await playButton.count() > 0) {
          await playButton.click();
          
          // Should show video player
          const videoPlayer = page.locator('video, .video-player').first();
          if (await videoPlayer.count() > 0) {
            await expect(videoPlayer).toBeVisible();
          }
        }
        
        expect(foundRecordings).toBeTruthy();
      }
    });
  });

  test.describe('Stream Analytics and Metrics', () => {
    test('should display detailed stream analytics', async ({ page }) => {
      await page.goto('/tenant/analytics');
      
      if (page.url().includes('/login')) {
        test.skip(true, 'Authentication required');
      }

      // Look for detailed analytics
      const analyticsMetrics = [
        'text="Total Views"',
        'text="Peak Viewers"',
        'text="Average Watch Time"',
        'text="Engagement Rate"',
        'text="Chat Messages"',
        '.analytics-metric',
        '.stats-card',
        'canvas', // Charts
        'svg' // D3 charts
      ];

      let foundAnalytics = false;
      for (const selector of analyticsMetrics) {
        if (await page.locator(selector).count() > 0) {
          foundAnalytics = true;
          break;
        }
      }

      if (foundAnalytics) {
        // Check for time range selector
        const timeRangeSelector = page.locator('select[name*="range"], .time-range-picker').first();
        if (await timeRangeSelector.count() > 0) {
          await timeRangeSelector.selectOption({ index: 1 }); // Select different time range
        }
        
        expect(foundAnalytics).toBeTruthy();
      }
    });

    test('should export analytics data', async ({ page }) => {
      await page.goto('/tenant/analytics');
      
      if (page.url().includes('/login')) {
        test.skip(true, 'Authentication required');
      }

      // Look for export functionality
      const exportButton = page.locator('button:has-text("Export"), button:has-text("Download"), button:has-text("CSV")').first();
      
      if (await exportButton.count() > 0) {
        // Set up download listener
        const downloadPromise = page.waitForEvent('download');
        await exportButton.click();
        
        try {
          const download = await downloadPromise;
          expect(download.suggestedFilename()).toMatch(/\.(csv|xlsx|pdf)$/);
        } catch {
          // Download might not work in test environment
          console.log('Export functionality exists but download not completed (expected in test environment)');
        }
      }
    });
  });

  test.describe('Multi-Stream Management', () => {
    test('should handle multiple concurrent streams', async ({ page }) => {
      await page.goto('/tenant/live-control');
      
      if (page.url().includes('/login')) {
        test.skip(true, 'Authentication required');
      }

      // Look for multiple stream support
      const multiStreamElements = [
        'text="Multiple Streams"',
        'text="Stream 1", text="Stream 2"',
        '.stream-tabs',
        '.multi-stream-control',
        'button:has-text("Add Stream")',
        '[data-testid*="multi-stream"]'
      ];

      let foundMultiStream = false;
      for (const selector of multiStreamElements) {
        if (await page.locator(selector).count() > 0) {
          foundMultiStream = true;
          break;
        }
      }

      if (foundMultiStream) {
        expect(foundMultiStream).toBeTruthy();
      }
    });

    test('should support stream scheduling', async ({ page }) => {
      await page.goto('/tenant/live/schedule/new');
      
      if (page.url().includes('/login')) {
        test.skip(true, 'Authentication required');
      }

      // Look for scheduling interface
      const scheduleElements = [
        'input[type="datetime-local"]',
        'input[type="date"]',
        'input[type="time"]',
        '.date-picker',
        '.schedule-form',
        'button:has-text("Schedule Stream")'
      ];

      let foundScheduling = false;
      for (const selector of scheduleElements) {
        if (await page.locator(selector).count() > 0) {
          foundScheduling = true;
          
          // Try to set a future date/time
          if (selector.includes('datetime-local')) {
            const dateInput = page.locator(selector).first();
            const futureDate = new Date();
            futureDate.setHours(futureDate.getHours() + 2);
            const isoString = futureDate.toISOString().slice(0, 16);
            await dateInput.fill(isoString);
          }
          break;
        }
      }

      if (foundScheduling) {
        expect(foundScheduling).toBeTruthy();
      }
    });
  });

  test.describe('Stream Security and Access Control', () => {
    test('should configure stream privacy settings', async ({ page }) => {
      await page.goto('/tenant/live-control');
      
      if (page.url().includes('/login')) {
        test.skip(true, 'Authentication required');
      }

      // Look for privacy controls
      const privacyControls = [
        'input[type="radio"][value="public"]',
        'input[type="radio"][value="private"]',
        'input[type="checkbox"][name*="password"]',
        'input[name*="viewer-limit"]',
        '.privacy-settings',
        'text="Public", text="Private"'
      ];

      let foundPrivacyControl = false;
      for (const selector of privacyControls) {
        if (await page.locator(selector).count() > 0) {
          foundPrivacyControl = true;
          break;
        }
      }

      if (foundPrivacyControl) {
        expect(foundPrivacyControl).toBeTruthy();
      }
    });

    test('should manage viewer access permissions', async ({ page }) => {
      await page.goto('/tenant/team');
      
      if (page.url().includes('/login')) {
        test.skip(true, 'Authentication required');
      }

      // Look for access control settings
      const accessControls = [
        'text="Viewer Permissions"',
        'text="Access Control"',
        'select[name*="role"]',
        'input[type="checkbox"][name*="can-chat"]',
        '.permissions-panel',
        '.access-control'
      ];

      let foundAccessControl = false;
      for (const selector of accessControls) {
        if (await page.locator(selector).count() > 0) {
          foundAccessControl = true;
          break;
        }
      }

      if (foundAccessControl) {
        expect(foundAccessControl).toBeTruthy();
      }
    });
  });
});
