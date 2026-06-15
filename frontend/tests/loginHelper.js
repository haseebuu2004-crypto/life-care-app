const { expect } = require('@playwright/test');

async function loginAsAdmin(page) {
    await page.goto('/');
    await page.fill('input[type="email"]', 'admin@lifecare.com');
    await page.fill('input[type="password"]', 'Haseeb@2007');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('http://localhost:3001/');
}

async function loginAsStaff(page) {
    await page.goto('/');
    await page.fill('input[type="email"]', 'staff@lifecare.com');
    await page.fill('input[type="password"]', 'Haseeb@2007');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*user\/sales.*/);
}

module.exports = { loginAsAdmin, loginAsStaff };
