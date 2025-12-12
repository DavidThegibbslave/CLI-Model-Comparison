# CryptoMarket Frontend

Modern React 18 + TypeScript + Vite application for cryptocurrency portfolio management.

## Tech Stack

- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **State Management**: Zustand + React Context
- **HTTP Client**: Axios
- **Real-time**: SignalR (@microsoft/signalr)
- **Routing**: React Router v6
- **Charts**: Recharts

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Backend API running on `https://localhost:7001`

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

### Demo Credentials

- **Email**: demo@cryptomarket.com
- **Password**: Demo123!

## Project Structure

```
client/
├── src/
│   ├── components/
│   │   ├── layout/         # Header, Footer, Layout
│   │   └── ui/             # Reusable UI components
│   ├── contexts/           # React Context providers
│   ├── pages/              # Route pages
│   ├── services/           # API client
│   ├── styles/             # Design tokens, theme, global CSS
│   ├── types/              # TypeScript types
│   ├── App.tsx             # Main app component
│   └── main.tsx            # Entry point
├── public/                 # Static assets
└── index.html             # HTML template
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint code with ESLint

## Features

- ✅ Authentication (Login/Register/Logout)
- ✅ Dark/Light theme toggle
- ✅ Responsive design (mobile-first)
- ✅ Protected routes
- ✅ Toast notifications
- ✅ Loading states
- ✅ Error handling
- ⏳ Real-time price updates (SignalR - ready to connect)
- ⏳ Market dashboard (API integration needed)
- ⏳ Portfolio management (API integration needed)
- ⏳ Shopping cart (API integration needed)
- ⏳ Price alerts (API integration needed)

## Design System

See `docs/UI-DESIGN.md` for comprehensive design system documentation.

## Environment Variables

Create `.env` file with:

```
VITE_API_BASE_URL=https://localhost:7001
VITE_SIGNALR_HUB_URL=https://localhost:7001/hubs/prices
VITE_APP_ENV=development
```

## Next Steps

1. Connect to backend API endpoints
2. Implement SignalR real-time connection
3. Build out remaining pages (Portfolio, Cart, Alerts, Compare)
4. Add cryptocurrency data visualization charts
5. Implement search and filtering
6. Add pagination for large data sets
7. Optimize performance (code splitting, lazy loading)
8. Write unit tests with Vitest
9. Add E2E tests with Playwright

## License

Educational project - Not for production use
