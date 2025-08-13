const fetch = require("node-fetch");

const RAILWAY_URL = "https://defigame-production.up.railway.app";

async function testRailwayDeployment() {
  console.log("🧪 Testing Railway Deployment...\n");

  try {
    // Test 1: Health check
    console.log("1. Testing health check endpoint");
    const healthResponse = await fetch(`${RAILWAY_URL}/ping`);
    const healthData = await healthResponse.json();

    if (healthResponse.ok) {
      console.log("✅ Health check endpoint working");
      console.log(`   - Response: ${JSON.stringify(healthData)}`);
    } else {
      console.log("❌ Health check endpoint failed:", healthData);
    }

    // Test 2: Admin stats endpoint
    console.log("\n2. Testing admin stats endpoint");
    const statsResponse = await fetch(`${RAILWAY_URL}/admin/stats`);
    const statsData = await statsResponse.json();

    if (statsResponse.ok) {
      console.log("✅ Admin stats endpoint working");
      console.log(`   - Total users: ${statsData.data?.totalUsers || "N/A"}`);
      console.log(
        `   - Admin users: ${statsData.data?.adminUsers?.total || "N/A"}`
      );
    } else {
      console.log("❌ Admin stats endpoint failed:", statsData);
    }

    // Test 3: Features endpoint
    console.log("\n3. Testing features endpoint");
    const featuresResponse = await fetch(`${RAILWAY_URL}/admin/features`);
    const featuresData = await featuresResponse.json();

    if (featuresResponse.ok) {
      console.log("✅ Features endpoint working");
      console.log(`   - Features count: ${featuresData.data?.length || 0}`);
    } else {
      console.log("❌ Features endpoint failed:", featuresData);
    }

    // Test 4: Admin actions endpoint
    console.log("\n4. Testing admin actions endpoint");
    const actionsResponse = await fetch(`${RAILWAY_URL}/admin/actions?limit=5`);
    const actionsData = await actionsResponse.json();

    if (actionsResponse.ok) {
      console.log("✅ Admin actions endpoint working");
      console.log(
        `   - Actions count: ${actionsData.data?.actions?.length || 0}`
      );
    } else {
      console.log("❌ Admin actions endpoint failed:", actionsData);
    }

    // Test 5: Admin user info endpoint
    console.log("\n5. Testing admin user info endpoint");
    const adminUserResponse = await fetch(
      `${RAILWAY_URL}/admin/admin-user?walletAddress=0x1234567890abcdef1234567890abcdef12345678`
    );
    const adminUserData = await adminUserResponse.json();

    if (adminUserResponse.ok) {
      console.log("✅ Admin user endpoint working");
      console.log(`   - Admin role: ${adminUserData.data?.role || "N/A"}`);
    } else {
      console.log("❌ Admin user endpoint failed:", adminUserData);
    }

    console.log("\n🎉 Railway Deployment Test Complete!");
    console.log("\n📋 Summary:");
    console.log(`- Railway URL: ${RAILWAY_URL}`);
    console.log("- Port: 8080 (Railway default)");
    console.log("- Admin system endpoints tested");

    console.log("\n🔧 Next Steps:");
    console.log("1. Check Railway dashboard for deployment status");
    console.log("2. Verify environment variables are set correctly");
    console.log("3. Run database migrations if needed");
    console.log("4. Test admin panel functionality");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.log("\n🔧 Troubleshooting:");
    console.log("1. Check if Railway deployment is running");
    console.log("2. Verify the Railway URL is correct");
    console.log("3. Check Railway logs for errors");
    console.log("4. Ensure environment variables are set");
  }
}

// Run the tests
testRailwayDeployment();
