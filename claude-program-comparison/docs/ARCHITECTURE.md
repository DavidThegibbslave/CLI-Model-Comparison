# Crypto Market Web Application - Architecture

## High-Level System Diagram (Text-Based)

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  React Frontend (SPA)                                            │
│  ├── Dashboard Component (Real-time updates)                    │
│  ├── Comparison Tool                                             │
│  ├── Store & Cart                                                │
│  ├── Portfolio Tracker                                           │
│  └── Authentication UI                                           │
│                                                                   │
│  State Management: Redux/Context API                             │
│  Real-time: SignalR Client / Polling                            │
│  HTTP Client: Axios                                              │
└────────────────────┬─────────────────────────────────────────────┘
                     │ HTTPS / WebSocket
                     │
┌────────────────────▼─────────────────────────────────────────────┐
│                    APPLICATION LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│  ASP.NET Core MVC Backend                                        │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Controllers                                              │   │
│  │  ├── HomeController (Dashboard views)                   │   │
│  │  ├── CryptoApiController (Market data endpoints)        │   │
│  │  ├── PortfolioController (User holdings)                │   │
│  │  ├── StoreController (Cart & purchases)                 │   │
│  │  └── AuthController (Login/Register)                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Services Layer                                           │   │
│  │  ├── CryptoService (External API integration)           │   │
│  │  ├── PortfolioService (Business logic)                  │   │
│  │  ├── UserService (Auth & user management)               │   │
│  │  └── CacheService (Redis/In-memory caching)             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Middleware                                               │   │
│  │  ├── Authentication Middleware (JWT/Cookie)             │   │
│  │  ├── Exception Handling                                 │   │
│  │  ├── Logging Middleware                                 │   │
│  │  └── Rate Limiting                                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  Real-time Hub: SignalR Hub for price updates                   │
└────────────┬──────────────────────────────┬────────────────────┘
             │                               │
             │ Entity Framework Core         │ HttpClient
             │                               │
┌────────────▼─────────────┐    ┌───────────▼─────────────────────┐
│   DATA LAYER              │    │   EXTERNAL SERVICES             │
├───────────────────────────┤    ├─────────────────────────────────┤
│  SQL Server Database      │    │  CoinGecko API                  │
│                           │    │  ├── /coins/markets             │
│  Tables:                  │    │  ├── /coins/{id}                │
│  ├── Users                │    │  ├── /coins/{id}/market_chart   │
│  ├── Portfolios           │    │  └── /simple/price              │
│  ├── Transactions         │    │                                  │
│  ├── CryptoHoldings       │    │  Rate Limit: 10-50 req/min      │
│  └── CachePrices          │    └──────────────────────────────────┘
│     (for performance)     │
└───────────────────────────┘
```

## Backend: ASP.NET Core MVC

### Choice Justification
**Selected**: ASP.NET Core MVC 8.0

**Reasons**:
1. **Requirement Alignment**: Explicitly specified in project requirements
2. **Enterprise-Grade**: Robust, mature framework with excellent performance
3. **SignalR Integration**: Built-in support for real-time features (critical for live price updates)
4. **Security Features**: Built-in authentication, authorization, and protection against common vulnerabilities
5. **Dependency Injection**: First-class DI support for clean architecture
6. **Cross-Platform**: Runs on Windows, Linux, macOS
7. **Performance**: One of the fastest web frameworks (TechEmpower benchmarks)

### Key Technologies from Research
Based on DeepWiki research of `dotnet/aspnetcore`:

1. **SignalR for Real-time Dashboards**: ASP.NET Core includes SignalR library that simplifies real-time web functionality, enabling server-side code to push content to connected clients instantly - perfect for live crypto price updates

2. **HttpClient & HttpClientFactory**: Recommended pattern for consuming external REST APIs (CoinGecko), with proper lifecycle management and resilience

3. **Controllers as RESTful APIs**: Controllers can serve both MVC views and JSON APIs, allowing flexible architecture

### Architecture Pattern
- **MVC Pattern**: Separation of concerns (Models, Views, Controllers)
- **Service Layer**: Business logic abstracted into services
- **Repository Pattern**: Data access layer abstraction
- **Dependency Injection**: Constructor injection throughout

## Frontend: React

### Choice Justification
**Selected**: React 18+ with TypeScript

**Reasons**:

1. **Ecosystem & Libraries**:
   - **Recharts/Chart.js**: Excellent charting libraries for crypto price visualization
   - **React Query**: Perfect for managing server state and real-time data
   - **SignalR Client**: Official @microsoft/signalr package for real-time updates
   - **Redux Toolkit**: Simplified state management for complex app state

2. **Real-time Capabilities**:
   - Efficient re-rendering with Virtual DOM
   - Hooks (useEffect, useState) ideal for polling and WebSocket management
   - Context API for global state (auth, theme)

3. **Developer Experience**:
   - Largest community and ecosystem
   - Extensive documentation and tutorials
   - Strong TypeScript support for type safety
   - Create React App / Vite for quick setup

4. **Performance**:
   - Component-based architecture enables code splitting
   - React.memo and useMemo for optimization
   - Lazy loading for better initial load time

5. **Industry Standard**:
   - Most in-demand frontend skill
   - Used by major crypto platforms (Coinbase, Binance use React-based stacks)

**Alternatives Considered**:
- **Vue.js**: Easier learning curve but smaller ecosystem for financial charts
- **Angular**: More opinionated, heavier framework, steeper learning curve

## Database: SQL Server

### Choice Justification
**Selected**: Microsoft SQL Server (or SQL Server Express for development)

**Reasons**:

1. **.NET Ecosystem Integration**:
   - First-class support with Entity Framework Core
   - Excellent tooling in Visual Studio
   - Native integration with Azure (future cloud deployment)

2. **ACID Compliance**:
   - Critical for transaction history and portfolio tracking
   - Ensures data integrity for user purchases and holdings

3. **Performance Features**:
   - Efficient indexing for fast queries
   - Query optimization engine
   - Built-in caching mechanisms

4. **Security**:
   - Row-level security capabilities
   - Transparent data encryption
   - Always Encrypted for sensitive data

5. **Developer Productivity**:
   - SQL Server Management Studio (SSMS)
   - Built-in migration tools with EF Core
   - Excellent debugging and profiling tools

### Database Schema Overview

```sql
Users
├── Id (PK)
├── Email (Unique)
├── PasswordHash
├── CreatedAt
└── LastLogin

Portfolios
├── Id (PK)
├── UserId (FK)
├── CreatedAt
└── TotalValue (computed)

CryptoHoldings
├── Id (PK)
├── PortfolioId (FK)
├── CryptoId (CoinGecko ID)
├── CryptoSymbol
├── Amount
├── PurchasePrice
├── PurchaseDate
└── CurrentValue (computed)

Transactions
├── Id (PK)
├── PortfolioId (FK)
├── CryptoId
├── TransactionType (Buy/Sell)
├── Amount
├── Price
└── Timestamp

PriceCache
├── CryptoId (PK)
├── CurrentPrice
├── LastUpdated
└── MarketData (JSON)
```

**Alternatives Considered**:
- **PostgreSQL**: Excellent choice, but SQL Server offers better .NET tooling
- **MongoDB**: NoSQL flexibility but less suitable for transactional data

## External Crypto API: CoinGecko

### Choice Justification
**Selected**: CoinGecko API v3

**Reasons**:

1. **Generous Free Tier**:
   - 10-50 requests/minute (enough for our use case)
   - No credit card required
   - No API key needed for basic endpoints

2. **Comprehensive Data**:
   - 13,000+ cryptocurrencies
   - Real-time price data
   - Historical data (24h, 7d, 30d, 1y, all)
   - Market cap, volume, price changes
   - Trending coins

3. **Well-Documented**:
   - Clear REST API documentation
   - Example requests and responses
   - Community libraries available

4. **Reliability**:
   - Industry-standard API used by many apps
   - High uptime (99.9%+)
   - Rate limiting is reasonable

5. **Key Endpoints for Our App**:
```
GET /coins/markets
  - List cryptocurrencies with market data
  - Parameters: vs_currency, order, per_page, page

GET /coins/{id}
  - Detailed info about specific coin
  - Includes description, links, market data

GET /coins/{id}/market_chart
  - Historical data for charts
  - Parameters: vs_currency, days (1,7,30,365,max)

GET /simple/price
  - Current price for multiple coins
  - Fast endpoint for real-time updates
```

### API Integration Strategy

1. **HttpClient Service**:
   - Singleton HttpClient via HttpClientFactory
   - Retry policy with Polly (3 retries with exponential backoff)
   - Circuit breaker pattern for resilience

2. **Caching Strategy**:
   - Cache responses for 30-60 seconds
   - In-memory cache for frequently accessed data
   - Reduce API calls to stay within rate limits

3. **Rate Limiting**:
   - Track requests per minute
   - Queue requests if approaching limit
   - Fallback to cached data if limit exceeded

**Alternatives Considered**:
- **CoinMarketCap**: Requires API key, more restrictive free tier
- **Binance API**: Focused on exchange data, more complex
- **Cryptocompare**: Good alternative, but CoinGecko has better free tier

## MCP Tool Usage Plan

### 1. Context7 - Library Documentation
**Use Cases**:
- **React Components**: Look up best practices for React hooks, SignalR integration, chart libraries
  ```
  /context7 @microsoft/signalr - Setting up SignalR client in React
  /context7 recharts - Creating real-time cryptocurrency price charts
  ```
- **ASP.NET Core**: Entity Framework patterns, authentication setup, SignalR hub configuration
  ```
  /context7 Microsoft.EntityFrameworkCore - Configuring relationships and migrations
  /context7 Microsoft.AspNetCore.SignalR - Hub setup for real-time updates
  ```
- **Security**: JWT authentication, password hashing libraries
  ```
  /context7 Microsoft.AspNetCore.Authentication.JwtBearer
  ```

**When to Use**: During implementation when we need specific API syntax or patterns

### 2. DeepWiki - Repository Deep Dives
**Use Cases**:
- **ASP.NET Core Patterns**: Understand MVC best practices, middleware patterns
  ```
  Research: dotnet/aspnetcore for SignalR implementation patterns
  Research: dotnet/efcore for complex query optimization
  ```
- **React Architecture**: Study React repository for component patterns
  ```
  Research: facebook/react for hooks patterns and optimization
  ```
- **Security Best Practices**: Look into authentication patterns

**When to Use**: During architecture/design phase and when solving complex problems

### 3. Playwright - E2E Testing & Browser Automation
**Use Cases**:
- **End-to-End Testing**:
  ```
  Test: User registration → Login → Purchase crypto → View portfolio
  Test: Real-time price updates appear on dashboard
  Test: Comparison tool displays correct data
  ```
- **Visual Testing**: Capture screenshots of different states
- **Performance Testing**: Measure load times, real-time update latency
- **Cross-browser Testing**: Verify functionality in Chrome, Firefox, Safari

**When to Use**:
- After core features are implemented
- Before major releases
- When debugging UI issues
- For regression testing

### Integration Workflow Example

```
Phase 1: Setup & Research
├── Use DeepWiki to research ASP.NET Core MVC structure
├── Use Context7 to look up Entity Framework setup
└── Initialize project structure

Phase 2: Backend Development
├── Use Context7 for SignalR hub implementation
├── Use Context7 for HttpClient best practices
└── Implement API integration with CoinGecko

Phase 3: Frontend Development
├── Use Context7 for React + SignalR client setup
├── Use Context7 for chart library integration
└── Build responsive UI components

Phase 4: Testing & Validation
├── Use Playwright for E2E test automation
├── Use Playwright to test real-time updates
└── Use Playwright for cross-browser testing

Phase 5: Optimization
├── Use DeepWiki to research performance patterns
├── Use Context7 for caching strategies
└── Use Playwright for performance profiling
```

## Development Environment

### Required Tools
- **IDE**: Visual Studio 2022 or VS Code
- **.NET SDK**: 8.0+
- **Node.js**: 18+ (for React)
- **SQL Server**: Express 2022 or Developer Edition
- **Git**: Version control

### Recommended Extensions
- **VS Code**: C# Dev Kit, ESLint, Prettier, REST Client
- **Visual Studio**: ReSharper (optional), Web Essentials

## Deployment Considerations (Future)

### Potential Hosting Options
- **Azure App Service**: Native .NET support, easy deployment
- **Docker**: Containerized deployment for portability
- **Vercel/Netlify**: Frontend hosting (React SPA)
- **Azure SQL**: Managed database service

### CI/CD Pipeline
- GitHub Actions or Azure DevOps
- Automated testing with xUnit (backend) and Jest (frontend)
- Automated deployments on merge to main

## Scalability Considerations

### Current Design Supports
- **Horizontal Scaling**: Stateless API design
- **Caching**: Redis for distributed cache (future)
- **Load Balancing**: Multiple server instances
- **Database**: Read replicas for query optimization

### Future Enhancements
- Microservices architecture (separate auth, portfolio, market data services)
- Message queue (RabbitMQ/Azure Service Bus) for async processing
- CDN for static assets
- API Gateway for rate limiting and routing

---

## Project Structure (Clean Architecture)

### Solution Structure

```
CryptoMarket/
├── src/
│   ├── CryptoMarket.Domain/              # Core business entities (no dependencies)
│   │   ├── Entities/
│   │   │   ├── User.cs
│   │   │   ├── Portfolio.cs
│   │   │   ├── CryptoHolding.cs
│   │   │   ├── Transaction.cs
│   │   │   ├── Cart.cs
│   │   │   ├── CartItem.cs
│   │   │   └── PriceCache.cs
│   │   ├── Enums/
│   │   │   ├── TransactionType.cs
│   │   │   └── UserRole.cs
│   │   └── Interfaces/
│   │       └── IEntity.cs
│   │
│   ├── CryptoMarket.Application/         # Business logic, DTOs, interfaces
│   │   ├── DTOs/
│   │   │   ├── Auth/
│   │   │   │   ├── LoginDto.cs
│   │   │   │   ├── RegisterDto.cs
│   │   │   │   └── TokenDto.cs
│   │   │   ├── Crypto/
│   │   │   │   ├── CryptoMarketDto.cs
│   │   │   │   ├── CryptoDetailDto.cs
│   │   │   │   └── PriceHistoryDto.cs
│   │   │   ├── Portfolio/
│   │   │   │   ├── PortfolioDto.cs
│   │   │   │   ├── HoldingDto.cs
│   │   │   │   └── PerformanceDto.cs
│   │   │   └── Store/
│   │   │       ├── CartDto.cs
│   │   │       └── CheckoutDto.cs
│   │   ├── Interfaces/
│   │   │   ├── Services/
│   │   │   │   ├── IAuthService.cs
│   │   │   │   ├── ICryptoService.cs
│   │   │   │   ├── IPortfolioService.cs
│   │   │   │   ├── ICartService.cs
│   │   │   │   └── ITokenService.cs
│   │   │   └── Repositories/
│   │   │       ├── IUserRepository.cs
│   │   │       ├── IPortfolioRepository.cs
│   │   │       └── ITransactionRepository.cs
│   │   ├── Services/
│   │   │   ├── AuthService.cs
│   │   │   ├── PortfolioService.cs
│   │   │   └── CartService.cs
│   │   ├── Validators/
│   │   │   ├── LoginDtoValidator.cs
│   │   │   └── RegisterDtoValidator.cs
│   │   └── Mappings/
│   │       └── MappingProfile.cs (AutoMapper)
│   │
│   ├── CryptoMarket.Infrastructure/      # External concerns (DB, APIs, caching)
│   │   ├── Data/
│   │   │   ├── ApplicationDbContext.cs
│   │   │   ├── Configurations/
│   │   │   │   ├── UserConfiguration.cs
│   │   │   │   ├── PortfolioConfiguration.cs
│   │   │   │   └── TransactionConfiguration.cs
│   │   │   └── Migrations/
│   │   ├── Repositories/
│   │   │   ├── BaseRepository.cs
│   │   │   ├── UserRepository.cs
│   │   │   ├── PortfolioRepository.cs
│   │   │   └── TransactionRepository.cs
│   │   ├── ExternalServices/
│   │   │   ├── CoinGecko/
│   │   │   │   ├── CoinGeckoService.cs
│   │   │   │   ├── CoinGeckoClient.cs
│   │   │   │   └── Models/ (API response models)
│   │   │   └── TokenService.cs (JWT)
│   │   ├── Caching/
│   │   │   └── MemoryCacheService.cs
│   │   └── BackgroundJobs/
│   │       └── PriceUpdateJob.cs (Background service)
│   │
│   └── CryptoMarket.Web/                 # Web layer (Controllers, SignalR, Middleware)
│       ├── Controllers/
│       │   ├── HomeController.cs
│       │   ├── Api/
│       │   │   ├── AuthController.cs
│       │   │   ├── CryptoController.cs
│       │   │   ├── PortfolioController.cs
│       │   │   └── CartController.cs
│       ├── Hubs/
│       │   └── PriceUpdateHub.cs (SignalR)
│       ├── Middleware/
│       │   ├── ExceptionHandlingMiddleware.cs
│       │   ├── RateLimitingMiddleware.cs
│       │   └── RequestLoggingMiddleware.cs
│       ├── Filters/
│       │   └── ValidateModelAttribute.cs
│       ├── Views/
│       │   ├── Home/
│       │   │   └── Index.cshtml
│       │   └── Shared/
│       │       └── _Layout.cshtml
│       ├── wwwroot/
│       │   └── (React build output will go here)
│       ├── Program.cs
│       ├── appsettings.json
│       └── appsettings.Development.json
│
├── tests/
│   ├── CryptoMarket.UnitTests/
│   │   ├── Services/
│   │   └── Validators/
│   └── CryptoMarket.IntegrationTests/
│       ├── Controllers/
│       └── Repositories/
│
├── client/                                # React frontend (separate)
│   ├── src/
│   ├── public/
│   └── package.json
│
├── CryptoMarket.sln
└── README.md
```

### Layer Responsibilities

| Layer | Responsibility | Dependencies |
|-------|----------------|--------------|
| **Domain** | Core business entities, enums, domain interfaces | None (pure C# domain models) |
| **Application** | Business logic, DTOs, validation, service interfaces, AutoMapper profiles | Domain only |
| **Infrastructure** | Database access, external APIs (CoinGecko), caching, background jobs, JWT token service | Domain, Application |
| **Web** | HTTP handling, API controllers, SignalR hubs, middleware, MVC views (minimal), request/response models | Application, Infrastructure (via DI) |

### Dependency Flow
```
Web → Application → Domain
  ↓
Infrastructure → Application → Domain
```

## Technology Stack - Finalized Versions

### Backend (NuGet Packages)

#### Core Framework
```xml
<PackageReference Include="Microsoft.AspNetCore.App" Version="8.0.0" />
<PackageReference Include="Microsoft.NET.Sdk.Web" Version="8.0.0" />
```

#### Database & ORM
```xml
<PackageReference Include="Microsoft.EntityFrameworkCore" Version="8.0.0" />
<PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="8.0.0" />
<PackageReference Include="Microsoft.EntityFrameworkCore.Design" Version="8.0.0">
  <PrivateAssets>all</PrivateAssets>
</PackageReference>
<PackageReference Include="Microsoft.EntityFrameworkCore.Tools" Version="8.0.0">
  <PrivateAssets>all</PrivateAssets>
</PackageReference>
```

#### Authentication & Security
```xml
<PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="8.0.0" />
<PackageReference Include="System.IdentityModel.Tokens.Jwt" Version="7.0.3" />
<PackageReference Include="BCrypt.Net-Next" Version="4.0.3" />
```

#### HTTP & Resilience
```xml
<PackageReference Include="Microsoft.Extensions.Http" Version="8.0.0" />
<PackageReference Include="Microsoft.Extensions.Http.Polly" Version="8.0.0" />
<PackageReference Include="Polly" Version="8.2.0" />
```

#### Logging
```xml
<PackageReference Include="Serilog.AspNetCore" Version="8.0.0" />
<PackageReference Include="Serilog.Sinks.Console" Version="5.0.1" />
<PackageReference Include="Serilog.Sinks.File" Version="5.0.0" />
<PackageReference Include="Serilog.Enrichers.Environment" Version="2.3.0" />
```

#### Validation & Mapping
```xml
<PackageReference Include="FluentValidation.AspNetCore" Version="11.3.0" />
<PackageReference Include="AutoMapper.Extensions.Microsoft.DependencyInjection" Version="12.0.1" />
```

#### Caching & Background Jobs
```xml
<PackageReference Include="Microsoft.Extensions.Caching.Memory" Version="8.0.0" />
```

#### SignalR
```xml
<PackageReference Include="Microsoft.AspNetCore.SignalR" Version="1.1.0" />
<!-- Already included in Microsoft.AspNetCore.App metapackage -->
```

#### Rate Limiting
```xml
<PackageReference Include="AspNetCoreRateLimit" Version="5.0.0" />
```

#### Testing
```xml
<PackageReference Include="xUnit" Version="2.6.2" />
<PackageReference Include="xUnit.runner.visualstudio" Version="2.5.4" />
<PackageReference Include="Moq" Version="4.20.70" />
<PackageReference Include="FluentAssertions" Version="6.12.0" />
<PackageReference Include="Microsoft.AspNetCore.Mvc.Testing" Version="8.0.0" />
```

### Frontend (npm/yarn Packages)

#### Core Libraries
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.20.0",
  "typescript": "^5.3.3"
}
```

#### State Management
```json
{
  "react-query": "^3.39.3",
  "@tanstack/react-query": "^5.14.2",
  "zustand": "^4.4.7"
}
```

#### UI & Styling
```json
{
  "tailwindcss": "^3.4.0",
  "@headlessui/react": "^1.7.17",
  "@heroicons/react": "^2.1.1",
  "clsx": "^2.0.0"
}
```

#### Charts & Visualization
```json
{
  "recharts": "^2.10.3",
  "chart.js": "^4.4.1",
  "react-chartjs-2": "^5.2.0"
}
```

#### Real-time & HTTP
```json
{
  "@microsoft/signalr": "^8.0.0",
  "axios": "^1.6.2"
}
```

#### Forms & Validation
```json
{
  "react-hook-form": "^7.49.2",
  "zod": "^3.22.4"
}
```

#### Dev Tools
```json
{
  "vite": "^5.0.8",
  "@vitejs/plugin-react": "^4.2.1",
  "eslint": "^8.55.0",
  "prettier": "^3.1.1"
}
```

### Authentication Method: JWT Bearer

**Decision**: Implement JWT Bearer tokens for stateless API authentication

**Configuration**:
- **Token Type**: JWT (JSON Web Tokens)
- **Algorithm**: HS256 (HMAC-SHA256)
- **Token Lifetime**:
  - Access Token: 15 minutes
  - Refresh Token: 7 days (stored in database)
- **Claims**: UserId, Email, Role, Expiration
- **Storage**:
  - Client: localStorage or httpOnly cookies
  - Server: Refresh tokens in database
- **Security**:
  - HTTPS only
  - Signing key from environment variables
  - Token validation on every protected request

### Caching Strategy

**Decision**: In-memory caching with IMemoryCache for MVP, Redis-ready architecture

**Implementation**:
1. **Price Data Caching**:
   - Cache duration: 30 seconds
   - Keys: `crypto:price:{coinId}`, `crypto:markets:page:{n}`

2. **User Data Caching**:
   - Cache duration: 5 minutes
   - Keys: `user:{userId}`, `portfolio:{portfolioId}`

3. **Cache Invalidation**:
   - Time-based expiration
   - Manual invalidation on data updates (portfolio changes)

4. **Future Migration to Redis**:
   - Abstract caching behind ICacheService interface
   - Easy swap to StackExchange.Redis when scaling

## Data Models (Entities)

### User Entity
```csharp
public class User
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.User;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastLogin { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public Portfolio? Portfolio { get; set; }
    public Cart? Cart { get; set; }
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
}
```

### Portfolio Entity
```csharp
public class Portfolio
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public User User { get; set; } = null!;
    public ICollection<CryptoHolding> Holdings { get; set; } = new List<CryptoHolding>();
    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();

    // Computed property (not mapped)
    public decimal TotalValue => Holdings.Sum(h => h.CurrentValue);
}
```

### CryptoHolding Entity
```csharp
public class CryptoHolding
{
    public Guid Id { get; set; }
    public Guid PortfolioId { get; set; }
    public string CryptoId { get; set; } = string.Empty; // CoinGecko ID
    public string Symbol { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public decimal AveragePurchasePrice { get; set; }
    public DateTime FirstPurchaseDate { get; set; }
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;

    // Navigation property
    public Portfolio Portfolio { get; set; } = null!;

    // Computed properties (not mapped)
    public decimal CurrentValue { get; set; } // Calculated from real-time price
    public decimal ProfitLoss => CurrentValue - (Amount * AveragePurchasePrice);
    public decimal ProfitLossPercentage =>
        AveragePurchasePrice > 0
            ? ((CurrentValue / (Amount * AveragePurchasePrice)) - 1) * 100
            : 0;
}
```

### Transaction Entity
```csharp
public class Transaction
{
    public Guid Id { get; set; }
    public Guid PortfolioId { get; set; }
    public string CryptoId { get; set; } = string.Empty;
    public string Symbol { get; set; } = string.Empty;
    public TransactionType Type { get; set; }
    public decimal Amount { get; set; }
    public decimal PriceAtTransaction { get; set; }
    public decimal TotalValue { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    // Navigation property
    public Portfolio Portfolio { get; set; } = null!;
}
```

### Cart Entity
```csharp
public class Cart
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public User User { get; set; } = null!;
    public ICollection<CartItem> Items { get; set; } = new List<CartItem>();

    // Computed property
    public decimal TotalValue => Items.Sum(i => i.TotalPrice);
}
```

### CartItem Entity
```csharp
public class CartItem
{
    public Guid Id { get; set; }
    public Guid CartId { get; set; }
    public string CryptoId { get; set; } = string.Empty;
    public string Symbol { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public decimal PriceAtAdd { get; set; }
    public DateTime AddedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    public Cart Cart { get; set; } = null!;

    // Computed property
    public decimal TotalPrice => Amount * PriceAtAdd;
}
```

### PriceCache Entity
```csharp
public class PriceCache
{
    public string CryptoId { get; set; } = string.Empty; // Primary Key
    public string Symbol { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public decimal CurrentPrice { get; set; }
    public decimal MarketCap { get; set; }
    public decimal Volume24h { get; set; }
    public decimal PriceChange24h { get; set; }
    public decimal PriceChangePercentage24h { get; set; }
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
    public string ImageUrl { get; set; } = string.Empty;
}
```

### RefreshToken Entity
```csharp
public class RefreshToken
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? RevokedAt { get; set; }
    public bool IsExpired => DateTime.UtcNow >= ExpiresAt;
    public bool IsActive => RevokedAt == null && !IsExpired;

    // Navigation property
    public User User { get; set; } = null!;
}
```

### Enums

```csharp
public enum UserRole
{
    User = 0,
    Admin = 1
}

public enum TransactionType
{
    Buy = 0,
    Sell = 1
}
```

### Entity Relationships Summary

```
User (1) ←→ (1) Portfolio
User (1) ←→ (1) Cart
User (1) ←→ (0..*) RefreshToken
Portfolio (1) ←→ (0..*) CryptoHolding
Portfolio (1) ←→ (0..*) Transaction
Cart (1) ←→ (0..*) CartItem
PriceCache (independent cache table)
```

## Data Flow Diagrams

### 1. Authentication Flow

```
┌──────────┐                 ┌────────────────┐                ┌──────────┐
│  Client  │                 │  Auth API      │                │ Database │
└─────┬────┘                 └───────┬────────┘                └────┬─────┘
      │                              │                              │
      │ POST /api/auth/register      │                              │
      │ { email, password }          │                              │
      ├─────────────────────────────>│                              │
      │                              │                              │
      │                              │ 1. Validate input            │
      │                              │ 2. Hash password (BCrypt)    │
      │                              │                              │
      │                              │ 3. Create User               │
      │                              ├─────────────────────────────>│
      │                              │                              │
      │                              │ 4. Create Portfolio          │
      │                              ├─────────────────────────────>│
      │                              │                              │
      │                              │<─────────────────────────────┤
      │                              │ User + Portfolio created     │
      │                              │                              │
      │<─────────────────────────────┤                              │
      │ { userId, email }            │                              │
      │                              │                              │
      │                              │                              │
      │ POST /api/auth/login         │                              │
      │ { email, password }          │                              │
      ├─────────────────────────────>│                              │
      │                              │                              │
      │                              │ 1. Find user by email        │
      │                              ├─────────────────────────────>│
      │                              │<─────────────────────────────┤
      │                              │ User found                   │
      │                              │                              │
      │                              │ 2. Verify password (BCrypt)  │
      │                              │ 3. Generate JWT access token │
      │                              │ 4. Generate refresh token    │
      │                              │                              │
      │                              │ 5. Store refresh token       │
      │                              ├─────────────────────────────>│
      │                              │                              │
      │<─────────────────────────────┤                              │
      │ { accessToken, refreshToken }│                              │
      │                              │                              │
      │                              │                              │
      │ GET /api/portfolio           │                              │
      │ Authorization: Bearer <JWT>  │                              │
      ├─────────────────────────────>│                              │
      │                              │                              │
      │                              │ 1. Validate JWT              │
      │                              │ 2. Extract userId from token │
      │                              │                              │
      │                              │ 3. Query portfolio           │
      │                              ├─────────────────────────────>│
      │                              │<─────────────────────────────┤
      │                              │ Portfolio data               │
      │                              │                              │
      │<─────────────────────────────┤                              │
      │ { portfolio data }           │                              │
      │                              │                              │
```

### 2. Real-Time Price Updates Flow

```
┌──────────┐     ┌────────────┐     ┌─────────────┐     ┌───────────┐     ┌─────────┐
│  Client  │     │  SignalR   │     │  Background │     │   Crypto  │     │CoinGecko│
│ (React)  │     │    Hub     │     │   Service   │     │  Service  │     │   API   │
└────┬─────┘     └─────┬──────┘     └──────┬──────┘     └─────┬─────┘     └────┬────┘
     │                 │                   │                  │                │
     │ 1. Connect to   │                   │                  │                │
     │    SignalR Hub  │                   │                  │                │
     ├────────────────>│                   │                  │                │
     │                 │                   │                  │                │
     │<────────────────┤                   │                  │                │
     │ Connected       │                   │                  │                │
     │                 │                   │                  │                │
     │                 │   Background job  │                  │                │
     │                 │   runs every 30s  │                  │                │
     │                 │                   │                  │                │
     │                 │<──────────────────┤                  │                │
     │                 │ 2. Fetch prices   │                  │                │
     │                 │                   │                  │                │
     │                 │                   │ 3. GetPrices()   │                │
     │                 │                   ├─────────────────>│                │
     │                 │                   │                  │                │
     │                 │                   │                  │ 4. API call    │
     │                 │                   │                  ├───────────────>│
     │                 │                   │                  │                │
     │                 │                   │                  │<───────────────┤
     │                 │                   │                  │ Price data     │
     │                 │                   │                  │                │
     │                 │                   │ 5. Cache prices  │                │
     │                 │                   │<─────────────────┤                │
     │                 │                   │ (in-memory)      │                │
     │                 │                   │                  │                │
     │                 │ 6. Broadcast to   │                  │                │
     │                 │    all clients    │                  │                │
     │                 │<──────────────────┤                  │                │
     │                 │                   │                  │                │
     │ 7. Price update │                   │                  │                │
     │<────────────────┤                   │                  │                │
     │ { prices }      │                   │                  │                │
     │                 │                   │                  │                │
     │ 8. Update UI    │                   │                  │                │
     │ (React state)   │                   │                  │                │
     │                 │                   │                  │                │

Alternative: Client-initiated request

     │ GET /api/crypto/prices          │                  │                │
     ├───────────────────────────────────────────────────>│                │
     │                                 │                  │                │
     │                                 │ Check cache      │                │
     │                                 │ If fresh: return │                │
     │                                 │ If stale: fetch  │                │
     │                                 │                  ├───────────────>│
     │                                 │                  │<───────────────┤
     │<───────────────────────────────────────────────────┤                │
     │ { prices from cache/API }       │                  │                │
```

### 3. Store Checkout Flow

```
┌──────────┐         ┌──────────────┐         ┌──────────────┐         ┌──────────┐
│  Client  │         │  Cart API    │         │  Portfolio   │         │ Database │
│ (React)  │         │              │         │   Service    │         │          │
└────┬─────┘         └──────┬───────┘         └──────┬───────┘         └────┬─────┘
     │                      │                        │                      │
     │ 1. Add to Cart       │                        │                      │
     │ POST /api/cart/items │                        │                      │
     │ { cryptoId, amount } │                        │                      │
     ├─────────────────────>│                        │                      │
     │                      │                        │                      │
     │                      │ 1. Get current price   │                      │
     │                      │    (from cache/API)    │                      │
     │                      │                        │                      │
     │                      │ 2. Create CartItem     │                      │
     │                      ├────────────────────────────────────────────>│
     │                      │                        │                      │
     │<─────────────────────┤                        │                      │
     │ { cart with items }  │                        │                      │
     │                      │                        │                      │
     │                      │                        │                      │
     │ 2. View Cart         │                        │                      │
     │ GET /api/cart        │                        │                      │
     ├─────────────────────>│                        │                      │
     │                      │                        │                      │
     │                      │ Query cart + items     │                      │
     │                      ├────────────────────────────────────────────>│
     │                      │<────────────────────────────────────────────┤
     │                      │                        │                      │
     │<─────────────────────┤                        │                      │
     │ { cart, items, total}│                        │                      │
     │                      │                        │                      │
     │                      │                        │                      │
     │ 3. Checkout          │                        │                      │
     │ POST /api/cart/checkout                       │                      │
     ├─────────────────────>│                        │                      │
     │                      │                        │                      │
     │                      │ 1. Validate cart       │                      │
     │                      │    not empty           │                      │
     │                      │                        │                      │
     │                      │ 2. Start transaction   │                      │
     │                      │                        │                      │
     │                      │ 3. Process purchase    │                      │
     │                      ├───────────────────────>│                      │
     │                      │                        │                      │
     │                      │                        │ 4. For each item:    │
     │                      │                        │    - Create Transaction
     │                      │                        │    - Update/Create   │
     │                      │                        │      CryptoHolding   │
     │                      │                        │    - Calculate avg   │
     │                      │                        │      purchase price  │
     │                      │                        ├─────────────────────>│
     │                      │                        │                      │
     │                      │                        │ 5. Clear cart items  │
     │                      │                        ├─────────────────────>│
     │                      │                        │                      │
     │                      │<───────────────────────┤                      │
     │                      │ Purchase complete      │                      │
     │                      │                        │                      │
     │<─────────────────────┤                        │                      │
     │ { success, portfolio │                        │                      │
     │   summary }          │                        │                      │
     │                      │                        │                      │
     │ 4. Navigate to       │                        │                      │
     │    Portfolio page    │                        │                      │
     │                      │                        │                      │
     │ GET /api/portfolio   │                        │                      │
     ├─────────────────────────────────────────────>│                      │
     │                      │                        │                      │
     │                      │                        │ Query portfolio,     │
     │                      │                        │ holdings, transactions
     │                      │                        ├─────────────────────>│
     │                      │                        │<─────────────────────┤
     │                      │                        │                      │
     │<─────────────────────────────────────────────┤                      │
     │ { portfolio with     │                        │                      │
     │   holdings, P&L }    │                        │                      │
     │                      │                        │                      │
     │ 5. Display portfolio │                        │                      │
     │    with new holdings │                        │                      │
```
