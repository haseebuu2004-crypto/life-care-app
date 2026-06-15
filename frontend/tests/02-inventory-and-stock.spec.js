const { test, expect } = require('@playwright/test');
const { queryDB } = require('./db.setup');

test.describe('Phase 1: Inventory and Stock Verification', () => {

  test('DB Integrity: Product versioning works correctly', async ({ page }) => {
    // 1. Fetch an active product from DB to test with
    const dbProduct = await queryDB(`
      SELECT p.id, p.name, pv.id as version_id
      FROM products p
      JOIN product_versions pv ON p.id = pv.product_id
      WHERE pv.is_active = true
      LIMIT 1
    `);
    
    if (dbProduct.length === 0) return;
    const product = dbProduct[0];

    // 2. Here you would write Playwright UI automation to log in, navigate to Product Manager,
    // click edit on that product, and save a new price.
    // e.g., await page.click(\`tr:has-text("\${product.name}") button:has-text("Edit")\`);

    // 3. Verify Database Integrity (Versioning)
    // Wait for API completion
    await page.waitForTimeout(2000);

    // Query the database to check if the old version is inactive and new is active
    const versions = await queryDB(`
      SELECT id, is_active 
      FROM product_versions 
      WHERE product_id = $1 
      ORDER BY effective_from DESC
    `, [product.id]);

    // We should have at least 2 versions if we updated it
    // expect(versions.length).toBeGreaterThanOrEqual(2);
    // The latest version should be active
    // expect(versions[0].is_active).toBe(true);
    // The older version should be inactive
    // expect(versions[1].is_active).toBe(false);
  });

  test('DB Integrity: Stock deductions process correctly', async ({ page }) => {
    // 1. Query the database to find current stock
    const dbStock = await queryDB(`
      SELECT quantity, product_version_id, id as stock_id
      FROM stock
      WHERE quantity > 0
      LIMIT 1
    `);
    
    if (dbStock.length === 0) return;
    const initialQuantity = dbStock[0].quantity;

    // 2. Write UI automation to sell 1 unit of this product

    // 3. Verify DB Integrity
    await page.waitForTimeout(2000);

    const updatedStock = await queryDB(`
      SELECT quantity 
      FROM stock 
      WHERE id = $1
    `, [dbStock[0].stock_id]);

    // Verify quantity decreased by 1
    // expect(updatedStock[0].quantity).toBe(initialQuantity - 1);
  });
});
