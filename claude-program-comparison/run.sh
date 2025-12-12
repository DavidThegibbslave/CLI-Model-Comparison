#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RUN_LOG="$ROOT_DIR/run.log"
: >"$RUN_LOG"
# Mirror all output (stdout+stderr) to run.log for debugging
exec > >(tee -a "$RUN_LOG") 2>&1

BACKEND_DIR="$ROOT_DIR/src/CryptoMarket.Web"
FRONTEND_DIR="$ROOT_DIR/client"
BACKEND_PORT="${BACKEND_PORT:-5000}"
FRONTEND_PORT="${FRONTEND_PORT:-5173}"
export NUGET_PACKAGES="${NUGET_PACKAGES:-$ROOT_DIR/.nuget/packages}"
export NUGET_HTTP_TIMEOUT="${NUGET_HTTP_TIMEOUT:-30}"
export NUGET_XMLDOC_MODE="${NUGET_XMLDOC_MODE:-skip}"
export DOTNET_SKIP_FIRST_TIME_EXPERIENCE=1
export DOTNET_CLI_TELEMETRY_OPTOUT=1
mkdir -p "$NUGET_PACKAGES"
RESTORE_LOG="$ROOT_DIR/restore.log"
: >"$RESTORE_LOG"
# Force MSBuild to use the SDK-provided targets instead of VS-installed ones
DOTNET_BASE_PATH="$(dotnet --info 2>/dev/null | awk -F': +' '/Base Path/ {print $2; exit}' | tr -d '\r')"
if [[ -n "$DOTNET_BASE_PATH" ]]; then
  DOTNET_BASE_PATH="${DOTNET_BASE_PATH%/}"
  if [[ -d "$DOTNET_BASE_PATH" ]]; then
    export MSBuildExtensionsPath="$DOTNET_BASE_PATH"
    export MSBuildExtensionsPath32="$DOTNET_BASE_PATH"
    export MSBuildSDKsPath="$DOTNET_BASE_PATH/Sdks"
  fi
fi
unset VSINSTALLDIR VisualStudioVersion VSToolsPath
# Avoid picking up Visual Studio's Windows-only fallback paths (breaks on WSL)
export MSBuildExtensionsPathFallbackPathsOverride=""

info() { echo "[INFO] $*"; }
ok() { echo "[OK] $*"; }
warn() { echo "[WARN] $*"; }
error() { echo "[ERROR] $*" >&2; }

# Find a free TCP port between start and end (inclusive)
find_free_port() {
  local start="${1:-5173}"
  local end="${2:-5205}"
  python3 - "$start" "$end" <<'PY'
import socket, sys
start, end = map(int, sys.argv[1:3])
for port in range(start, end + 1):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.bind(("127.0.0.1", port))
        except OSError:
            continue
        print(port)
        sys.exit(0)
print("")
PY
}

require_command() {
  local cmd="$1"
  local hint="$2"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    error "$cmd is not installed. $hint"
    exit 1
  fi
}

restore_project() {
  local proj="$1"
  local name
  name="$(basename "$proj")"
  info "Restoring $name ..."
  if command -v timeout >/dev/null 2>&1; then
    if ! timeout 300 dotnet restore "$proj" \
      --configfile "$ROOT_DIR/NuGet.config" \
      --ignore-failed-sources \
      --verbosity normal | tee -a "$RESTORE_LOG"; then
      error "Restore failed for $name (see $RESTORE_LOG)."
      exit 1
    fi
  else
    if ! dotnet restore "$proj" \
      --configfile "$ROOT_DIR/NuGet.config" \
      --ignore-failed-sources \
      --verbosity normal | tee -a "$RESTORE_LOG"; then
      error "Restore failed for $name (see $RESTORE_LOG)."
      exit 1
    fi
  fi
}

BACKEND_PID=""
FRONTEND_PID=""

cleanup() {
  for pid in "$BACKEND_PID" "$FRONTEND_PID"; do
    if [[ -n "${pid:-}" ]] && kill -0 "$pid" 2>/dev/null; then
      kill "$pid" 2>/dev/null || true
    fi
  done
}
trap cleanup EXIT INT TERM

info "Checking prerequisites..."
require_command "dotnet" "Install the .NET 8 SDK from https://dotnet.microsoft.com/download."
require_command "node" "Install Node.js 18+ from https://nodejs.org/."
require_command "npm" "npm should come with Node.js. Reinstall Node.js if missing."
ok "Prerequisites look good."

# Stop running backend dotnet processes to avoid locked bin/obj files
if pgrep -f "dotnet.*CryptoMarket.Web" >/dev/null 2>&1; then
  warn "Stopping running backend dotnet processes to release file locks..."
  pkill -f "dotnet.*CryptoMarket.Web" || true
fi

# Ensure wwwroot exists to avoid DirectoryNotFound exceptions
mkdir -p "$BACKEND_DIR/wwwroot"

# Ask for clean build
read -r -p "Perform a clean build (delete bin/obj)? [y/N] " CLEAN_INPUT
if [[ "$CLEAN_INPUT" =~ ^[Yy]$ ]]; then
  info "Cleaning bin/obj folders..."
  rm -rf "$ROOT_DIR"/src/CryptoMarket.Web/{bin,obj} \
         "$ROOT_DIR"/src/CryptoMarket.Application/{bin,obj} \
         "$ROOT_DIR"/src/CryptoMarket.Infrastructure/{bin,obj} \
         "$ROOT_DIR"/src/CryptoMarket.Domain/{bin,obj} \
         "$ROOT_DIR"/src/CryptoMarket.Tests/{bin,obj} 2>/dev/null || warn "Some files may be locked; close running backend/frontend processes and retry."
fi

info "Restoring backend packages (per project; logging to $RESTORE_LOG)..."
restore_project "$ROOT_DIR/src/CryptoMarket.Domain/CryptoMarket.Domain.csproj"
restore_project "$ROOT_DIR/src/CryptoMarket.Application/CryptoMarket.Application.csproj"
restore_project "$ROOT_DIR/src/CryptoMarket.Infrastructure/CryptoMarket.Infrastructure.csproj"
restore_project "$ROOT_DIR/src/CryptoMarket.Web/CryptoMarket.Web.csproj"
ok "Backend packages restored."

info "Building backend..."
if command -v timeout >/dev/null 2>&1; then
  timeout 300 dotnet build "$ROOT_DIR/CryptoMarket.sln" --configuration Debug --no-restore
else
  dotnet build "$ROOT_DIR/CryptoMarket.sln" --configuration Debug --no-restore
fi
ok "Backend build complete."

info "Ensuring frontend dependencies..."
if [[ ! -d "$FRONTEND_DIR/node_modules" ]]; then
  (cd "$FRONTEND_DIR" && npm install)
else
  (cd "$FRONTEND_DIR" && npm install --prefer-offline || npm install)
fi
ok "Frontend dependencies ready."

ENV_FILE="$FRONTEND_DIR/.env"
if [[ ! -f "$ENV_FILE" ]]; then
  info "Creating default frontend .env file..."
  cat >"$ENV_FILE" <<EOF
VITE_API_BASE_URL=http://localhost:${BACKEND_PORT}
VITE_SIGNALR_HUB_URL=http://localhost:${BACKEND_PORT}/hubs/prices
VITE_APP_ENV=development
EOF
  ok "Created $ENV_FILE"
else
  warn "$ENV_FILE already exists. Leaving it untouched."
fi

info "Starting backend on port ${BACKEND_PORT}..."
(
  cd "$BACKEND_DIR"
  ASPNETCORE_ENVIRONMENT="${ASPNETCORE_ENVIRONMENT:-Development}" \
  ASPNETCORE_URLS="http://localhost:${BACKEND_PORT}" \
  dotnet run --no-build --urls "http://localhost:${BACKEND_PORT}"
) | sed -u 's/^/[backend] /' &
BACKEND_PID=$!

# Resolve a free frontend port (default 5173; search next 20 ports if busy)
PREFERRED_FRONTEND_PORT="$FRONTEND_PORT"
FOUND_FRONTEND_PORT="$(find_free_port "$PREFERRED_FRONTEND_PORT" $((PREFERRED_FRONTEND_PORT + 20)))"
if [[ -z "$FOUND_FRONTEND_PORT" ]]; then
  error "No free frontend port found in range ${PREFERRED_FRONTEND_PORT}-${PREFERRED_FRONTEND_PORT+20}."
  exit 1
fi
if [[ "$FOUND_FRONTEND_PORT" != "$PREFERRED_FRONTEND_PORT" ]]; then
  warn "Port $PREFERRED_FRONTEND_PORT is busy; using $FOUND_FRONTEND_PORT instead."
fi
FRONTEND_PORT="$FOUND_FRONTEND_PORT"

info "Starting frontend on port ${FRONTEND_PORT}..."
(
  cd "$FRONTEND_DIR"
  npm run dev -- --port "${FRONTEND_PORT}" --host localhost --strictPort
) | sed -u 's/^/[frontend] /' &
FRONTEND_PID=$!

ok "Backend PID: ${BACKEND_PID}"
ok "Frontend PID: ${FRONTEND_PID}"
echo
info "Servers are starting..."
info "Backend:  http://localhost:${BACKEND_PORT}"
info "Frontend: http://localhost:${FRONTEND_PORT}"
info "Press Ctrl+C to stop both servers."
echo

wait -n "$BACKEND_PID" "$FRONTEND_PID"
