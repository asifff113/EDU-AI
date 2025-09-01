# Test chat functionality
Write-Host "Testing AI chat functionality..."

try {
    $chatRequest = @{
        messages = @(
            @{
                role = "user"
                content = "Hello, can you introduce yourself briefly?"
            }
        )
        provider = "local"
        model = "llama3.1:8b"
        temperature = 0.7
    } | ConvertTo-Json -Depth 3

    Write-Host "Sending chat request to backend..."
    $response = Invoke-RestMethod -Uri "http://localhost:4000/ai/chat" -Method POST -ContentType "application/json" -Body $chatRequest
    
    Write-Host "Chat response:"
    $response | ConvertTo-Json -Depth 3
}
catch {
    Write-Host "Error: $($_.Exception.Message)"
}
