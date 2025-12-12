# CryptoMarket - Quick Start Guide

Get the application running in **5 minutes**! ⚡

---

## 🎯 Fastest Way to Test

### Step 1: Initialize (One-Time Setup)

Choose your platform:

**Windows PowerShell:**
```powershell
cd C:\AI-Projects\claude-program-comparison
.\scripts\init-all.ps1
```

**Linux/macOS/WSL:**
```bash
cd /mnt/c/AI-Projects/claude-program-comparison
./scripts/init-all.sh
```

This will:
- ✓ Check prerequisites (.NET SDK, Node.js)
- ✓ Install all dependencies
- ✓ Set up the database
- ✓ Configure environment variables

**Time:** ~2-3 minutes

---

### Step 2: Start the Application

**Windows PowerShell:**
```powershell
.\scripts\start-all.ps1
```

**Linux/macOS/WSL:**
```bash
./scripts/start-all.sh
```

This will:
- ✓ Start backend server (https://localhost:7001)
- ✓ Start frontend server (http://localhost:5173)
- ✓ Open browser automatically (Windows only)

**Time:** ~30 seconds

---

### Step 3: Test the Application

The browser will open automatically to `http://localhost:5173`

**Try these features:**

1. **Register an account** (password requires: 8+ chars, uppercase, lowercase, digit, special char)
2. **View real-time crypto prices** on the dashboard
3. **Add cryptos to cart** and checkout
4. **View your portfolio** with profit/loss calculations
5. **Compare cryptocurrencies** side-by-side
6. **Set price alerts** for your favorite cryptos
7. **Toggle dark mode** with the button in header

---

## 🔧 Prerequisites

If initialization fails, install these first:

1. **.NET 8.0 SDK** - [Download](https://dotnet.microsoft.com/download/dotnet/8.0)
2. **Node.js 18+** - [Download](https://nodejs.org/)
3. **SQL Server LocalDB** (usually included with Visual Studio)
   - Or SQL Server Express - [Download](https://www.microsoft.com/sql-server/sql-server-downloads)

---

## 📝 Manual Setup (If Scripts Fail)

### Backend Setup

```bash
# Restore packages
cd src/CryptoMarket.Web
dotnet restore

# Build
dotnet build

# Create database
dotnet ef database update --project ../CryptoMarket.Infrastructure/CryptoMarket.Infrastructure.csproj

# Run
dotnet run
```

### Frontend Setup

```bash
# Install packages
cd client
npm install

# Create .env file
echo "VITE_API_BASE_URL=https://localhost:7001
VITE_SIGNALR_HUB_URL=https://localhost:7001/hubs/prices
VITE_APP_ENV=development" > .env

# Run
npm run dev
```

---

## 🚨 Common Issues

### "dotnet: command not found"

**Solution:** Install .NET 8.0 SDK from [dotnet.microsoft.com](https://dotnet.microsoft.com/download/dotnet/8.0)

**On WSL:**
```bash
wget https://dot.net/v1/dotnet-install.sh
chmod +x dotnet-install.sh
./dotnet-install.sh --channel 8.0
export PATH="$PATH:$HOME/.dotnet"
```

### Database Connection Error

**Issue:** Cannot connect to SQL Server

**Solutions:**
1. Install SQL Server Express or LocalDB
2. Start SQL Server service
3. Update connection string in `src/CryptoMarket.Web/appsettings.Development.json`

### Port Already in Use

**Backend (7001):**
```bash
# Windows
netstat -ano | findstr :7001
taskkill /PID <process_id> /F

# Linux/macOS
lsof -ti:7001 | xargs kill -9
```

**Frontend (5173):**
```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID <process_id> /F

# Linux/macOS
lsof -ti:5173 | xargs kill -9
```

### CORS Errors

Ensure backend is running on `https://localhost:7001` and frontend `.env` has correct URL.

---

## 📚 Next Steps

After testing the application:

1. **Read the Documentation:** See `/docs` folder
2. **Review API Endpoints:** `docs/API-ENDPOINTS.md`
3. **Understand Architecture:** `docs/ARCHITECTURE.md`
4. **Check Test Coverage:**
   - Backend: `cd tests/CryptoMarket.Tests && dotnet test`
   - Frontend: `cd client && npm run test:e2e`

---

## 🎓 Test Accounts

No pre-configured accounts - register your own!

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one digit
- At least one special character (@$!%*?&#)

**Example:** `Test123!`

---

## 📊 Available API Endpoints

Once backend is running, test these:

```bash
# Get crypto markets
curl https://localhost:7001/api/crypto/markets

# Get specific crypto
curl https://localhost:7001/api/crypto/bitcoin

# Register user
curl -X POST https://localhost:7001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","firstName":"John","lastName":"Doe"}'

# Login
curl -X POST https://localhost:7001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

See `docs/API-ENDPOINTS.md` for complete reference.

---

## 🔍 Verify Everything is Working

### Backend Health Checks

1. **API is responding:**
   - Open: https://localhost:7001/api/crypto/markets
   - Should return JSON array of cryptocurrencies

2. **SignalR Hub is running:**
   - Check backend console for "PriceUpdateJob is starting"
   - Should see price updates every 30 seconds

3. **Database is connected:**
   - Backend starts without errors
   - No connection exceptions in logs

### Frontend Health Checks

1. **Application loads:**
   - Open: http://localhost:5173
   - Should see login/register page

2. **Real-time updates work:**
   - Login and view dashboard
   - Prices should flash green/red when updating

3. **Dark mode works:**
   - Toggle theme button in header
   - Theme should switch smoothly

---

## 📞 Need Help?

- **Script Issues:** See `scripts/README.md`
- **Setup Issues:** See main `README.md`
- **Feature Questions:** See `docs/PROJECT-IDEA.md`
- **API Reference:** See `docs/API-ENDPOINTS.md`
- **Development History:** See `PROGRESS_LOG.md`

---

**Estimated Total Time:** 5-10 minutes from zero to running application ⚡

**Happy Testing! 🚀**
