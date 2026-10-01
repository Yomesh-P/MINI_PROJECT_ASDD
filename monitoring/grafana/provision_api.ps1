$ErrorActionPreference = "Stop"

$user = "admin"
$pass = "admin"
$pair = "$($user):$($pass)"
$bytes = [System.Text.Encoding]::ASCII.GetBytes($pair)
$base64 = [Convert]::ToBase64String($bytes)
$headers = @{
    "Authorization" = "Basic $base64"
    "Content-Type"  = "application/json"
}

Write-Host "1. Testing connection to Grafana API..."
$health = Invoke-RestMethod -Uri "http://localhost:3001/api/health" -Method GET
Write-Host "   Grafana Health: $($health.database)"

Write-Host "2. Adding Prometheus Data Source..."
$dsBody = @{
    name      = "Prometheus"
    type      = "prometheus"
    url       = "http://prometheus:9090"
    access    = "proxy"
    isDefault = $true
} | ConvertTo-Json -Depth 5

try {
    $dsRes = Invoke-RestMethod -Uri "http://localhost:3001/api/datasources" -Method POST -Headers $headers -Body $dsBody
    Write-Host "   Datasource created: $($dsRes.message)"
} catch {
    Write-Host "   Datasource may already exist or: $($_.Message)"
}

Write-Host "3. Importing Smart Cricket Observability Dashboard..."
$dashboardJsonContent = Get-Content -Raw "c:\ASDD_MINI\monitoring\grafana\provisioning\dashboards\json\cricket_dashboard.json"
$dashboardObj = $dashboardJsonContent | ConvertFrom-Json
$importBody = @{
    dashboard = $dashboardObj
    overwrite = $true
    folderId  = 0
} | ConvertTo-Json -Depth 20

$dashRes = Invoke-RestMethod -Uri "http://localhost:3001/api/dashboards/db" -Method POST -Headers $headers -Body $importBody
Write-Host "   Dashboard Imported Successfully! URL: http://localhost:3001$($dashRes.url)"
Write-Host "   Dashboard Title: $($dashboardObj.title)"
Write-Host "   Status: $($dashRes.status)"

Write-Host "4. Setting Cricket Observability as Default Home Dashboard..."
try {
    $prefBody = @{ homeDashboardUID = "cricket-telemetry-2026" } | ConvertTo-Json
    Invoke-RestMethod -Uri "http://localhost:3001/api/org/preferences" -Method PUT -Headers $headers -Body $prefBody
    Write-Host "   Default Home Dashboard set to cricket-telemetry-2026"
} catch {
    Write-Host "   Note on home preference: $($_.Message)"
}

