# Simple stop script for EDU AI
Write-Host "Stopping EDU AI services..." -ForegroundColor Yellow

# Kill all node processes (simple and effective)
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Stop Docker containers
docker-compose down 2>$null

Write-Host "All services stopped." -ForegroundColor Green

 