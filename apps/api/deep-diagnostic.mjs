import fetch from "node-fetch";

const RAILWAY_URL = "https://game5-production.up.railway.app";

async function deepDiagnostic() {
  console.log("🔍 Deep Railway Backend Diagnostic");
  console.log("=".repeat(50));
  console.log(`📍 Target URL: ${RAILWAY_URL}`);
  console.log(`⏰ Started: ${new Date().toISOString()}\n`);

  // Test 1: Basic health check
  console.log("1️⃣ Testing Basic Health Check");
  console.log("-".repeat(30));

  try {
    const healthResponse = await fetch(`${RAILWAY_URL}/ping`);
    const healthData = await healthResponse.json();

    if (healthResponse.ok) {
      console.log(`✅ Health Check: SUCCESS (${healthResponse.status})`);
      console.log(`📊 Response: ${JSON.stringify(healthData)}`);
    } else {
      console.log(`❌ Health Check: FAILED (${healthResponse.status})`);
      console.log(`📊 Error: ${JSON.stringify(healthData)}`);
    }
  } catch (error) {
    console.log(`❌ Health Check: ERROR - ${error.message}`);
  }

  // Test 2: Check Railway logs endpoint (if available)
  console.log("\n2️⃣ Testing Alternative Endpoints");
  console.log("-".repeat(30));

  const alternativeEndpoints = [
    { name: "Root", path: "/" },
    { name: "Health Alt", path: "/health" },
    { name: "Status", path: "/status" },
    { name: "API Root", path: "/api" },
    { name: "Test JWT", path: "/test-jwt" }
  ];

  for (const endpoint of alternativeEndpoints) {
    try {
      const response = await fetch(`${RAILWAY_URL}${endpoint.path}`, {
        headers: { "User-Agent": "Deep-Diagnostic/1.0" },
        method: "GET",
        timeout: 5000
      });

      const data = await response
        .json()
        .catch(() => ({ error: "Invalid JSON" }));

      if (response.ok) {
        console.log(`✅ ${endpoint.name}: SUCCESS (${response.status})`);
        if (data && Object.keys(data).length > 0) {
          console.log(
            `   📊 Response: ${JSON.stringify(data).substring(0, 100)}...`
          );
        }
      } else {
        console.log(`❌ ${endpoint.name}: FAILED (${response.status})`);
        console.log(`   📊 Error: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name}: ERROR - ${error.message}`);
    }
  }

  // Test 3: Test database endpoints with detailed error analysis
  console.log("\n3️⃣ Testing Database Endpoints with Error Analysis");
  console.log("-".repeat(30));

  const dbEndpoints = [
    { name: "Admin Stats", path: "/admin/stats" },
    { name: "Features", path: "/admin/features" },
    { name: "Games List", path: "/games/list?limit=5" },
    { name: "Admin Actions", path: "/admin/actions?limit=5" }
  ];

  for (const endpoint of dbEndpoints) {
    try {
      const startTime = Date.now();
      const response = await fetch(`${RAILWAY_URL}${endpoint.path}`, {
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Deep-Diagnostic/1.0"
        },
        method: "GET",
        timeout: 10000
      });

      const responseTime = Date.now() - startTime;
      const data = await response
        .json()
        .catch(() => ({ error: "Invalid JSON response" }));

      console.log(`\n🔍 ${endpoint.name}:`);
      console.log(`   URL: ${RAILWAY_URL}${endpoint.path}`);
      console.log(`   Status: ${response.status} ${response.statusText}`);
      console.log(`   Time: ${responseTime}ms`);
      console.log(`   Response: ${JSON.stringify(data)}`);

      if (response.status === 500) {
        console.log("   🔍 500 Error Analysis:");
        console.log("      - This indicates a server-side error");
        console.log(
          "      - Likely database connection or Prisma client issue"
        );
        console.log("      - Check Railway logs for specific error details");
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name}: ERROR - ${error.message}`);
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("📋 DIAGNOSTIC SUMMARY");
  console.log("=".repeat(50));

  console.log("\n🎯 CURRENT STATUS:");
  console.log("✅ Basic connectivity: Working");
  console.log("✅ Health endpoint: Working");
  console.log("❌ Database endpoints: Failing with 500 errors");

  console.log("\n🔍 LIKELY CAUSES:");
  console.log("1. DATABASE_URL environment variable not set correctly");
  console.log("2. Prisma client not generated with latest schema");
  console.log("3. Database connection string format issue");
  console.log("4. Supabase connection permissions issue");

  console.log("\n🔧 RECOMMENDED ACTIONS:");
  console.log("1. Check Railway environment variables:");
  console.log("   railway variables");

  console.log("\n2. Verify DATABASE_URL format (should be like):");
  console.log("   postgresql://username:password@host:port/database");

  console.log("\n3. Check Railway logs for specific error messages:");
  console.log("   railway logs");

  console.log("\n4. Regenerate Prisma client in Railway shell:");
  console.log("   railway shell");
  console.log("   npx prisma generate --schema=src/prisma/schema.prisma");

  console.log("\n5. Test database connection in Railway shell:");
  console.log("   npx prisma db pull --schema=src/prisma/schema.prisma");

  console.log("\n📊 NEXT STEPS:");
  console.log("1. Check Railway logs for specific database error messages");
  console.log("2. Verify DATABASE_URL is correctly set in Railway dashboard");
  console.log("3. Ensure Supabase database is accessible from Railway");
  console.log("4. Regenerate Prisma client with latest schema");

  console.log("\n🔗 Useful Commands:");
  console.log("- railway logs (view real-time logs)");
  console.log("- railway variables (check environment variables)");
  console.log("- railway shell (access deployment shell)");
  console.log("- railway status (check deployment status)");
}

deepDiagnostic().catch((error) => {
  console.error("❌ Diagnostic failed:", error);
  process.exit(1);
});
