import { test, expect } from '@playwright/test';

test.describe('Feature Flows', () => {
  // Helper to login before each test
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
    const uniqueSuffix = Date.now();
    await page.fill('input[id="username"]', `test_${uniqueSuffix}`);
    await page.fill('input[id="email"]', `test_${uniqueSuffix}@example.com`);
    await page.fill('input[id="password"]', 'Password123!');
    await page.fill('input[id="confirmPassword"]', 'Password123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
  });

  test('Dashboard loads crypto data', async ({ page }) => {
    await expect(page.getByText('Market Dashboard')).toBeVisible();
    // Wait for SignalR or fetch to populate table
    await expect(page.locator('table')).toBeVisible();
    // Check for Bitcoin
    await expect(page.getByText('Bitcoin')).toBeVisible({ timeout: 10000 });
  });

  test('Store checkout flow', async ({ page }) => {
    await page.goto('/store');
    await expect(page.getByText('Merch Store')).toBeVisible();
    
    // Add first item
    await page.locator('button:has-text("Add")').first().click();
    // Visual feedback wait
    await page.waitForTimeout(500); 
    
    await page.goto('/cart');
    await expect(page.getByText('Shopping Cart')).toBeVisible();
    await expect(page.getByText('Order Summary')).toBeVisible();
    
    await page.click('button:has-text("Checkout")');
    await expect(page.getByText('Order Confirmed!')).toBeVisible();
  });

  test('Portfolio Buy/Sell flow', async ({ page }) => {
    await page.goto('/portfolio');
    
    // Create portfolio if prompted (first time)
    if (await page.getByText('Create your first Portfolio').isVisible()) {
        await page.fill('input[placeholder*="Name"]', 'My Fund');
        await page.click('button:has-text("Get Started")');
    }

    await expect(page.getByText('Cash Balance')).toBeVisible();
    
    // Execute Buy
    await page.fill('input[id="asset"]', 'bitcoin');
    await page.fill('input[id="quantity"]', '0.1');
    await page.click('button:has-text("Buy")');
    
    // Check if position appears in table
    await expect(page.locator('table')).toContainText('bitcoin');
    await expect(page.locator('table')).toContainText('0.1000');
  });
});
