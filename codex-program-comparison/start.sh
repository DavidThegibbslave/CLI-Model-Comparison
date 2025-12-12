#!/usr/bin/env bash
set -euo pipefail

# Prefer locally installed SDK if present
if [[ -d "$HOME/.dotnet" ]]; then
  export PATH="$HOME/.dotnet:$PATH"
fi

# Startup helper for Crypto Market Web Application
# - Restores/builds backend (if dotnet is available) and runs it
# - Installs frontend deps and runs the Vite dev server
# - Exits when either process stops; cleans up background processes
#
# Env knobs:
#   SKIP_BACKEND=1       -> skip backend entirely
#   BACKEND_NO_RESTORE=1 -> run backend without restore (assumes packages are present)
#   BACKEND_PORT=5001    -> override backend port (default 5001 to avoid clashes)
#   BACKEND_URL=...      -> full backend URL override (takes precedence over BACKEND_PORT)
#   FRONTEND_PORT=4173   -> override dev server port
#   VITE_API_BASE_URL    -> override backend API base URL

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND="$ROOT/backend"
FRONTEND="$ROOT/frontend"
BACKEND_WEB_PROJECT="$BACKEND/src/CryptoMarket.Web/CryptoMarket.Web.csproj"
BACKEND_HOST="${BACKEND_HOST:-127.0.0.1}"
BACKEND_PORT="${BACKEND_PORT:-5001}"
BACKEND_URL="${BACKEND_URL:-http://${BACKEND_HOST}:${BACKEND_PORT}}"
API_URL_DEFAULT="$BACKEND_URL"
FRONTEND_PORT="${FRONTEND_PORT:-4173}"
FRONTEND_HOST="${FRONTEND_HOST:-127.0.0.1}"
DOTNET_CMD="dotnet"
DOTNET_CANDIDATES=(
  "$HOME/.dotnet/dotnet"
  "/mnt/c/Program Files/dotnet/dotnet.exe"
  "/mnt/c/Program Files (x86)/dotnet/dotnet.exe"
  "/usr/local/bin/dotnet"
  "/usr/bin/dotnet"
)
if ! command -v "$DOTNET_CMD" >/dev/null 2>&1; then
  for cand in "${DOTNET_CANDIDATES[@]}"; do
    if [[ -x "$cand" ]]; then
      DOTNET_CMD="$cand"
      break
    fi
  done
fi
DOTNET_FOUND=0
if DOTNET_PATH_RESOLVED="$(command -v "$DOTNET_CMD" 2>/dev/null)"; then
  DOTNET_CMD="$DOTNET_PATH_RESOLVED"
  DOTNET_FOUND=1
elif [[ -x "$DOTNET_CMD" ]]; then
  DOTNET_FOUND=1
fi

BACK_PID=""
FRONT_PID=""

cleanup() {
  if [[ -n "$FRONT_PID" ]]; then kill "$FRONT_PID" 2>/dev/null || true; fi
  if [[ -n "$BACK_PID" ]]; then kill "$BACK_PID" 2>/dev/null || true; fi
}
trap cleanup EXIT

echo "==> Starting Crypto Market Web Application"

# Backend
if [[ "${SKIP_BACKEND:-0}" == "1" ]]; then
  echo "!! SKIP_BACKEND=1 set; skipping backend."
else
  if [[ "$DOTNET_FOUND" -eq 1 ]]; then
    echo "==> Backend: using dotnet at '$DOTNET_CMD' on $BACKEND_URL (timeout restore if stuck)"
    (
      cd "$BACKEND"
      if [[ ! -f "$BACKEND_WEB_PROJECT" ]]; then
        echo "!! Backend project not found at $BACKEND_WEB_PROJECT"
        exit 1
      fi
      if [[ -f appsettings.Development.json ]]; then
        echo "    Using appsettings.Development.json (ensure ConnectionStrings/JWT/CryptoApi are set)"
      fi
      if [[ "${BACKEND_NO_RESTORE:-0}" != "1" ]]; then
        "$DOTNET_CMD" restore CryptoMarket.sln --configfile NuGet.Config --ignore-failed-sources --disable-parallel -v minimal
      fi
      "$DOTNET_CMD" run --urls "$BACKEND_URL" --project "$BACKEND_WEB_PROJECT" --no-restore
    ) &
    BACK_PID=$!
  else
    echo "!! dotnet not found; skipping backend. Install .NET SDK 8.0+ or ensure /mnt/c/Program Files/dotnet is on PATH."
  fi
fi

# Frontend
if ! command -v npm >/dev/null 2>&1; then
  echo "!! npm not found; install Node.js 18+ to run the frontend."
  exit 1
fi

echo "==> Frontend: install deps and start dev server on port ${FRONTEND_PORT}"
(
  cd "$FRONTEND"
  export VITE_API_BASE_URL="${VITE_API_BASE_URL:-$API_URL_DEFAULT}"
  npm install
  npm run dev -- --host "$FRONTEND_HOST" --port "$FRONTEND_PORT"
) &
FRONT_PID=$!

echo "==> Backend PID: ${BACK_PID:-skipped}, Frontend PID: $FRONT_PID"
echo "==> Frontend available at: http://localhost:${FRONTEND_PORT}"
echo "==> Press Ctrl+C to stop both."

# Wait for either process to exit
wait -n ${BACK_PID:+$BACK_PID} $FRONT_PID
