@echo off
echo 🗳️  Starting IVC Platform (Local Windows)...

:: 1. Setup Environment
if not exist backend\.env (
    echo ⚙️  Backend .env not found, copying from .env.example...
    if exist .env.example (
        copy .env.example backend\.env > nul
    ) else (
        echo ⚠️  Warning: .env.example not found. Please configure manually.
    )
)

:: 2. Start Blockchain node
if exist blockchain (
    echo [Blockchain] Starting node in a new window...
    start cmd /k "cd blockchain && npm install && npx hardhat node"
    timeout /t 5 > nul
)

:: Start Backend
echo [Backend] Starting server in a new window...
start cmd /k "cd backend && npm install && npm run dev"

:: Start Frontend
echo [Frontend] Starting UI in a new window...
start cmd /k "cd frontend && npm install && npm run dev"

echo ✅ Services are launching in separate windows.
echo 🌐 Opening browser in 5 seconds...
timeout /t 5 > nul
start http://localhost:3000

echo Blockchain Node: http://localhost:8545
echo Backend API:     http://localhost:5000
echo Frontend UI:      http://localhost:3000
pause
