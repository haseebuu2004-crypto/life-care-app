const { expect } = require('@playwright/test');

async function loginAsAdmin(page) {
    page.on('console', msg => console.log('LOGIN CONSOLE:', msg.text()));
    page.on('request', req => { if(req.url().includes('/api/auth')) console.log('REQ:', req.url(), req.method(), req.postData()) });
    page.on('response', res => { if(res.url().includes('/api/auth')) console.log('RES:', res.url(), res.status()) });
    
    await page.goto('/');
    await page.fill('input[type="email"]', 'admin@lifecare.com');
    await page.fill('input[type="password"]', 'Haseeb@2007');
    await page.click('button[type="submit"]');
    try {
        await expect(page).toHaveURL('http://localhost:3001/', { timeout: 15000 });
    } catch (e) {
        const html = await page.content();
        console.log('PAGE HTML AFTER CLICK:', html);
        throw e;
    }
}

async function loginAsStaff(page) {
    await page.goto('/');
    await page.fill('input[type="email"]', 'staff@lifecare.com');
    await page.fill('input[type="password"]', 'Haseeb@2007');
    await page.click('button[type="submit"]');
    try {
        await expect(page).toHaveURL(/.*user\/sales.*/, { timeout: 15000 });
    } catch (e) {
        const html = await page.content();
        console.log('PAGE HTML AFTER CLICK STAFF:', html);
        throw e;
    }
}

module.exports = { loginAsAdmin, loginAsStaff };
