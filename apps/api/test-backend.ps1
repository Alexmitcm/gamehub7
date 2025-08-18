# Backend Testing Script
# This script tests all the main endpoints of the Hey API

Write-Host "=== Hey API Backend Testing ===" -ForegroundColor Green
Write-Host "Testing server at http://localhost:8080" -ForegroundColor Yellow
Write-Host ""

# Function to test an endpoint
function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Endpoint,
        [string]$Description,
        [string]$Body = $null,
        [hashtable]$Headers = @{}
    )
    
    Write-Host "Testing: $Description" -ForegroundColor Cyan
    Write-Host "  $Method $Endpoint" -ForegroundColor Gray
    
    try {
        $params = @{
            Uri = "http://localhost:8080$Endpoint"
            Method = $Method
            Headers = $Headers
        }
        
        if ($Body) {
            $params.Body = $Body
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-WebRequest @params -TimeoutSec 10
        
        Write-Host "  ✓ Status: $($response.StatusCode)" -ForegroundColor Green
        Write-Host "  ✓ Response: $($response.Content.Substring(0, [Math]::Min(100, $response.Content.Length)))..." -ForegroundColor Green
        
        return $true
    }
    catch {
        Write-Host "  ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            Write-Host "  ✗ Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
            Write-Host "  ✗ Response: $($_.Exception.Response.Content)" -ForegroundColor Red
        }
        return $false
    }
    Write-Host ""
}

# Test basic connectivity
Write-Host "=== Basic Connectivity Tests ===" -ForegroundColor Magenta
Test-Endpoint -Method "GET" -Endpoint "/ping" -Description "Ping endpoint"

# Test auth endpoints
Write-Host "=== Authentication Tests ===" -ForegroundColor Magenta
$loginBody = @{
    walletAddress = "0x1234567890123456789012345678901234567890"
    selectedProfileId = "test-profile"
} | ConvertTo-Json

Test-Endpoint -Method "POST" -Endpoint "/auth/login" -Description "Auth login" -Body $loginBody

# Test games endpoints
Write-Host "=== Games Tests ===" -ForegroundColor Magenta
Test-Endpoint -Method "GET" -Endpoint "/games" -Description "Get all games"
Test-Endpoint -Method "GET" -Endpoint "/games/categories" -Description "Get game categories"

# Test premium endpoints
Write-Host "=== Premium Tests ===" -ForegroundColor Magenta
Test-Endpoint -Method "GET" -Endpoint "/premium/status" -Description "Premium status"
Test-Endpoint -Method "GET" -Endpoint "/premium/profiles" -Description "Premium profiles"

# Test metadata endpoints
Write-Host "=== Metadata Tests ===" -ForegroundColor Magenta
Test-Endpoint -Method "GET" -Endpoint "/metadata" -Description "Metadata endpoint"

# Test oembed endpoints
Write-Host "=== OEmbed Tests ===" -ForegroundColor Magenta
Test-Endpoint -Method "GET" -Endpoint "/oembed?url=https://example.com" -Description "OEmbed endpoint"

# Test OG endpoints
Write-Host "=== Open Graph Tests ===" -ForegroundColor Magenta
Test-Endpoint -Method "GET" -Endpoint "/og/account/test" -Description "OG account endpoint"
Test-Endpoint -Method "GET" -Endpoint "/og/post/test" -Description "OG post endpoint"

# Test preferences endpoints
Write-Host "=== Preferences Tests ===" -ForegroundColor Magenta
Test-Endpoint -Method "GET" -Endpoint "/preferences" -Description "Preferences endpoint"

# Test referral endpoints
Write-Host "=== Referral Tests ===" -ForegroundColor Magenta
Test-Endpoint -Method "GET" -Endpoint "/referral" -Description "Referral tree endpoint"

# Test sitemap endpoints
Write-Host "=== Sitemap Tests ===" -ForegroundColor Magenta
Test-Endpoint -Method "GET" -Endpoint "/sitemap" -Description "Sitemap endpoint"

# Test database connection
Write-Host "=== Database Tests ===" -ForegroundColor Magenta
Test-Endpoint -Method "GET" -Endpoint "/db-test" -Description "Database connection test"

# Test admin endpoints (should return 404 without auth)
Write-Host "=== Admin Tests ===" -ForegroundColor Magenta
Test-Endpoint -Method "GET" -Endpoint "/admin" -Description "Admin endpoint (should fail without auth)"

# Test non-existent endpoint
Write-Host "=== Error Handling Tests ===" -ForegroundColor Magenta
Test-Endpoint -Method "GET" -Endpoint "/non-existent" -Description "Non-existent endpoint (should return 404)"

Write-Host ""
Write-Host "=== Testing Complete ===" -ForegroundColor Green
Write-Host "Check the results above for any failed endpoints." -ForegroundColor Yellow
