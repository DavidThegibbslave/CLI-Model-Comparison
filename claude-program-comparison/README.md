# Crypto Market Web Application

A comprehensive full-stack cryptocurrency market tracking and portfolio management application built with ASP.NET Core and React.

## Overview

**CryptoMarket** is an educational platform for learning about cryptocurrency markets without financial risk. Users can explore real-time market data, compare cryptocurrencies, manage a simulated portfolio, and set price alerts—all without real money involved.

### Key Features

- **Real-Time Market Dashboard** - Live cryptocurrency prices with SignalR WebSocket updates
- **Crypto Comparison Tool** - Side-by-side analysis of multiple cryptocurrencies with overlay charts
- **Portfolio Tracker** - Manage simulated holdings with P&L calculations and performance metrics
- **Shopping Cart & Store** - Educational checkout experience (no real transactions)
- **Price Alerts** - Set target prices with automated monitoring
- **Authentication** - Secure JWT-based user accounts
- **Mobile Responsive** - Optimized for all device sizes

## Tech Stack

### Backend
- **Framework**: ASP.NET Core 8.0 (C#)
- **Database**: SQL Server / LocalDB
- **ORM**: Entity Framework Core 8.0
- **Real-time**: SignalR (WebSockets)
- **Authentication**: JWT Bearer tokens with BCrypt password hashing
- **Validation**: FluentValidation
- **Logging**: Serilog (structured logging)
- **Caching**: IMemoryCache (Redis-ready)
- **Architecture**: Clean Architecture (Domain, Application, Infrastructure, Web layers)

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router DOM v6
- **Styling**: TailwindCSS with custom design system
- **Charts**: Recharts
- **State Management**: Zustand + React Context
- **Real-time**: @microsoft/signalr
- **HTTP Client**: Axios

### External Services
- **Market Data**: CoinGecko API v3

### Testing
- **Backend**: xUnit, Moq, EF Core InMemory (56+ tests)
- **Frontend**: Playwright E2E (46 tests across 5 browsers)
- **Coverage**: 100+ combined tests

## Prerequisites

Before running the application, ensure you have:

- **.NET SDK 8.0+** - [Download](https://dotnet.microsoft.com/download/dotnet/8.0)
- **Node.js 18+** - [Download](https://nodejs.org/)
- **SQL Server** (Express, LocalDB, or full version) - [Download](https://www.microsoft.com/en-us/sql-server/sql-server-downloads)
- **Git** - [Download](https://git-scm.com/)

## ⚡ Quick Start (One Command!)

**Use the master run script - it does EVERYTHING:**

### Windows PowerShell
```powershell
.\run.ps1
```

### Linux/macOS
```bash
./run.sh
```

**That's it!** The script will check prerequisites, initialize on first run, start servers, and open your browser.

**See [START-HERE.md](START-HERE.md) for detailed guide.**

---

## 📖 Manual Setup (Alternative)

If you prefer manual setup or the scripts don't work:

### 1. Clone the Repository

```bash
git clone <repository-url>
cd claude-program-comparison
```

### 2. Backend Setup

#### Configure Database Connection

1. Navigate to backend configuration:
   ```bash
   cd src/CryptoMarket.Web
   ```

2. Update `appsettings.Development.json` with your connection string:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=CryptoMarketDb;Trusted_Connection=true;MultipleActiveResultSets=true"
     }
   }
   ```

#### Run Database Migrations

```bash
# From src/CryptoMarket.Web directory
dotnet ef database update --project ../CryptoMarket.Infrastructure/CryptoMarket.Infrastructure.csproj
```

#### Start the Backend Server

```bash
# From src/CryptoMarket.Web directory
dotnet run
```

The API will be available at:
- HTTPS: `https://localhost:7001`
- HTTP: `http://localhost:5000`

#### Verify Backend is Running

```bash
curl https://localhost:7001/api/crypto/markets
# Should return JSON array of cryptocurrencies
```

### 3. Frontend Setup

#### Install Dependencies

```bash
cd client
npm install
```

#### Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Verify `.env` contains:
   ```env
   VITE_API_BASE_URL=https://localhost:7001
   VITE_SIGNALR_HUB_URL=https://localhost:7001/hubs/prices
   VITE_APP_ENV=development
   ```

#### Start the Frontend Development Server

```bash
npm run dev
```

The application will be available at: `http://localhost:5173`

### 4. Access the Application

1. Open your browser to `http://localhost:5173`
2. Register a new account
3. Explore the dashboard with real-time crypto prices
4. Try comparing cryptocurrencies
5. "Purchase" some crypto from the store
6. View your portfolio with P&L calculations

## Environment Variables

### Backend (appsettings.json / Environment Variables)

```bash
# Database
ConnectionStrings__DefaultConnection="Server=...;Database=...;User=...;Password=..."

# JWT Authentication (IMPORTANT: Change in production!)
JwtSettings__SecretKey="<your-secret-key-min-32-characters>"
JwtSettings__Issuer="https://api.cryptomarket.com"
JwtSettings__Audience="https://cryptomarket.com"
JwtSettings__AccessTokenExpirationMinutes="15"
JwtSettings__RefreshTokenExpirationDays="7"

# CORS (Update with your frontend URL)
Cors__AllowedOrigins__0="http://localhost:5173"

# External API
CoinGecko__BaseUrl="https://api.coingecko.com/api/v3/"
CoinGecko__CacheDurationSeconds="30"

# Rate Limiting
IpRateLimiting__GeneralRules__0__Limit="100"
IpRateLimiting__GeneralRules__0__Period="1m"
```

### Frontend (.env)

```env
# API Base URL (Backend server)
VITE_API_BASE_URL=https://localhost:7001

# SignalR Hub URL (WebSocket endpoint)
VITE_SIGNALR_HUB_URL=https://localhost:7001/hubs/prices

# Application Environment
VITE_APP_ENV=development
```

**Note**: Never commit real API keys or secrets to version control. Use environment variables or secret management tools (Azure Key Vault, AWS Secrets Manager) in production.

## Project Structure

```
claude-program-comparison/
├── src/
│   ├── CryptoMarket.Domain/           # Entities, Enums (no dependencies)
│   ├── CryptoMarket.Application/      # DTOs, Services, Interfaces
│   ├── CryptoMarket.Infrastructure/   # Repositories, EF Core, External APIs
│   └── CryptoMarket.Web/              # Controllers, SignalR Hubs, Middleware
├── tests/
│   └── CryptoMarket.Tests/            # Unit, Integration, Security tests
├── client/
│   ├── src/
│   │   ├── components/                # React components
│   │   ├── contexts/                  # React contexts (Auth, Theme, Toast)
│   │   ├── hooks/                     # Custom hooks (useSignalR)
│   │   ├── pages/                     # Page components
│   │   ├── services/                  # API service layer
│   │   ├── types/                     # TypeScript type definitions
│   │   └── styles/                    # Global CSS and animations
│   ├── e2e/                           # Playwright E2E tests
│   └── public/                        # Static assets
├── docs/                              # Documentation
├── PROGRESS_LOG.md                    # Development history
└── README.md                          # This file
```

## Documentation

### Core Documentation
- **[Architecture](docs/ARCHITECTURE.md)** - System architecture, design patterns, Clean Architecture layers
- **[API Endpoints](docs/API-ENDPOINTS.md)** - Complete API reference with request/response examples
- **[Authentication](docs/AUTH-IMPLEMENTATION.md)** - JWT authentication flow and security measures
- **[UI Design](docs/UI-DESIGN.md)** - Design system, components, theming, accessibility

### Implementation Documentation
- **[Backend Complete](docs/BACKEND-COMPLETE.md)** - Comprehensive backend feature documentation
- **[Frontend Complete](docs/FRONTEND-COMPLETE.md)** - Frontend implementation details and optimizations

### Testing Documentation
- **[Backend Testing](docs/TESTING-BACKEND.md)** - Unit, integration, and security tests (56+ tests)
- **[Frontend Testing](docs/TESTING-FRONTEND.md)** - E2E tests with Playwright (46 tests)

### Additional Resources
- **[Project Idea](docs/PROJECT-IDEA.md)** - Original project concept and requirements
- **[Progress Log](PROGRESS_LOG.md)** - Detailed development history and decisions

## Running Tests

### Backend Tests

```bash
# Run all tests
cd tests/CryptoMarket.Tests
dotnet test

# Run specific test category
dotnet test --filter "FullyQualifiedName~Unit"           # Unit tests
dotnet test --filter "FullyQualifiedName~Integration"   # Integration tests
dotnet test --filter "FullyQualifiedName~Security"      # Security tests

# Run with code coverage
dotnet test --collect:"XPlat Code Coverage"
```

**Test Coverage**: 56+ tests covering authentication, cart management, portfolio calculations, and security vulnerabilities.

### Frontend Tests

```bash
cd client

# Install Playwright browsers (first time only)
npx playwright install --with-deps

# Run all E2E tests (all browsers)
npm run test:e2e

# Run tests in interactive UI mode
npm run test:e2e:ui

# Run tests on specific browser
npm run test:e2e:chromium              # Chromium only
npx playwright test --project=firefox  # Firefox only
npx playwright test --project=webkit   # Safari/WebKit only

# Run specific test file
npx playwright test e2e/auth.spec.ts

# Run in headed mode (see browser)
npx playwright test --headed

# Debug mode (step through tests)
npx playwright test --debug
```

**Test Coverage**: 46 E2E tests covering authentication, dashboard, store/cart, comparison, and portfolio flows.

## Deployment

### Backend Deployment

#### Pre-Deployment Checklist

- [ ] Set `ASPNETCORE_ENVIRONMENT=Production`
- [ ] Use Azure Key Vault or similar for secrets
- [ ] Generate strong JWT secret key (min 32 random characters)
- [ ] Configure production database connection string
- [ ] Update CORS allowed origins with production URLs
- [ ] Enable HTTPS (disable HTTP)
- [ ] Configure distributed caching (Redis)
- [ ] Set up Application Insights or similar monitoring
- [ ] Configure database backups
- [ ] Run database migrations on production database
- [ ] Test all API endpoints
- [ ] Review and adjust rate limits

#### Deployment Options

**Azure App Service** (Recommended for ASP.NET Core):
```bash
# Publish the application
dotnet publish -c Release -o ./publish

# Deploy to Azure (using Azure CLI)
az webapp up --name <app-name> --resource-group <resource-group>
```

**Docker**:
```dockerfile
# Add Dockerfile to src/CryptoMarket.Web
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY . .
RUN dotnet restore
RUN dotnet build -c Release -o /app/build

FROM build AS publish
RUN dotnet publish -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "CryptoMarket.Web.dll"]
```

### Frontend Deployment

#### Build for Production

```bash
cd client
npm run build
```

The `dist/` folder will contain optimized production assets.

#### Deployment Options

**Vercel** (Recommended):
```bash
npm install -g vercel
vercel --prod
```

**Netlify**:
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

**Azure Static Web Apps**:
```bash
# Using Azure CLI
az staticwebapp create \
  --name <app-name> \
  --resource-group <resource-group> \
  --source ./dist
```

#### Update Environment Variables for Production

Ensure frontend `.env` points to production backend:
```env
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_SIGNALR_HUB_URL=https://api.yourdomain.com/hubs/prices
VITE_APP_ENV=production
```

## Security

### Implemented Security Measures

- ✅ **Authentication**: JWT Bearer tokens with refresh token rotation
- ✅ **Password Security**: BCrypt hashing (work factor: 11)
- ✅ **Input Validation**: FluentValidation on all DTOs
- ✅ **SQL Injection Prevention**: Parameterized queries via EF Core
- ✅ **XSS Protection**: Content Security Policy headers
- ✅ **CSRF Protection**: SameSite cookies, token validation
- ✅ **CORS Policy**: Configured allowed origins
- ✅ **Rate Limiting**: IP-based rate limiting (100 req/min)
- ✅ **HTTPS**: Enforced in production
- ✅ **Security Headers**: X-Content-Type-Options, X-Frame-Options, etc.

### OWASP Top 10 Compliance

The application implements mitigations for all OWASP Top 10 2021 vulnerabilities. See [Backend Complete](docs/BACKEND-COMPLETE.md) for details.

### Security Best Practices for Production

1. **Never hardcode secrets** - Use environment variables or Key Vault
2. **Use strong JWT secret keys** - Minimum 32 random characters
3. **Enable HTTPS only** - Redirect HTTP to HTTPS
4. **Keep dependencies updated** - Regularly update NuGet/npm packages
5. **Monitor logs** - Set up centralized logging and alerting
6. **Regular backups** - Automated database backups
7. **Security scans** - Run OWASP ZAP or similar tools

## Known Limitations

1. **No Real Payment Processing** - This is an educational app; checkout is simulated
2. **No Email Notifications** - Price alerts log to console (integration ready)
3. **No Sell Functionality** - Users can only buy cryptocurrencies
4. **In-Memory Caching** - Not suitable for multi-server deployment (migrate to Redis for production)
5. **CoinGecko Rate Limits** - Free tier: 10-50 requests/minute
6. **No PWA Support** - No offline mode or service workers

## Future Enhancements

### High Priority
- [ ] Distributed caching with Redis
- [ ] Email/SMS notifications for price alerts
- [ ] Sell functionality for portfolio holdings
- [ ] API versioning (`/api/v1/`)
- [ ] Health check endpoints
- [ ] Comprehensive logging aggregation

### Medium Priority
- [ ] Advanced portfolio analytics (Sharpe ratio, volatility)
- [ ] Advanced crypto search and filters
- [ ] User preferences (theme, currency, notifications)
- [ ] Data export (CSV/PDF portfolio reports)
- [ ] Social features (following users, shared portfolios)

### Low Priority
- [ ] Crypto news API integration
- [ ] Advanced charting (candlestick, technical indicators)
- [ ] Webhooks for external integrations
- [ ] Multiple fiat currency support
- [ ] PWA with offline mode

## Troubleshooting

### Backend Issues

**Issue**: "Unable to connect to database"
```bash
# Solution: Verify SQL Server is running
# Verify connection string in appsettings.Development.json
# Run migrations: dotnet ef database update
```

**Issue**: "CoinGecko API rate limit exceeded"
```bash
# Solution: Increase cache duration in appsettings.json
# Or wait for rate limit to reset (1 minute)
```

**Issue**: "SignalR connection failed"
```bash
# Solution: Ensure backend is running on correct port (7001)
# Check CORS settings allow frontend origin
# Verify SignalR hub is registered in Program.cs
```

### Frontend Issues

**Issue**: "Network Error" or "Failed to fetch"
```bash
# Solution: Verify backend is running (https://localhost:7001)
# Check .env file has correct VITE_API_BASE_URL
# Verify CORS allows http://localhost:5173
```

**Issue**: "Real-time updates not working"
```bash
# Solution: Check browser console for SignalR errors
# Verify VITE_SIGNALR_HUB_URL in .env
# Ensure PriceUpdateJob is running on backend
```

**Issue**: "E2E tests fail"
```bash
# Solution: Install Playwright browsers: npx playwright install --with-deps
# Ensure backend is running before tests
# On WSL, may need: sudo npx playwright install-deps
```

## Contributing

This is an educational project demonstrating full-stack development best practices. Contributions are welcome!

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`dotnet test` and `npm run test:e2e`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Style

- **Backend**: Follow C# coding conventions, SOLID principles
- **Frontend**: Use ESLint rules, TypeScript strict mode
- **Comments**: Write clear, concise comments for complex logic
- **Tests**: Write tests for new features

## License

This project is for educational purposes. No real financial transactions occur.

## Acknowledgments

- **CoinGecko** - Cryptocurrency market data API
- **ASP.NET Core Team** - Excellent framework and documentation
- **React Team** - Amazing frontend library
- **TailwindCSS** - Utility-first CSS framework
- **Claude (Anthropic)** - AI assistant for development

## Support

For issues, questions, or suggestions:
- Review the [Documentation](docs/)
- Check [Progress Log](PROGRESS_LOG.md) for implementation details
- Open an issue on GitHub (if public repository)

---

**Version**: 1.0.0
**Status**: Production Ready
**Last Updated**: December 4, 2025
**Built with**: ASP.NET Core 8.0 + React 18 + TypeScript
