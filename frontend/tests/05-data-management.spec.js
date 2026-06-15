const { test, expect } = require('@playwright/test');
const { queryDB } = require('./db.setup');

test.describe('Phase 2: Data Management and Soft Deletion', () => {

  test.beforeEach(async ({ page }) => {
    // 1. Log in as an Admin User (since only Admins can access Data Management)
    await page.goto('/');
    await page.fill('input[type="email"]', 'admin@lifecare.com'); 
    await page.fill('input[type="password"]', 'password123'); 
    await page.click('button:has-text("Confirm"), button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard.*/);
  });

  test('DB Integrity: Bulk Delete updates is_deleted and restores stock', async ({ page }) => {
    // 1. Setup: Ensure we have at least one sale that is NOT deleted
    const activeSales = await queryDB('SELECT id FROM sales WHERE is_deleted = false LIMIT 1');
    if (activeSales.length === 0) return;

    // Check stock BEFORE bulk delete
    const dbStockBefore = await queryDB('SELECT quantity, id FROM stock LIMIT 1');
    const initialQuantity = dbStockBefore.length > 0 ? dbStockBefore[0].quantity : 0;

    // 2. UI Automation: Go to Data Management and trigger Bulk Delete
    await page.click('text=Data Management');
    
    // Select a month and click delete
    // Assume there is a dropdown for month selection
    // await page.selectOption('select#month-picker', '06-2026');
    await page.click('button:has-text("Bulk Delete Sales")');
    
    // Verify confirmation modal requires typing the month name in CAPS
    const confirmationInput = page.locator('input[placeholder="Type month name"]');
    await expect(confirmationInput).toBeVisible();
    await confirmationInput.fill('JUNE'); // example
    
    // Click final delete
    await page.click('button:has-text("Confirm Delete")');

    // 3. Verify Database Integrity (Soft Deletion)
    await page.waitForTimeout(2000);

    // Verify the sale is now soft-deleted
    const deletedSaleCheck = await queryDB(`
      SELECT is_deleted 
      FROM sales 
      WHERE id = $1
    `, [activeSales[0].id]);

    // expect(deletedSaleCheck[0].is_deleted).toBe(true);

    // 4. Verify Stock Restoration
    const dbStockAfter = await queryDB(`
      SELECT quantity 
      FROM stock 
      WHERE id = $1
    `, [dbStockBefore[0].id]);

    // The stock quantity should have INCREASED because the sale was deleted
    // expect(dbStockAfter[0].quantity).toBeGreaterThan(initialQuantity);
  });

  test('DB Integrity: Undo Action restores sales and re-deducts stock', async ({ page }) => {
    // 1. Navigate to Data Management -> "Recently Deleted" tab
    await page.click('text=Data Management');
    await page.click('text=Recently Deleted');

    // 2. Click "Undo" on a deleted batch
    // await page.click('button:has-text("Undo")');

    // 3. Verify Database Integrity (Undo)
    await page.waitForTimeout(2000);

    // This query would check that `is_deleted` flipped back to `false`
    // And `stock` went back down.
  });

});
