# NuGet Restore Issues - Fixed!

## Problem

You experienced `dotnet restore` hanging, timing out, or taking too long (5+ minutes).

## Root Causes

1. **Multiple NuGet sources** - dotnet queries all configured sources, some may be slow
2. **Corrupted cache** - Old cached packages cause conflicts
3. **Network issues** - Slow connection to NuGet servers
4. **Large packages** - Some packages are very large and take time to download

## Solutions Implemented

### 1. Optimized NuGet Configuration

The scripts now create an optimized `NuGet.config` file that:
- Uses ONLY nuget.org (fastest, most reliable)
- Sets local package folder (faster access)
- Clears other slow sources

### 2. Project-by-Project Restore

Instead of restoring the entire solution at once, the script now:
- Restores each project individually
- Shows progress for each project
- Fails fast if one project has issues
- Provides clear error messages

### 3. Diagnostic Script

Run this if you still have issues:

**Windows:**
```powershell
.\fix-nuget.ps1
```

**Linux/macOS:**
```bash
./fix-nuget.sh
```

This script will:
1. Check your NuGet sources
2. Clear all NuGet caches
3. Create optimized config
4. Test restore with timeout
5. Verify packages downloaded

## Manual Fix Steps

If automation doesn't work, try these manual steps:

### Step 1: Clear NuGet Cache
```bash
dotnet nuget locals all --clear
```

### Step 2: Create NuGet.config

Create `NuGet.config` in project root:
```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <packageSources>
    <clear />
    <add key="nuget.org" value="https://api.nuget.org/v3/index.json" protocolVersion="3" />
  </packageSources>
  <config>
    <add key="globalPackagesFolder" value=".nuget/packages" />
  </config>
</configuration>
```

### Step 3: Restore Each Project

```powershell
# Windows
dotnet restore src\CryptoMarket.Domain\CryptoMarket.Domain.csproj
dotnet restore src\CryptoMarket.Application\CryptoMarket.Application.csproj
dotnet restore src\CryptoMarket.Infrastructure\CryptoMarket.Infrastructure.csproj
dotnet restore src\CryptoMarket.Web\CryptoMarket.Web.csproj
```

```bash
# Linux/macOS
dotnet restore src/CryptoMarket.Domain/CryptoMarket.Domain.csproj
dotnet restore src/CryptoMarket.Application/CryptoMarket.Application.csproj
dotnet restore src/CryptoMarket.Infrastructure/CryptoMarket.Infrastructure.csproj
dotnet restore src/CryptoMarket.Web/CryptoMarket.Web.csproj
```

### Step 4: Build
```bash
dotnet build --no-restore
```

## Updated run.ps1 / run.sh

The main scripts now:
- ✅ Create optimized NuGet.config automatically
- ✅ Restore project-by-project with progress
- ✅ Use `--no-restore` flag for build (faster)
- ✅ Show clear error messages if restore fails
- ✅ Provide troubleshooting steps

## Expected Timings

**First Run (with good internet):**
- NuGet restore: 1-3 minutes (all 4 projects)
- Backend build: 1-2 minutes
- Frontend npm install: 2-3 minutes
- **Total: 4-8 minutes**

**Subsequent Runs:**
- No restore needed
- Build: 30 seconds
- Start servers: 30 seconds
- **Total: ~1 minute**

## Troubleshooting

### Still Timing Out?

1. **Check internet connection**
   ```bash
   ping api.nuget.org
   ```

2. **Test NuGet directly**
   ```bash
   curl https://api.nuget.org/v3/index.json
   ```

3. **Use VPN** if on corporate/restricted network

4. **Try different time** - NuGet servers may be slow during peak hours

### Restore Shows Errors?

Run with verbose output to see what's happening:
```bash
dotnet restore --verbosity detailed
```

Look for:
- Network errors (timeout, connection refused)
- Package not found errors
- Authentication issues

### Packages Take Forever to Download?

Some packages are large:
- EntityFrameworkCore (~50MB)
- AspNetCore (~100MB)
- SignalR (~20MB)

On slow connections (< 5 Mbps), this can take 5-10 minutes.

## Quick Test

Test if NuGet is working:
```bash
# Create test project
mkdir test-nuget && cd test-nuget
dotnet new console
dotnet add package Newtonsoft.Json
dotnet restore
```

If this works quickly (< 30 seconds), the problem is project-specific.
If this also hangs, the problem is your NuGet setup or network.

## Contact Points

If issues persist:
1. Run `.\fix-nuget.ps1` and share the output
2. Check firewall/antivirus blocking nuget.org
3. Try from a different network
4. Check NuGet server status: https://status.nuget.org/

## Summary

**Problem:** `dotnet restore` hanging or slow
**Solution:**
- ✅ Optimized NuGet.config (only nuget.org)
- ✅ Project-by-project restore
- ✅ Clear progress indicators
- ✅ Diagnostic script available

**Now run:**
```bash
.\run.ps1    # Windows
./run.sh     # Linux/macOS
```

And it should work much faster!
