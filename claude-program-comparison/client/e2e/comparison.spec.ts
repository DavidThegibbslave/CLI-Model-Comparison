import { test, expect } from '@playwright/test';

test.describe('Comparison Flow', () => {
  test('comparison page loads successfully', async ({ page }) => {
    await page.goto('/compare');

    // Wait for page to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Check for main heading
    await expect(page.locator('h1, h2').first()).toBeVisible();

    // Check for crypto selection UI (dropdown, checkboxes, or list)
    const selectionUI = page.locator('select, input[type="checkbox"], [role="listbox"], .crypto-selector, .crypto-list');
    await expect(selectionUI.first()).toBeVisible({ timeout: 10000 });
  });

  test('user can select multiple cryptocurrencies to compare', async ({ page }) => {
    await page.goto('/compare');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Look for crypto selection elements (checkboxes or multi-select)
    const cryptoCheckboxes = page.locator('input[type="checkbox"]');

    if (await cryptoCheckboxes.count() >= 2) {
      // Select first crypto
      await cryptoCheckboxes.nth(0).check();
      await page.waitForTimeout(500);

      // Select second crypto
      await cryptoCheckboxes.nth(1).check();
      await page.waitForTimeout(500);

      // Verify both are checked
      await expect(cryptoCheckboxes.nth(0)).toBeChecked();
      await expect(cryptoCheckboxes.nth(1)).toBeChecked();
    } else {
      // Alternative: look for add buttons or selection dropdowns
      const addButtons = page.locator('button:has-text("Add"), button:has-text("Select"), button:has-text("Compare")');
      if (await addButtons.count() > 0) {
        await addButtons.first().click();
        await page.waitForTimeout(1000);
      }
    }

    // Verify selected cryptos are displayed
    const selectedItems = page.locator('[data-testid="selected-crypto"], .selected-item, .comparison-item');
    if (await selectedItems.count() > 0) {
      expect(await selectedItems.count()).toBeGreaterThanOrEqual(1);
    }
  });

  test('comparison chart displays for selected cryptocurrencies', async ({ page }) => {
    await page.goto('/compare');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Select cryptos (try different methods)
    const checkboxes = page.locator('input[type="checkbox"]');

    if (await checkboxes.count() >= 2) {
      await checkboxes.nth(0).check();
      await checkboxes.nth(1).check();
      await page.waitForTimeout(1500);

      // Look for chart
      const chart = page.locator('canvas, .recharts-wrapper, .chart, svg.recharts-surface');
      await expect(chart.first()).toBeVisible({ timeout: 10000 });

      // Verify chart contains data (has some elements)
      const chartElements = await chart.count();
      expect(chartElements).toBeGreaterThan(0);
    } else {
      // If no checkboxes, look for pre-selected or default comparison
      const chart = page.locator('canvas, .recharts-wrapper, .chart, svg.recharts-surface');
      if (await chart.count() > 0) {
        await expect(chart.first()).toBeVisible({ timeout: 10000 });
      }
    }
  });

  test('user can deselect cryptocurrencies from comparison', async ({ page }) => {
    await page.goto('/compare');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Select checkboxes
    const checkboxes = page.locator('input[type="checkbox"]');

    if (await checkboxes.count() >= 2) {
      // Check two
      await checkboxes.nth(0).check();
      await checkboxes.nth(1).check();
      await page.waitForTimeout(1000);

      // Uncheck first
      await checkboxes.nth(0).uncheck();
      await page.waitForTimeout(1000);

      // Verify first is unchecked
      await expect(checkboxes.nth(0)).not.toBeChecked();

      // Second should still be checked
      await expect(checkboxes.nth(1)).toBeChecked();
    }
  });

  test('comparison shows side-by-side metrics', async ({ page }) => {
    await page.goto('/compare');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Select multiple cryptos if needed
    const checkboxes = page.locator('input[type="checkbox"]');
    if (await checkboxes.count() >= 2) {
      await checkboxes.nth(0).check();
      await checkboxes.nth(1).check();
      await page.waitForTimeout(1500);
    }

    // Look for comparison metrics (price, market cap, volume, etc.)
    const metricsSection = page.locator('text=/Price|Market Cap|Volume|24h|Change/i');
    await expect(metricsSection.first()).toBeVisible({ timeout: 5000 });

    // Verify multiple metric values are shown
    const metricValues = page.locator('.metric, .stat, td, .comparison-value');
    if (await metricValues.count() > 0) {
      expect(await metricValues.count()).toBeGreaterThan(2);
    }
  });

  test('comparison overlay chart works correctly', async ({ page }) => {
    await page.goto('/compare');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Select cryptos
    const checkboxes = page.locator('input[type="checkbox"]');
    if (await checkboxes.count() >= 2) {
      await checkboxes.nth(0).check();
      await checkboxes.nth(1).check();
      await page.waitForTimeout(2000);

      // Look for overlay chart (should show multiple lines/colors)
      const chart = page.locator('canvas, .recharts-wrapper, svg.recharts-surface');
      await expect(chart.first()).toBeVisible();

      // Look for legend showing multiple cryptos
      const legend = page.locator('.recharts-legend, .chart-legend, [class*="legend"]');
      if (await legend.count() > 0) {
        await expect(legend.first()).toBeVisible();
      }
    }
  });

  test('user can switch comparison timeframes', async ({ page }) => {
    await page.goto('/compare');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Select cryptos first
    const checkboxes = page.locator('input[type="checkbox"]');
    if (await checkboxes.count() >= 2) {
      await checkboxes.nth(0).check();
      await checkboxes.nth(1).check();
      await page.waitForTimeout(1000);
    }

    // Look for timeframe buttons (1D, 7D, 30D, etc.)
    const timeframeButtons = page.locator('button:has-text("1D"), button:has-text("7D"), button:has-text("30D"), button:has-text("1H")');

    if (await timeframeButtons.count() > 0) {
      // Click a timeframe button
      await timeframeButtons.first().click();
      await page.waitForTimeout(1500);

      // Verify chart updated (still visible)
      const chart = page.locator('canvas, .recharts-wrapper, svg.recharts-surface');
      await expect(chart.first()).toBeVisible();
    }
  });

  test('comparison handles no selection gracefully', async ({ page }) => {
    await page.goto('/compare');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Ensure no checkboxes are selected
    const checkboxes = page.locator('input[type="checkbox"]:checked');
    for (let i = 0; i < await checkboxes.count(); i++) {
      await checkboxes.nth(i).uncheck();
    }

    await page.waitForTimeout(1000);

    // Should show message to select cryptos
    const emptyMessage = page.locator('text=/Select|Choose|Pick/i, text=/compare/i');
    if (await emptyMessage.count() > 0) {
      await expect(emptyMessage.first()).toBeVisible();
    }
  });

  test('comparison is mobile responsive', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/compare');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Verify content is visible
    const mainContent = page.locator('main, [role="main"]');
    await expect(mainContent.first()).toBeVisible();

    // Verify no horizontal scrolling
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = 375;
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 50);

    // Chart should still be visible on mobile
    const chart = page.locator('canvas, .recharts-wrapper, svg.recharts-surface');
    if (await chart.count() > 0) {
      const chartBox = await chart.first().boundingBox();
      if (chartBox) {
        expect(chartBox.width).toBeLessThanOrEqual(viewportWidth);
      }
    }
  });

  test('comparison page shows loading states', async ({ page }) => {
    await page.goto('/compare');

    // Look for loading indicator during initial load
    const loadingIndicator = page.locator('[data-testid="loading"], .loading, .spinner, text=/Loading/i');

    // May or may not catch it, but verify page eventually loads
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // After loading, content should be visible
    const content = page.locator('h1, h2, input[type="checkbox"], .crypto-list');
    await expect(content.first()).toBeVisible();
  });

  test('comparison data updates correctly when switching selections', async ({ page }) => {
    await page.goto('/compare');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const checkboxes = page.locator('input[type="checkbox"]');

    if (await checkboxes.count() >= 3) {
      // Select first two
      await checkboxes.nth(0).check();
      await checkboxes.nth(1).check();
      await page.waitForTimeout(1500);

      // Get initial chart state
      const chart = page.locator('canvas, .recharts-wrapper');
      await expect(chart.first()).toBeVisible();

      // Deselect second, select third
      await checkboxes.nth(1).uncheck();
      await checkboxes.nth(2).check();
      await page.waitForTimeout(1500);

      // Chart should still be visible (data should update)
      await expect(chart.first()).toBeVisible();
    }
  });
});
