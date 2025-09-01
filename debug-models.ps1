# Debug frontend model filtering
Write-Host "Debugging frontend model filtering..."

try {
    Write-Host "Getting raw providers data..."
    $providers = Invoke-RestMethod -Uri "http://localhost:3000/api/ai/providers" -Method GET
    
    Write-Host "`nProviders received:"
    $providers | ForEach-Object {
        Write-Host "Provider: $($_.displayName) ($($_.name))"
        Write-Host "Models:"
        $_.models | ForEach-Object {
            Write-Host "  - $($_.displayName) ($($_.id))"
        }
        Write-Host ""
    }
    
    Write-Host "Total providers: $($providers.Count)"
    $totalModels = ($providers | ForEach-Object { $_.models.Count } | Measure-Object -Sum).Sum
    Write-Host "Total models: $totalModels"
}
catch {
    Write-Host "Error: $($_.Exception.Message)"
}
