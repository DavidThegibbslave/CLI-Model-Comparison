# Architecture

## High-Level System Diagram (text)
```
[Web Client (React SPA)]
        | HTTPS (REST) + SignalR streaming
        v
[ASP.NET Core MVC]
  - Controllers -> Services -> Repositories
  - Auth (Identity + OAuth) -> JWT issuance
  - Background workers -> market polling/cache refresh
        |
        v
[PostgreSQL + Redis cache]
        ^
        |
[External Crypto API: Binance REST/WebSocket]
```

## Project Structure
```
CryptoMarket/
├── docs/
├── backend/
│   ├── src/
│   │   ├── CryptoMarket.Web/                    # Presentation Layer
│   │   │   ├── Controllers/
│   │   │   ├── Hubs/
│   │   │   ├── Middleware/
│   │   │   └── Filters/
│   │   ├── CryptoMarket.Application/            # Business Logic Layer
│   │   │   ├── Services/
│   │   │   ├── DTOs/
│   │   │   │   ├── Auth/
│   │   │   │   ├── Crypto/
│   │   │   │   ├── Store/
│   │   │   │   └── Common/
│   │   │   ├── Interfaces/
│   │   │   ├── Validators/
│   │   │   └── Mappings/
│   │   ├── CryptoMarket.Domain/                 # Domain Layer
│   │   │   ├── Entities/
│   │   │   ├── Enums/
│   │   │   └── Interfaces/
│   │   └── CryptoMarket.Infrastructure/         # Infrastructure Layer
│   │       ├── Data/
│   │       │   ├── Configurations/
│   │       │   ├── Migrations/
│   │       │   └── Seeders/
│   │       ├── Repositories/
│   │       ├── ExternalApis/
│   │       ├── Caching/
│   │       └── BackgroundServices/
│   └── tests/
│       ├── CryptoMarket.UnitTests/
│       └── CryptoMarket.IntegrationTests/
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── ui/
    │   │   ├── layout/
    │   │   ├── crypto/
    │   │   ├── store/
    │   │   └── auth/
    │   ├── pages/
    │   ├── services/
    │   ├── hooks/
    │   ├── store/
    │   ├── styles/
    │   │   ├── tokens/
    │   │   └── theme/
    │   ├── types/
    │   └── utils/
    └── tests/
        ├── e2e/
        └── components/
```

### Layer Responsibilities
| Layer | Responsibility |
|-------|----------------|
| **Web** | HTTP handling, request/response, middleware, SignalR hubs |
| **Application** | Business logic, DTOs, validation, service interfaces |
| **Domain** | Entities, enums, domain interfaces (no dependencies) |
| **Infrastructure** | Database, external APIs, caching, background jobs |

## Technology Stack (initial versions)
- Backend: .NET 8, ASP.NET Core MVC, SignalR.
  - NuGet: `Microsoft.AspNetCore.Authentication.JwtBearer` (8.x), `Microsoft.EntityFrameworkCore` (8.x), `Microsoft.EntityFrameworkCore.Design` (8.x), `Microsoft.EntityFrameworkCore.PostgreSQL` (8.x), `StackExchange.Redis` (2.7+), `Serilog.AspNetCore` (8.x), `FluentValidation` (11.x), `AutoMapper.Extensions.Microsoft.DependencyInjection` (12.x).
- Frontend: React 18 + Vite, TypeScript 5.
  - npm: `react`, `react-dom`, `@reduxjs/toolkit`, `react-redux`, `axios`, `@microsoft/signalr`, `react-hook-form`, `zod`, `recharts` (or `visx`), `tailwindcss` (or CSS vars-based theming), `vitest`/`playwright` for tests.
- Authentication: JWT bearer (short-lived access tokens) + ASP.NET Identity, optional OAuth (Google/GitHub). Refresh tokens persisted in DB.
- Caching: Redis for hot market symbols, order books, and rate-limit buffers; in-memory cache fallback for local dev.

## Data Models (domain)
- User (Id, Email, PasswordHash, MFAEnabled, CreatedAt, LastLoginAt, Preferences JSONB)
- Role (Id, Name) — many-to-many UserRoles
- CryptoAsset (Id, Symbol, Name, Source, Status)
- MarketSnapshot (Id, CryptoAssetId, Price, Volume24h, MarketCap, ChangePct24h, LiquidityScore, CapturedAt)
- PriceHistory (Id, CryptoAssetId, Interval, Open, High, Low, Close, Volume, CapturedAt)
- Product (Id, Name, Description, ImageUrl, PriceUsd, AssetSymbolRef, Available)
- Cart (Id, UserId nullable for guest/session, CreatedAt, Status)
- CartItem (Id, CartId, ProductId, Quantity, UnitPrice)
- Portfolio (Id, UserId, Name, RiskTolerance)
- PortfolioPosition (Id, PortfolioId, CryptoAssetId, Quantity, AvgPrice)
- AlertRule (Id, UserId, CryptoAssetId, ConditionType [price_up/down, volume_spike], ThresholdValue, Direction, Channel [email/push], IsActive)
- RefreshToken (Id, UserId, TokenHash, ExpiresAt, RevokedAt, ReplacedByTokenHash)

Relationships: User-Role (many-to-many), User-Cart (one-to-many), Cart-CartItem (one-to-many), Product-CartItem (many-to-one), User-Portfolio (one-to-many), Portfolio-PortfolioPosition (one-to-many), CryptoAsset-PriceHistory/MarketSnapshot/PortfolioPosition/AlertRule (one-to-many).

## Data Flow Diagrams (text)
- Auth flow: Client -> `/api/auth/register|login` -> Web controllers -> Application auth service -> Identity/DB -> issue JWT + refresh -> client stores token -> subsequent requests via `Authorization: Bearer`.
- Real-time price updates: Background service polls Binance REST, caches to Redis + DB snapshots -> SignalR hub broadcasts to subscribed clients -> client updates dashboard/comparison views.
- Store checkout flow (visual-only): Client cart actions -> `/api/store/cart` -> Application store service -> DB/Redis -> checkout endpoint clears cart and returns confirmation (no payment provider).

## MCP Tool Usage Plan
- Context7: pull quick references for ASP.NET Identity, SignalR, React charting/state when needed.
- DeepWiki: targeted repo research on ASP.NET Core patterns, EF Core, JWT/security to guide implementation choices.
- Playwright: automated E2E/regression for dashboard, comparisons, auth, and cart flows.

## Research Notes (DeepWiki)
- ASP.NET Core MVC commonly layers controllers -> services -> data access via DI with scoped/transient lifetimes to keep business logic testable.
- Binance Spot API offers public REST/WebSocket market data without auth, with IP-based rate limits (e.g., REQUEST_WEIGHT 6000/min) and ticker/book endpoints suited for dashboards; WebSockets cap at 5 inbound msgs/sec and 24h connections.
- EF Core: register DbContext in Program with `AddDbContext` (or pooling), store connection strings in config/env, use migrations (dev middleware `UseMigrationsEndPoint`), DI into services/controllers.
- JWT: issue tokens with claims + exp using `JwtSecurityTokenHandler`, validate via `AddJwtBearer` with `TokenValidationParameters` (signature + lifetime), handle `OnMessageReceived` for SignalR query tokens; refresh flow handled separately with short-lived access + refresh tokens.
- Security middleware: enforce `UseHttpsRedirection` + `UseHsts`, add CORS policies, and enable ASP.NET Core rate limiting; apply security headers and optional `[RequireHttps]` attributes where needed.
