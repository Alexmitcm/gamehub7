const API_BASE = "https://gamehub4-production.up.railway.app";

async function testAdminEndpoints() {
  console.log("🧪 Testing Admin Endpoints...\n");

  try {
    // Test 1: Get admin stats
    console.log("1. Testing GET /admin/stats");
    const statsResponse = await fetch(`${API_BASE}/admin/stats`);
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

    // Test 2: Get features
    console.log("\n2. Testing GET /admin/features");
    const featuresResponse = await fetch(`${API_BASE}/admin/features`);
    const featuresData = await featuresResponse.json();

    if (featuresResponse.ok) {
      console.log("✅ Features endpoint working");
      console.log(`   - Features count: ${featuresData.data?.length || 0}`);
    } else {
      console.log("❌ Features endpoint failed:", featuresData);
    }

    // Test 3: Get admin actions
    console.log("\n3. Testing GET /admin/actions");
    const actionsResponse = await fetch(`${API_BASE}/admin/actions?limit=5`);
    const actionsData = await actionsResponse.json();

    if (actionsResponse.ok) {
      console.log("✅ Admin actions endpoint working");
      console.log(
        `   - Actions count: ${actionsData.data?.actions?.length || 0}`
      );
    } else {
      console.log("❌ Admin actions endpoint failed:", actionsData);
    }

    // Test 4: Get admin user info
    console.log("\n4. Testing GET /admin/admin-user");
    const adminUserResponse = await fetch(
      `${API_BASE}/admin/admin-user?walletAddress=0x1234567890abcdef1234567890abcdef12345678`
    );
    const adminUserData = await adminUserResponse.json();

    if (adminUserResponse.ok) {
      console.log("✅ Admin user endpoint working");
      console.log(`   - Admin role: ${adminUserData.data?.role || "N/A"}`);
    } else {
      console.log("❌ Admin user endpoint failed:", adminUserData);
    }

    // Test 5: Get users list
    console.log("\n5. Testing GET /admin/users");
    const usersResponse = await fetch(`${API_BASE}/admin/users?limit=5`);
    const usersData = await usersResponse.json();

    if (usersResponse.ok) {
      console.log("✅ Users endpoint working");
      console.log(`   - Users count: ${usersData.data?.users?.length || 0}`);
    } else {
      console.log("❌ Users endpoint failed:", usersData);
    }

    console.log("\n🎉 Admin System Test Complete!");
    console.log("\n📋 Next Steps:");
    console.log("1. Start the web application");
    console.log("2. Navigate to the admin panel");
    console.log("3. Test the admin dashboard features");
    console.log("4. Try user management actions");
    console.log("5. Test feature management");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

// Run the tests
testAdminEndpoints();
