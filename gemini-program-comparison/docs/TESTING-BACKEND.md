# Backend Testing Guide

## Overview
The `CryptoMarket.Tests` project contains Unit and Integration tests to ensure the reliability and security of the backend API. It uses **xUnit**, **Moq**, and **FluentAssertions**.

## Project Structure
- **UnitTests/**: Tests individual services (e.g., `PortfolioService`) with mocked dependencies.
- **IntegrationTests/**: Tests full API endpoints using `WebApplicationFactory` and an In-Memory Database.

## Running Tests
Ensure you have the .NET 8 SDK installed.

```bash
cd tests/CryptoMarket.Tests
dotnet test
```

## Test Coverage

### 1. Unit Tests (Service Layer)
- **PortfolioService**:
    - `CreatePortfolio`: Verifies default balance ($10k).
    - `ExecuteOrder (Buy)`: Verifies balance deduction and position creation.
    - `ExecuteOrder (Insufficient Funds)`: Verifies exception is thrown.

### 2. Integration Tests (API Layer)
- **Auth**:
    - `/register`: Successful creation returns JWT.
    - `/login`: Valid credentials return JWT.
    - `/me`: Unauthenticated request returns 401 Unauthorized.

## Security Testing
- **Authorization**: Verified via Integration Tests (401 responses).
- **Validation**: Data Annotations on DTOs (tested implicitly via API integration).
- **Isolation**: Tests use an In-Memory database, ensuring no side effects on production data.

## Extending Tests
To add new tests:
1.  Create a class in `UnitTests` or `IntegrationTests`.
2.  For Unit Tests: Mock interfaces (`ICryptoService`, etc.).
3.  For Integration Tests: Use `_client` from `WebApplicationFactory`.
