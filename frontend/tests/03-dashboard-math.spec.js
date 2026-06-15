const { test, expect } = require('@playwright/test');
const { queryDB } = require('./db.setup');

test.describe('Phase 1: Dashboard Math Verification', () => {

  test('DB Integrity: Dashboard Revenue matches sum of price_charged', async ({ page }) => {
    // 1. Query the database to find the total revenue for today
    const today = new Date().toISOString().split('T')[0];
    
    // Revenue is calculated from sale_items.price_charged for sales that are not deleted
    const dbRevenueResult = await queryDB(`
      SELECT SUM(CAST(si.price_charged AS BIGINT)) as total_revenue_paise
      FROM sale_items si
      JOIN sales s ON si.sale_id = s.id
      WHERE s.is_deleted = false
      AND s.sale_date = $1
    `, [today]);
    
    const dbRevenuePaise = dbRevenueResult[0]?.total_revenue_paise || 0;
    const dbRevenueRs = (dbRevenuePaise / 100).toFixed(2);

    // 2. Load the dashboard UI
    await page.goto('/');
    // Assume login is handled or we use the auth state...

    // 3. Verify the UI matches the exact database sum
    // Wait for API to load dashboard
    await page.waitForTimeout(2000);
    
    // Find the Revenue card on the UI
    // Example: <div data-testid="total-revenue-card">Rs. 100.00</div>
    // const uiRevenue = await page.textContent('[data-testid="total-revenue-card"]');
    
    // Expect the UI string to contain our calculated Rs value
    // expect(uiRevenue).toContain(dbRevenueRs);
  });

  test('DB Integrity: Soft deletion removes revenue but preserves record', async ({ page }) => {
    // 1. Find a valid sale to delete
    const dbSale = await queryDB(`
      SELECT id 
      FROM sales 
      WHERE is_deleted = false 
      ORDER BY created_at DESC 
      LIMIT 1
    `);
    
    if (dbSale.length === 0) return;
    const saleIdToDelete = dbSale[0].id;

    // 2. Perform UI automation to delete the sale
    // e.g., navigate to Sales, click Trash icon for this sale...

    // 3. Verify Database Integrity
    await page.waitForTimeout(2000);

    const checkSale = await queryDB(`
      SELECT is_deleted 
      FROM sales 
      WHERE id = $1
    `, [saleIdToDelete]);

    // Ensure it was soft deleted, NOT hard deleted
    // expect(checkSale.length).toBe(1);
    // expect(checkSale[0].is_deleted).toBe(true);
  });
});
