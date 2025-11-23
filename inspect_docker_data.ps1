# List Running Containers
Write-Host "--- RUNNING CONTAINERS ---"
docker ps --format "table {{.Names}}\t{{.Status}}"

# Start Postgres container
Write-Host "`nStarting Postgres container..."
docker-compose up -d postgres

# Wait for Postgres to be ready
Write-Host "Waiting for Postgres to be ready..."
$retries = 0
while ($retries -lt 30) {
    try {
        docker exec eduai-postgres-1 pg_isready -U postgres
        if ($?) { break }
    } catch {
        Start-Sleep -Seconds 2
    }
    $retries++
    Start-Sleep -Seconds 2
}

# List Databases
Write-Host "`n--- DATABASES ---"
docker exec eduai-postgres-1 psql -U postgres -c "\l"

# List Tables in edu_ai
Write-Host "`n--- TABLES IN edu_ai ---"
docker exec eduai-postgres-1 psql -U postgres -d edu_ai -c "\dt"

# Count Rows
Write-Host "`n--- ROW COUNTS ---"
$tables = docker exec eduai-postgres-1 psql -U postgres -d edu_ai -t -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"
foreach ($table in $tables) {
    $table = $table.Trim()
    if ($table) {
        $query = "SELECT count(*) FROM ""$table"";"
        $count = $query | docker exec -i eduai-postgres-1 psql -U postgres -d edu_ai -t
        Write-Host "$table : $count rows"
    }
}

# List Volumes
Write-Host "`n--- DOCKER VOLUMES ---"
docker volume ls
