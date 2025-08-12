import { PrismaClient } from "@prisma/client";

async function testAlternativeConnections() {
  console.log("🔍 Testing alternative database connection methods...");

  // Test 1: Direct connection test
  console.log("\n📊 Test 1: Direct connection test");
  try {
    const prisma = new PrismaClient();
    await prisma.$connect();
    console.log("   ✅ Direct connection successful");
    await prisma.$disconnect();
  } catch (error) {
    console.log("   ❌ Direct connection failed:", error.message);
  }

  // Test 2: Check if it's a DNS issue
  console.log("\n📊 Test 2: DNS resolution test");
  try {
    const { execSync } = require("node:child_process");
    const result = execSync("nslookup db.hyzardurrtfrglfuelyd.supabase.co", {
      encoding: "utf8"
    });
    console.log("   ✅ DNS resolution successful");
    console.log("   📍 Resolved addresses:");
    console.log(result);
  } catch (error) {
    console.log("   ❌ DNS resolution failed:", error.message);
  }

  // Test 3: Check if it's a port issue
  console.log("\n📊 Test 3: Port connectivity test");
  try {
    const { execSync } = require("node:child_process");
    const result = execSync(
      'Test-NetConnection -ComputerName "db.hyzardurrtfrglfuelyd.supabase.co" -Port 5432',
      { encoding: "utf8" }
    );
    console.log("   ✅ Port test completed");
    console.log(result);
  } catch (error) {
    console.log("   ❌ Port test failed:", error.message);
  }

  // Test 4: Check environment variables
  console.log("\n📊 Test 4: Environment variables check");
  console.log(
    `   DATABASE_URL: ${process.env.DATABASE_URL ? "✅ Set" : "❌ Not set"}`
  );
  console.log(
    `   SUPABASE_URL: ${process.env.SUPABASE_URL ? "✅ Set" : "❌ Not set"}`
  );
  console.log(
    `   SUPABASE_KEY: ${process.env.SUPABASE_KEY ? "✅ Set" : "❌ Not set"}`
  );

  // Test 5: Try to parse the connection string
  console.log("\n📊 Test 5: Connection string analysis");
  if (process.env.DATABASE_URL) {
    try {
      const url = new URL(process.env.DATABASE_URL);
      console.log(`   Protocol: ${url.protocol}`);
      console.log(`   Hostname: ${url.hostname}`);
      console.log(`   Port: ${url.port}`);
      console.log(`   Database: ${url.pathname}`);
      console.log(`   Username: ${url.username}`);
      console.log(`   Password: ${url.password ? "***" : "Not set"}`);
    } catch (_error) {
      console.log("   ❌ Invalid connection string format");
    }
  }

  console.log("\n🔧 Recommended actions:");
  console.log("   1. Check Supabase dashboard for project status");
  console.log("   2. Verify project is not paused or suspended");
  console.log("   3. Check if you need to upgrade your plan");
  console.log("   4. Try accessing the project from Supabase dashboard");
  console.log("   5. Check if there are any IP restrictions");
  console.log("   6. Verify your database credentials are correct");
}

testAlternativeConnections()
  .then(() => {
    console.log("\n✅ Alternative connection tests completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Tests failed:", error);
    process.exit(1);
  });
