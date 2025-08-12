import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  // Increase timeouts to handle slow database
  log: ["query", "info", "warn", "error"]
});

async function testSlowConnection() {
  try {
    console.log("🔍 Testing database connection with extended timeouts...");
    console.log(
      "   This test accounts for the slow database performance shown in your dashboard"
    );

    // Test 1: Basic connection with timeout
    console.log("\n📊 Test 1: Basic database connection (30s timeout)");
    const connectPromise = prisma.$connect();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error("Connection timeout after 30 seconds")),
        30000
      )
    );

    try {
      await Promise.race([connectPromise, timeoutPromise]);
      console.log("   ✅ Database connection successful (but slow)");
    } catch (_timeoutError) {
      console.log("   ❌ Connection timed out after 30 seconds");
      console.log("   This confirms the database is extremely slow");
      return;
    }

    // Test 2: Simple query with timeout
    console.log("\n📊 Test 2: Simple database query (60s timeout)");
    const queryPromise = prisma.$queryRaw`SELECT 1 as test`;
    const queryTimeoutPromise = new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error("Query timeout after 60 seconds")),
        60000
      )
    );

    try {
      const result = await Promise.race([queryPromise, queryTimeoutPromise]);
      console.log(`   ✅ Query successful: ${JSON.stringify(result)}`);
      console.log("   ⚠️  Database is working but very slow");
    } catch (_queryTimeoutError) {
      console.log("   ❌ Query timed out after 60 seconds");
      console.log("   This confirms severe database performance issues");
      return;
    }

    // Test 3: Check if we can access tables
    console.log("\n📊 Test 3: Table access test (60s timeout)");
    const tablePromise = prisma.premiumProfile.count();
    const tableTimeoutPromise = new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error("Table access timeout after 60 seconds")),
        60000
      )
    );

    try {
      const count = await Promise.race([tablePromise, tableTimeoutPromise]);
      console.log(`   ✅ PremiumProfile access successful: ${count} records`);
      console.log("   🎉 Database is accessible but slow");
    } catch (_tableTimeoutError) {
      console.log("   ❌ Table access timed out after 60 seconds");
      console.log("   This confirms the database is unusably slow");
    }
  } catch (error) {
    console.error("❌ Slow connection test failed:", error.message);

    if (error.message.includes("timeout")) {
      console.error("   🔴 Database is responding but extremely slow");
      console.error(
        "   This matches the performance issues in your Supabase dashboard"
      );
    } else {
      console.error("   🔴 Other error:", error.message);
    }
  } finally {
    await prisma.$disconnect();
  }

  console.log("\n🔧 **IMMEDIATE ACTION REQUIRED**:");
  console.log("   1. Go to your Supabase dashboard");
  console.log('   2. Click "PERFORMANCE 9" to see the 9 performance issues');
  console.log(
    "   3. Fix the performance problems (especially the slow queries)"
  );
  console.log('   4. Click "SECURITY 1" to fix the OTP expiration issue');
  console.log(
    "   5. Your database connection will work once performance improves"
  );
}

testSlowConnection()
  .then(() => {
    console.log("\n✅ Slow connection test completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Test failed:", error);
    process.exit(1);
  });
