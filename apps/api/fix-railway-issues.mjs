import fetch from "node-fetch";

const RAILWAY_URL = "https://game5-production.up.railway.app";

console.log("🔧 Railway Backend Issue Fix Script");
console.log("=".repeat(50));
console.log(`📍 Target URL: ${RAILWAY_URL}`);
console.log(`⏰ Started: ${new Date().toISOString()}\n`);

console.log("🎯 ISSUES IDENTIFIED FROM RAILWAY LOGS:");
console.log("1. AdminService method calls failing (TypeError)");
console.log("2. Database connection failing (PrismaClientInitializationError)");
console.log("");

console.log("🔧 IMMEDIATE FIXES NEEDED:");
console.log("");

console.log("📋 FIX 1: AdminService Method Calls");
console.log("-".repeat(30));
console.log("❌ Problem: AdminService methods called as static methods");
console.log("✅ Solution: Instantiate AdminService with WebSocketService");
console.log("📁 File: apps/api/src/controllers/AdminController.ts");
console.log("🔧 Action: Replace AdminService.method() with adminService.method()");
console.log("");

console.log("📋 FIX 2: Database Connection");
console.log("-".repeat(30));
console.log("❌ Problem: Can't reach database server at db.hyzardurrtfrglfuelyd.supabase.co:5432");
console.log("✅ Solution: Set correct DATABASE_URL in Railway environment variables");
console.log("🔧 Action: Add DATABASE_URL to Railway dashboard");
console.log("");

console.log("🚀 STEP-BY-STEP FIX INSTRUCTIONS:");
console.log("=".repeat(50));
console.log("");

console.log("STEP 1: Fix AdminService Method Calls");
console.log("1. Open: apps/api/src/controllers/AdminController.ts");
console.log("2. Add at the top after imports:");
console.log("   const mockWebSocketService = {");
console.log("     broadcastTransactionUpdate: () => {},");
console.log("     broadcastRegistrationUpdate: () => {},");
console.log("     broadcastPremiumStatusUpdate: () => {},");
console.log("     broadcastProfileLinkedUpdate: () => {},");
console.log("     sendNotification: () => {},");
console.log("     getStats: () => ({ connectedClients: 0 })");
console.log("   };");
console.log("   const adminService = new AdminService(mockWebSocketService as any);");
console.log("3. Replace all AdminService.method() calls with adminService.method()");
console.log("");

console.log("STEP 2: Fix Database Connection");
console.log("1. Go to Railway Dashboard: https://railway.app/dashboard");
console.log("2. Select your project: game5-production");
console.log("3. Go to Variables tab");
console.log("4. Add DATABASE_URL with your Supabase connection string:");
console.log("   DATABASE_URL=postgresql://postgres:[password]@db.hyzardurrtfrglfuelyd.supabase.co:5432/postgres");
console.log("5. Get the connection string from your Supabase dashboard");
console.log("");

console.log("STEP 3: Redeploy and Test");
console.log("1. After fixing both issues, redeploy:");
console.log("   railway up");
console.log("2. Test the endpoints:");
console.log("   node test-db-connection.mjs");
console.log("");

console.log("🔍 CURRENT STATUS CHECK:");
console.log("-".repeat(30));

async function checkCurrentStatus() {
  try {
    // Test basic connectivity
    const healthResponse = await fetch(`${RAILWAY_URL}/ping`);
    const healthData = await healthResponse.json();
    
    if (healthResponse.ok) {
      console.log("✅ Basic connectivity: Working");
    } else {
      console.log("❌ Basic connectivity: Failed");
    }

    // Test database endpoints
    const dbEndpoints = [
      { name: "Admin Stats", path: "/admin/stats" },
      { name: "Features", path: "/admin/features" },
      { name: "Games List", path: "/games/list?limit=5" }
    ];

    for (const endpoint of dbEndpoints) {
      try {
        const response = await fetch(`${RAILWAY_URL}${endpoint.path}`);
        const data = await response.json();
        
        if (response.status === 500) {
          console.log(`❌ ${endpoint.name}: Still failing (500) - ${data.error || 'Unknown error'}`);
        } else if (response.ok) {
          console.log(`✅ ${endpoint.name}: Working`);
        } else {
          console.log(`❌ ${endpoint.name}: Failed (${response.status})`);
        }
      } catch (error) {
        console.log(`❌ ${endpoint.name}: Error - ${error.message}`);
      }
    }

  } catch (error) {
    console.log(`❌ Status check failed: ${error.message}`);
  }
}

checkCurrentStatus().then(() => {
  console.log("\n" + "=".repeat(50));
  console.log("📊 SUMMARY");
  console.log("=".repeat(50));
  console.log("");
  console.log("🎯 PRIORITY ACTIONS:");
  console.log("1. Fix AdminService method calls in AdminController.ts");
  console.log("2. Set DATABASE_URL in Railway dashboard");
  console.log("3. Redeploy with: railway up");
  console.log("4. Test with: node test-db-connection.mjs");
  console.log("");
  console.log("🔗 Useful Links:");
  console.log("- Railway Dashboard: https://railway.app/dashboard");
  console.log("- Supabase Dashboard: https://supabase.com/dashboard");
  console.log("- Project URL: https://game5-production.up.railway.app");
  console.log("");
  console.log("💡 Tips:");
  console.log("- The AdminService fix is a code change that needs to be deployed");
  console.log("- The DATABASE_URL fix is an environment variable in Railway");
  console.log("- Both fixes are needed for the backend to work properly");
});
