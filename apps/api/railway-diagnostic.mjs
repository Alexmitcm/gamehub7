import fetch from "node-fetch";

const RAILWAY_URL = "https://game5-production.up.railway.app";

class RailwayDiagnostic {
  constructor() {
    this.results = [];
  }

  async testConnectivity() {
    console.log("🔍 Railway Backend Diagnostic");
    console.log("=" .repeat(50));
    console.log(`📍 Target URL: ${RAILWAY_URL}`);
    console.log(`⏰ Started: ${new Date().toISOString()}\n`);

    // Test 1: Basic connectivity
    await this.testBasicConnectivity();
    
    // Test 2: DNS resolution
    await this.testDNSResolution();
    
    // Test 3: Alternative endpoints
    await this.testAlternativeEndpoints();
    
    // Test 4: Check if it's a different service
    await this.testServiceDetection();
    
    this.generateDiagnosticReport();
  }

  async testBasicConnectivity() {
    console.log("1️⃣ Testing Basic Connectivity");
    console.log("-".repeat(30));
    
    try {
      const response = await fetch(RAILWAY_URL, {
        method: 'GET',
        headers: {
          'User-Agent': 'Railway-Diagnostic/1.0'
        },
        timeout: 10000
      });

      console.log(`✅ Server responded with status: ${response.status}`);
      console.log(`📊 Content-Type: ${response.headers.get('content-type')}`);
      console.log(`📊 Server: ${response.headers.get('server')}`);
      
      const text = await response.text();
      console.log(`📄 Response length: ${text.length} characters`);
      
      if (text.length < 200) {
        console.log(`📄 Response preview: ${text.substring(0, 200)}`);
      }
      
      this.results.push({ test: "Basic Connectivity", success: true, status: response.status });
    } catch (error) {
      console.log(`❌ Connection failed: ${error.message}`);
      this.results.push({ test: "Basic Connectivity", success: false, error: error.message });
    }
  }

  async testDNSResolution() {
    console.log("\n2️⃣ Testing DNS Resolution");
    console.log("-".repeat(30));
    
    try {
      const url = new URL(RAILWAY_URL);
      console.log(`🌐 Hostname: ${url.hostname}`);
      console.log(`🔗 Protocol: ${url.protocol}`);
      console.log(`📍 Port: ${url.port || 'default'}`);
      
      // Try to resolve the hostname
      const dns = await import('dns/promises');
      try {
        const addresses = await dns.lookup(url.hostname);
        console.log(`✅ DNS resolved to: ${addresses.address}`);
        this.results.push({ test: "DNS Resolution", success: true, address: addresses.address });
      } catch (dnsError) {
        console.log(`❌ DNS resolution failed: ${dnsError.message}`);
        this.results.push({ test: "DNS Resolution", success: false, error: dnsError.message });
      }
    } catch (error) {
      console.log(`❌ URL parsing failed: ${error.message}`);
      this.results.push({ test: "DNS Resolution", success: false, error: error.message });
    }
  }

  async testAlternativeEndpoints() {
    console.log("\n3️⃣ Testing Alternative Endpoints");
    console.log("-".repeat(30));
    
    const endpoints = [
      { name: "Root", path: "/" },
      { name: "Health", path: "/health" },
      { name: "Status", path: "/status" },
      { name: "API Root", path: "/api" },
      { name: "V1 API", path: "/api/v1" },
      { name: "Docs", path: "/docs" },
      { name: "OpenAPI", path: "/openapi.json" }
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${RAILWAY_URL}${endpoint.path}`, {
          method: 'GET',
          headers: { 'User-Agent': 'Railway-Diagnostic/1.0' },
          timeout: 5000
        });
        
        console.log(`${response.ok ? '✅' : '❌'} ${endpoint.name}: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
          this.results.push({ 
            test: `Alternative Endpoint: ${endpoint.name}`, 
            success: true, 
            status: response.status,
            path: endpoint.path
          });
        }
      } catch (error) {
        console.log(`❌ ${endpoint.name}: ${error.message}`);
      }
    }
  }

  async testServiceDetection() {
    console.log("\n4️⃣ Service Detection");
    console.log("-".repeat(30));
    
    try {
      const response = await fetch(RAILWAY_URL, {
        method: 'GET',
        headers: { 'User-Agent': 'Railway-Diagnostic/1.0' },
        timeout: 10000
      });

      const server = response.headers.get('server');
      const contentType = response.headers.get('content-type');
      
      console.log(`🔍 Server header: ${server || 'Not set'}`);
      console.log(`🔍 Content-Type: ${contentType || 'Not set'}`);
      
      if (server) {
        if (server.includes('Railway')) {
          console.log("✅ Railway service detected");
        } else if (server.includes('nginx')) {
          console.log("⚠️  Nginx detected (might be Railway proxy)");
        } else if (server.includes('cloudflare')) {
          console.log("⚠️  Cloudflare detected (CDN/proxy)");
        } else {
          console.log(`ℹ️  Other server: ${server}`);
        }
      }
      
      if (contentType && contentType.includes('application/json')) {
        console.log("✅ JSON response detected (likely API)");
      } else if (contentType && contentType.includes('text/html')) {
        console.log("ℹ️  HTML response detected (might be landing page)");
      }
      
    } catch (error) {
      console.log(`❌ Service detection failed: ${error.message}`);
    }
  }

  generateDiagnosticReport() {
    console.log("\n" + "=".repeat(50));
    console.log("📋 DIAGNOSTIC REPORT");
    console.log("=".repeat(50));
    
    const successfulTests = this.results.filter(r => r.success).length;
    const totalTests = this.results.length;
    
    console.log(`\n📊 Test Results: ${successfulTests}/${totalTests} successful`);
    
    console.log("\n🔍 Detailed Results:");
    this.results.forEach(result => {
      const status = result.success ? "✅" : "❌";
      console.log(`${status} ${result.test}`);
      if (!result.success && result.error) {
        console.log(`   └─ Error: ${result.error}`);
      }
    });

    console.log("\n🎯 ANALYSIS:");
    
    if (successfulTests === 0) {
      console.log("🔴 CRITICAL: No connectivity to Railway");
      console.log("   - The application may not be deployed");
      console.log("   - The URL may be incorrect");
      console.log("   - Railway service may be down");
    } else if (successfulTests < totalTests) {
      console.log("🟡 PARTIAL: Some connectivity issues detected");
      console.log("   - Basic connectivity works but some endpoints fail");
      console.log("   - Application may be partially deployed");
    } else {
      console.log("🟢 GOOD: All tests passed");
      console.log("   - Railway backend is accessible");
    }

    console.log("\n🔧 RECOMMENDED ACTIONS:");
    
    if (successfulTests === 0) {
      console.log("1. Check Railway dashboard for deployment status");
      console.log("2. Verify the project name and URL are correct");
      console.log("3. Ensure the application is deployed and running");
      console.log("4. Check Railway logs for deployment errors");
      console.log("5. Verify environment variables are set correctly");
      console.log("6. Try redeploying the application");
    } else {
      console.log("1. Check Railway logs for specific endpoint errors");
      console.log("2. Verify environment variables are set correctly");
      console.log("3. Run database migrations if needed");
      console.log("4. Check application startup logs");
    }

    console.log("\n📋 NEXT STEPS:");
    console.log("1. Run: railway status (if Railway CLI is installed)");
    console.log("2. Check Railway dashboard at https://railway.app");
    console.log("3. Verify environment variables in Railway dashboard");
    console.log("4. Check deployment logs for errors");
    console.log("5. Try redeploying the application");
    
    console.log("\n🔗 Useful Commands:");
    console.log("- railway login (if not logged in)");
    console.log("- railway link (to link local project)");
    console.log("- railway up (to deploy)");
    console.log("- railway logs (to view logs)");
    console.log("- railway variables (to check env vars)");
  }
}

// Run the diagnostic
async function main() {
  const diagnostic = new RailwayDiagnostic();
  await diagnostic.testConnectivity();
}

main().catch(error => {
  console.error("❌ Diagnostic failed:", error);
  process.exit(1);
});
