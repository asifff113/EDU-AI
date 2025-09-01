# Pre-deployment build verification script for Windows

Write-Host "🔍 Pre-deployment verification starting..." -ForegroundColor Blue

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Not in project root directory" -ForegroundColor Red
    exit 1
}

# Check pnpm is available
try {
    pnpm --version | Out-Null
} catch {
    Write-Host "❌ Error: pnpm is not installed" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Project structure looks good" -ForegroundColor Green

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Blue
pnpm install --frozen-lockfile

# Generate Prisma client
Write-Host "🔧 Generating Prisma client..." -ForegroundColor Blue
Set-Location "apps/api"
pnpm prisma generate
Set-Location "../.."

# Build API
Write-Host "🏗️ Building API..." -ForegroundColor Blue
Set-Location "apps/api"
pnpm build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ API build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ API build successful" -ForegroundColor Green
Set-Location "../.."

# Build Web
Write-Host "🎨 Building Web frontend..." -ForegroundColor Blue
Set-Location "apps/web"
pnpm build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Web build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Web build successful" -ForegroundColor Green
Set-Location "../.."

Write-Host "🎉 Pre-deployment verification completed successfully!" -ForegroundColor Green
Write-Host "📋 Ready for deployment to Render" -ForegroundColor Blue
