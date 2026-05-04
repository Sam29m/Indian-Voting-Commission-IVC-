#!/bin/bash

# Indian Voting Commission (IVC) - Comprehensive Startup Script
# This script manages Backend, Frontend, and Blockchain services concurrently.

echo "🗳️  Starting Indian Voting Commission Platform..."

# 1. Setup Environment
if [ ! -f backend/.env ]; then
    echo "⚙️  Backend .env not found, copying from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example backend/.env
    else
        echo "⚠️  Warning: .env.example not found. Creating a default .env..."
        echo "PORT=5000" > backend/.env
        echo "MONGODB_URI=mongodb://localhost:27017/indian-voting-commission" >> backend/.env
        echo "JWT_SECRET=ivc_jwt_secret_key_2026_production" >> backend/.env
        echo "CLIENT_URL=http://localhost:3000" >> backend/.env
    fi
fi

# 2. Check and Install Dependencies
install_deps() {
    local dir=$1
    local name=$2
    if [ -d "$dir" ]; then
        if [ ! -d "$dir/node_modules" ]; then
            echo "📦 Installing dependencies for $name..."
            (cd "$dir" && npm install)
        else
            echo "✅ Dependencies for $name already installed."
        fi
    fi
}

install_deps "blockchain" "Blockchain"
install_deps "backend" "Backend"
install_deps "frontend" "Frontend"

# 3. Cleanup Function
cleanup() {
    echo ""
    echo "🛑 Stopping all services..."
    # Kill all background jobs started by this script
    # We use -P to kill the process group if possible, or just jobs -p
    kill $(jobs -p) 2>/dev/null
    echo "👋 All services stopped. Goodbye!"
    exit
}

# Trap Ctrl+C (SIGINT) and SIGTERM
trap cleanup SIGINT SIGTERM EXIT

# 4. Start Services
echo "🚀 Launching services..."

# Start Blockchain node
if [ -d "blockchain" ]; then
    echo "[Blockchain] Starting Hardhat node..."
    (cd blockchain && npx hardhat node) &
    # Wait a bit for the node to be ready
    sleep 2
fi

# Start Backend
echo "[Backend] Starting API server..."
(cd backend && npm run dev) &

# Start Frontend
echo "[Frontend] Starting Vite dev server..."
(cd frontend && npm run dev) &

echo ""
echo "✅ All services are launching!"
echo "--------------------------------------------------"
echo "Frontend:    http://localhost:3000"
echo "Backend API: http://localhost:5000"
echo "--------------------------------------------------"
echo "Press Ctrl+C to stop all services."
echo ""

# Wait for background processes to keep the script alive
wait
