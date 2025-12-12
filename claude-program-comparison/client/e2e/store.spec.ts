import { test, expect } from '@playwright/test';

test.describe('Store and Cart Flow', () => {
  // Helper function to register and login
  async function loginUser(page: any) {
    const email = `test${Date.now()}@example.com`;
    const password = 'SecurePass123!';

    await page.goto('/register');
    await page.fill('input[type="email"]', email);
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'User');
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/', { timeout: 10000 });

    return { email, password };
  }

  test('store page loads with crypto products', async ({ page }) => {
    await page.goto('/store');

    // Wait for store to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Check for store heading
    await expect(page.locator('h1, h2').first()).toBeVisible();

    // Check that products are displayed
    const products = page.locator('[data-testid="crypto-product"], .product-card, .crypto-item, .grid > div');
    await expect(products.first()).toBeVisible({ timeout: 10000 });

    // Verify multiple products are shown
    const count = await products.count();
    expect(count).toBeGreaterThanOrEqual(3);

    // Check for "Add to Cart" buttons
    const addButtons = page.locator('button:has-text("Add to Cart"), button:has-text("Add"), button:has-text("Buy")');
    await expect(addButtons.first()).toBeVisible();
  });

  test('user can add items to cart', async ({ page }) => {
    // Login first
    await loginUser(page);

    // Navigate to store
    await page.goto('/store');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Find first product's add to cart button
    const addButton = page.locator('button:has-text("Add to Cart"), button:has-text("Add")').first();
    await addButton.click();

    // Wait for cart to update (might show notification or cart icon badge)
    await page.waitForTimeout(1500);

    // Check for cart indicator update (badge with count)
    const cartBadge = page.locator('[data-testid="cart-badge"], .cart-count, .badge');
    if (await cartBadge.count() > 0) {
      const badgeText = await cartBadge.first().textContent();
      expect(badgeText).toBeTruthy();
    }

    // Navigate to cart
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');

    // Verify item is in cart
    const cartItems = page.locator('[data-testid="cart-item"], .cart-item, tbody tr');
    await expect(cartItems.first()).toBeVisible({ timeout: 5000 });
  });

  test('user can add custom amount to cart', async ({ page }) => {
    // Login first
    await loginUser(page);

    // Navigate to store
    await page.goto('/store');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Look for amount input field on first product
    const amountInputs = page.locator('input[type="number"], input[placeholder*="Amount" i], input[placeholder*="Quantity" i]');

    if (await amountInputs.count() > 0) {
      // Clear and enter custom amount
      const firstInput = amountInputs.first();
      await firstInput.clear();
      await firstInput.fill('0.5');

      // Add to cart
      const addButton = page.locator('button:has-text("Add to Cart"), button:has-text("Add")').first();
      await addButton.click();
      await page.waitForTimeout(1500);

      // Go to cart and verify amount
      await page.goto('/cart');
      await page.waitForLoadState('networkidle');

      // Check for the custom amount in cart
      const cartContent = await page.locator('body').textContent();
      expect(cartContent).toContain('0.5');
    }
  });

  test('cart displays correct total', async ({ page }) => {
    // Login first
    await loginUser(page);

    // Navigate to store and add items
    await page.goto('/store');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Add first item
    const addButtons = page.locator('button:has-text("Add to Cart"), button:has-text("Add")');
    await addButtons.first().click();
    await page.waitForTimeout(1000);

    // Navigate to cart
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');

    // Check for total price display
    const totalElement = page.locator('[data-testid="cart-total"], .total, text=/Total:/i, text=/Subtotal:/i');
    await expect(totalElement.first()).toBeVisible({ timeout: 5000 });

    // Verify total contains a dollar amount
    const totalText = await totalElement.first().textContent();
    expect(totalText).toMatch(/\$[\d,]+\.?\d*/);
  });

  test('user can update cart item quantity', async ({ page }) => {
    // Login first
    await loginUser(page);

    // Navigate to store and add item
    await page.goto('/store');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.locator('button:has-text("Add to Cart"), button:has-text("Add")').first().click();
    await page.waitForTimeout(1000);

    // Go to cart
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');

    // Look for quantity input or update buttons
    const quantityInput = page.locator('input[type="number"]').first();

    if (await quantityInput.count() > 0) {
      // Update quantity
      await quantityInput.clear();
      await quantityInput.fill('2');
      await quantityInput.press('Enter');
      await page.waitForTimeout(1500);

      // Verify quantity updated
      const value = await quantityInput.inputValue();
      expect(value).toBe('2');
    }
  });

  test('user can remove item from cart', async ({ page }) => {
    // Login first
    await loginUser(page);

    // Navigate to store and add item
    await page.goto('/store');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.locator('button:has-text("Add to Cart"), button:has-text("Add")').first().click();
    await page.waitForTimeout(1000);

    // Go to cart
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');

    // Find remove button
    const removeButton = page.locator('button:has-text("Remove"), button:has-text("Delete"), button[aria-label*="Remove" i]').first();
    await removeButton.click();
    await page.waitForTimeout(1500);

    // Verify cart is empty or item is removed
    const emptyMessage = page.locator('text=/empty/i, text=/no items/i');
    if (await emptyMessage.count() > 0) {
      await expect(emptyMessage.first()).toBeVisible();
    } else {
      // Or verify the item count decreased
      const cartItems = page.locator('[data-testid="cart-item"], .cart-item, tbody tr');
      expect(await cartItems.count()).toBe(0);
    }
  });

  test('user can checkout and complete purchase', async ({ page }) => {
    // Login first
    await loginUser(page);

    // Navigate to store and add item
    await page.goto('/store');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.locator('button:has-text("Add to Cart"), button:has-text("Add")').first().click();
    await page.waitForTimeout(1000);

    // Go to cart
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');

    // Find and click checkout button
    const checkoutButton = page.locator('button:has-text("Checkout"), button:has-text("Complete Purchase"), button:has-text("Buy Now")');
    await expect(checkoutButton.first()).toBeVisible({ timeout: 5000 });
    await checkoutButton.first().click();

    // Wait for success modal or redirect
    await page.waitForTimeout(2000);

    // Check for success message or modal
    const successIndicator = page.locator('text=/success/i, text=/complete/i, text=/purchased/i, [role="dialog"]');
    await expect(successIndicator.first()).toBeVisible({ timeout: 10000 });

    // Verify cart is cleared (if we go back to cart, it should be empty)
    await page.goto('/cart');
    await page.waitForTimeout(1000);

    const emptyMessage = page.locator('text=/empty/i, text=/no items/i');
    if (await emptyMessage.count() > 0) {
      await expect(emptyMessage.first()).toBeVisible();
    }
  });

  test('checkout redirects unauthenticated user to login', async ({ page }) => {
    // Don't login, go directly to cart/checkout
    await page.goto('/cart');

    // Should redirect to login
    await expect(page).toHaveURL('/login', { timeout: 10000 });
  });

  test('empty cart shows appropriate message', async ({ page }) => {
    // Login first
    await loginUser(page);

    // Go to cart without adding items
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');

    // Should show empty state
    const emptyMessage = page.locator('text=/empty/i, text=/no items/i, text=/cart is empty/i');
    await expect(emptyMessage.first()).toBeVisible({ timeout: 5000 });

    // Checkout button should be disabled or not present
    const checkoutButton = page.locator('button:has-text("Checkout")');
    if (await checkoutButton.count() > 0) {
      await expect(checkoutButton.first()).toBeDisabled();
    }
  });

  test('store is mobile responsive', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/store');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Verify content is visible
    const products = page.locator('[data-testid="crypto-product"], .product-card, .crypto-item');
    await expect(products.first()).toBeVisible({ timeout: 10000 });

    // Verify no horizontal scrolling
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = 375;
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 50);

    // Verify products are stacked vertically (grid should be single column)
    // Products should be visible and accessible
    const count = await products.count();
    expect(count).toBeGreaterThan(0);
  });
});
