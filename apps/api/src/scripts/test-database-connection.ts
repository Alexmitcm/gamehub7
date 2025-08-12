import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testDatabaseConnection() {
  try {
    console.log("🔍 Testing database connection...");
    console.log("📊 Environment check:");
    console.log(
      `   DATABASE_URL: ${process.env.DATABASE_URL ? "✅ Set" : "❌ Not set"}`
    );
    console.log(`   NODE_ENV: ${process.env.NODE_ENV || "Not set"}`);

    console.log("\n🌐 Network connectivity test...");

    // Test basic connection
    console.log("   Testing basic Prisma connection...");
    await prisma.$connect();
    console.log("   ✅ Prisma connection successful");

    // Test a simple query
    console.log("   Testing simple database query...");
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log(`   ✅ Query successful: ${JSON.stringify(result)}`);

    // Test PremiumProfile table access
    console.log("   Testing PremiumProfile table access...");
    const count = await prisma.premiumProfile.count();
    console.log(`   ✅ PremiumProfile count: ${count}`);

    // Show table structure
    console.log("   Testing table structure...");
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    console.log("   ✅ Available tables:", tables);

    console.log("\n🎉 Database connection test completed successfully!");
  } catch (error) {
    console.error("❌ Database connection test failed:");
    console.error("   Error details:", error);

    if (error.code === "ECONNREFUSED") {
      console.error(
        "   🔴 Connection refused - Database server is not accepting connections"
      );
    } else if (error.code === "ENOTFOUND") {
      console.error("   🔴 Host not found - DNS resolution failed");
    } else if (error.code === "ETIMEDOUT") {
      console.error(
        "   🔴 Connection timeout - Database server is not responding"
      );
    } else if (error.message?.includes("Can't reach database server")) {
      console.error(
        "   🔴 Database server unreachable - Check Supabase project status"
      );
    }

    console.log("\n🔧 Troubleshooting steps:");
    console.log("   1. Check if your Supabase project is active");
    console.log("   2. Verify your project is not paused or suspended");
    console.log("   3. Check if there are any maintenance windows");
    console.log("   4. Verify your database credentials are correct");
    console.log("   5. Try accessing the Supabase dashboard");
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testDatabaseConnection()
  .then(() => {
    console.log("✅ Test completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });
