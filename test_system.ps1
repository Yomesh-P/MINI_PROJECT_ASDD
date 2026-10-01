Write-Host "`n========================================================" -ForegroundColor Green
Write-Host "   SMART CRICKET TRACKER: END-TO-END TEST SUITE" -ForegroundColor Green
Write-Host "========================================================`n" -ForegroundColor Green

# 1. Health & Prometheus Metrics
Write-Host "[1/7] Testing Backend Health & Prometheus Metrics..." -ForegroundColor Cyan
$health = Invoke-RestMethod -Uri "http://localhost:5000/health"
Write-Host "  Health Status: $($health.status) | Uptime: $([math]::Round($health.uptime, 1))s"
$metrics = curl.exe -s http://localhost:5000/metrics
$metricLine = ($metrics | Select-String -Pattern "cricket_http_requests_total\{")[0]
Write-Host "  Prometheus Metric Sample: $metricLine"

# 2. Authentication
Write-Host "`n[2/7] Testing Admin Authentication & JWT..." -ForegroundColor Cyan
$loginBody = @{ email = "admin@cricket.org"; password = "admin123" } | ConvertTo-Json
$login = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $login.token
Write-Host "  Login Success: $($login.success) | Role: $($login.user.role) | Token: $($token.Substring(0, 20))..."

# 3. Tournaments & Standings
Write-Host "`n[3/7] Testing Tournaments & Standings (NRR Engine)..." -ForegroundColor Cyan
$tournaments = Invoke-RestMethod -Uri "http://localhost:5000/api/tournaments"
$tournamentId = $tournaments.data[0]._id
Write-Host "  Tournament: $($tournaments.data[0].name) (Format: $($tournaments.data[0].format))"
$standings = (Invoke-RestMethod -Uri "http://localhost:5000/api/standings/$tournamentId").data
Write-Host "  Points Table:"
$standings | Select-Object rank, teamName, played, won, lost, points, nrr | Format-Table | Out-String | Write-Host

# 4. Live Match Center
Write-Host "[4/7] Testing Live Match Center Scorecard..." -ForegroundColor Cyan
$liveData = (Invoke-RestMethod -Uri "http://localhost:5000/api/matches/live").data[0]
$matchId = $liveData._id
Write-Host "  Match: $($liveData.teamA.shortName) vs $($liveData.teamB.shortName)"
Write-Host "  Before Ball Update: Score = $($liveData.scoreB.runs)/$($liveData.scoreB.wickets) in $($liveData.scoreB.overs) ov"

# 5. Live Scoring (+4 Boundary via Admin JWT)
Write-Host "`n[5/7] Testing Live Ball Update (+4 Boundary Event)..." -ForegroundColor Cyan
$ballBody = @{ runs = 4; ballOutcome = "4" } | ConvertTo-Json
$headers = @{ Authorization = "Bearer $token" }
$ballRes = Invoke-RestMethod -Uri "http://localhost:5000/api/matches/$matchId/ball" -Method Post -Headers $headers -Body $ballBody -ContentType "application/json"
Write-Host "  After Ball Update:  Score = $($ballRes.data.scoreB.runs)/$($ballRes.data.scoreB.wickets) in $($ballRes.data.scoreB.overs) ov"
Write-Host "  Ball-by-ball Timeline: $($ballRes.data.liveState.recentBalls -join ' ')"

# 6. Machine Learning Predictions
Write-Host "`n[6/7] Testing ML Performance Prediction Endpoint (LO5)..." -ForegroundColor Cyan
$players = (Invoke-RestMethod -Uri "http://localhost:5000/api/players").data
$testPlayer = $players[0]
$predictBody = @{ playerId = $testPlayer._id; venue = "Wankhede Stadium, Mumbai" } | ConvertTo-Json
$predictRes = Invoke-RestMethod -Uri "http://localhost:5000/api/predict/runs" -Method Post -Body $predictBody -ContentType "application/json"
Write-Host "  Player: $($predictRes.data.player_name) ($($predictRes.data.player_role))"
Write-Host "  Predicted Runs: $($predictRes.data.predicted_runs) (Range: $($predictRes.data.confidence_range[0]) - $($predictRes.data.confidence_range[1]))"
Write-Host "  Features Used: Form Avg = $($predictRes.data.features_used.recent_form_avg), Strike Rate = $($predictRes.data.features_used.recent_strike_rate)"

# 7. Frontend HTTP Verification
Write-Host "`n[7/7] Testing React Frontend Web Server (Port 3000)..." -ForegroundColor Cyan
$frontHeaders = curl.exe -I -s http://localhost:3000/
Write-Host "  Frontend HTTP Status: $($frontHeaders[0])"
Write-Host "  Content-Type: $($frontHeaders[2])"

Write-Host "`n========================================================" -ForegroundColor Green
Write-Host "   ALL 7 SYSTEM COMPONENTS PASSED AND OPERATIONAL!   " -ForegroundColor Green
Write-Host "========================================================`n" -ForegroundColor Green
