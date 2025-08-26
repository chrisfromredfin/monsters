import { test, expect } from '@playwright/test';

test.describe('Basic App Tests', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');
    
    // Check that the page loads without errors
    await expect(page).toHaveTitle('Gloomhaven Monster Tracker');
    
    // Verify basic elements are present
    await expect(page.locator('h1')).toHaveText('Gloomhaven Monster Tracker');
  });

  test('should have scenario level selector', async ({ page }) => {
    await page.goto('/');
    
    // Check that scenario level selector exists
    await expect(page.locator('select').first()).toBeVisible();
    await expect(page.locator('text=Scenario Level:')).toBeVisible();
  });

  test('should show Add Monsters panel', async ({ page }) => {
    await page.goto('/');
    
    // Check that Add Monsters expandable panel exists
    await expect(page.locator('button:has-text("Add Monsters")')).toBeVisible();
  });

});
