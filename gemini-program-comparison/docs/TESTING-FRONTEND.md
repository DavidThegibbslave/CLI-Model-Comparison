# Frontend Testing Guide

## Overview
End-to-End (E2E) testing is implemented using **Playwright**. These tests verify critical user flows from the browser perspective, ensuring the React frontend integrates correctly with the ASP.NET Core backend.

## Test Suite
- **Auth Flow** (`auth.spec.ts`):
    - Registration -> Auto-login -> Dashboard.
    - Logout -> Login -> Dashboard.
    - Invalid credentials handling.
- **Feature Flows** (`features.spec.ts`):
    - **Dashboard**: Verifies table rendering and real-time data (Bitcoin presence).
    - **Store**: Full e-commerce flow (Add to Cart -> View Cart -> Checkout -> Success).
    - **Portfolio**: Portfolio creation, and executing a "Buy" order for Bitcoin.

## Running Tests
1. Ensure the Backend API is running on `https://localhost:7200`.
2. Navigate to client directory:
   ```bash
   cd src/client
   ```
3. Run Playwright:
   ```bash
   npx playwright test
   ```
   *Note: The config is set to start the frontend dev server automatically (`npm run dev`) on port 5173.*

## UX & Accessibility Findings
- **Loading States**: Verified loading spinners appear during Auth and Data fetching.
- **Error Handling**: Invalid forms display red error text correctly.
- **Mobile**: Tests configured to run on "Pixel 5" viewport to ensure responsive layout (Sidebar collapses, Tables scroll).

## Known Limitations
- **Real-time Flakiness**: Tests involving SignalR updates have a generous timeout (10s) to account for the 60s polling interval of the mock backend worker.
- **Database State**: Tests create new users (`Date.now()` suffix) to avoid state collision, but backend DB resets might be needed for repeated local runs.
