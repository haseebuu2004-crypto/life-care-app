const { chromium } = require('playwright');
(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    page.on('console', msg => {
        if (msg.text().includes('[TIMING]')) {
            console.log(msg.text());
        }
    });
    await page.goto('http://localhost:3001');
    
    // Login
    await page.fill('input[type="text"]', 'user');
    await page.fill('input[type="password"]', 'user123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    
    // Find Add Sale button
    const btns = await page.$$('button');
    let addSaleBtn = null;
    for (const b of btns) {
        const text = await b.textContent();
        if (text && text.includes('Add Sale')) {
            addSaleBtn = b;
            break;
        }
    }
    
    if (addSaleBtn) {
        await addSaleBtn.click();
        await page.waitForTimeout(1000);
        
        // Fill Customer
        await page.locator('input[role="combobox"]').first().fill('Test Customer');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(500);
        
        // Fill Product
        await page.locator('input[role="combobox"]').nth(1).fill('a'); // Just type 'a' to search
        await page.keyboard.press('Enter');
        await page.waitForTimeout(500);

        // Fill Price
        await page.fill('input[title="Selling Price"]', '100');
        
        // Submit
        await page.click('button:has-text("Complete Sale")');
        
        await page.waitForTimeout(5000); // Wait for all timing logs
    } else {
        console.log("Add Sale button not found");
    }
    await browser.close();
})();
