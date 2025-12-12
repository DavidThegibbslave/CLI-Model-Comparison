# 🚀 START HERE - CryptoMarket Quick Launch

## One Command to Rule Them All!

Get the entire application running with **ONE SCRIPT**:

### Windows (PowerShell)
```powershell
.\run.ps1
```

### Linux/macOS
```bash
./run.sh
```

That's it! The script will:
- ✅ Check prerequisites
- ✅ Initialize on first run (build, database, dependencies)
- ✅ Start both backend & frontend servers
- ✅ Open your browser automatically
- ✅ Verify everything is working

---

## Prerequisites

Install these first (the script will check for you):

1. **.NET SDK 8.0** - [Download](https://dotnet.microsoft.com/download/dotnet/8.0)
2. **Node.js 18+** - [Download](https://nodejs.org/)
3. **SQL Server LocalDB** (included with Visual Studio) or [SQL Server Express](https://www.microsoft.com/sql-server/sql-server-downloads)

---

## Detailed Steps

### Step 1: Open Terminal

**Windows:**
- Press `Win + X`, select "Windows PowerShell"
- Navigate to project: `cd C:\AI-Projects\claude-program-comparison`

**Linux/macOS:**
- Open Terminal
- Navigate to project: `cd /path/to/claude-program-comparison`

### Step 2: Run the Script

**Windows:**
```powershell
.\run.ps1
```

**Linux/macOS:**
```bash
./run.sh
```

### Step 3: Wait & Enjoy! ☕

The script will:
1. Check prerequisites (~5 seconds)
2. Initialize if first time (~2-3 minutes)
3. Start servers (~30 seconds)
4. Open browser automatically

**Total time:** 3-5 minutes on first run, 30 seconds on subsequent runs.

---

## What You'll See

### First Run (Initialization)
```
==========================================
   CryptoMarket - One-Click Launcher
==========================================

[1/4] Checking Prerequisites...
✓ .NET SDK found: 8.0.100
✓ Node.js found: v18.17.0
✓ npm found: 9.6.7

[2/4] Checking Initialization Status...
⚠ Backend not built yet
⚠ Frontend dependencies not installed
⚠ Frontend .env file missing

First-time setup required. Initializing...
→ Restoring NuGet packages...
→ Building backend...
→ Setting up database...
→ Installing frontend dependencies...
→ Creating .env file...

✓ Initialization complete!

[3/4] Starting Servers...
→ Starting backend in new window...
→ Starting frontend in new window...
✓ Server windows opened

[4/4] Waiting for servers to start...
→ Waiting for backend.........
✓ Backend ready!
→ Waiting for frontend......
✓ Frontend ready!

==========================================
   ✓ CryptoMarket is Running!
==========================================

Frontend: http://localhost:5173
Backend:  https://localhost:7001
API Test: https://localhost:7001/api/crypto/markets

Opening browser...
```

### Subsequent Runs (Already Initialized)
```
==========================================
   CryptoMarket - One-Click Launcher
==========================================

[1/4] Checking Prerequisites...
✓ .NET SDK found: 8.0.100
✓ Node.js found: v18.17.0
✓ npm found: 9.6.7

[2/4] Checking Initialization Status...
✓ Already initialized

[3/4] Starting Servers...
→ Starting backend in new window...
→ Starting frontend in new window...
✓ Server windows opened

[4/4] Waiting for servers to start...
✓ Backend ready!
✓ Frontend ready!

==========================================
   ✓ CryptoMarket is Running!
==========================================

Frontend: http://localhost:5173
```

---

## Testing the Application

Once the browser opens:

### 1. Register Account
- Click "Register" button
- Fill in details
- Password needs: 8+ chars, uppercase, lowercase, digit, special character
- Example: `Test123!`

### 2. Login
- Use your email and password

### 3. Test Features
- ✅ **Dashboard** - View real-time crypto prices (updates every 30 seconds)
- ✅ **Compare** - Compare multiple cryptocurrencies side-by-side
- ✅ **Store** - Add cryptos to cart
- ✅ **Cart** - Checkout (simulated purchase)
- ✅ **Portfolio** - View your holdings with P&L
- ✅ **Alerts** - Set price alerts
- ✅ **Dark Mode** - Toggle theme in header

---

## Troubleshooting

### "Script cannot be loaded" (Windows)
**Error:** `run.ps1 cannot be loaded because running scripts is disabled`

**Solution:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### "dotnet: command not found"
**Solution:** Install .NET 8.0 SDK from https://dotnet.microsoft.com/download/dotnet/8.0

### "node: command not found"
**Solution:** Install Node.js from https://nodejs.org/

### Database Connection Error
**Solution:**
1. Install SQL Server Express or LocalDB
2. Or update connection string in `src/CryptoMarket.Web/appsettings.Development.json`

### Servers Already Running
If you see "Backend already running" or "Frontend already running", the script detected existing processes. You can:
- Close existing server windows and run again
- Or just open browser to `http://localhost:5173`

### Port Already in Use
**Kill processes on ports:**

**Windows:**
```powershell
# Backend (port 7001)
netstat -ano | findstr :7001
taskkill /PID <process_id> /F

# Frontend (port 5173)
netstat -ano | findstr :5173
taskkill /PID <process_id> /F
```

**Linux/macOS:**
```bash
# Backend (port 7001)
lsof -ti:7001 | xargs kill -9

# Frontend (port 5173)
lsof -ti:5173 | xargs kill -9
```

---

## Stopping the Application

### Windows
- Close the two PowerShell windows that opened (Backend & Frontend)

### Linux/macOS (with tmux)
```bash
tmux kill-session -t cryptomarket
```

### Linux/macOS (with screen)
```bash
screen -X -S cryptomarket-backend quit
screen -X -S cryptomarket-frontend quit
```

---

## What's Running?

When the script completes successfully:

**Backend (ASP.NET Core):**
- HTTPS: `https://localhost:7001`
- HTTP: `http://localhost:5000`
- SignalR: `wss://localhost:7001/hubs/prices`
- Test: `https://localhost:7001/api/crypto/markets`

**Frontend (React + Vite):**
- URL: `http://localhost:5173`

**Database:**
- SQL Server LocalDB: `CryptoMarketDb`

---

## Files Created on First Run

The script creates:
- `src/CryptoMarket.Infrastructure/Migrations/` - Database migrations
- `src/CryptoMarket.Web/bin/` - Compiled backend
- `client/node_modules/` - Frontend dependencies
- `client/.env` - Frontend environment variables
- Database: `CryptoMarketDb`

---

## Success Criteria ✅

After running the script, verify:

- [x] ✅ No errors in script output
- [x] ✅ Two server windows opened (Windows) or tmux session created (Linux)
- [x] ✅ Browser opens to `http://localhost:5173`
- [x] ✅ Login page visible
- [x] ✅ Can register and login
- [x] ✅ Dashboard shows crypto prices
- [x] ✅ Prices update in real-time (flash green/red)

---

## Next Steps

After successful launch:

1. **Explore the application** - Try all features
2. **Read the docs** - See `/docs` folder for detailed documentation
3. **Check tests** - Run `dotnet test` (backend) and `npm run test:e2e` (frontend)
4. **Review code** - Explore the Clean Architecture structure

---

## Quick Links

- **Main README:** [README.md](README.md)
- **Quick Start Guide:** [QUICK-START.md](QUICK-START.md)
- **API Documentation:** [docs/API-ENDPOINTS.md](docs/API-ENDPOINTS.md)
- **Architecture:** [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **Project Handover:** [docs/HANDOVER.md](docs/HANDOVER.md)

---

## Help & Support

**Common Issues:**
- Prerequisites missing → Install .NET SDK, Node.js
- Database errors → Install SQL Server LocalDB/Express
- Port conflicts → Kill existing processes

**For More Help:**
- Check [README.md](README.md) troubleshooting section
- Review [QUICK-START.md](QUICK-START.md)
- Read script output carefully - it shows exactly what failed

---

**That's it! Enjoy exploring CryptoMarket! 🚀**
