# Simple startup script for EDU AI
Write-Host "Starting EDU AI services..." -ForegroundColor Green

# Start Docker containers (databases only)
Write-Host "Starting database containers..." -ForegroundColor Yellow
docker-compose up -d postgres redis

# Wait a moment for containers to be ready
Write-Host "Waiting for databases to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Start API server in a new terminal
Write-Host "Starting API server on port 4000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'd:\projects\EDU AI\apps\api'; `$env:PORT=4000; npm run start:dev"

# Wait a moment
Start-Sleep -Seconds 3

# Start Web server in a new terminal
Write-Host "Starting Web server on port 3000..." -ForegroundColor Yellow  
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'd:\projects\EDU AI\apps\web'; `$env:PORT=3000; npm run dev"

Write-Host ""
Write-Host "Services are starting..." -ForegroundColor Green
Write-Host "Database: PostgreSQL on port 5433" -ForegroundColor Cyan
Write-Host "Cache: Redis on port 6379" -ForegroundColor Cyan
Write-Host "API: http://localhost:4000" -ForegroundColor Cyan
Write-Host "Web: http://localhost:3000" -ForegroundColor Cyan
Write-Host "AI Tutor: http://localhost:3000/tutor" -ForegroundColor Cyan
