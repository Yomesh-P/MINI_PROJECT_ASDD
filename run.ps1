# ==============================================================================
# SMART CRICKET TOURNAMENT TRACKER - WINDOWS POWERSHELL RUNNER
# Course: Agile Software Development and DevOps Lab (TE AI & DS, Sem V)
# Author: Yomesh-P (yomeshpatil99@gmail.com)
#
# Usage:
#   .\run.ps1              # Start all 8 microservices & dashboards
#   .\run.ps1 -Down        # Stop all running microservices
#   .\run.ps1 -Logs        # Follow live logs
#   .\run.ps1 -Seed        # Re-seed the database
# ==============================================================================

param (
    [switch]$Down,
    [switch]$Logs,
    [switch]$Status,
    [switch]$Seed
)

Write-Host "==========================================================================" -ForegroundColor Cyan
Write-Host "       🏏 SMART CRICKET TOURNAMENT TRACKER (2026 CLAYMORPHISM)           " -ForegroundColor Cyan
Write-Host "       Agile Software Development & DevOps + MLOps Lab (TE AI & DS)       " -ForegroundColor Cyan
Write-Host "==========================================================================" -ForegroundColor Cyan

function Show-Dashboards {
    Write-Host "`n🎉 ALL SERVICES OPERATIONAL! ACCESS YOUR DASHBOARDS BELOW:`n" -ForegroundColor Green
    Write-Host "+--------------------------------+----------------------------+-----------------------------+" -ForegroundColor Yellow
    Write-Host "| DASHBOARD / INTERFACE          | URL / PORT                 | ACCESS & CREDENTIALS        |" -ForegroundColor Yellow
    Write-Host "+--------------------------------+----------------------------+-----------------------------+" -ForegroundColor Yellow
    Write-Host "| 1. React Web App (White Clay)  | http://localhost:3000      | Public / User Dashboard     |"
    Write-Host "|    - Admin Scorer Console      | http://localhost:3000 (Tab)| admin@cricket.org / admin123|"
    Write-Host "| 2. Express REST API Gateway    | http://localhost:5000      | Auto-redirects to Port 3000 |"
    Write-Host "|    - Live Matches Endpoint     | http://localhost:5000/api/matches/live                   |"
    Write-Host "|    - Health Check Probe        | http://localhost:5000/health                            |"
    Write-Host "| 3. FastAPI ML Microservice     | http://localhost:8000/docs | Interactive Swagger OpenAPI |"
    Write-Host "| 4. MLflow Model Registry (LO5) | http://localhost:5001      | Model Lineage & Metrics     |"
    Write-Host "| 5. Apache Airflow UI (LO5)     | http://localhost:8080      | User: admin | Pass: admin   |"
    Write-Host "| 6. Grafana Analytics (Exp 8)   | http://localhost:3001      | User: admin | Pass: admin   |"
    Write-Host "| 7. Prometheus Metrics (Exp 8)  | http://localhost:9090      | PromQL & Target Health      |"
    Write-Host "| 8. MongoDB Database Engine     | localhost:27017            | Database: cricket_tracker   |"
    Write-Host "+--------------------------------+----------------------------+-----------------------------+`n" -ForegroundColor Yellow
    Write-Host "💡 Tip: To view live container logs, run: .\run.ps1 -Logs" -ForegroundColor Yellow
    Write-Host "🛑 To stop all containers, run:          .\run.ps1 -Down`n" -ForegroundColor Yellow
}

if ($Down) {
    Write-Host "Stopping all Docker containers..." -ForegroundColor Yellow
    docker compose down
    Write-Host "All services stopped." -ForegroundColor Green
    exit 0
}

if ($Logs) {
    Write-Host "Streaming live container logs..." -ForegroundColor Cyan
    docker compose logs -f
    exit 0
}

if ($Status) {
    docker compose ps
    exit 0
}

if ($Seed) {
    Write-Host "Re-seeding database..." -ForegroundColor Cyan
    docker exec -t cricket-backend node seed.js
    Write-Host "Database re-seeded successfully." -ForegroundColor Green
    exit 0
}

# Check Docker
$hasDocker = $false
try {
    $info = docker info 2>$null
    if ($LASTEXITCODE -eq 0) { $hasDocker = $true }
} catch {}

if ($hasDocker) {
    Write-Host "[1/4] Docker Engine detected and running." -ForegroundColor Cyan
    Write-Host "[2/4] Building and starting all 8 microservices via Docker Compose..." -ForegroundColor Cyan
    docker compose up -d --build

    Write-Host "[3/4] Waiting for Backend to be healthy..." -ForegroundColor Cyan
    Start-Sleep -Seconds 5

    Write-Host "[4/4] Seeding 2026 cricket tournament data..." -ForegroundColor Cyan
    docker exec -t cricket-backend node seed.js 2>$null

    Show-Dashboards
} else {
    Write-Host "Docker is not currently running. Starting in Local Node.js development mode..." -ForegroundColor Yellow
    Set-Location backend
    npm install
    node seed.js
    Start-Process node -ArgumentList "server.js"
    Set-Location ..\frontend
    npm install
    Start-Process npm -ArgumentList "run dev -- --port 3000 --host 0.0.0.0"
    Set-Location ..
    Show-Dashboards
}
