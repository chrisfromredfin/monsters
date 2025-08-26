import { test, expect } from '@playwright/test';

test.describe('AddPanel E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
  });

  test('should load the page and show scenario level selector', async ({ page }) => {
    // Check that the page loads correctly
    await expect(page.locator('h1')).toBeVisible();

    // Check that scenario level selector is present
    await expect(page.locator('select').first()).toBeVisible();
  });

  test('should show AddPanel after selecting a scenario level', async ({ page }) => {
    // Select a scenario level (assuming level 1 exists)
    await page.locator('select').first().selectOption('1');

    // Check that AddPanel becomes visible
    await expect(page.locator('text=Monster:')).toBeVisible();
    await expect(page.locator('text=Add Boss')).toBeVisible();
    await expect(page.locator('text=Add Ally')).toBeVisible();
  });

  test('should be able to add a monster', async ({ page }) => {
    // Set scenario level
    await page.locator('select').first().selectOption('1');

    // Select a monster (assuming 'Ancient Artillery' is available)
    await page.locator('#monster-select').selectOption('Ancient Artillery');

    // Check one of the checkboxes (e.g., first Elite checkbox)
    await page.locator('input[type="checkbox"]').first().check();

    // Click Add Monsters button
    await page.locator('button:has-text("Add Monsters")').click();

    // Verify that a monster was added to the play area
    await expect(page.locator('text=Ancient Artillery')).toBeVisible();
  });

  test('should be able to add a boss', async ({ page }) => {
    // Set scenario level
    await page.locator('select').first().selectOption('1');

    // Select a boss and set party count
    const bossSelect = page.locator('#boss-select');
    await bossSelect.selectOption({ index: 0 }); // Select first boss

    await page.locator('#party-count').fill('4');

    // Click Add Boss button
    await page.locator('button:has-text("Add Boss")').click();

    // Verify that a boss was added
    // This would depend on your UI structure - adjust the selector as needed
    await expect(page.locator('.boss-section')).toBeVisible();
  });

  test('should be able to add an ally', async ({ page }) => {
    // Set scenario level
    await page.locator('select').first().selectOption('1');

    // Fill ally information
    await page.locator('#ally-name').fill('Test Ally');
    await page.locator('#ally-hp').fill('15');

    // Click Add Ally button
    await page.locator('button:has-text("Add Ally")').click();

    // Verify that an ally was added
    await expect(page.locator('text=Test Ally')).toBeVisible();
  });

  test('should auto-generate ally names when name is empty', async ({ page }) => {
    // Set scenario level
    await page.locator('select').first().selectOption('1');

    // Leave name empty, just set HP
    await page.locator('#ally-hp').fill('10');

    // Click Add Ally button
    await page.locator('button:has-text("Add Ally")').click();

    // Verify that an auto-generated ally name appears
    await expect(page.locator('text=Ally 1')).toBeVisible();
  });

  test('should prevent adding monsters when no checkboxes are selected', async ({ page }) => {
    // Set scenario level
    await page.locator('select').first().selectOption('1');

    // Don't check any boxes, just click Add Monsters
    await page.locator('button:has-text("Add Monsters")').click();

    // Verify no monsters were added (this would depend on your UI feedback)
    // You might want to add some visual feedback for this case
  });

  test('should disable checkboxes for existing monster numbers', async ({ page }) => {
    // Set scenario level
    await page.locator('select').first().selectOption('1');

    // Add first monster
    await page.locator('#monster-select').selectOption('Ancient Artillery');
    await page.locator('input[type="checkbox"]').first().check();
    await page.locator('button:has-text("Add Monsters")').click();

    // Verify the first checkbox becomes disabled
    await expect(page.locator('input[type="checkbox"]').first()).toBeDisabled();
  });

  test('should show message when no scenario level is selected', async ({ page }) => {
    // Don't select a scenario level
    // Check that appropriate message is shown
    await expect(
      page.locator('text=Select a scenario level above to add monsters and bosses.')
    ).toBeVisible();
  });
});
