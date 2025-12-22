# Test Payment API endpoints (PowerShell)
# Make sure API server is running on http://localhost:8080

$API_BASE = "http://localhost:8080/api/payment"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Testing Payment API Endpoints" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Test GET /api/payment/packages (no auth required)
Write-Host "1. Testing GET /api/payment/packages" -ForegroundColor Yellow
Write-Host "-----------------------------------" -ForegroundColor Gray
try {
    $response = Invoke-RestMethod -Uri "${API_BASE}/packages" -Method Get -ContentType "application/json"
    $response | ConvertTo-Json -Depth 10
    Write-Host "Status: 200 OK" -ForegroundColor Green
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
}
Write-Host ""
Write-Host ""

# 2. Test GET /api/payment/current (requires auth)
Write-Host "2. Testing GET /api/payment/current (requires Bearer token)" -ForegroundColor Yellow
Write-Host "-----------------------------------" -ForegroundColor Gray
$token = Read-Host "Please provide Bearer token (or press Enter to skip)"
if ([string]::IsNullOrWhiteSpace($token)) {
    Write-Host "Skipping authenticated endpoints..." -ForegroundColor Yellow
} else {
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        }
        $response = Invoke-RestMethod -Uri "${API_BASE}/current" -Method Get -Headers $headers
        $response | ConvertTo-Json -Depth 10
        Write-Host "Status: 200 OK" -ForegroundColor Green
    } catch {
        Write-Host "Error: $_" -ForegroundColor Red
        if ($_.Exception.Response) {
            Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
        }
    }
}
Write-Host ""
Write-Host ""

# 3. Test GET /api/payment/deposits (requires auth)
if (![string]::IsNullOrWhiteSpace($token)) {
    Write-Host "3. Testing GET /api/payment/deposits" -ForegroundColor Yellow
    Write-Host "-----------------------------------" -ForegroundColor Gray
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        }
        $response = Invoke-RestMethod -Uri "${API_BASE}/deposits?page=0&limit=10" -Method Get -Headers $headers
        $response | ConvertTo-Json -Depth 10
        Write-Host "Status: 200 OK" -ForegroundColor Green
    } catch {
        Write-Host "Error: $_" -ForegroundColor Red
        if ($_.Exception.Response) {
            Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
        }
    }
    Write-Host ""
    Write-Host ""
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Test completed" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan








