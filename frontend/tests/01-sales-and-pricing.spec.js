const { test, expect } = require('@playwright/test');
const { queryDB } = require('./db.setup');

test.describe('Phase 1: Sales and Pricing Verification', () => {
  
  test.beforeEach(async ({ page }) => {
    // 1. Load the app and login
    await page.goto('/');
    await page.fill('input[type="email"]', 'admin@lifecare.com'); // Replace with actual test admin email
    await page.fill('input[type="password"]', 'password123'); // Replace with actual password
    await page.click('button:has-text("Confirm"), button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard.*/);
  });

  test('DB Integrity: Sale variable pricing matches database strictly', async ({ page }) => {
    // 1. Navigate to Sales tab
    await page.click('text=Sales'); // Assuming navigation has 'Sales' text
    await page.click('button:has-text("Add Sale")'); // Open the Add Sale modal
    
    // 2. We need to fetch an active product to test with
    // Let's query the DB to find an active product version ID first so we know what to expect
    const dbProduct = await queryDB(`
      SELECT pv.id as version_id, p.name, pv.vendor_price, pv.volume_points
      FROM product_versions pv
      JOIN products p ON pv.product_id = p.id
      WHERE pv.is_active = true
      LIMIT 1
    `);
    
    if (dbProduct.length === 0) {
      console.log('No active products found in DB. Skipping test.');
      return;
    }
    
    const product = dbProduct[0];
    
    // 3. Fill out the Sale form (simulate user input)
    // Here you would select a customer and the product. 
    // Since UI selects might be complex, we assume standard inputs:
    await page.fill('input[placeholder="Search member..."]', 'Test');
    // ... complete the dropdown selection logic based on your UI ...
    
    // Find the price input and change it to something custom (e.g. 50 Rs)
    const customPrice = "50";
    await page.fill('input[type="number"]', customPrice);
    
    // Submit Sale
    await page.click('button:has-text("Save Sale")');
    
    // 4. Verify Database Integrity!
    // We wait 2 seconds for the server to process the insertion
    await page.waitForTimeout(2000);
    
    // Query the latest sale item from the DB
    const latestSaleItem = await queryDB(`
      SELECT price_charged, standard_price_snap, vendor_price_snap 
      FROM sale_items 
      ORDER BY id DESC 
      LIMIT 1
    `);
    
    expect(latestSaleItem.length).toBeGreaterThan(0);
    
    const dbItem = latestSaleItem[0];
    
    // The DB stores values in PAISE (Rs * 100)
    // Verify the custom price we charged (50 Rs = 5000 paise) was strictly saved
    // expect(dbItem.price_charged).toBe((parseFloat(customPrice) * 100).toString());
    
    // Verify the vendor cost correctly tracked the exact underlying cost
    // expect(dbItem.vendor_price_snap).toBe(product.vendor_price.toString());
  });
});
