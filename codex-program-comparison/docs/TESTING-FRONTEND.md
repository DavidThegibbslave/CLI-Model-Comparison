# Frontend Testing Plan

> Note: Playwright/Jest/Vitest are not installed here, and the backend is offline. The steps below describe how to set up and run tests once you can install dependencies and serve the app.

## Recommended Stack
- E2E: Playwright (`@playwright/test`) with dev server `npm run dev -- --host --port 4173`
- Component/Unit (optional): Vitest + @testing-library/react for UI components/forms/state helpers

## E2E Coverage (Playwright)
- **Auth flow** (requires backend): register → login → redirect to dashboard; invalid creds → error.
- **Dashboard**: loads cards/table; history modal opens; connection badge shows state; no console errors.
- **Store/Cart**: add products, adjust quantities, checkout clears cart and shows success.
- **Compare**: add/remove assets (max 4), table + overlay chart update.
- **Portfolio/Alerts**: add position, remove position, create/delete alert (backend required).
- **Mobile**: viewport 390x844 – nav, cards, tables responsive.
- **Error/empty states**: simulate API failure (set `VITE_API_BASE_URL` to unreachable) → fallbacks render without crashes.

### Suggested Playwright Config (pseudo)
```ts
import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  webServer: {
    command: 'npm run dev -- --host --port 4173',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
  },
  use: { baseURL: 'http://localhost:4173', trace: 'on-first-retry' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
});
```

### Example Tests (outline)
```ts
test('dashboard loads', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Market Pulse')).toBeVisible();
  await expect(page.getByText('Market overview')).toBeVisible();
});

test('store add and checkout', async ({ page }) => {
  await page.goto('/store');
  await page.getByRole('button', { name: /add to cart/i }).first().click();
  await page.goto('/cart');
  await page.getByRole('button', { name: /checkout/i }).click();
  await expect(page.getByText(/thank you/i)).toBeVisible();
});
```

## Component/Unit Ideas (Vitest)
- Button/Input/Card render states (hover/disabled/focus via snapshots or DOM assertions).
- Auth forms: validation errors for bad email/password; remember-me toggles payload.
- CartContext: add/update/remove/checkout reducers with sample products.
- Compare page helpers: enforcing max 4 assets and reset behavior.

## How to Run (once installed)
```
npm install
npx playwright install
npx playwright test
# Optional: npm run test:unit (after adding Vitest config)
```

## UX Checks
- Verify skeletons appear during loading, error banners on failures, and responsive layout on <=768px.
- Ensure focus-visible outlines are present and contrast meets WCAG AA.
- Watch console/network for errors while running flows.

## Known Blockers
- Backend/API offline here → auth-protected flows (cart/portfolio) require a running backend or test doubles.
- Playwright/Vitest not installed; no tests executed in this environment. Install deps and run the commands above when ready.
