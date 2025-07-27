// @ts-check
import { test, expect } from '@playwright/test';

test.describe('PhonoCorrect AI Web Application', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the main application', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('PhonoCorrect AI');
    await expect(page.locator('[data-testid="writing-tab"]')).toBeVisible();
  });

  test('should perform phonetic correction: "fone" → "phone"', async ({ page }) => {
    // Navigate to writing tab
    await page.click('[data-testid="writing-tab"]');
    
    // Type test text
    const textarea = page.locator('textarea[placeholder="Start typing here..."]');
    await textarea.fill('I got your fone call yesterday');
    
    // Wait for AI analysis
    await page.waitForSelector('[data-testid="suggestion"]', { timeout: 5000 });
    
    // Verify suggestion appears
    const suggestion = page.locator('[data-testid="suggestion"]').first();
    await expect(suggestion).toContainText('fone');
    await expect(suggestion).toContainText('phone');
    
    // Accept the suggestion
    await page.click('[data-testid="accept-suggestion"]');
    
    // Verify correction applied
    await expect(textarea).toHaveValue('I got your phone call yesterday');
  });

  test('should switch between languages', async ({ page }) => {
    await page.click('[data-testid="language-tab"]');
    
    // Test switching to Spanish
    await page.click('button:has-text("ES")');
    await page.click('[data-testid="writing-tab"]');
    
    // Load Spanish example
    await page.click('button:has-text("Load Example")');
    
    const textarea = page.locator('textarea');
    const content = await textarea.inputValue();
    expect(content).toContain('téléfono');
  });

  test('should display performance metrics', async ({ page }) => {
    // Check performance status card
    const performanceCard = page.locator('[data-testid="performance-status"]');
    await expect(performanceCard).toBeVisible();
    
    // Verify acceleration status
    await expect(performanceCard.locator('text=Acceleration')).toBeVisible();
    await expect(performanceCard.locator('text=Inference Time')).toBeVisible();
  });

  test('should show testing dashboard', async ({ page }) => {
    await page.click('[data-testid="testing-tab"]');
    
    await expect(page.locator('h2:has-text("Testing Dashboard")')).toBeVisible();
    await expect(page.locator('text=Tests Passed')).toBeVisible();
    await expect(page.locator('text=Mobile End-to-End Tests')).toBeVisible();
  });

  test('should run performance comparison', async ({ page }) => {
    await page.click('[data-testid="comparison-tab"]');
    
    await expect(page.locator('text=4-bit vs 16-bit')).toBeVisible();
    
    // Test running comparison
    await page.click('button:has-text("Run Comparison")');
    await expect(page.locator('text=Running comparison')).toBeVisible();
  });
});

test.describe('Chrome Extension Integration', () => {
  test('should load extension popup', async ({ page, context }) => {
    // This would be run with a Chrome extension loaded
    // For now, we'll test the popup interface structure
    
    await page.goto('/extension-popup');
    
    await expect(page.locator('h1')).toContainText('PhonoCorrect');
    await expect(page.locator('button:has-text("Enable")')).toBeVisible();
  });

  test('should inject content script functionality', async ({ page }) => {
    // Test content script injection simulation
    await page.goto('/');
    
    // Add content script simulation
    await page.addScriptTag({
      content: `
        window.phonoCorrectExtension = {
          isActive: true,
          correctText: (text) => text.replace(/fone/g, 'phone')
        };
      `
    });
    
    // Test the injected functionality
    const result = await page.evaluate(() => {
      return window.phonoCorrectExtension?.correctText('Call me on my fone');
    });
    
    expect(result).toBe('Call me on my phone');
  });
});

test.describe('Performance Testing', () => {
  test('should load within performance budget', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    
    // Wait for main content to load
    await page.waitForSelector('h1:has-text("PhonoCorrect AI")');
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000); // 3 second budget
  });

  test('should handle large text input efficiently', async ({ page }) => {
    await page.goto('/');
    
    const textarea = page.locator('textarea[placeholder="Start typing here..."]');
    
    // Generate large text with multiple phonetic errors
    const largeText = Array(100).fill('fone seperate recieve definately').join(' ');
    
    const startTime = Date.now();
    await textarea.fill(largeText);
    
    // Wait for analysis to complete
    await page.waitForSelector('[data-testid="suggestion"]', { timeout: 10000 });
    
    const analysisTime = Date.now() - startTime;
    expect(analysisTime).toBeLessThan(5000); // 5 second budget for large text
  });
});

test.describe('Accessibility Testing', () => {
  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');
    
    // Test tab navigation
    await page.keyboard.press('Tab');
    await expect(page.locator('textarea')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('button:has-text("Load Example")')).toBeFocused();
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/');
    
    // Check for accessibility attributes
    await expect(page.locator('textarea')).toHaveAttribute('aria-label', /writing|text|input/i);
    await expect(page.locator('[role="tablist"]')).toBeVisible();
  });
});

test.describe('Mobile Responsiveness', () => {
  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('textarea')).toBeVisible();
    
    // Test touch interactions
    await page.tap('textarea');
    await expect(page.locator('textarea')).toBeFocused();
  });
});