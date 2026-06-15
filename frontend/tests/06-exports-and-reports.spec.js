const { test, expect } = require('@playwright/test');
const { loginAsAdmin } = require('./loginHelper');

test.describe('Phase 3: Exports and Reports Verification', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('UI Integrity: PDF Generation Endpoint Succeeds', async ({ page }) => {
    // Navigate to Reports
    await page.click('text=Reports');
    await expect(page).toHaveURL(/.*reports.*/);

    // Wait for the UI
    const summaryCard = page.locator('.card:has-text("Summary Report")');
    await expect(summaryCard).toBeVisible();

    // Start waiting for download before clicking.
    const downloadPromise = page.waitForEvent('download');
    
    // Click the Download PDF button inside the Summary Report card
    await summaryCard.locator('button:has-text("Download PDF")').click();
    
    const download = await downloadPromise;
    
    // Validate the download
    expect(download.suggestedFilename()).toMatch(/summary_report.*\.pdf/);
    
    // Verify Toast Success
    await expect(page.locator('text=summary report exported successfully')).toBeVisible();
  });
});
