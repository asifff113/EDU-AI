# Test Gemini chat functionality
Write-Host "Testing Gemini AI chat functionality..."

try {
    $chatRequest = @{
        messages = @(
            @{
                role = "user"
                content = "Hello! Please introduce yourself as Gemini and tell me one interesting fact about artificial intelligence."
            }
        )
        provider = "google"
        model = "gemini-1.5-flash"
        temperature = 0.7
    } | ConvertTo-Json -Depth 3

    Write-Host "Sending chat request to Gemini..."
    $response = Invoke-RestMethod -Uri "http://localhost:4000/ai/chat" -Method POST -ContentType "application/json" -Body $chatRequest
    
    Write-Host "Gemini response:"
    $response | ConvertTo-Json -Depth 3
}
catch {
    Write-Host "Error: $($_.Exception.Message)"
    Write-Host "Full Error Details:"
    $_.Exception | Format-List -Force
}
