# Backend Setup Guide

## Prerequisites
- [.NET 8.0 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/8.0)
- [PostgreSQL](https://www.postgresql.org/download/) (Running on default port 5432)

## Getting Started

The project structure has been generated. Since the `dotnet` CLI was not available during initialization, you may need to restore packages manually.

### 1. Restore Dependencies
Navigate to the `src` directory (or root) and run:
```bash
dotnet restore src/CryptoMarket.Web/CryptoMarket.Web.csproj
```

### 2. Database Setup
Ensure PostgreSQL is running. Update `src/CryptoMarket.Web/appsettings.json` with your credentials if they differ from:
`Host=localhost;Database=CryptoMarketDb;Username=postgres;Password=postgres`

Create the database and apply migrations (you may need to install the EF Core tool: `dotnet tool install --global dotnet-ef`):
```bash
cd src/CryptoMarket.Web
dotnet ef migrations add InitialCreate --project ../CryptoMarket.Infrastructure --startup-project .
dotnet ef database update
```

### 3. Run the Application
```bash
dotnet run --project src/CryptoMarket.Web/CryptoMarket.Web.csproj
```

The API will be available at `https://localhost:7200` (or similar, check console output).
Swagger UI: `https://localhost:7200/swagger`

## Configuration
- **Security**: JWT settings and connection strings are in `appsettings.json`.
- **Logging**: Configured with Serilog, writing to Console and `logs/` folder.
