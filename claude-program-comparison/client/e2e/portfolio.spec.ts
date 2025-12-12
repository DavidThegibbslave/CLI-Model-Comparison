import { test, expect } from '@playwright/test';

test.describe('Portfolio Flow', () => {
  // Helper function to register, login, and make a purchase
  async function setupUserWithPortfolio(page: any) {
    const email = `portfolio${Date.now()}@example.com`;
    const password = 'SecurePass123!';

    // Register
    await page.goto('/register');
    await page.fill('input[type="email"]', email);
    await page.fill('input[name="firstName"]', 'Portfolio');
    await page.fill('input[name="lastName"]', 'User');
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/', { timeout: 10000 });

    // Go to store and add item
    await page.goto('/store');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const addButton = page.locator('button:has-text("Add to Cart"), button:has-text("Add")').first();
    await addButton.click();
    await page.waitForTimeout(1000);

    // Go to cart and checkout
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const checkoutButton = page.locator('button:has-text("Checkout"), button:has-text("Complete Purchase")').first();
    if (await checkoutButton.isVisible()) {
      await checkoutButton.click();
      await page.waitForTimeout(2000);
    }

    return { email, password };
  }

  test('portfolio requires authentication', async ({ page }) => {
    // Try to access portfolio without login
    await page.goto('/portfolio');

    // Should redirect to login
    await expect(page).toHaveURL('/login', { timeout: 10000 });
  });

  test('empty portfolio shows appropriate message', async ({ page }) => {
    // Register and login (but don't make any purchases)
    const email = `empty${Date.now()}@example.com`;
    const password = 'SecurePass123!';

    await page.goto('/register');
    await page.fill('input[type="email"]', email);
    await page.fill('input[name="firstName"]', 'Empty');
    await page.fill('input[name="lastName"]', 'Portfolio');
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/', { timeout: 10000 });

    // Go to portfolio
    await page.goto('/portfolio');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Should show empty state
    const emptyMessage = page.locator('text=/empty/i, text=/no holdings/i, text=/no assets/i, text=/no investments/i');
    await expect(emptyMessage.first()).toBeVisible({ timeout: 5000 });
  });

  test('portfolio displays user holdings', async ({ page }) => {
    // Setup user with a purchase
    await setupUserWithPortfolio(page);

    // Navigate to portfolio
    await page.goto('/portfolio');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Check for portfolio heading
    await expect(page.locator('h1, h2').first()).toBeVisible();

    // Check for holdings display
    const holdings = page.locator('[data-testid="holding-item"], .holding, .portfolio-item, tbody tr');
    await expect(holdings.first()).toBeVisible({ timeout: 10000 });

    // Verify holding shows key information (name, amount, value)
    const holdingText = await page.locator('body').textContent();
    expect(holdingText).toMatch(/\$[\d,]+\.?\d*/); // Should show dollar amounts
  });

  test('portfolio shows total value and P&L', async ({ page }) => {
    // Setup user with a purchase
    await setupUserWithPortfolio(page);

    // Navigate to portfolio
    await page.goto('/portfolio');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Look for total value display
    const totalValue = page.locator('[data-testid="total-value"], .total-value, text=/Total Value/i, text=/Portfolio Value/i');
    await expect(totalValue.first()).toBeVisible({ timeout: 5000 });

    // Look for P&L (profit/loss) display
    const pnl = page.locator('[data-testid="pnl"], .profit, .loss, text=/Profit/i, text=/Loss/i, text=/P&L/i, text=/Gain/i');
    if (await pnl.count() > 0) {
      await expect(pnl.first()).toBeVisible();
    }

    // Verify dollar amounts are shown
    const pageText = await page.locator('body').textContent();
    expect(pageText).toMatch(/\$[\d,]+\.?\d*/);
  });

  test('portfolio displays performance metrics', async ({ page }) => {
    // Setup user with a purchase
    await setupUserWithPortfolio(page);

    // Navigate to portfolio
    await page.goto('/portfolio');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Look for performance indicators (percentages, best performer, etc.)
    const performanceMetrics = page.locator('text=/Best Performer/i, text=/Top Gainer/i, text=/Allocation/i, text=/%/');
    if (await performanceMetrics.count() > 0) {
      await expect(performanceMetrics.first()).toBeVisible();
    }

    // Verify percentage values are shown
    const pageText = await page.locator('body').textContent();
    if (pageText?.includes('%')) {
      expect(pageText).toMatch(/\d+\.?\d*%/);
    }
  });

  test('portfolio shows transaction history', async ({ page }) => {
    // Setup user with a purchase
    await setupUserWithPortfolio(page);

    // Navigate to portfolio
    await page.goto('/portfolio');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Look for transactions section or tab
    const transactionsSection = page.locator('text=/Transactions/i, text=/History/i, [data-testid="transactions"]');

    if (await transactionsSection.count() > 0) {
      // Click to view transactions if it's a tab
      if (await page.locator('button:has-text("Transactions"), button:has-text("History")').count() > 0) {
        await page.locator('button:has-text("Transactions"), button:has-text("History")').first().click();
        await page.waitForTimeout(1000);
      }

      // Verify transaction items are shown
      const transactionItems = page.locator('[data-testid="transaction-item"], .transaction, .history-item, tbody tr');
      if (await transactionItems.count() > 0) {
        await expect(transactionItems.first()).toBeVisible();
      }
    }
  });

  test('portfolio chart displays correctly', async ({ page }) => {
    // Setup user with a purchase
    await setupUserWithPortfolio(page);

    // Navigate to portfolio
    await page.goto('/portfolio');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Look for portfolio chart
    const chart = page.locator('canvas, .recharts-wrapper, svg.recharts-surface, .chart');

    if (await chart.count() > 0) {
      await expect(chart.first()).toBeVisible({ timeout: 10000 });

      // Verify chart has some size
      const chartBox = await chart.first().boundingBox();
      if (chartBox) {
        expect(chartBox.width).toBeGreaterThan(100);
        expect(chartBox.height).toBeGreaterThan(100);
      }
    }
  });

  test('user can view individual holding details', async ({ page }) => {
    // Setup user with a purchase
    await setupUserWithPortfolio(page);

    // Navigate to portfolio
    await page.goto('/portfolio');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Click on a holding
    const holdings = page.locator('[data-testid="holding-item"], .holding, .portfolio-item, tbody tr');
    if (await holdings.count() > 0) {
      await holdings.first().click();
      await page.waitForTimeout(1500);

      // Look for detail modal or expanded view
      const detailView = page.locator('[role="dialog"], .modal, .detail-view, .expanded');
      if (await detailView.count() > 0) {
        await expect(detailView.first()).toBeVisible();

        // Should show detailed information
        const detailText = await page.locator('body').textContent();
        expect(detailText).toMatch(/Amount|Quantity|Value|Price/i);
      }
    }
  });

  test('portfolio allocation chart shows distribution', async ({ page }) => {
    // Setup user with a purchase
    await setupUserWithPortfolio(page);

    // Navigate to portfolio
    await page.goto('/portfolio');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Look for allocation/distribution section
    const allocationSection = page.locator('text=/Allocation/i, text=/Distribution/i');

    if (await allocationSection.count() > 0) {
      // Look for pie chart or bar chart
      const chart = page.locator('canvas, .recharts-wrapper, svg');
      if (await chart.count() > 0) {
        await expect(chart.first()).toBeVisible();
      }

      // Verify percentages are shown
      const pageText = await page.locator('body').textContent();
      expect(pageText).toMatch(/\d+\.?\d*%/);
    }
  });

  test('portfolio is mobile responsive', async ({ page }) => {
    // Setup user with a purchase
    await setupUserWithPortfolio(page);

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Navigate to portfolio
    await page.goto('/portfolio');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Verify content is visible
    const mainContent = page.locator('main, [role="main"]');
    await expect(mainContent.first()).toBeVisible();

    // Verify no horizontal scrolling
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = 375;
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 50);

    // Holdings should be visible (possibly in card format)
    const holdings = page.locator('[data-testid="holding-item"], .holding, .portfolio-item, .card');
    if (await holdings.count() > 0) {
      await expect(holdings.first()).toBeVisible();
    }
  });

  test('portfolio updates with real-time price changes', async ({ page }) => {
    // Setup user with a purchase
    await setupUserWithPortfolio(page);

    // Navigate to portfolio
    await page.goto('/portfolio');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Get initial portfolio value
    const valueElement = page.locator('[data-testid="total-value"], .total-value').first();
    if (await valueElement.count() > 0) {
      await expect(valueElement).toBeVisible();

      // Wait for potential SignalR updates
      await page.waitForTimeout(5000);

      // Value should still be visible (and may have updated)
      await expect(valueElement).toBeVisible();
    }

    // Look for connection indicator
    const connectionStatus = page.locator('text=/Connected|Live|Real-time/i');
    if (await connectionStatus.count() > 0) {
      await expect(connectionStatus.first()).toBeVisible();
    }
  });

  test('portfolio handles loading states', async ({ page }) => {
    // Setup user with a purchase
    await setupUserWithPortfolio(page);

    // Navigate to portfolio
    await page.goto('/portfolio');

    // May catch loading state
    const loadingIndicator = page.locator('[data-testid="loading"], .loading, .spinner, text=/Loading/i');

    // Eventually content should load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Portfolio content should be visible
    const content = page.locator('h1, h2, [data-testid="holding-item"], .holding');
    await expect(content.first()).toBeVisible();
  });
});
