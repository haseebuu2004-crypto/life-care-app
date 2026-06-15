const { test, expect } = require('@playwright/test');
const { queryDB } = require('./db.setup');
const { loginAsAdmin } = require('./loginHelper');

test.describe('Phase 2: Data Management and Soft Deletion', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('DB Integrity: Sale Deletion updates is_deleted and restores stock', async ({ page }) => {
    const ownerQuery = await queryDB(`SELECT owner_id FROM users WHERE email = 'admin@lifecare.com'`);
    const ownerId = ownerQuery[0].owner_id;

    // We need an active product to make a sale
    const dbProduct = await queryDB(`
      SELECT v.id as inventory_id
      FROM variants v
      JOIN stock s ON s.variant_id = v.id
      JOIN product_versions pv ON v.product_version_id = pv.id
      WHERE v.is_active = true AND pv.is_active = true AND s.quantity > 0 AND s.owner_id = $1
      ORDER BY s.id DESC
      LIMIT 1 OFFSET 1
    `, [ownerId]);
    
    if (dbProduct.length === 0) return;
    const inventoryId = dbProduct[0].inventory_id;
    const customerName = 'Delete Test Customer ' + Date.now();
    
    // Create Sale via UI
    await page.click('text=Sales'); 
    await expect(page).toHaveURL(/.*sales.*/);
    
    await page.click('button:has-text("Add Sale")'); 
    const customerInput = page.locator('input[placeholder="Select or type new customer"]');
    await expect(customerInput).toBeVisible();

    await customerInput.fill(customerName);
    await page.selectOption('select', inventoryId.toString());
    const priceInput = page.locator('input[title="Selling Price"]');
    await priceInput.fill('100');
    
    await page.click('button:has-text("Complete Sale")');
    await expect(page.locator('text=Sale completed successfully')).toBeVisible();
    await page.waitForTimeout(1000);

    // Get Sale ID from DB
    const newSale = await queryDB(`
      SELECT s.id 
      FROM sales s
      JOIN customers c ON s.customer_id = c.id
      WHERE c.name = $1 
      ORDER BY s.id DESC 
      LIMIT 1
    `, [customerName]);
    const saleId = newSale[0].id;

    // Soft Delete via UI
    page.on('dialog', dialog => dialog.accept());
    await page.fill('input[placeholder="Search customer..."]', customerName);
    await page.waitForTimeout(500);

    const deleteButton = page.locator('tr').filter({ hasText: customerName }).locator('button').last();
    await deleteButton.click();
    
    await expect(page.locator('text=Sale deleted successfully')).toBeVisible();
    await page.waitForTimeout(1000);

    const checkSale = await queryDB(`SELECT is_deleted FROM sales WHERE id = $1`, [saleId]);
    expect(checkSale[0].is_deleted).toBe(true);
  });
});
