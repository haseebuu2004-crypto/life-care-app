# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 01-sales-and-pricing.spec.js >> Phase 1: Sales and Pricing Verification >> DB Integrity: Sale variable pricing matches database strictly
- Location: tests\01-sales-and-pricing.spec.js:11:3

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected: "http://localhost:3001/"
Received: "http://localhost:3001/login"
Timeout:  15000ms

Call log:
  - Expect "toHaveURL" with timeout 15000ms
    31 × unexpected value "http://localhost:3001/login"

```

```yaml
- alert
- heading "🥗 Life Care System" [level=2]
- text: Network Error
- heading "ACCOUNT LOGIN" [level=3]
- text: Email Address
- textbox "name@example.com": admin@lifecare.com
- text: Password
- textbox "Enter password": Haseeb@2007
- button
- button "Sign In"
- button "Forgot Password?"
```

# Test source

```ts
  1  | const { expect } = require('@playwright/test');
  2  | 
  3  | async function loginAsAdmin(page) {
  4  |     page.on('console', msg => console.log('LOGIN CONSOLE:', msg.text()));
  5  |     page.on('request', req => { if(req.url().includes('/api/auth')) console.log('REQ:', req.url(), req.method(), req.postData()) });
  6  |     page.on('response', res => { if(res.url().includes('/api/auth')) console.log('RES:', res.url(), res.status()) });
  7  |     
  8  |     await page.goto('/');
  9  |     await page.fill('input[type="email"]', 'admin@lifecare.com');
  10 |     await page.fill('input[type="password"]', 'Haseeb@2007');
  11 |     await page.click('button[type="submit"]');
  12 |     try {
> 13 |         await expect(page).toHaveURL('http://localhost:3001/', { timeout: 15000 });
     |                            ^ Error: expect(page).toHaveURL(expected) failed
  14 |     } catch (e) {
  15 |         const html = await page.content();
  16 |         console.log('PAGE HTML AFTER CLICK:', html);
  17 |         throw e;
  18 |     }
  19 | }
  20 | 
  21 | async function loginAsStaff(page) {
  22 |     await page.goto('/');
  23 |     await page.fill('input[type="email"]', 'staff@lifecare.com');
  24 |     await page.fill('input[type="password"]', 'Haseeb@2007');
  25 |     await page.click('button[type="submit"]');
  26 |     try {
  27 |         await expect(page).toHaveURL(/.*user\/sales.*/, { timeout: 15000 });
  28 |     } catch (e) {
  29 |         const html = await page.content();
  30 |         console.log('PAGE HTML AFTER CLICK STAFF:', html);
  31 |         throw e;
  32 |     }
  33 | }
  34 | 
  35 | module.exports = { loginAsAdmin, loginAsStaff };
  36 | 
```