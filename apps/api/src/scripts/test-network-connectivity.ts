import * as net from "node:net";

async function testNetworkConnectivity() {
  const host = "db.hyzardurrtfrglfuelyd.supabase.co";
  const port = 5432;

  console.log("🔍 Testing network connectivity to Supabase database...");
  console.log(`   Host: ${host}`);
  console.log(`   Port: ${port}`);

  return new Promise((resolve) => {
    const socket = new net.Socket();

    // Set timeout
    socket.setTimeout(10000); // 10 seconds

    socket.on("connect", () => {
      console.log("✅ Network connection successful!");
      console.log("   The database server is reachable from your network");
      console.log("   The issue might be with Prisma or authentication");
      socket.destroy();
      resolve(true);
    });

    socket.on("timeout", () => {
      console.log("❌ Network connection timed out");
      console.log("   The database server is not reachable from your network");
      console.log("   This suggests a network/firewall issue");
      socket.destroy();
      resolve(false);
    });

    socket.on("error", (error) => {
      console.log("❌ Network connection failed:", error.message);
      console.log("   The database server is not reachable from your network");
      console.log("   This suggests a network/firewall issue");
      resolve(false);
    });

    // Attempt connection
    socket.connect(port, host);
  });
}

async function runTests() {
  try {
    console.log("🚀 Starting network connectivity tests...\n");

    const isConnected = await testNetworkConnectivity();

    console.log("\n🔧 **DIAGNOSIS RESULTS:**");

    if (isConnected) {
      console.log("✅ Network connectivity: WORKING");
      console.log("❌ Database access: FAILING");
      console.log("   The issue is likely:");
      console.log("   - Prisma configuration");
      console.log("   - Authentication problems");
      console.log("   - Database credentials");
    } else {
      console.log("❌ Network connectivity: FAILING");
      console.log("❌ Database access: FAILING");
      console.log("   The issue is likely:");
      console.log("   - Firewall blocking port 5432");
      console.log("   - ISP blocking the connection");
      console.log("   - Corporate network restrictions");
      console.log("   - VPN interference");
    }

    console.log("\n🔧 **NEXT STEPS:**");
    console.log("   1. Check your Supabase project status");
    console.log("   2. Verify your network/firewall settings");
    console.log("   3. Try from a different network");
    console.log("   4. Check if port 5432 is blocked");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

runTests()
  .then(() => {
    console.log("\n✅ Network tests completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Tests failed:", error);
    process.exit(1);
  });
