# Crypto Market Web Application

## Overview
Real-time crypto market experience with live dashboard, side-by-side comparisons, a visual-only store/checkout, authentication, and a portfolio + alerts feature. Frontend uses demo fallbacks when the backend or API is unavailable so the UI remains usable offline.

## Features
- Real-time market dashboard with streaming updates and sparklines
- Crypto comparisons (metrics + history overlay)
- Demo store (visual only) with cart/checkout flow (no payments)
- Authentication with JWT + refresh
- Portfolio tracker with alerts (additional feature)

## Tech Stack
- Backend: ASP.NET Core MVC, PostgreSQL (planned), SignalR, IMemoryCache, Serilog
- Frontend: React + Vite + TypeScript, Recharts, Axios, @microsoft/signalr
- Testing: xUnit (backend plan), Playwright (frontend plan)

## Prerequisites
- .NET SDK 8.0+
- Node.js 18+
- PostgreSQL 14+ (or use in-memory for demo)
- Crypto API key for CoinGecko (or keep free/public endpoints)

## Quick Start
### Backend
```bash
cd backend
dotnet restore
# update appsettings.Development.json or env vars for DB/JWT/Crypto API
dotnet build
dotnet run
```
> If DB not available, switch to InMemory provider in appsettings for local demo.

### Frontend
```bash
cd frontend
npm install
npm run dev
# or npm run build && npm run preview
```

### One-shot helper
```bash
chmod +x start.sh
./start.sh       # starts backend (if dotnet present) + frontend; uses fallback data if backend skipped
# SKIP_BACKEND=1 ./start.sh          # skip backend entirely
# BACKEND_NO_RESTORE=1 ./start.sh    # skip restore if packages are already restored
# FRONTEND_PORT=4300 ./start.sh      # change frontend port
```

## Environment Variables
- `ASPNETCORE_ENVIRONMENT`: e.g., Development
- `ConnectionStrings__Default`: PostgreSQL connection string
- `Jwt__Key`: signing key for JWTs
- `Jwt__Issuer` / `Jwt__Audience`: token metadata
- `CryptoApi__BaseUrl`: e.g., https://api.coingecko.com/api/v3
- `CryptoApi__ApiKey`: API key if required
- `CryptoApi__PollingIntervalSeconds`: background polling interval
- `Redis__ConnectionString`: optional for cache/backplane
- `RateLimiting__General`: request limit configuration
- `AllowedHosts`: host filter
- Frontend: `VITE_API_BASE_URL` (points to backend, defaults to http://localhost:5000)

## Documentation
- [Architecture](docs/ARCHITECTURE.md)
- [API Endpoints](docs/API-ENDPOINTS.md)
- [UI Design](docs/UI-DESIGN.md)
- [Frontend Complete](docs/FRONTEND-COMPLETE.md)
- [Testing - Backend](docs/TESTING-BACKEND.md)
- [Testing - Frontend](docs/TESTING-FRONTEND.md)
- [Project Idea](docs/PROJECT-IDEA.md)
- [Backend Setup](docs/BACKEND-SETUP.md)
- [Backend Complete Summary](docs/BACKEND-COMPLETE.md)
- [Frontend Progress](docs/FRONTEND-PROGRESS.md)

## Deployment
- Backend: publish ASP.NET Core (e.g., `dotnet publish -c Release`) and deploy behind HTTPS with environment-specific appsettings. Use PostgreSQL/Redis for persistence/SignalR scale-out and set strong JWT key.
- Frontend: `npm run build` and serve `frontend/dist` via static hosting or CDN; configure `VITE_API_BASE_URL` to point at the deployed backend.
