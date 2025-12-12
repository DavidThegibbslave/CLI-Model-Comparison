# Backend Setup Guide

## Prerequisites

### Required Software
- **.NET 8.0 SDK** or later
  - Download: https://dotnet.microsoft.com/download
  - Verify installation: `dotnet --version`

- **SQL Server** (one of the following):
  - SQL Server Express (free): https://www.microsoft.com/sql-server/sql-server-downloads
  - SQL Server LocalDB (included with Visual Studio)
  - SQL Server Developer Edition (free)
  - Docker SQL Server: `docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YourStrong@Passw0rd" -p 1433:1433 -d mcr.microsoft.com/mssql/server:2022-latest`

- **IDE** (choose one):
  - Visual Studio 2022 (Community, Professional, or Enterprise)
  - Visual Studio Code with C# Dev Kit extension
  - JetBrains Rider

### Optional Tools
- **SQL Server Management Studio (SSMS)**: For database management
- **.NET EF Core CLI Tools**: For migrations
  ```bash
  dotnet tool install --global dotnet-ef
  ```

---

## Project Structure Created

```
CryptoMarket/
├── src/
│   ├── CryptoMarket.Domain/              ✅ Created
│   │   ├── Entities/                     ✅ All entities created
│   │   ├── Enums/                        ✅ UserRole, TransactionType
│   │   └── CryptoMarket.Domain.csproj    ✅ Created
│   │
│   ├── CryptoMarket.Application/         ✅ Created
│   │   ├── DTOs/                         📁 Folders ready
│   │   ├── Interfaces/                   📁 Folders ready
│   │   ├── Services/                     📁 Folders ready
│   │   ├── Validators/                   📁 Folders ready
│   │   └── CryptoMarket.Application.csproj ✅ Created
│   │
│   ├── CryptoMarket.Infrastructure/      ✅ Created
│   │   ├── Data/
│   │   │   ├── ApplicationDbContext.cs   ✅ Created
│   │   │   └── Configurations/           ✅ All 8 configurations created
│   │   ├── Repositories/                 📁 Folder ready
│   │   ├── ExternalServices/             📁 Folder ready
│   │   └── CryptoMarket.Infrastructure.csproj ✅ Created
│   │
│   └── CryptoMarket.Web/                 ✅ Created
│       ├── Controllers/                  📁 Folders ready
│       ├── Hubs/                         📁 Folder ready
│       ├── Middleware/                   📁 Folder ready
│       ├── Program.cs                    ✅ Created with full configuration
│       ├── appsettings.json              ✅ Created
│       ├── appsettings.Development.json  ✅ Created
│       └── CryptoMarket.Web.csproj       ✅ Created
│
├── CryptoMarket.sln                      ✅ Created
└── docs/
    ├── PROJECT-IDEA.md                   ✅ Created
    ├── ARCHITECTURE.md                   ✅ Created
    ├── API-ENDPOINTS.md                  ✅ Created
    └── BACKEND-SETUP.md                  ✅ This file
```

---

## Setup Instructions

### Step 1: Install .NET SDK

If not already installed:

```bash
# Check if .NET 8 is installed
dotnet --version

# If not installed, download from:
# https://dotnet.microsoft.com/download/dotnet/8.0
```

### Step 2: Restore NuGet Packages

Navigate to the solution directory and restore packages:

```bash
cd /path/to/CryptoMarket

# Restore all project dependencies
dotnet restore
```

### Step 3: Configure Database Connection String

#### Option A: Using SQL Server LocalDB (Default)
The project is pre-configured for LocalDB. No changes needed.

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=CryptoMarketDb;Trusted_Connection=true;MultipleActiveResultSets=true"
}
```

#### Option B: Using SQL Server Express
Edit `src/CryptoMarket.Web/appsettings.Development.json`:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost\\SQLEXPRESS;Database=CryptoMarketDb;Trusted_Connection=true;MultipleActiveResultSets=true"
}
```

#### Option C: Using Docker SQL Server
Edit `src/CryptoMarket.Web/appsettings.Development.json`:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost,1433;Database=CryptoMarketDb;User Id=sa;Password=YourStrong@Passw0rd;TrustServerCertificate=True"
}
```

### Step 4: Configure JWT Secret Key

**IMPORTANT**: Change the JWT secret key before running!

#### For Development:
Edit `src/CryptoMarket.Web/appsettings.Development.json`:

```json
"JwtSettings": {
  "SecretKey": "your-development-secret-key-must-be-at-least-32-characters-long",
  ...
}
```

#### For Production:
Use environment variables or Azure Key Vault:

```bash
# Windows
set JwtSettings__SecretKey=your-production-secret-key

# Linux/macOS
export JwtSettings__SecretKey=your-production-secret-key
```

### Step 5: Create Database Migration

Navigate to the Web project directory and create initial migration:

```bash
cd src/CryptoMarket.Web

# Create migration
dotnet ef migrations add InitialCreate --project ../CryptoMarket.Infrastructure --startup-project . --context ApplicationDbContext

# Apply migration to database
dotnet ef database update --project ../CryptoMarket.Infrastructure --startup-project . --context ApplicationDbContext
```

### Step 6: Build the Solution

```bash
cd ../..  # Back to solution root

# Build entire solution
dotnet build

# Expected output: Build succeeded. 0 Warning(s). 0 Error(s).
```

### Step 7: Run the Application

```bash
cd src/CryptoMarket.Web

# Run in development mode
dotnet run

# Or with watch (auto-reload on code changes)
dotnet watch run
```

**Expected Output:**
```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: https://localhost:7001
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5000
info: Microsoft.Hosting.Lifetime[0]
      Application started. Press Ctrl+C to shut down.
```

### Step 8: Verify Application is Running

Open browser and navigate to:
- **HTTPS**: https://localhost:7001
- **HTTP**: http://localhost:5000

You should see the default ASP.NET Core page or API response.

---

## Configuration Keys Reference

### Required Configuration Keys

#### Connection Strings
| Key | Description | Example |
|-----|-------------|---------|
| `ConnectionStrings:DefaultConnection` | SQL Server connection string | See examples above |

#### JWT Settings
| Key | Description | Required |
|-----|-------------|----------|
| `JwtSettings:SecretKey` | Secret key for JWT signing (min 32 chars) | ✅ Yes |
| `JwtSettings:Issuer` | Token issuer name | ✅ Yes |
| `JwtSettings:Audience` | Token audience | ✅ Yes |
| `JwtSettings:AccessTokenExpirationMinutes` | Access token lifetime | ✅ Yes |
| `JwtSettings:RefreshTokenExpirationDays` | Refresh token lifetime | ✅ Yes |

#### CORS Settings
| Key | Description | Default |
|-----|-------------|---------|
| `Cors:AllowedOrigins` | Array of allowed frontend origins | localhost:3000, localhost:5173 |

#### Rate Limiting
| Key | Description | Default |
|-----|-------------|---------|
| `IpRateLimiting:EnableEndpointRateLimiting` | Enable rate limiting | true |
| `IpRateLimiting:GeneralRules[0]:Period` | Time period | 1m |
| `IpRateLimiting:GeneralRules[0]:Limit` | Request limit per period | 100 |

#### External APIs
| Key | Description | Default |
|-----|-------------|---------|
| `CoinGecko:BaseUrl` | CoinGecko API base URL | https://api.coingecko.com/api/v3/ |
| `CoinGecko:CacheDurationSeconds` | Cache duration for API responses | 30 |

---

## Environment Variables

For production or sensitive configuration, use environment variables:

### Windows (PowerShell)
```powershell
$env:ConnectionStrings__DefaultConnection="Server=prod-server;Database=CryptoMarketDb;..."
$env:JwtSettings__SecretKey="your-production-secret-key-min-32-chars"
```

### Linux/macOS (Bash)
```bash
export ConnectionStrings__DefaultConnection="Server=prod-server;Database=CryptoMarketDb;..."
export JwtSettings__SecretKey="your-production-secret-key-min-32-chars"
```

### Docker
```dockerfile
ENV ConnectionStrings__DefaultConnection="Server=db;Database=CryptoMarketDb;..."
ENV JwtSettings__SecretKey="your-secret-key"
```

### Azure App Service
Configure in Azure Portal under Configuration → Application Settings

---

## Common Issues & Solutions

### Issue: .NET SDK Not Found

**Error**: `dotnet: command not found` or `The command could not be loaded`

**Solution**:
1. Install .NET 8.0 SDK from https://dotnet.microsoft.com/download
2. Restart terminal/IDE
3. Verify: `dotnet --version`

---

### Issue: SQL Server Connection Failed

**Error**: `A network-related or instance-specific error occurred`

**Solutions**:

1. **Check SQL Server is running**:
   ```bash
   # Windows Services
   services.msc
   # Look for "SQL Server (SQLEXPRESS)" or "SQL Server (MSSQLSERVER)"
   ```

2. **Test LocalDB**:
   ```bash
   sqllocaldb info
   sqllocaldb start mssqllocaldb
   ```

3. **Use InMemory Database (Temporary)**:
   Edit `Program.cs`:
   ```csharp
   builder.Services.AddDbContext<ApplicationDbContext>(options =>
       options.UseInMemoryDatabase("CryptoMarketDb"));
   ```

---

### Issue: Migration Failed

**Error**: `Build failed` or `No DbContext was found`

**Solution**:
```bash
# Ensure you're in the Web project directory
cd src/CryptoMarket.Web

# Clean and rebuild
dotnet clean
dotnet build

# Try migration again with verbose logging
dotnet ef migrations add InitialCreate --project ../CryptoMarket.Infrastructure --startup-project . --context ApplicationDbContext --verbose
```

---

### Issue: JWT Authentication Not Working

**Error**: `401 Unauthorized` on protected endpoints

**Solutions**:

1. **Check Secret Key Length**: Must be at least 32 characters
2. **Verify Token in Request**: Include `Authorization: Bearer <token>` header
3. **Check Token Expiration**: Access tokens expire in 15 minutes (dev: 60 minutes)
4. **Review Logs**: Check `logs/cryptomarket-*.log` for authentication errors

---

### Issue: Port Already in Use

**Error**: `Failed to bind to address https://localhost:7001`

**Solution**:
```bash
# Find process using port 7001
# Windows:
netstat -ano | findstr :7001
taskkill /PID <pid> /F

# Linux/macOS:
lsof -ti:7001 | xargs kill -9

# Or change port in launchSettings.json
```

---

### Issue: CORS Errors in Browser

**Error**: `Access to XMLHttpRequest has been blocked by CORS policy`

**Solution**:
1. Add your frontend URL to `appsettings.json` → `Cors:AllowedOrigins`
2. Ensure `app.UseCors("AllowFrontend")` is before `app.UseAuthorization()` in `Program.cs`
3. Clear browser cache and retry

---

## Development Workflow

### Database Migrations

```bash
# Create new migration
dotnet ef migrations add <MigrationName> --project ../CryptoMarket.Infrastructure --startup-project .

# Apply migrations
dotnet ef database update --project ../CryptoMarket.Infrastructure --startup-project .

# Revert last migration
dotnet ef database update <PreviousMigrationName> --project ../CryptoMarket.Infrastructure --startup-project .

# Remove last migration (if not applied)
dotnet ef migrations remove --project ../CryptoMarket.Infrastructure --startup-project .

# Generate SQL script
dotnet ef migrations script --project ../CryptoMarket.Infrastructure --startup-project . --output migration.sql
```

### Hot Reload

```bash
cd src/CryptoMarket.Web

# Run with hot reload
dotnet watch run

# Now changes to .cs files will auto-reload the app
```

### Testing

```bash
# Run all tests
dotnet test

# Run with coverage
dotnet test /p:CollectCoverage=true

# Run specific test project
dotnet test tests/CryptoMarket.UnitTests
```

---

## Next Steps

### Immediate Tasks
1. ✅ Verify application builds: `dotnet build`
2. ✅ Verify application runs: `dotnet run`
3. ⏳ Create initial database migration
4. ⏳ Test database connection
5. ⏳ Implement service layer (Auth, Crypto, Portfolio, Cart)
6. ⏳ Implement repository layer
7. ⏳ Create API controllers
8. ⏳ Implement SignalR hub
9. ⏳ Add unit tests
10. ⏳ Connect frontend

### Future Enhancements
- Add Redis for distributed caching
- Implement comprehensive logging
- Add health check endpoints
- Configure CI/CD pipeline
- Add API documentation (Swagger/OpenAPI)
- Implement API versioning
- Add integration tests
- Configure Docker containerization

---

## Useful Commands Cheat Sheet

```bash
# Solution Management
dotnet new sln -n CryptoMarket                          # Create solution
dotnet sln add src/**/*.csproj                          # Add all projects to solution
dotnet restore                                          # Restore NuGet packages
dotnet build                                            # Build solution
dotnet clean                                            # Clean build outputs

# Project Management
dotnet new classlib -n ProjectName                      # Create class library
dotnet new webapi -n ProjectName                        # Create Web API project
dotnet add reference ../OtherProject/OtherProject.csproj # Add project reference
dotnet add package PackageName                          # Add NuGet package

# Running
dotnet run                                              # Run application
dotnet watch run                                        # Run with hot reload
dotnet run --launch-profile "Production"                # Run with specific profile

# Entity Framework
dotnet ef migrations add MigrationName                  # Create migration
dotnet ef database update                               # Apply migrations
dotnet ef database drop                                 # Drop database
dotnet ef dbcontext info                                # Show DbContext info
dotnet ef dbcontext scaffold                            # Scaffold from existing DB

# Testing
dotnet test                                             # Run all tests
dotnet test --filter "FullyQualifiedName~UnitTest"      # Run specific tests
dotnet test --logger "console;verbosity=detailed"       # Verbose test output

# Publishing
dotnet publish -c Release -o ./publish                  # Publish for deployment
dotnet publish -c Release -r win-x64 --self-contained   # Self-contained Windows
dotnet publish -c Release -r linux-x64 --self-contained # Self-contained Linux
```

---

## Support & Resources

### Documentation
- **ASP.NET Core**: https://docs.microsoft.com/aspnet/core
- **Entity Framework Core**: https://docs.microsoft.com/ef/core
- **SignalR**: https://docs.microsoft.com/aspnet/core/signalr

### Troubleshooting
1. Check logs in `logs/` directory
2. Review console output for errors
3. Verify configuration in `appsettings.json`
4. Check database connection with SQL Server Management Studio
5. Review GitHub Issues for similar problems

---

## Security Checklist

Before deploying to production:

- [ ] Change JWT secret key to a strong, random value
- [ ] Store secrets in environment variables or Azure Key Vault
- [ ] Enable HTTPS (RequireHttpsMetadata = true)
- [ ] Configure CORS to allow only specific origins
- [ ] Enable rate limiting
- [ ] Review and configure security headers
- [ ] Set up proper logging and monitoring
- [ ] Use parameterized queries (EF Core handles this)
- [ ] Validate all user input
- [ ] Implement proper error handling (don't leak sensitive info)
- [ ] Keep NuGet packages updated
- [ ] Configure SQL Server firewall rules
- [ ] Use strong database passwords
- [ ] Enable SQL Server encryption

---

**Last Updated**: 2025-12-01
**Version**: 1.0
**Status**: ✅ Initial setup complete, ready for service implementation
