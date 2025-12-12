# Backend Testing Plan

> Note: The .NET SDK/runtime is not installed in this environment, so tests cannot be executed here. This document captures the intended setup and coverage to run once the SDK is available.

## Stack & Setup
- Test framework: xUnit
- Mocks: Moq
- Integration host: `WebApplicationFactory` with InMemory EF provider (swap to PostgreSQL when available)
- Coverage: `coverlet.collector` via `dotnet test /p:CollectCoverage=true`

### Project Structure
```
backend/tests/
├── CryptoMarket.UnitTests/
│   ├── Services/
│   │   ├── AuthServiceTests.cs
│   │   ├── CartServiceTests.cs
│   │   ├── CryptoAnalysisServiceTests.cs
│   │   └── PortfolioServiceTests.cs
│   └── Security/
│       └── TokenValidationTests.cs
└── CryptoMarket.IntegrationTests/
    ├── AuthEndpointsTests.cs
    ├── CryptoEndpointsTests.cs
    ├── StoreEndpointsTests.cs
    ├── PortfolioEndpointsTests.cs
    └── AlertsEndpointsTests.cs
```

## Test Coverage Targets
- Services: ≥70% statements/branches on core paths (auth, cart, crypto analysis, portfolio).
- Integration: Happy path + 400/401/404 per endpoint; 429 rate-limit and malformed token cases.

## Key Unit Tests
- **AuthService**
  - Generates JWT with correct claims/expiry; refresh rotation invalidates old token; invalid refresh rejected.
  - Password hashing uses BCrypt and rejects bad passwords.
- **CryptoAnalysisService**
  - Top gainers/losers sorted correctly; comparison aggregates price/volume/marketCap.
  - Percent change calculations handle zero/negative safely.
- **CartService**
  - Add/update/remove items recalculates totals; checkout clears cart and logs message.
  - Invalid quantities rejected.
- **PortfolioService**
  - Position upsert merges existing; PnL/value computed from injected price source; deletion drops value correctly.
- **AlertService**
  - Creates/updates/deletes rules; validates thresholds/directions.

## Key Integration Tests
- **Auth**: register/login/refresh/me/logout happy paths; invalid password → 400; expired/invalid token → 401.
- **Crypto**: list/get/history/top/compare → 200; invalid id → 404; malformed query → 400.
- **Store/Cart**: products → 200; add item → 201; get cart → 200; remove → 200; checkout clears cart → 200; unauthenticated cart → 401.
- **Portfolio/Alerts**: CRUD happy paths; unauthorized → 401; bad payload → 400; missing resource → 404.
- **Rate limiting**: burst requests to a protected endpoint return 429 after limit.

## Security-focused Tests
- SQL injection strings in IDs/queries return 400 (no crashes).
- XSS payloads echoed through validation errors are encoded/sanitized.
- Expired/invalid JWTs return 401; missing token → 401.

## Running Tests (once SDK installed)
```
cd backend/tests
dotnet test /p:CollectCoverage=true /p:CoverletOutputFormat=lcov
```
Coverage artifacts: `backend/tests/CryptoMarket.UnitTests/TestResults/coverage.info` (adjust path per runner).

## Known Gaps / TODO
- Cannot execute tests or generate coverage without installing the .NET SDK/runtime.
- Integration harness assumes EF InMemory; switch to Postgres test container when DB config is ready.
- No Playwright/API smoke added yet; add once backend runs locally.
