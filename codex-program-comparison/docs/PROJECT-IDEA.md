# Crypto Market — Project Idea

## Concept
A web app for real-time crypto market analysis: live prices, fast comparisons, and a visual-only store experience to explore purchasing flows without real payments.

## Core Features
- Real-time market dashboard: streaming prices, order book snapshots, trend indicators, and news signals to keep users current.
- Crypto comparisons: side-by-side metrics (price moves, volume, market cap, volatility, dominance, liquidity depth) with customizable time windows.
- Visual-only store: add-to-cart and checkout flows to experiment with pricing UX; BUY clears the cart and never charges.
- Authentication system: email/password + OAuth providers (e.g., Google/GitHub) for saved preferences, watchlists, and alerts.
- Additional feature — Portfolio tracker with price alerts and risk meter: users simulate holdings, get alert rules (price up/down, volume spikes), and a simple risk score; increases stickiness and connects real-time data to personal context.

## Target Users & Use Cases
- Retail traders watching intraday moves and needing rapid comparisons.
- New crypto enthusiasts exploring markets safely via a mock store and simulated portfolio.
- Analysts/students gathering structured snapshots for research or demos.
- Product designers testing commerce flows without payment risk.

## Non-Functional Requirements
- Security: hashed+salted credentials, MFA option, OAuth flows, input validation, rate limiting on auth/data endpoints, secrets isolated from code, HTTPS-only.
- Performance: sub-300ms API p99 for cached reads, WebSocket/SignalR streaming for dashboards, async I/O for API calls, server-side caching of hot symbols, efficient pagination for historical lists.
- UX: responsive layouts for mobile/desktop, accessible charts and controls (WCAG AA intent), fast perceived load with skeleton states, clear error/empty states, and optimistic UI for cart/watch actions.
