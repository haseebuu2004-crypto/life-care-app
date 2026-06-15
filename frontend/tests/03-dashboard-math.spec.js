const { test, expect } = require('@playwright/test');
const { queryDB } = require('./db.setup');
const { loginAsAdmin } = require('./loginHelper');

test.describe('Phase 1: Dashboard Math Verification', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('DB Integrity: Dashboard Revenue matches sum of price_charged', async ({ page }) => {
    // 1. Query the database to find the total revenue for today
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    
    // Revenue is calculated from sale_items.price_charged for sales that are not deleted
    // The default dashboard view is "This Month"
    const ownerQuery = await queryDB(`SELECT owner_id FROM users WHERE email = 'admin@lifecare.com'`);
    const ownerId = ownerQuery[0].owner_id;

    const dbRevenueResult = await queryDB(`
      SELECT SUM(CAST(si.price_charged AS BIGINT) * CAST(si.quantity AS BIGINT)) as total_revenue_paise
      FROM sale_items si
      JOIN sales s ON si.sale_id = s.id
      WHERE s.is_deleted = false
      AND s.owner_id = $1
      AND s.sale_date >= $2
    `, [ownerId, firstDay]);
    
    const dbRevenuePaise = dbRevenueResult[0]?.total_revenue_paise || 0;
    const dbRevenueRs = (dbRevenuePaise / 100).toFixed(2);
    
    // Wait for Dashboard API
    await page.waitForTimeout(2000);
    
    // Find the Revenue card on the UI
    const uiRevenueText = await page.locator('.card:has-text("Total Revenue") > div:nth-child(2)').textContent();
    
    // Compare string representations
    // Remove "Rs. " or commas
    const parsedUiRevenue = uiRevenueText.replace(/Rs\.\s?|,/g, '').trim();
    
    expect(Number(parsedUiRevenue)).toBeCloseTo(Number(dbRevenueRs), 2);
  });
});
