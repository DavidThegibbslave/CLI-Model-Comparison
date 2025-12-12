# System Architecture

## Project Structure: Clean Architecture

We follow the **Clean Architecture** principles to ensure separation of concerns and testability.

| Layer | Project Name | Responsibility | Dependencies |
|-------|--------------|----------------|--------------|
| **Domain** | `CryptoMarket.Domain` | Core entities, value objects, enums, domain interfaces (e.g., `IRepository`). Pure C#. | None |
| **Application** | `CryptoMarket.Application` | Business logic, use cases (Services/CQRS), DTOs, validation, interface implementations (logic). | Domain |
| **Infrastructure** | `CryptoMarket.Infrastructure` | Database access (EF Core), external API clients (CoinGecko), Identity, Logging, Background Jobs. | Application, Domain |
| **Web** | `CryptoMarket.Web` | API Controllers, SignalR Hubs, Middleware, Dependency Injection Root. | Application, Infrastructure |

## Technology Stack

### Backend (ASP.NET Core 8.0)
*   **Framework**: .NET 8 SDK
*   **Database Access**: `Microsoft.EntityFrameworkCore`, `Npgsql.EntityFrameworkCore` (PostgreSQL)
*   **Real-time**: `Microsoft.AspNetCore.SignalR`
*   **Authentication**: `Microsoft.AspNetCore.Authentication.JwtBearer` (JWT)
*   **Logging**: `Serilog.AspNetCore` (Structured logging)
*   **Documentation**: `Swashbuckle.AspNetCore` (Swagger/OpenAPI)
*   **Mapping**: `AutoMapper` (Optional, or manual mapping)
*   **Validation**: `FluentValidation`

### Frontend (React 18+)
*   **Build Tool**: Vite
*   **State Management**: React Query (TanStack Query) + Context API (for global auth state)
*   **Routing**: React Router v6
*   **Styling**: Tailwind CSS + generic component library (e.g., shadcn/ui or Material UI)
*   **Charts**: Recharts
*   **Real-time**: `@microsoft/signalr`
*   **HTTP Client**: Axios

### Database (PostgreSQL 16+)
*   **Hosting**: Docker container or local service.
*   **ORM**: Entity Framework Core (Code-First).

## Data Models

### Identity & Users
*   **User**: `Id` (Guid), `Email`, `PasswordHash`, `Username`, `CreatedAt`.
*   **Role**: `Id`, `Name` (Admin, User).

### Crypto Market Data
*   **CryptoAsset**: `Id` (Symbol), `Name`, `Symbol`, `CoingeckoId`.
*   **MarketSnapshot**: `Id`, `AssetId`, `PriceUsd`, `Volume24h`, `Change24h`, `Timestamp`. (TimescaleDB candidate, but standard PG table for now).

### Portfolio (Additional Feature)
*   **Portfolio**: `Id`, `UserId`, `Name`, `BalanceUsd` (Virtual Cash), `CreatedAt`.
*   **PortfolioPosition**: `Id`, `PortfolioId`, `AssetId`, `Quantity`, `AverageBuyPrice`.
*   **Transaction**: `Id`, `PortfolioId`, `AssetId`, `Type` (Buy/Sell), `Quantity`, `PriceAtTransaction`, `TotalUsd`, `Timestamp`.

### Visual Store
*   **Product**: `Id`, `Name`, `Description`, `PriceUsd`, `ImageUrl`.
*   **Cart**: `Id`, `UserId` (or SessionId), `Items` (List).
*   **CartItem**: `Id`, `CartId`, `ProductId`, `Quantity`.

## Data Flows

### 1. Real-Time Price Updates
1.  **Background Service** (`CryptoWorker`) wakes up every 10 seconds.
2.  **Infrastructure** calls CoinGecko API to fetch prices for tracked assets.
3.  **Application** updates the `MarketSnapshot` cache/DB.
4.  **Infrastructure** invokes `CryptoHub.SendAsync("ReceivePrices", data)` via SignalR.
5.  **Web Client** receives event and updates Redux/Context state.

### 2. Simulated "Buy" Order
1.  **User** clicks "Buy 1 BTC" on Frontend.
2.  **Frontend** sends POST `/api/portfolio/buy` with `{ asset: 'BTC', amount: 1 }`.
3.  **Web API** validates JWT and request.
4.  **Application Service** (`PortfolioService`):
    *   Gets latest price from `MarketSnapshot` (server-side source of truth).
    *   Checks User's `Portfolio.BalanceUsd`.
    *   If sufficient funds:
        *   Deduct USD from Balance.
        *   Add BTC to `PortfolioPosition`.
        *   Create `Transaction` record.
    *   Saves to DB transactionally.
5.  **Response**: Returns updated Portfolio state.