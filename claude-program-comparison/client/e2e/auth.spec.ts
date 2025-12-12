import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  const testEmail = `test${Date.now()}@example.com`;
  const testPassword = 'SecurePass123!';

  test('user can register with valid credentials', async ({ page }) => {
    await page.goto('/register');

    // Wait for page to load
    await expect(page.locator('h1')).toContainText('Create Account', { timeout: 10000 });

    // Fill registration form
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[type="password"]', testPassword);

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to dashboard after successful registration
    await expect(page).toHaveURL('/', { timeout: 10000 });

    // Should show user is logged in (check for logout or user menu)
    const header = page.locator('header');
    await expect(header).toContainText('John', { timeout: 5000 });
  });

  test('registration fails with weak password', async ({ page }) => {
    await page.goto('/register');

    await expect(page.locator('h1')).toContainText('Create Account');

    // Fill form with weak password
    await page.fill('input[type="email"]', `weak${Date.now()}@example.com`);
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[type="password"]', 'weak');

    // Submit form
    await page.click('button[type="submit"]');

    // Should show validation error
    await expect(page.locator('text=/password/i')).toBeVisible({ timeout: 5000 });
  });

  test('user can login with valid credentials', async ({ page }) => {
    // First register a user
    await page.goto('/register');
    const uniqueEmail = `login${Date.now()}@example.com`;

    await page.fill('input[type="email"]', uniqueEmail);
    await page.fill('input[name="firstName"]', 'Jane');
    await page.fill('input[name="lastName"]', 'Smith');
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');

    // Wait for redirect
    await page.waitForURL('/', { timeout: 10000 });

    // Logout
    const userMenu = page.locator('text=/Jane|Logout/i').first();
    await userMenu.click();
    const logoutButton = page.locator('text=/logout/i').last();
    await logoutButton.click();

    // Wait for redirect to login or home
    await page.waitForTimeout(1000);

    // Now login
    await page.goto('/login');
    await expect(page.locator('h1')).toContainText(/Login|Sign In/i);

    await page.fill('input[type="email"]', uniqueEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL('/', { timeout: 10000 });
    await expect(page.locator('header')).toContainText('Jane', { timeout: 5000 });
  });

  test('login fails with invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await expect(page.locator('h1')).toContainText(/Login|Sign In/i);

    // Try to login with non-existent user
    await page.fill('input[type="email"]', 'nonexistent@example.com');
    await page.fill('input[type="password"]', 'WrongPassword123!');
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('text=/invalid|error|incorrect/i')).toBeVisible({ timeout: 5000 });

    // Should still be on login page
    await expect(page).toHaveURL('/login');
  });

  test('user can logout successfully', async ({ page }) => {
    // Register and login
    await page.goto('/register');
    const uniqueEmail = `logout${Date.now()}@example.com`;

    await page.fill('input[type="email"]', uniqueEmail);
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'User');
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');

    await page.waitForURL('/', { timeout: 10000 });

    // Logout
    const userMenu = page.locator('text=/Test/i').first();
    await userMenu.click();
    const logoutButton = page.locator('text=/logout/i').last();
    await logoutButton.click();

    // Should redirect to login or show logged out state
    await page.waitForTimeout(1000);

    // Header should not show user name anymore
    const header = page.locator('header');
    await expect(header.locator('text=/Test/i')).not.toBeVisible({ timeout: 5000 });

    // Should show login/sign up buttons
    await expect(header.locator('text=/Login|Sign Up/i')).toBeVisible();
  });

  test('protected routes redirect to login when not authenticated', async ({ page }) => {
    // Try to access protected route (Portfolio) without authentication
    await page.goto('/portfolio');

    // Should redirect to login
    await expect(page).toHaveURL('/login', { timeout: 10000 });
  });
});
