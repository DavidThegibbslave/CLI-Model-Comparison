# Crypto Market Project - Windows Start Script
# Usage: Right-click > Run with PowerShell

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   Crypto Market Web Application - Start Script   " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# ------------------------------------------------------------------
# 1. Prerequisite Checks
# ------------------------------------------------------------------
Write-Host "`n[1/4] Checking prerequisites..." -ForegroundColor Yellow

# WORKAROUND: Disable MSBuild workload resolver to fix System.Text.Json conflicts on some Windows environments
$env:MSBuildEnableWorkloadResolver = "false"

# Clean up potential VS vs CLI conflicts
$env:MSBuildSDKsPath = $null
$env:MSBUILD_EXE_PATH = $null

if (-not (Get-Command "dotnet" -ErrorAction SilentlyContinue)) {
    Write-Error "Error: .NET SDK is not installed or not in PATH."
    Write-Host "Please install it from: https://dotnet.microsoft.com/download"
    exit 1
}

# Force using the specific dotnet executable found on path to avoid alias issues
$DotNetExe = (Get-Command "dotnet").Source
Write-Host "Using dotnet executable at: $DotNetExe" -ForegroundColor Gray
& $DotNetExe --info

if (-not (Get-Command "npm" -ErrorAction SilentlyContinue)) {
    Write-Error "Error: npm (Node.js) is not installed or not in PATH."
    Write-Host "Please install it from: https://nodejs.org/"
    exit 1
}

# Docker check removed as we are using InMemory DB now.

# ------------------------------------------------------------------
# 2. Backend Setup
# ------------------------------------------------------------------
Write-Host "`n[2/4] Setting up Backend (ASP.NET Core)..." -ForegroundColor Yellow

$BackendDir = Join-Path $PSScriptRoot "src\CryptoMarket.Web"

if (-not (Test-Path $BackendDir)) {
    Write-Error "Error: Backend directory not found at $BackendDir"
    exit 1
}

Push-Location $BackendDir

Write-Host "Cleaning previous builds..."
& $DotNetExe clean

Write-Host "Restoring NuGet packages..."
& $DotNetExe restore

# Database update removed (InMemory DB used)

Pop-Location

# ------------------------------------------------------------------
# 3. Frontend Setup
# ------------------------------------------------------------------
Write-Host "`n[3/4] Setting up Frontend (React/Vite)..." -ForegroundColor Yellow

$FrontendDir = Join-Path $PSScriptRoot "src\client"

if (-not (Test-Path $FrontendDir)) {
    Write-Error "Error: Frontend directory not found at $FrontendDir"
    exit 1
}

Push-Location $FrontendDir

# Force install to ensure binaries like 'vite' are linked correctly
Write-Host "Ensuring npm dependencies are installed..."
npm install

Pop-Location

# ------------------------------------------------------------------
# 4. Start Services
# ------------------------------------------------------------------
Write-Host "`n[4/4] Starting Services..." -ForegroundColor Yellow

# Start Backend
# Using http://localhost:5000 because we disabled https redirection
$BackendProcess = Start-Process -FilePath $DotNetExe -ArgumentList "run --urls=http://localhost:5000" -WorkingDirectory $BackendDir -NoNewWindow -PassThru
Write-Host "Backend starting (PID: $($BackendProcess.Id))..." -ForegroundColor Green

# Wait a bit
Start-Sleep -Seconds 5

# Start Frontend
# Note: On Windows, 'npm' is often a cmd script, so we use 'npm.cmd' if 'npm' fails, or rely on shell execution.
try {
    $FrontendProcess = Start-Process -FilePath "npm" -ArgumentList "run dev -- --port 5173" -WorkingDirectory $FrontendDir -NoNewWindow -PassThru
} catch {
    # Fallback for some Windows environments where npm is not a direct executable
    $FrontendProcess = Start-Process -FilePath "cmd" -ArgumentList "/c npm run dev -- --port 5173" -WorkingDirectory $FrontendDir -NoNewWindow -PassThru
}
Write-Host "Frontend starting (PID: $($FrontendProcess.Id))..." -ForegroundColor Green

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "   PROJECT RUNNING" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Backend API:   http://localhost:5000" -ForegroundColor Green
Write-Host "Frontend App:  http://localhost:5173" -ForegroundColor Green
Write-Host "Press Enter to stop all servers..." -ForegroundColor Yellow

Read-Host

# Cleanup
Stop-Process -Id $BackendProcess.Id -ErrorAction SilentlyContinue
Stop-Process -Id $FrontendProcess.Id -ErrorAction SilentlyContinue
Write-Host "Stopped."
