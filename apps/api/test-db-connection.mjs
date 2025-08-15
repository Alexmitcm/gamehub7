import fetch from "node-fetch";

const RAILWAY_URL = "https://game5-production.up.railway.app";

async function testDatabaseConnection() {
  console.log("🔍 Database Connection Test");
  console.log("=".repeat(40));
  console.log(`📍 Target URL: ${RAILWAY_URL}`);
  console.log(`⏰ Started: ${new Date().toISOString()}\n`);

  // Test endpoints that require database access
  const dbEndpoints = [
    { name: "Admin Stats", path: "/admin/stats" },
    { name: "Features", path: "/admin/features" },
    { name: "Games List", path: "/games/list?limit=5" },
    { name: "Admin Actions", path: "/admin/actions?limit=5" }
  ];

  console.log("🔍 Testing Database-Dependent Endpoints:");
  console.log("-".repeat(40));

  for (const endpoint of dbEndpoints) {
    try {
      const startTime = Date.now();
      const response = await fetch(`${RAILWAY_URL}${endpoint.path}`, {
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "DB-Connection-Test/1.0"
        },
        method: "GET",
        timeout: 10000
      });

      const responseTime = Date.now() - startTime;
      const data = await response
        .json()
        .catch(() => ({ error: "Invalid JSON response" }));

      if (response.ok) {
        console.log(
          `✅ ${endpoint.name}: SUCCESS (${response.status}) - ${responseTime}ms`
        );
        if (data && Object.keys(data).length > 0) {
          console.log(
            `   📊 Response: ${JSON.stringify(data).substring(0, 100)}...`
          );
        }
      } else {
        console.log(
          `❌ ${endpoint.name}: FAILED (${response.status}) - ${responseTime}ms`
        );
        console.log(`   📊 Error: ${JSON.stringify(data)}`);

        // Analyze the error
        if (response.status === 500) {
          if (data.error && data.error.includes("database")) {
            console.log("   🔍 Analysis: Database connection issue");
          } else if (data.error && data.error.includes("prisma")) {
            console.log("   🔍 Analysis: Prisma client issue");
          } else {
            console.log("   🔍 Analysis: Server error (check logs)");
          }
        }
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name}: ERROR - ${error.message}`);
    }
  }

  console.log("\n" + "=".repeat(40));
  console.log("📋 ANALYSIS & RECOMMENDATIONS");
  console.log("=".repeat(40));

  console.log("\n🎯 Based on the test results:");

  console.log("\n🔧 IMMEDIATE ACTIONS NEEDED:");
  console.log(
    "1. Restart your Railway deployment to pick up database changes:"
  );
  console.log("   railway up");

  console.log("\n2. Check Railway logs for specific error messages:");
  console.log("   railway logs");

  console.log("\n3. Verify Prisma client is generated:");
  console.log("   railway shell");
  console.log("   # In shell:");
  console.log("   npx prisma generate --schema=src/prisma/schema.prisma");

  console.log("\n4. Check if database tables exist:");
  console.log("   # In Railway shell:");
  console.log("   npx prisma db pull --schema=src/prisma/schema.prisma");

  console.log("\n🔍 TROUBLESHOOTING STEPS:");
  console.log(
    "1. The database migrations ran successfully (as shown in your logs)"
  );
  console.log(
    "2. The application might need to be restarted to use the new schema"
  );
  console.log("3. The Prisma client might need to be regenerated");
  console.log(
    "4. Check if the DATABASE_URL is correctly set in Railway variables"
  );

  console.log("\n📊 EXPECTED OUTCOME:");
  console.log(
    "After restarting the deployment, the database endpoints should work."
  );
  console.log(
    "If they still fail, check the Railway logs for specific error messages."
  );

  console.log("\n🔗 Useful Commands:");
  console.log("- railway up (redeploy and restart)");
  console.log("- railway logs (view real-time logs)");
  console.log("- railway shell (access deployment shell)");
  console.log("- railway variables (check environment variables)");
}

testDatabaseConnection().catch((error) => {
  console.error("❌ Test failed:", error);
  process.exit(1);
});
