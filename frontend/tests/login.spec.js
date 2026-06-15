const { test, expect } = require('@playwright/test');

test.describe('Authentication and Core Flow', () => {
  
  test('User can load the login page', async ({ page }) => {
    // Go to the login page (which is the root or /login)
    await page.goto('/');
    
    // Expect the page to have a title or some text related to login
    // Based on the app structure, the root usually redirects to login if unauthenticated
    await expect(page).toHaveURL(/.*login.*/);
    
    // Verify the login form renders (email/password inputs)
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });

});
