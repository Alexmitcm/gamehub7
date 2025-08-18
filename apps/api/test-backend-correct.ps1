# Backend Testing Script - Corrected Endpoints
# This script tests all the main endpoints of the Hey API with correct paths

Write-Host "=== Hey API Backend Testing (Corrected) ===" -ForegroundColor Green
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

# Test metadata endpoints (correct path)
Write-Host "=== Metadata Tests ===" -ForegroundColor Magenta
Test-Endpoint -Method "GET" -Endpoint "/metadata/sts" -Description "Metadata STS endpoint"

# Test oembed endpoints (correct path)
Write-Host "=== OEmbed Tests ===" -ForegroundColor Magenta
Test-Endpoint -Method "GET" -Endpoint "/oembed/get?url=https://example.com" -Description "OEmbed endpoint"

# Test OG endpoints (correct paths)
Write-Host "=== Open Graph Tests ===" -ForegroundColor Magenta
Test-Endpoint -Method "GET" -Endpoint "/og/u/testuser" -Description "OG user endpoint"
Test-Endpoint -Method "GET" -Endpoint "/og/posts/test-post" -Description "OG post endpoint"
Test-Endpoint -Method "GET" -Endpoint "/og/g/0x1234567890123456789012345678901234567890" -Description "OG group endpoint"

# Test preferences endpoints (correct path)
Write-Host "=== Preferences Tests ===" -ForegroundColor Magenta
Test-Endpoint -Method "GET" -Endpoint "/preferences/get" -Description "Get preferences"

# Test referral endpoints (correct paths)
Write-Host "=== Referral Tests ===" -ForegroundColor Magenta
Test-Endpoint -Method "GET" -Endpoint "/referral/test" -Description "Referral test endpoint"
Test-Endpoint -Method "GET" -Endpoint "/referral/simple" -Description "Referral simple endpoint"

# Test sitemap endpoints (correct paths)
Write-Host "=== Sitemap Tests ===" -ForegroundColor Magenta
Test-Endpoint -Method "GET" -Endpoint "/sitemap/all.xml" -Description "Sitemap index"
Test-Endpoint -Method "GET" -Endpoint "/sitemap/pages.xml" -Description "Pages sitemap"
Test-Endpoint -Method "GET" -Endpoint "/sitemap/accounts.xml" -Description "Accounts sitemap index"

# Test database connection
Write-Host "=== Database Tests ===" -ForegroundColor Magenta
Test-Endpoint -Method "GET" -Endpoint "/db-test" -Description "Database connection test"

# Test admin endpoints
Write-Host "=== Admin Tests ===" -ForegroundColor Magenta
Test-Endpoint -Method "GET" -Endpoint "/admin" -Description "Admin endpoint"

# Test lens endpoints
Write-Host "=== Lens Tests ===" -ForegroundColor Magenta
Test-Endpoint -Method "GET" -Endpoint "/lens" -Description "Lens endpoint"

# Test live endpoints
Write-Host "=== Live Tests ===" -ForegroundColor Magenta
Test-Endpoint -Method "GET" -Endpoint "/live" -Description "Live endpoint"

# Test cron endpoints
Write-Host "=== Cron Tests ===" -ForegroundColor Magenta
Test-Endpoint -Method "GET" -Endpoint "/cron" -Description "Cron endpoint"

# Test non-existent endpoint
Write-Host "=== Error Handling Tests ===" -ForegroundColor Magenta
Test-Endpoint -Method "GET" -Endpoint "/non-existent" -Description "Non-existent endpoint (should return 404)"

Write-Host ""
Write-Host "=== Testing Complete ===" -ForegroundColor Green
Write-Host "Check the results above for any failed endpoints." -ForegroundColor Yellow
