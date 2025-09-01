# Test providers endpoint in detail
try {
    Write-Host "Testing /ai/providers endpoint..."
    $response = Invoke-RestMethod -Uri "http://localhost:4000/ai/providers" -Method GET
    
    Write-Host "Response type: $($response.GetType().Name)"
    Write-Host "Response is array: $($response -is [array])"
    
    if ($response -is [array]) {
        Write-Host "Array length: $($response.Length)"
        $response | ConvertTo-Json -Depth 5
    } else {
        Write-Host "Single object response:"
        $response | ConvertTo-Json -Depth 5
    }
}
catch {
    Write-Host "Error: $($_.Exception.Message)"
}
