#!/bin/bash

# Crypto Market Project - Enhanced Start Script
# Usage: ./start-project.sh

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}   Crypto Market Web Application - Start Script   ${NC}"
echo -e "${BLUE}==================================================${NC}"

# Function to find command or exe (WSL support)
find_cmd() {
    if command -v "$1" &> /dev/null; then
        echo "$1"
    elif command -v "$1.exe" &> /dev/null; then
        echo "$1.exe"
    else
        return 1
    fi
}

# ------------------------------------------------------------------
# 1. Prerequisite Checks
# ------------------------------------------------------------------
echo -e "\n${YELLOW}[1/4] Checking prerequisites...${NC}"

DOTNET_CMD=$(find_cmd dotnet)
if [ -z "$DOTNET_CMD" ]; then
    echo -e "${RED}Error: .NET SDK is not installed or not in PATH.${NC}"
    echo "Please install it from: https://dotnet.microsoft.com/download"
    exit 1
fi
echo -e "Found .NET: $DOTNET_CMD"

NPM_CMD=$(find_cmd npm)
if [ -z "$NPM_CMD" ]; then
    echo -e "${RED}Error: npm is not installed or not in PATH.${NC}"
    echo "Please install it from: https://nodejs.org/"
    exit 1
fi
echo -e "Found npm: $NPM_CMD"

DOCKER_CMD=$(find_cmd docker)
if [ -n "$DOCKER_CMD" ]; then
    echo -e "${GREEN}Docker found. Starting PostgreSQL...${NC}"
    # Use docker-compose if available, else docker run
    if command -v docker-compose &> /dev/null; then
        docker-compose up -d db
    else
        "$DOCKER_CMD" compose up -d db
    fi
    
    echo "Waiting for Database to be ready..."
    sleep 5
else
    echo -e "${YELLOW}Docker not found. Ensure PostgreSQL is running manually.${NC}"
fi

echo -e "${GREEN}Prerequisites check passed.${NC}"

# ------------------------------------------------------------------
# 2. Backend Setup
# ------------------------------------------------------------------
echo -e "\n${YELLOW}[2/4] Setting up Backend (ASP.NET Core)...${NC}"

PROJECT_ROOT=$(pwd)
BACKEND_DIR="$PROJECT_ROOT/src/CryptoMarket.Web"
DEFAULT_BACKEND_PORT=5000

find_free_port() {
    local port=$1
    local limit=$((port+20)) # try 20 ports ahead
    while [ $port -le $limit ]; do
        if command -v ss >/dev/null 2>&1; then
            if ! ss -ltn 2>/dev/null | grep -q ":$port "; then
                echo $port
                return 0
            fi
        elif command -v netstat >/dev/null 2>&1; then
            if ! netstat -tln 2>/dev/null | grep -q ":$port "; then
                echo $port
                return 0
            fi
        else
            # Fallback: optimistic use
            echo $port
            return 0
        fi
        port=$((port+1))
    done
    return 1
}

BACKEND_PORT=$(find_free_port $DEFAULT_BACKEND_PORT)
if [ -z "$BACKEND_PORT" ]; then
    echo -e "${RED}Error: Could not find a free port for backend.${NC}"
    exit 1
fi
BACKEND_URL="http://127.0.0.1:${BACKEND_PORT}"
echo -e "Using backend port: ${GREEN}${BACKEND_PORT}${NC}"

if [ ! -d "$BACKEND_DIR" ]; then
    echo -e "${RED}Error: Backend directory not found at $BACKEND_DIR${NC}"
    exit 1
fi

cd "$BACKEND_DIR" || exit

echo -e "Restoring NuGet packages..."
"$DOTNET_CMD" restore

echo -e "Applying Database Migrations..."
# Capture output to check for errors, but allow continuing if it's just "already up to date"
if ! "$DOTNET_CMD" ef database update; then
    echo -e "${RED}Database update failed.${NC}"
    echo "Please check your PostgreSQL connection string in 'src/CryptoMarket.Web/appsettings.json'."
    echo "Attempting to run anyway in 3 seconds..."
    sleep 3
fi

# ------------------------------------------------------------------
# 3. Frontend Setup
# ------------------------------------------------------------------
echo -e "\n${YELLOW}[3/4] Setting up Frontend (React/Vite)...${NC}"

FRONTEND_DIR="$PROJECT_ROOT/src/client"

if [ ! -d "$FRONTEND_DIR" ]; then
    echo -e "${RED}Error: Frontend directory not found at $FRONTEND_DIR${NC}"
    exit 1
fi

cd "$FRONTEND_DIR" || exit

if [ ! -d "node_modules" ]; then
    echo -e "Installing npm dependencies (this may take a minute)..."
    "$NPM_CMD" install
else
    echo -e "node_modules found, skipping install (run 'npm install' manually if needed)."
fi

# ------------------------------------------------------------------
# 4. Start Services
# ------------------------------------------------------------------
echo -e "\n${YELLOW}[4/4] Starting Services...${NC}"

# Function to handle script termination
cleanup() {
    echo -e "\n${RED}Stopping all services...${NC}"
    # Kill the process group
    trap - SIGINT SIGTERM # Clear the trap
    kill -- -$$ 2>/dev/null # Kill current process group
}

trap cleanup SIGINT SIGTERM

# Start Backend in background
echo -e "${GREEN}Starting Backend Server...${NC}"
cd "$BACKEND_DIR" || exit
ASPNETCORE_URLS="$BACKEND_URL" "$DOTNET_CMD" run --urls="$BACKEND_URL" &
BACKEND_PID=$!

# Wait for backend to likely be ready
echo "Waiting for Backend to initialize..."
sleep 5

# Start Frontend in background
echo -e "${GREEN}Starting Frontend Dev Server...${NC}"
cd "$FRONTEND_DIR" || exit
VITE_API_BASE="$BACKEND_URL" "$NPM_CMD" run dev -- --port 5173 &
FRONTEND_PID=$!

echo -e "\n${BLUE}==================================================${NC}"
echo -e "${BLUE}   PROJECT RUNNING${NC}"
echo -e "${BLUE}==================================================${NC}"
echo -e "Backend API:   ${GREEN}$BACKEND_URL${NC}"
echo -e "Swagger Docs:  ${GREEN}$BACKEND_URL/swagger${NC}"
echo -e "Frontend App:  ${GREEN}http://localhost:5173${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop both servers.${NC}"

# Wait for processes
wait $BACKEND_PID $FRONTEND_PID
