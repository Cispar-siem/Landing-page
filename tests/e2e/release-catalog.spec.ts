import { test, expect } from '@playwright/test';

test.describe('CISPAR Landing - Release Catalog Validation', () => {
  test('All releases show as unavailable (available: false)', async ({ page }) => {
    await page.goto('#/download');
    await page.waitForSelector('.download-grid', { timeout: 15000 });

    const cards = page.locator('.release-card');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);
      await expect(card.locator('a.btn-primary')).toHaveCount(0);
      await expect(card.locator('a[href*="contact"]')).toBeVisible();
    }
  });

  test('No Docker requirements shown for Agent releases', async ({ page }) => {
    await page.goto('#/download');
    await page.waitForSelector('.download-grid', { timeout: 15000 });

    const cards = page.locator('.release-card');
    const count = await cards.count();

    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);
      const requirements = await card.locator('p').nth(1).textContent();
      expect(requirements?.toLowerCase()).not.toMatch(/docker/i);
    }
  });

  test('Platform detection works correctly', async ({ page }) => {
    await page.goto('#/download');
    await page.waitForSelector('.platform-tabs', { timeout: 15000 });

    const detectedText = await page.locator('.page-heading p').nth(1).textContent();
    expect(detectedText).toBeTruthy();
  });
});
