import { test, expect } from '@playwright/test';

test.describe('Auth Flow', () => {
  test('should allow user to register and login', async ({ page }) => {
    // 1. Register
    await page.goto('/register');
    
    const uniqueSuffix = Date.now();
    const username = `user_${uniqueSuffix}`;
    const email = `user_${uniqueSuffix}@example.com`;
    const password = 'Password123!';

    await page.fill('input[id="username"]', username);
    await page.fill('input[id="email"]', email);
    await page.fill('input[id="password"]', password);
    await page.fill('input[id="confirmPassword"]', password);
    
    await page.click('button[type="submit"]');

    // Should redirect to dashboard upon successful auto-login or login page
    await expect(page).toHaveURL('/');
    await expect(page.getByText('Dashboard')).toBeVisible();

    // 2. Logout
    await page.click('button:has-text("Logout")');
    await expect(page).toHaveURL('/login');

    // 3. Login again
    await page.fill('input[id="email"]', email);
    await page.fill('input[id="password"]', password);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/');
    await expect(page.getByText('Dashboard')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[id="email"]', 'wrong@example.com');
    await page.fill('input[id="password"]', 'wrongpass');
    await page.click('button[type="submit"]');

    await expect(page.locator('.text-destructive')).toBeVisible();
  });
});
