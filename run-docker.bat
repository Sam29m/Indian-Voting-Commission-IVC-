@echo off
echo Starting Indian Voting Commission System...

:: Ensure Docker is running
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Docker is not installed or not running. Please install Docker Desktop and start it.
    pause
    exit /b
)

echo Building and starting Docker containers...
docker-compose up --build
pause
