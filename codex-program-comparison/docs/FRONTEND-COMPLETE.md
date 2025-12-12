# Frontend Complete

## Pages & Flows
- Dashboard: live market stats, searchable/sortable/paginated table with sparklines, detail modal w/ history chart, SignalR feed with polling fallback and flash updates.
- Compare: multi-select (max 4) assets, side-by-side metrics table, 7d overlay line chart, add/remove chips, reset shortcut.
- Store: responsive product grid (search + category filters), product detail modal with quantity, add-to-cart animation/feedback.
- Cart: quantity adjust/remove, refresh, checkout clears cart with success modal; powered by CartContext (API-first, local fallback).
- Auth: login/register with validation, remember-me refresh tokens, protected routes, user menu, error/loading states.
- Portfolio & Alerts (additional feature): portfolio switching, positions list with PnL, add/update positions, create/delete alerts, new-portfolio modal; API-first with local cached fallback.

## Components & System
- UI kit: Button, Input, Card, Modal, Spinner, Toast, Skeleton; layout Header/Sidebar/Footer; charts (Sparkline, History).
- State providers: AuthContext (tokens + refresh), CartContext (cart sync), ThemeProvider (light/dark).
- Services: API client with refresh retry, crypto/market services, store/cart services, portfolio/alert services with sample data fallback.
- Design tokens/themes: colors, spacing, radii, shadows, typography in `frontend/src/styles/tokens/*`; light/dark CSS variables in `global.css`.

## Accessibility & UX
- Focus-visible outlines on controls, semantic form labels, aria modal structure, keyboardable menus, WCAG-friendly contrast.
- Loading skeletons instead of spinners for data fetches; error + retry states; hover/active micro-interactions; page fade-in.

## Performance
- Route-level code splitting with React.lazy/Suspense; axios timeouts; short TTL caching in services; image sizes constrained.
- Bundle warnings only for vendor chunks (SignalR/Recharts) — acceptable for current scope; further tuning via manualChunks if needed.

## Known Issues / Follow-ups
- Backend (.NET + SignalR) not running here; data flows use API calls first then fallback seeds/local storage. Validate against live API when available.
- Token storage is in-memory + refresh tokens in storage; ensure secure cookie usage when backend enables it.
- Additional testing (unit/E2E) pending once backend endpoints are reachable; Playwright smoke can be added when app is served.
