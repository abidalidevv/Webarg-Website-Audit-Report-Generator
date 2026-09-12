# Webarg Phase 1 - Verification Script

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host " WEBARG PHASE 1 - BACKEND VERIFICATION   " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

$baseUrl = "http://localhost:5000"

# 1. Health check
Write-Host "`n[Test 1] Health Check..." -ForegroundColor Yellow
try {
    $res = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get
    Write-Host "Passed! Health status: $($res.status)" -ForegroundColor Green
} catch {
    Write-Host "Failed: $_" -ForegroundColor Red
}

# 2. SSRF Test: 127.0.0.1
Write-Host "`n[Test 2] SSRF Protection: 127.0.0.1..." -ForegroundColor Yellow
try {
    $body = @{ url = "http://127.0.0.1" } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$baseUrl/scan" -Method Post -Body $body -ContentType "application/json"
    Write-Host "FAILED: 127.0.0.1 was NOT blocked!" -ForegroundColor Red
} catch {
    Write-Host "Passed! Blocked as expected: $($_.Exception.Message)" -ForegroundColor Green
}

# 3. SSRF Test: 169.254.169.254 (Cloud metadata)
Write-Host "`n[Test 3] SSRF Protection: 169.254.169.254 (Cloud Metadata)..." -ForegroundColor Yellow
try {
    $body = @{ url = "http://169.254.169.254" } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$baseUrl/scan" -Method Post -Body $body -ContentType "application/json"
    Write-Host "FAILED: 169.254.169.254 was NOT blocked!" -ForegroundColor Red
} catch {
    Write-Host "Passed! Blocked as expected: $($_.Exception.Message)" -ForegroundColor Green
}

# 4. SSRF Test: localhost
Write-Host "`n[Test 4] SSRF Protection: localhost..." -ForegroundColor Yellow
try {
    $body = @{ url = "http://localhost:3000" } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$baseUrl/scan" -Method Post -Body $body -ContentType "application/json"
    Write-Host "FAILED: localhost was NOT blocked!" -ForegroundColor Red
} catch {
    Write-Host "Passed! Blocked as expected: $($_.Exception.Message)" -ForegroundColor Green
}

# 5. Invalid Protocol: ftp://
Write-Host "`n[Test 5] Protocol Validation: ftp://..." -ForegroundColor Yellow
try {
    $body = @{ url = "ftp://example.com" } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$baseUrl/scan" -Method Post -Body $body -ContentType "application/json"
    Write-Host "FAILED: ftp was NOT rejected!" -ForegroundColor Red
} catch {
    Write-Host "Passed! Rejected as expected: $($_.Exception.Message)" -ForegroundColor Green
}

# 6. Live Scan: https://example.com
Write-Host "`n[Test 6] Live Quick Scan: https://example.com..." -ForegroundColor Yellow
try {
    $body = @{ url = "https://example.com"; mode = "quick" } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$baseUrl/scan" -Method Post -Body $body -ContentType "application/json"
    Write-Host "Passed! Scan successful." -ForegroundColor Green
    Write-Host "Report ID: $($res.reportId)" -ForegroundColor Cyan
    Write-Host "Overall Health Score: $($res.overallScore) ($($res.statusText))" -ForegroundColor Cyan
    Write-Host "Scores -> Performance: $($res.scores.performance) | SEO: $($res.scores.seo) | A11y: $($res.scores.accessibility) | Security: $($res.scores.security)" -ForegroundColor Cyan
    Write-Host "Total Findings: $($res.summary.totalFindings) ($($res.summary.criticalCount) critical, $($res.summary.warningCount) warnings)" -ForegroundColor Cyan
} catch {
    Write-Host "Failed: $_" -ForegroundColor Red
}

Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host " VERIFICATION COMPLETE                   " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
