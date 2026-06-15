const { test, expect } = require('@playwright/test');
const { queryDB } = require('./db.setup');
const { loginAsAdmin } = require('./loginHelper');

test.describe('Phase 1: Sales and Pricing Verification', () => {
  
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('DB Integrity: Sale variable pricing matches database strictly', async ({ page }) => {
    await page.click('text=Sales'); 
    await expect(page).toHaveURL(/.*sales.*/);
    
    await page.click('button:has-text("Add Sale")'); 
    
    const customerInput = page.locator('input[placeholder="Select or type new customer"]');
    await expect(customerInput).toBeVisible();

    const ownerQuery = await queryDB(`SELECT owner_id FROM users WHERE email = 'admin@lifecare.com'`);
    const ownerId = ownerQuery[0].owner_id;

    const dbProduct = await queryDB(`
      SELECT pv.id as version_id, p.name, pv.vendor_price, pv.volume_points, pv.product_id, v.id as inventory_id, s.id as stock_id, s.quantity as initial_quantity
      FROM product_versions pv
      JOIN products p ON pv.product_id = p.id
      JOIN variants v ON v.product_version_id = pv.id
      JOIN stock s ON s.variant_id = v.id
      WHERE pv.is_active = true AND v.is_active = true AND s.quantity > 0 AND s.owner_id = $1
      ORDER BY s.id ASC
      LIMIT 1
    `, [ownerId]);
    
    if (dbProduct.length === 0) {
      console.log('No active products with stock found in DB. Skipping test.');
      return;
    }
    
    const product = dbProduct[0];
    const initialQuantity = Number(product.initial_quantity);
    const customerName = 'Playwright Test Member ' + Date.now();
    
    await customerInput.fill(customerName);
    
    // Select product
    await page.selectOption('select', product.inventory_id.toString());
    
    const customPrice = "50";
    const priceInput = page.locator('input[title="Selling Price"]');
    await priceInput.fill('');
    await priceInput.fill(customPrice);
    
    await page.click('button:has-text("Complete Sale")');
    await expect(page.locator('text=Sale completed successfully')).toBeVisible();

    await page.waitForTimeout(1000); 
    
    const latestSale = await queryDB(`
      SELECT s.id, si.price_charged, si.standard_price_snap, si.vendor_price_snap 
      FROM sales s
      JOIN sale_items si ON s.id = si.sale_id
      JOIN customers c ON s.customer_id = c.id
      WHERE c.name = $1
      ORDER BY s.id DESC 
      LIMIT 1
    `, [customerName]);
    
    expect(latestSale.length).toBe(1);
    const dbItem = latestSale[0];
    
    expect(Number(dbItem.price_charged)).toBe(parseFloat(customPrice) * 100);
    expect(Number(dbItem.vendor_price_snap)).toBe(Number(product.vendor_price));
    
    // Check Stock Deduction
    const updatedStock = await queryDB(`SELECT quantity FROM stock WHERE id = $1`, [product.stock_id]);
    expect(Number(updatedStock[0].quantity)).toBe(initialQuantity - 1);

    await queryDB(`UPDATE sales SET is_deleted = true WHERE id = $1`, [dbItem.id]);
    await queryDB(`UPDATE stock SET quantity = quantity + 1 WHERE id = $1`, [product.stock_id]);
  });
});
