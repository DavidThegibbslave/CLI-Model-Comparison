# Backend Setup (Initial)

## Structure Created
- Solution: `backend/CryptoMarket.sln`
- Projects:
  - `backend/src/CryptoMarket.Web` (Web/API, Program.cs with DI, JWT auth, CORS, rate limiting, Serilog)
  - `backend/src/CryptoMarket.Application` (interfaces, validators/mappings placeholder)
  - `backend/src/CryptoMarket.Domain` (entities and relationships)
  - `backend/src/CryptoMarket.Infrastructure` (EF Core `AppDbContext`, repo stub, data folders for configs/migrations/seeders)
- Tests: folders for unit/integration prepared under `backend/tests/`

## Configuration Keys
- `ConnectionStrings:DefaultConnection` (PostgreSQL) — fallback to in-memory if missing
- `ConnectionStrings:Redis` or `REDIS_CONNECTION` — optional, falls back to in-memory cache
- `Cors:AllowedOrigins` — array of allowed origins
- `Jwt:Key`, `Jwt:Issuer`, `Jwt:Audience` — for JWT signing/validation
- `Logging` / `Serilog` — structured logging sinks and levels

## How to Run (expected)
```bash
# From backend directory
# Requires .NET 8 SDK and PostgreSQL/Redis if not using in-memory defaults
# dotnet build CryptoMarket.sln
# dotnet run --project src/CryptoMarket.Web
```

Notes: `dotnet` SDK was not available in this environment, so build/run could not be executed. Program.cs is wired for HTTPS redirection, CORS policy, rate limiting, JWT auth, Serilog logging, SignalR hub placeholder, and EF Core with optional PostgreSQL/Redis.
