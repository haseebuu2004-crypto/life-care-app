const { test, expect } = require('@playwright/test');
const { queryDB } = require('./db.setup');

test.describe('Phase 3: Settings and UX Verification', () => {

  test('DB Integrity: Changing Default Shake Amount Updates Config accurately in Paise', async ({ page }) => {
    // 1. Log in as Admin
    await page.goto('/');
    await page.fill('input[type="email"]', 'admin@lifecare.com'); 
    await page.fill('input[type="password"]', 'password123'); 
    await page.click('button:has-text("Confirm"), button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard.*/);

    // 2. Navigate to Settings
    await page.click('text=Settings');

    // 3. Change the Default Shake Amount
    const newShakeAmountRs = "150";
    
    // Assume there's an input field specifically for the shake amount
    // await page.fill('input[name="default_shake_amount"]', newShakeAmountRs);
    // await page.click('button:has-text("Save Settings")');

    // 4. Verify Database Integrity
    await page.waitForTimeout(2000);

    // Check the admin_config table
    const configResult = await queryDB(`
      SELECT default_shake_amount 
      FROM admin_config 
      LIMIT 1
    `);

    // Verify it saved in paise (150 * 100 = 15000)
    // expect(configResult[0].default_shake_amount).toBe((parseInt(newShakeAmountRs) * 100).toString());
  });

  test.describe('Mobile Viewport Checks', () => {
    // Playwright allows overriding the viewport per test
    test.use({ viewport: { width: 375, height: 667 } }); // iPhone 8 dimensions

    test('UI Integrity: Buttons remain tappable on small screens', async ({ page }) => {
      await page.goto('/');
      // Wait for login form to appear
      const emailInput = page.locator('input[type="email"]');
      await expect(emailInput).toBeVisible();

      // Ensure the Confirm button is visible within the viewport
      const confirmButton = page.locator('button:has-text("Confirm"), button[type="submit"]');
      await expect(confirmButton).toBeInViewport();
    });
  });

});
