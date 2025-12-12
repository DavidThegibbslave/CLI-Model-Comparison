# Crypto Market Web Application

## Overview
A comprehensive real-time cryptocurrency dashboard that combines market analysis with a risk-free simulated trading environment. Users can monitor live prices, compare assets, browse a visual merchandise store, and practice trading strategies using a virtual portfolio with $10,000 starting cash.

## Features
- **Real-Time Market Dashboard**: Live price updates, 24h change, and volume data for top cryptocurrencies powered by SignalR.
- **Simulated Portfolio Tracker**: Manage a virtual portfolio, execute buy/sell orders, and track real-time Profit & Loss (P&L).
- **Crypto Comparisons**: Side-by-side comparison of asset performance over the last 7 days.
- **Visual Store**: A merchandise store with cart management and a simulated checkout flow.
- **Authentication**: Secure User Registration and Login with JWT access and refresh tokens.

## Tech Stack
- **Backend**: ASP.NET Core 8 Web API
  - **Database**: PostgreSQL with Entity Framework Core
  - **Real-time**: SignalR
  - **Auth**: JWT Bearer Authentication
- **Frontend**: React 18 + TypeScript (Vite)
  - **Styling**: Tailwind CSS
  - **State Management**: Context API + React Query
  - **Charts**: Recharts
- **Testing**: 
  - Backend: xUnit, Moq, FluentAssertions
  - Frontend: Playwright (E2E)

## Prerequisites
- [.NET 8.0 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/download/) (running on default port 5432)

## Quick Start

### Backend
1.  Navigate to the web project:
    ```bash
    cd src/CryptoMarket.Web
    ```
2.  Ensure PostgreSQL is running. Update `appsettings.json` connection string if necessary.
3.  Apply database migrations:
    ```bash
    dotnet ef database update
    ```
4.  Run the API:
    ```bash
    dotnet run
    ```
    The API will start at `https://localhost:7200`.

### Frontend
1.  Navigate to the client project:
    ```bash
    cd src/client
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
    The app will be available at `http://localhost:5173`.

## Environment Variables

### Backend (`appsettings.json`)
- `ConnectionStrings:DefaultConnection`: PostgreSQL connection string.
- `Jwt:Key`: Secret key for signing tokens (min 16 chars).
- `Jwt:Issuer`: Token issuer (e.g., `CryptoMarketApi`).
- `Jwt:Audience`: Token audience (e.g., `CryptoMarketClient`).
- `CoinGecko:BaseUrl`: External API URL (default: `https://api.coingecko.com/api/v3`).

## Documentation
- [Architecture](docs/ARCHITECTURE.md) - System design and technology choices.
- [API Endpoints](docs/API-ENDPOINTS.md) - detailed API specification.
- [Backend Status](docs/BACKEND-COMPLETE.md) - Implementation details and security audit.
- [Frontend Status](docs/FRONTEND-COMPLETE.md) - UI features and components.
- [UI Design](docs/UI-DESIGN.md) - Design system tokens and components.
- [Backend Testing](docs/TESTING-BACKEND.md) - Unit and Integration testing guide.
- [Frontend Testing](docs/TESTING-FRONTEND.md) - End-to-End testing guide with Playwright.

## Deployment
- **Backend**: Publish as a self-contained executable or Docker container. Requires a PostgreSQL instance and a Reverse Proxy (Nginx/IIS) for production.
- **Frontend**: Build using `npm run build` and serve the `dist` folder via a static file server (e.g., Nginx, Netlify, Vercel).
