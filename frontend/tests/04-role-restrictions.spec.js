const { test, expect } = require('@playwright/test');
const { loginAsStaff } = require('./loginHelper');

test.describe('Phase 2: Role Restrictions and Ownership', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsStaff(page);
  });

  test('UI Integrity: Staff (User) cannot see Reports, Settings, or Products', async ({ page }) => {
    // 1. Check sidebar navigation
    // Wait for the UI to be fully loaded
    await page.waitForTimeout(2000);
    
    // Ensure that restricted links are completely absent from the DOM
    await expect(page.locator('a:has-text("Reports")')).toHaveCount(0);
    await expect(page.locator('a:has-text("Products")')).toHaveCount(0);

    // 2. Direct Navigation tests (Forced access)
    // Attempt to access /settings directly
    await page.goto('/settings');
    // Staff should be redirected
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL(/.*user\/sales.*/);

    // Attempt to access /reports directly
    await page.goto('/reports');
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL(/.*user\/sales.*/);
  });
});
