import { test, expect } from '@playwright/test';

test.describe('CISPAR Landing - Auth Flow (Device Authorization)', () => {
  const VERIFICATION_URL = '#/auth?user_code=ABCDEF1234';
  const PLATFORM_API_URL = 'http://localhost:8787';
  const SUPABASE_URL = 'https://mock.supabase.co';

  test.beforeEach(async ({ page }) => {
    // Mock Supabase auth network calls
    await page.route(`${SUPABASE_URL}/auth/v1/**`, async (route) => {
      const url = route.request().url();
      const method = route.request().method();

      if (url.includes('/token') && method === 'POST') {
        // Sign in with password - return session
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            access_token: 'mock-access-token',
            refresh_token: 'mock-refresh-token',
            user: {
              id: 'user-123',
              email: 'test@cispar.io',
              created_at: new Date().toISOString(),
            },
            expires_in: 3600,
            token_type: 'bearer',
          }),
        });
      } else if (url.includes('/authorize') && method === 'GET') {
        // OAuth authorize - redirect back
        const redirectTo = new URL(url).searchParams.get('redirect_to') || '#/auth#user_code=ABCDEF1234';
        await route.fulfill({
          status: 302,
          headers: { location: redirectTo },
        });
      } else if (url.includes('/user') && method === 'GET') {
        // Get user - return user info
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'user-123',
            email: 'test@cispar.io',
            created_at: new Date().toISOString(),
          }),
        });
      } else {
        await route.continue();
      }
    });

    // Mock the device/approve endpoint to track calls
    await page.route(`${PLATFORM_API_URL}/device/approve`, async (route) => {
      const request = route.request();
      const body = request.postDataJSON();
      await page.evaluate((data) => {
        (window as any).__lastApproveRequest = data;
      }, body);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });
  });

  test('SIGNED_IN with userCode transitions to confirm_device step (not auto-approve)', async ({ page }) => {
    await page.goto(VERIFICATION_URL);

    // Wait for auth page to load - look for the form
    await page.waitForSelector('input[type="email"]', { timeout: 15000 });

    // Click email sign in
    await page.fill('input[type="email"]', 'test@cispar.io');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]:has-text("Sign In")');

    // Should show confirm_device step (not directly approve)
    await expect(page.locator('text=Autorizar este equipo, text=Authorize this device')).toBeVisible({ timeout: 10000 });

    // Verify NO approve request was made yet (explicit click required)
    const approveRequest = await page.evaluate(() => (window as any).__lastApproveRequest);
    expect(approveRequest).toBeUndefined();
  });

  test('Explicit click on "Authorize this device" triggers POST /device/approve', async ({ page }) => {
    await page.goto(VERIFICATION_URL);

    await page.waitForSelector('input[type="email"]', { timeout: 15000 });
    await page.fill('input[type="email"]', 'test@cispar.io');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]:has-text("Sign In")');

    // Wait for confirm_device step
    await expect(page.locator('button:has-text("Autorizar este equipo"), button:has-text("Authorize this device")')).toBeVisible({ timeout: 10000 });

    // Click the explicit authorize button
    await page.click('button:has-text("Autorizar este equipo"), button:has-text("Authorize this device")');

    // Verify approve request was made
    const approveRequest = await page.evaluate(() => (window as any).__lastApproveRequest);
    expect(approveRequest).toBeDefined();
    expect(approveRequest.userCode).toBe('ABCDEF1234');
    expect(approveRequest.supabaseToken).toBe('mock-access-token');
  });

  test('No POST /device/approve before explicit user click (double-click protection)', async ({ page }) => {
    await page.goto(VERIFICATION_URL);

    await page.waitForSelector('input[type="email"]', { timeout: 15000 });
    await page.fill('input[type="email"]', 'test@cispar.io');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]:has-text("Sign In")');

    // Wait for confirm_device step
    await expect(page.locator('button:has-text("Autorizar este equipo"), button:has-text("Authorize this device")')).toBeVisible({ timeout: 10000 });

    // Setup request tracking
    await page.evaluate(() => {
      (window as any).__approveRequests = [];
    });

    // Re-setup route to capture all requests
    await page.route(`${PLATFORM_API_URL}/device/approve`, async (route) => {
      const body = route.request().postDataJSON();
      await page.evaluate((data) => {
        (window as any).__approveRequests.push(data);
      }, body);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    const authorizeBtn = page.locator('button:has-text("Autorizar este equipo"), button:has-text("Authorize this device")');

    // Click multiple times rapidly
    await authorizeBtn.click({ delay: 0 });
    await authorizeBtn.click({ delay: 0 });
    await authorizeBtn.click({ delay: 0 });

    const approveRequests = await page.evaluate(() => (window as any).__approveRequests);
    // Should only have ONE approve request despite multiple clicks
    expect(approveRequests.length).toBeLessThanOrEqual(1);
  });

  test('Expired device code shows error state', async ({ page }) => {
    // Mock expired code response
    await page.route(`${PLATFORM_API_URL}/device/approve`, async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Device code expired' }),
      });
    });

    await page.goto('#/auth?user_code=EXPIRED123');

    await page.waitForSelector('input[type="email"]', { timeout: 15000 });
    await page.fill('input[type="email"]', 'test@cispar.io');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]:has-text("Sign In")');

    await expect(page.locator('button:has-text("Autorizar este equipo"), button:has-text("Authorize this device")')).toBeVisible({ timeout: 10000 });
    await page.click('button:has-text("Autorizar este equipo"), button:has-text("Authorize this device")');

    // Should show error
    await expect(page.locator('text=Authorization failed, text=Authorization failed')).toBeVisible({ timeout: 5000 });
  });

  test('OAuth Google sign-in flow works with device code', async ({ page }) => {
    await page.goto(VERIFICATION_URL);
    await page.waitForSelector('input[type="email"]', { timeout: 15000 });

    // Click Google sign-in - this will trigger OAuth redirect
    await page.click('button:has-text("Continue with Google")');

    // Should handle OAuth redirect and show confirm_device
    await expect(page.locator('text=Autorizar este equipo, text=Authorize this device')).toBeVisible({ timeout: 10000 });
  });

  test('Pre-existing session (INITIAL_SESSION) with userCode goes to confirm_device', async ({ page }) => {
    // Set up a mock session cookie/storage to simulate existing session
    await page.addInitScript(() => {
      // Set Supabase auth token in localStorage to simulate existing session
      localStorage.setItem('sb-mock-supabase-co-auth-token', JSON.stringify({
        access_token: 'existing-token',
        refresh_token: 'existing-refresh',
        user: { id: 'user-123', email: 'existing@cispar.io' },
        expires_at: Date.now() + 3600000,
      }));
    });

    await page.goto(VERIFICATION_URL);
    await page.waitForSelector('input[type="email"]', { timeout: 15000 });

    // With pre-existing session, the app should detect it
    // Fill and submit login (which should succeed quickly)
    await page.fill('input[type="email"]', 'existing@cispar.io');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]:has-text("Sign In")');

    // Should show confirm_device step
    await expect(page.locator('text=Autorizar este equipo, text=Authorize this device')).toBeVisible({ timeout: 10000 });

    // No approve request yet
    const approveRequest = await page.evaluate(() => (window as any).__lastApproveRequest);
    expect(approveRequest).toBeUndefined();
  });

  test('Standalone login (no userCode) goes to success step', async ({ page }) => {
    await page.goto('#/auth');

    await page.waitForSelector('input[type="email"]', { timeout: 15000 });
    await page.fill('input[type="email"]', 'test@cispar.io');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]:has-text("Sign In")');

    // Should show success (not confirm_device)
    await expect(page.locator('text=Terminal authorized, text=Device authorized, text=Signed in')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('CISPAR Landing - Release Catalog Validation', () => {
  test('All releases show as unavailable (available: false)', async ({ page }) => {
    await page.goto('#/download');
    await page.waitForSelector('.download-grid', { timeout: 15000 });

    const cards = page.locator('.release-card');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);
      const button = card.locator('button.btn-disabled');
      // All should be disabled (btn-disabled) since available: false
      await expect(button).toBeVisible();
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
      // Should not mention Docker
      expect(requirements?.toLowerCase()).not.toMatch(/docker/i);
    }
  });

  test('Platform detection works correctly', async ({ page }) => {
    await page.goto('#/download');
    await page.waitForSelector('.platform-tabs', { timeout: 15000 });

    // Should detect current platform
    const detectedText = await page.locator('.page-heading p').nth(1).textContent();
    expect(detectedText).toBeTruthy();
  });
});
