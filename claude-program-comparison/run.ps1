[CmdletBinding()]
param(
    [int]$BackendPort = 5000,
    [int]$FrontendPort = 5173
)

$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $MyInvocation.MyCommand.Definition
$BackendDir = Join-Path $Root "src\CryptoMarket.Web"
$FrontendDir = Join-Path $Root "client"
$SolutionPath = Join-Path $Root "CryptoMarket.sln"
# Set defaults if not already provided
if (-not $Env:NUGET_PACKAGES) { $Env:NUGET_PACKAGES = Join-Path $Root ".nuget\packages" }
if (-not $Env:NUGET_HTTP_TIMEOUT) { $Env:NUGET_HTTP_TIMEOUT = "30" }
if (-not $Env:NUGET_XMLDOC_MODE) { $Env:NUGET_XMLDOC_MODE = "skip" }
$Env:DOTNET_SKIP_FIRST_TIME_EXPERIENCE = "1"
$Env:DOTNET_CLI_TELEMETRY_OPTOUT = "1"
if (-not (Test-Path $Env:NUGET_PACKAGES)) { New-Item -ItemType Directory -Path $Env:NUGET_PACKAGES -Force | Out-Null }

# Force MSBuild to use the SDK-provided targets instead of any VS-installed ones
$basePathLine = (& dotnet --info | Where-Object { $_ -match 'Base Path' } | Select-Object -First 1)
if ($basePathLine) {
    $basePath = ($basePathLine -replace 'Base Path:\s*', '').Trim().TrimEnd('\','/')
    if (Test-Path $basePath) {
        $Env:MSBuildExtensionsPath = $basePath
        $Env:MSBuildExtensionsPath32 = $basePath
        $Env:MSBuildSDKsPath = Join-Path $basePath "Sdks"
        # Keep MSBuild from probing Visual Studio fallback paths that pull in desktop-only tasks
        $Env:MSBuildExtensionsPathFallbackPaths = ""
        $Env:MSBuildExtensionsPathFallbackPathsOverride = ""
    }
}
Remove-Item Env:VSINSTALLDIR, Env:VisualStudioVersion, Env:VSToolsPath, Env:MSBUILD_EXE_PATH -ErrorAction SilentlyContinue

function Write-Info($Message) { Write-Host "[INFO] $Message" -ForegroundColor Cyan }
function Write-Ok($Message) { Write-Host "[OK] $Message" -ForegroundColor Green }
function Write-Warn($Message) { Write-Host "[WARN] $Message" -ForegroundColor Yellow }
function Write-Err($Message) { Write-Host "[ERROR] $Message" -ForegroundColor Red }

function Require-Command($Name, $Hint) {
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        Write-Err "$Name is not installed. $Hint"
        exit 1
    }
    Write-Ok "$Name found."
}

function Get-FreePort {
    param(
        [int]$Start = 5173,
        [int]$End = 5205
    )
    for ($p = $Start; $p -le $End; $p++) {
        try {
            $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $p)
            $listener.Start()
            $listener.Stop()
            return $p
        } catch {
            # Port in use, try next
        }
    }
    throw "No free port found between $Start and $End."
}

Write-Info "Checking prerequisites..."
Require-Command "dotnet" "Install the .NET 8 SDK from https://dotnet.microsoft.com/download."
Require-Command "node" "Install Node.js 18+ from https://nodejs.org/."
Require-Command "npm" "Reinstall Node.js to include npm if it is missing."

# Stop any running backend dotnet processes to avoid locked bin/obj files
try {
    $dotnetProcs = Get-CimInstance Win32_Process -Filter "Name = 'dotnet.exe'" | Where-Object {
        $_.CommandLine -like "*CryptoMarket.Web*" -or $_.CommandLine -like "*CryptoMarket.sln*"
    }
    foreach ($p in $dotnetProcs) {
        Write-Warn "Stopping running backend process (PID $($p.ProcessId)) to release file locks..."
        Stop-Process -Id $p.ProcessId -Force -ErrorAction SilentlyContinue
    }
} catch {
    Write-Warn "Could not query/stop dotnet processes: $_"
}

# Ensure wwwroot exists to avoid DirectoryNotFound exceptions
$wwwrootPath = Join-Path $BackendDir "wwwroot"
if (-not (Test-Path $wwwrootPath)) {
    New-Item -ItemType Directory -Path $wwwrootPath -Force | Out-Null
}

# Ask for clean build
$cleanInput = Read-Host "Perform a clean build (delete bin/obj)? [y/N]"
$doClean = $cleanInput -match '^[Yy]'

if ($doClean) {
    Write-Info "Cleaning bin/obj folders..."
    $pathsToClean = @(
        "src\CryptoMarket.Web\bin",
        "src\CryptoMarket.Web\obj",
        "src\CryptoMarket.Application\bin",
        "src\CryptoMarket.Application\obj",
        "src\CryptoMarket.Infrastructure\bin",
        "src\CryptoMarket.Infrastructure\obj",
        "src\CryptoMarket.Domain\bin",
        "src\CryptoMarket.Domain\obj",
        "src\CryptoMarket.Tests\bin",
        "src\CryptoMarket.Tests\obj"
    )
    foreach ($p in $pathsToClean) {
        try {
            $full = Join-Path $Root $p
            if (Test-Path $full) {
                Remove-Item $full -Recurse -Force -ErrorAction SilentlyContinue
            }
        } catch {
            Write-Warn "Could not delete $p (may be locked by a running process). Close any running backend/frontend windows and retry."
        }
    }
}

Write-Info "Restoring backend packages (cached, single source)..."
dotnet restore $SolutionPath `
    --configfile (Join-Path $Root "NuGet.config") `
    --ignore-failed-sources `
    --verbosity detailed *>&1 | Tee-Object -FilePath (Join-Path $Root "restore.log")
if ($LASTEXITCODE -ne 0) { Write-Err "dotnet restore failed."; exit 1 }
Write-Ok "Backend packages restored."

Write-Info "Building backend..."
dotnet build $SolutionPath --configuration Debug --no-restore
if ($LASTEXITCODE -ne 0) { Write-Err "dotnet build failed."; exit 1 }
Write-Ok "Backend build complete."

Write-Info "Ensuring frontend dependencies..."
Push-Location $FrontendDir
$prevEAP = $ErrorActionPreference
$ErrorActionPreference = "Continue"  # prevent npm stderr warnings from halting script
if (-not (Test-Path "node_modules")) {
    npm install 2>&1 | Out-Host
    if ($LASTEXITCODE -ne 0) { $ErrorActionPreference = $prevEAP; Write-Err "npm install failed."; exit 1 }
} else {
    npm install --prefer-offline *> $null
    if ($LASTEXITCODE -ne 0) {
        npm install 2>&1 | Out-Host
        if ($LASTEXITCODE -ne 0) { $ErrorActionPreference = $prevEAP; Write-Err "npm install failed."; exit 1 }
    }
}
$ErrorActionPreference = $prevEAP

$EnvPath = Join-Path $FrontendDir ".env"
if (-not (Test-Path $EnvPath)) {
    @"
VITE_API_BASE_URL=http://localhost:$BackendPort
VITE_SIGNALR_HUB_URL=http://localhost:$BackendPort/hubs/prices
VITE_APP_ENV=development
"@ | Set-Content $EnvPath
    Write-Ok "Created default .env file at $EnvPath"
} else {
    Write-Warn ".env already exists. Leaving it unchanged."
}
Pop-Location

# Pick a free frontend port (default 5173; search next 20 ports)
$preferredFrontend = $FrontendPort
try {
    $availableFrontend = Get-FreePort -Start $preferredFrontend -End ($preferredFrontend + 20)
    if ($availableFrontend -ne $preferredFrontend) {
        Write-Warn "Port $preferredFrontend is busy; using $availableFrontend instead."
    }
    $FrontendPort = $availableFrontend
} catch {
    Write-Err $_
    exit 1
}

Write-Info "Starting backend on port $BackendPort..."
$backendCommand = "& { Set-Location '$BackendDir'; `$env:ASPNETCORE_ENVIRONMENT='Development'; `$env:ASPNETCORE_URLS='http://localhost:$BackendPort'; dotnet run --no-build --urls 'http://localhost:$BackendPort' }"
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", $backendCommand -WindowStyle Normal

Write-Info "Starting frontend on port $FrontendPort..."
$frontendCommand = "& { Set-Location '$FrontendDir'; npm run dev -- --port $FrontendPort --host localhost --strictPort }"
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", $frontendCommand -WindowStyle Normal

Write-Ok "Backend:  http://localhost:$BackendPort"
Write-Ok "Frontend: http://localhost:$FrontendPort"
Write-Info "Two PowerShell windows were opened. Close them to stop the servers."
