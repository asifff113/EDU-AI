# 🧹 EDU AI Complete Cleanup Script

Write-Host "EDU AI - Complete Cleanup" -ForegroundColor Red
Write-Host "=========================" -ForegroundColor Red
Write-Host ""

## STEP 1: KILL ALL PROCESSES ON EDU AI PORTS
Write-Host "STEP 1: Killing processes on EDU AI ports..." -ForegroundColor Yellow

$ports = @(3000, 4000, 5432, 6379)
foreach ($port in $ports) {
    $netstat = netstat -ano | Select-String ":$port " | Select-Object -First 1
    if ($netstat) {
        $pid = ($netstat -split '\s+')[-1]
        Write-Host "  Killing process on port $port (PID: $pid)" -ForegroundColor Red
        taskkill /PID $pid /F 2>$null
    } else {
        Write-Host "  Port $port is already free" -ForegroundColor Green
    }
}

# Kill all Node.js processes (safer approach)
Write-Host "  Killing all Node.js processes..." -ForegroundColor Red
taskkill /IM node.exe /F 2>$null

## STEP 2: COMPLETE DOCKER CLEANUP
Write-Host ""
Write-Host "STEP 2: Docker cleanup..." -ForegroundColor Yellow

# Stop all eduai containers
Write-Host "  Stopping eduai containers..." -ForegroundColor Cyan
docker stop $(docker ps -q --filter "name=eduai") 2>$null

# Remove all eduai containers
Write-Host "  Removing eduai containers..." -ForegroundColor Cyan
docker rm $(docker ps -aq --filter "name=eduai") 2>$null

# Clean up volumes
Write-Host "  Cleaning Docker volumes..." -ForegroundColor Cyan
docker volume prune -f 2>$null

## STEP 3: VERIFY CLEANUP
Write-Host ""
Write-Host "STEP 3: Verification..." -ForegroundColor Yellow

Write-Host "  Docker containers:" -ForegroundColor Cyan
$containers = docker ps --filter "name=eduai" --format "{{.Names}}"
if ($containers) {
    Write-Host "    Still running: $containers" -ForegroundColor Red
} else {
    Write-Host "    All eduai containers stopped" -ForegroundColor Green
}

Write-Host "  Port status:" -ForegroundColor Cyan
$portCheck = netstat -ano | findstr ":3000 :4000 :5432 :6379"
if ($portCheck) {
    Write-Host "    Some ports still in use:" -ForegroundColor Red
    Write-Host "    $portCheck" -ForegroundColor Yellow
} else {
    Write-Host "    All EDU AI ports are free" -ForegroundColor Green
}

Write-Host ""
Write-Host "Cleanup completed!" -ForegroundColor Green
Write-Host "Ready to start fresh with: .\startup.ps1" -ForegroundColor Cyan
Write-Host ""
