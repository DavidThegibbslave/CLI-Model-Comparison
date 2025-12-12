# Testing Instructions for CryptoMarket

## How to Test the Application

Follow these steps to verify everything works:

---

## Step 1: Run the Master Script

**On Windows (PowerShell):**
```powershell
cd C:\AI-Projects\claude-program-comparison
.\run.ps1
```

**On Linux/macOS:**
```bash
cd /mnt/c/AI-Projects/claude-program-comparison
./run.sh
```

**Expected:** Script starts, checks prerequisites, initializes (first run), and starts servers.

---

## Step 2: Verify Prerequisites Check

You should see:
```
[1/4] Checking Prerequisites...
✓ .NET SDK found: 8.0.x
✓ Node.js found: v18.x.x
✓ npm found: 9.x.x
```

**If you see errors:** Install missing prerequisites (see START-HERE.md)

---

## Step 3: Verify Initialization (First Run Only)

On first run, you'll see:
```
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
```

**Expected time:** 2-3 minutes

**On subsequent runs:** Should show "✓ Already initialized" (much faster)

---

## Step 4: Verify Servers Start

You should see:
```
[3/4] Starting Servers...
→ Starting backend in new window...
→ Starting frontend in new window...
✓ Server windows opened
```

**Windows:** Two PowerShell windows should open
**Linux/macOS:** Should see tmux or screen message

---

## Step 5: Verify Connection

The script will wait for servers:
```
[4/4] Waiting for servers to start...
→ Waiting for backend.........
✓ Backend ready!
→ Waiting for frontend......
✓ Frontend ready!
```

**Expected:** Both show "ready" within 30 seconds

---

## Step 6: Browser Opens Automatically

```
==========================================
   ✓ CryptoMarket is Running!
==========================================

Frontend: http://localhost:5173
Backend:  https://localhost:7001

Opening browser...
```

**Expected:** Browser opens to `http://localhost:5173`

---

## Step 7: Test the Website

### 7.1 Login Page Loads
- [ ] ✅ Page loads without errors
- [ ] ✅ See "CryptoMarket" header
- [ ] ✅ See login form with email/password fields
- [ ] ✅ See "Register" button

### 7.2 Register New Account
- [ ] ✅ Click "Register"
- [ ] ✅ Fill in:
  - Email: test@example.com
  - Password: Test123!
  - First Name: John
  - Last Name: Doe
- [ ] ✅ Click "Register" button
- [ ] ✅ See success message
- [ ] ✅ Redirected to login

### 7.3 Login
- [ ] ✅ Enter email: test@example.com
- [ ] ✅ Enter password: Test123!
- [ ] ✅ Click "Login"
- [ ] ✅ Redirected to dashboard

### 7.4 Dashboard Features
- [ ] ✅ See list of cryptocurrencies
- [ ] ✅ See prices (Bitcoin, Ethereum, etc.)
- [ ] ✅ Wait 30 seconds - prices should flash green/red (real-time updates)
- [ ] ✅ Can sort by clicking column headers
- [ ] ✅ Can search for specific crypto

### 7.5 Compare Feature
- [ ] ✅ Click "Compare" in navigation
- [ ] ✅ Select 2-3 cryptocurrencies
- [ ] ✅ See comparison table
- [ ] ✅ See comparison chart with multiple lines

### 7.6 Store Feature
- [ ] ✅ Click "Store" in navigation
- [ ] ✅ See cryptocurrency products
- [ ] ✅ Click "Add to Cart" on Bitcoin
- [ ] ✅ See cart icon update with item count
- [ ] ✅ Click cart icon
- [ ] ✅ See Bitcoin in cart
- [ ] ✅ Click "Checkout"
- [ ] ✅ See success message
- [ ] ✅ Cart is now empty

### 7.7 Portfolio Feature
- [ ] ✅ Click "Portfolio" in navigation
- [ ] ✅ See your Bitcoin holding from checkout
- [ ] ✅ See current value
- [ ] ✅ See profit/loss calculation
- [ ] ✅ See pie chart of holdings

### 7.8 Dark Mode
- [ ] ✅ Click theme toggle button in header
- [ ] ✅ Page switches to dark mode
- [ ] ✅ All text remains readable
- [ ] ✅ Click again to switch back to light mode

### 7.9 Mobile Responsiveness (Optional)
- [ ] ✅ Open browser dev tools (F12)
- [ ] ✅ Toggle device toolbar (mobile view)
- [ ] ✅ Verify layout adapts to mobile size
- [ ] ✅ All features still accessible

---

## Step 8: Test Backend API Directly

Open a new terminal and test API endpoints:

### Test 1: Get Crypto Markets
```bash
curl https://localhost:7001/api/crypto/markets
```
**Expected:** JSON array of cryptocurrencies

### Test 2: Get Specific Crypto
```bash
curl https://localhost:7001/api/crypto/bitcoin
```
**Expected:** JSON object with Bitcoin details

### Test 3: Register API
```bash
curl -X POST https://localhost:7001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"api-test@example.com","password":"Test123!","firstName":"API","lastName":"Test"}'
```
**Expected:** 201 status, user created

### Test 4: Login API
```bash
curl -X POST https://localhost:7001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"api-test@example.com","password":"Test123!"}'
```
**Expected:** 200 status, JWT tokens returned

---

## Step 9: Verify Real-Time Updates

1. Keep dashboard open
2. Wait 30 seconds
3. Watch prices - they should flash green (price up) or red (price down)

**Expected:** Prices update every 30 seconds via SignalR WebSocket

---

## Step 10: Check Server Logs

### Windows
Look at the two PowerShell windows:
- **Backend window:** Should show API requests, SignalR connections, database queries
- **Frontend window:** Should show Vite dev server running

### Linux/macOS (tmux)
```bash
# View backend logs
tmux attach -t cryptomarket
# Press Ctrl+B then 0

# View frontend logs
# Press Ctrl+B then 1

# Detach
# Press Ctrl+B then D
```

**Expected:** No error messages, only informational logs

---

## Success Criteria ✅

All must pass:

- [x] ✅ Script runs without errors
- [x] ✅ Prerequisites detected correctly
- [x] ✅ Initialization completes (first run)
- [x] ✅ Backend starts on https://localhost:7001
- [x] ✅ Frontend starts on http://localhost:5173
- [x] ✅ Browser opens automatically
- [x] ✅ Website loads successfully
- [x] ✅ Can register new account
- [x] ✅ Can login
- [x] ✅ Dashboard shows crypto prices
- [x] ✅ Real-time updates work (prices flash)
- [x] ✅ Can add to cart and checkout
- [x] ✅ Portfolio shows holdings
- [x] ✅ Dark mode works
- [x] ✅ API endpoints respond correctly

---

## Common Issues & Solutions

### Issue 1: Script Permission Denied (Windows)
**Error:** "run.ps1 cannot be loaded"
**Solution:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Issue 2: .NET SDK Not Found
**Error:** "✗ .NET SDK not found!"
**Solution:** Install from https://dotnet.microsoft.com/download/dotnet/8.0

### Issue 3: Database Connection Failed
**Error:** "Cannot connect to database"
**Solution:**
1. Install SQL Server LocalDB (included with Visual Studio)
2. Or install SQL Server Express
3. Or update connection string in `src/CryptoMarket.Web/appsettings.Development.json`

### Issue 4: Port Already in Use
**Error:** "Backend already running"
**Solution:** Kill existing processes:
```bash
# Windows
netstat -ano | findstr :7001
taskkill /PID <id> /F

# Linux/macOS
lsof -ti:7001 | xargs kill -9
```

### Issue 5: Frontend Can't Connect
**Error:** Network errors in browser console
**Solution:** Verify backend is running, check `.env` file has correct URL

### Issue 6: No Real-Time Updates
**Error:** Prices don't update
**Solution:**
1. Check browser console for SignalR errors
2. Verify backend console shows "PriceUpdateJob" running
3. Wait 30 seconds for first update

---

## Performance Benchmarks

**First Run (With Initialization):**
- Prerequisites check: 5 seconds
- Backend build: 60-90 seconds
- Database setup: 15-30 seconds
- Frontend install: 60-120 seconds
- Server startup: 20-30 seconds
- **Total: 3-5 minutes**

**Subsequent Runs (Already Initialized):**
- Prerequisites check: 5 seconds
- Initialization check: 2 seconds
- Server startup: 20-30 seconds
- **Total: 30-40 seconds**

**Website Performance:**
- Initial page load: < 1 second
- Dashboard load: < 2 seconds
- Real-time updates: Every 30 seconds
- API response time: < 200ms

---

## Test Report Template

After testing, fill this out:

```
Date: _____________
Tester: _____________
OS: Windows / Linux / macOS
.NET Version: _____________
Node Version: _____________

Test Results:
[ ] Script runs without errors
[ ] Initialization completes (first run)
[ ] Backend starts successfully
[ ] Frontend starts successfully
[ ] Website loads in browser
[ ] Can register/login
[ ] Dashboard shows data
[ ] Real-time updates work
[ ] All features functional

Issues Found:
_____________________________________________
_____________________________________________

Notes:
_____________________________________________
_____________________________________________
```

---

## Next Steps After Successful Test

1. ✅ Explore all features thoroughly
2. ✅ Try on different browsers (Chrome, Firefox, Safari, Edge)
3. ✅ Test mobile responsiveness
4. ✅ Run automated tests: `dotnet test` and `npm run test:e2e`
5. ✅ Review code and documentation in `/docs`
6. ✅ Check PROGRESS_LOG.md for development history

---

**Good luck with testing! 🧪**
