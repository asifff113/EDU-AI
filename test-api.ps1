# Test script for AI API endpoints
Write-Host "Testing AI API endpoints..."

try {
    Write-Host "Testing /ai/providers endpoint..."
    $providers = Invoke-RestMethod -Uri "http://localhost:4000/ai/providers" -Method GET
    Write-Host "Providers response:"
    $providers | ConvertTo-Json -Depth 3

    Write-Host "`nTesting /ai/models endpoint..."
    $models = Invoke-RestMethod -Uri "http://localhost:4000/ai/models" -Method GET
    Write-Host "Models response:"
    $models | ConvertTo-Json -Depth 3
}
catch {
    Write-Host "Error: $($_.Exception.Message)"
}
