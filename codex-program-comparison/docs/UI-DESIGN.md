# UI Design

## Design Direction
- Intentional, high-contrast look with gradients and clear hierarchy; typography uses Space Grotesk for a modern, technical tone.
- Layout shell: sticky header with theme toggle + auth CTAs, responsive sidebar for navigation/status, page container with metric-friendly grid.
- Additional feature route = `/portfolio` (portfolio + alerts), highlighted in nav and hero copy.

## Design Tokens (source: `frontend/src/styles/tokens/*`)
- Colors: primary blue (`colors.primary`), secondary amber, success green, danger red, neutral grays. CSS variables live in `styles/global.css` and switch by `data-theme`.
- Typography: font family Space Grotesk; size scale xs→2xl; weights regular→bold; line heights tight/normal/relaxed.
- Spacing: 4px base scale (`spacing.xxs`..`xxxl`), used for gaps/margins via CSS variables `--space-1..8`.
- Shape/Shadows: radii sm/md/lg/pill; shadows sm/md/lg for cards, modals, and floating nav.
- Themes: light/dark definitions in `styles/theme/index.ts`; `ThemeProvider` persists choice in `localStorage` and updates `data-theme`.

## Components
- UI kit: Button (primary/secondary/ghost, loading), Input (hint/error), Card, Modal (with actions), Spinner, Toast (auto-dismiss).
- Layout: Header, Sidebar (mobile slide-in), Footer, `LayoutShell` wrapper; hero + metric grid patterns available in CSS (`ui.css`).

## Routing
- `/` dashboard, `/compare`, `/store`, `/cart`, `/login`, `/register`, `/portfolio` (additional feature), catch-all 404.

## API Client
- Axios wrapper at `src/services/apiClient.ts` with base URL from `VITE_API_BASE_URL`; attaches bearer token from `localStorage` (`auth.ts`) and clears tokens on 401.
- Ready for integration with auth/crypto/store endpoints; error surfaces the server message when present.

## Next Steps
- Wire API data (crypto lists/top/compare, cart/portfolio/alerts) + SignalR for live updates.
- Add state layer (Redux Toolkit or React Query) and form validation (zod/react-hook-form) once endpoints are reachable.
- Extend component library (tabs, table, charts) and add tests (component + Playwright smoke).
