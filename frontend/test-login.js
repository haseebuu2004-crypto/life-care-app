const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3001/');
  
  await page.fill('input[type="email"]', 'admin@lifecare.com');
  await page.fill('input[type="password"]', 'Haseeb@2007');
  await page.click('button[type="submit"]');
  
  // Wait a bit to see what happens
  await page.waitForTimeout(3000);
  
  await page.screenshot({ path: 'login-screenshot.png' });
  
  console.log('Current URL:', page.url());
  
  await browser.close();
})();
