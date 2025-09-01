# 🚀 EDU AI Startup Script

param(
    [switch]$SkipDependencies,  # Skip dependency installation
    [switch]$NoSeed,            # Don't seed database
    [switch]$Status,            # Just check status
    [int]$FrontendPort = 3000,  # Frontend port
    [int]$BackendPort = 4000    # Backend port
)

Write-Host "EDU AI - Web App Startup" -ForegroundColor Green
Write-Host "========================" -ForegroundColor Green
Write-Host ""

function Write-StatusMessage {
    param([string]$Message, [string]$Type = "Info")
    $color = switch($Type) {
        "Success" { "Green" }
        "Warning" { "Yellow" }
        "Error" { "Red" }
        "Info" { "Cyan" }
        "Action" { "White" }
        default { "White" }
    }
    $prefix = switch($Type) {
        "Success" { "[SUCCESS]" }
        "Warning" { "[WARNING]" }
        "Error" { "[ERROR]" }
        "Info" { "[INFO]" }
        "Action" { "[ACTION]" }
        default { "[INFO]" }
    }
    Write-Host "$prefix $Message" -ForegroundColor $color
}

function Test-Service {
    param([string]$Name, [string]$Url, [int]$Port)
    try {
        $response = Invoke-WebRequest -Uri $Url -Method Get -UseBasicParsing -TimeoutSec 3
        Write-StatusMessage "$Name (Port $Port): Running - Status $($response.StatusCode)" "Success"
        return $true
    }
    catch {
        Write-StatusMessage "$Name (Port $Port): Not responding" "Error"
        return $false
    }
}

function Start-ServiceInNewTerminal {
    param([string]$Command, [string]$Title, [string]$WorkingDir = $PWD)
    $Command = "cd '$WorkingDir'; $Command"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $Command -WindowStyle Normal
    Write-StatusMessage "Started: $Title" "Success"
    Start-Sleep 2
}

# Status Check Only
if ($Status) {
    Write-StatusMessage "Checking service status..." "Info"
    
    $frontend = Test-Service "Frontend" "http://localhost:$FrontendPort" $FrontendPort
    $backend = Test-Service "Backend API" "http://localhost:$BackendPort/health" $BackendPort
    $ollama = Test-Service "Ollama AI" "http://localhost:11434" 11434
    
    Write-Host ""
    if ($frontend -and $backend -and $ollama) {
        Write-StatusMessage "All services are running!" "Success"
    } else {
        Write-StatusMessage "Some services need attention" "Warning"
    }
    exit
}

# Prerequisites Check
Write-StatusMessage "Checking prerequisites..." "Info"

if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-StatusMessage "Docker not found! Install Docker Desktop" "Error"
    exit 1
}

# Check if Ollama is running
$ollamaRunning = Test-Service "Ollama" "http://localhost:11434" 11434
if (!$ollamaRunning) {
    Write-StatusMessage "Ollama not running! Please start it separately: ollama serve" "Warning"
    Write-StatusMessage "Continuing anyway..." "Info"
}

Write-StatusMessage "Prerequisites check passed!" "Success"

# Start Infrastructure
Write-StatusMessage "Starting databases..." "Action"
docker run --name eduai-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=edu_ai -p 5432:5432 -d postgres:16-alpine
docker run --name eduai-redis -p 6379:6379 -d redis:7-alpine

Write-StatusMessage "Waiting for databases to initialize..." "Info"
Start-Sleep 8

# Install Dependencies
if (!$SkipDependencies) {
    if (!(Test-Path "node_modules")) {
        Write-StatusMessage "Installing dependencies..." "Action"
        pnpm install
    } else {
        Write-StatusMessage "Dependencies already installed" "Info"
    }
    
    # Setup Database
    Write-StatusMessage "Setting up database..." "Action"
    Set-Location "apps/api"
    pnpm prisma generate
    pnpm prisma migrate deploy
    
    if (!$NoSeed) {
        Write-StatusMessage "Seeding database with sample data..." "Action"
        pnpm prisma db seed
    }
    
    Set-Location "../.."
}

# Start Backend API
Write-StatusMessage "Starting Backend API..." "Action"
Start-ServiceInNewTerminal "pnpm run start:dev" "Backend API (Port $BackendPort)" "d:\projects\EDU AI\apps\api"

Start-Sleep 8

# Start Frontend
Write-StatusMessage "Starting Frontend..." "Action"
Start-ServiceInNewTerminal "pnpm run dev" "Frontend Web (Port $FrontendPort)" "d:\projects\EDU AI\apps\web"

Start-Sleep 5

# Final Status
Write-Host ""
Write-StatusMessage "EDU AI Web App Started!" "Success"
Write-Host ""
Write-Host "Your Applications:" -ForegroundColor Cyan
Write-Host "  Frontend:    http://localhost:$FrontendPort" -ForegroundColor White
Write-Host "  Backend API: http://localhost:$BackendPort" -ForegroundColor White
Write-Host "  API Docs:    http://localhost:$BackendPort/api-docs" -ForegroundColor White
Write-Host "  Ollama AI:   http://localhost:11434 (external)" -ForegroundColor White
Write-Host ""
Write-Host "Infrastructure:" -ForegroundColor Cyan  
Write-Host "  PostgreSQL:  localhost:5432" -ForegroundColor White
Write-Host "  Redis:       localhost:6379" -ForegroundColor White
Write-Host ""

if ($ollamaRunning) {
    Write-StatusMessage "All systems ready! Your EDU AI app is running!" "Success"
} else {
    Write-StatusMessage "App started, but please start Ollama: ollama serve" "Warning"
}

Write-Host ""
Write-Host "Wait 30-60 seconds for all services to fully start..." -ForegroundColor Yellow
Write-Host ""
Write-Host "To check status later, run:" -ForegroundColor Cyan
Write-Host "  .\startup.ps1 -Status" -ForegroundColor White
