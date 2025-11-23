# Database Backup Configuration
$container = "eduai-postgres-1"
$db = "edu_ai"
$dbUser = "postgres"
$backupFile = "eduai_backup.sql"

# 1. Backup Database
Write-Host "--- DATABASE BACKUP ---"
Write-Host "Target: $container : $db"
Write-Host "Backing up to: $PWD\$backupFile"

try {
    # Using --clean and --if-exists as requested
    # We use 'docker exec' with input/output redirection. 
    # Note: PowerShell redirection of binary/text data can be tricky with encoding.
    # pg_dump outputs text (SQL), so > is usually fine, but we ensure UTF8.
    
    # Using cmd /c to handle redirection reliably and avoid PowerShell encoding issues
    $cmd = "docker exec $container pg_dump -U $dbUser --clean --if-exists $db > $backupFile"
    cmd /c $cmd
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Success! Database dumped to $backupFile"
    } else {
        Write-Host "Warning: pg_dump returned exit code $LASTEXITCODE"
    }
} catch {
    Write-Host "Error during backup: $_"
}

# 2. Copy Uploads
Write-Host "`n--- UPLOADS BACKUP ---"
$desktopPath = [Environment]::GetFolderPath("Desktop")
$destPath = Join-Path $desktopPath "eduai_uploads_backup"

# Check for web container (assuming standard naming convention based on folder name 'EDU AI' -> 'eduai')
# The user's postgres container is 'eduai-postgres-1', so web is likely 'eduai-web-1'
$webContainer = "eduai-web-1"

if (docker ps -a -q -f name=$webContainer) {
    Write-Host "Found container: $webContainer"
    Write-Host "Copying /app/uploads to $destPath..."
    docker cp "${webContainer}:/app/uploads" "$destPath"
    if ($?) { Write-Host "Copy successful." } else { Write-Host "Failed to copy (maybe path doesn't exist?)" }
} else {
    Write-Host "Container '$webContainer' not found (it might be removed)."
    
    # Fallback: Check local bind mount
    $localPath = ".\apps\web\uploads"
    Write-Host "Checking local bind mount path: $localPath"
    if (Test-Path $localPath) {
        Write-Host "Found local uploads folder. Copying to Desktop..."
        Copy-Item -Path $localPath -Destination $destPath -Recurse -Force
        Write-Host "Copy successful."
    } else {
        Write-Host "Could not find uploads folder in container or local filesystem."
    }
}
