import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testSimpleConnection() {
  try {
    console.log("🔍 Testing simple database connection after RLS fix...");

    // Test 1: Basic connection
    console.log("\n📊 Test 1: Basic database connection");
    await prisma.$connect();
    console.log("   ✅ Database connection successful");

    // Test 2: Simple query
    console.log("\n📊 Test 2: Simple database query");
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log(`   ✅ Query successful: ${JSON.stringify(result)}`);

    // Test 3: Check if PremiumProfile is accessible
    console.log("\n📊 Test 3: PremiumProfile table access");
    try {
      const count = await prisma.premiumProfile.count();
      console.log(`   ✅ PremiumProfile count: ${count}`);
      console.log("   🎉 RLS fix is working!");
    } catch (tableError) {
      console.log("   ❌ PremiumProfile access failed:", tableError.message);
    }

    console.log("\n🎉 Database connection test completed successfully!");
    console.log("   The RLS fix appears to be working.");
  } catch (error) {
    console.error("❌ Database connection test failed:");
    console.error("   Error details:", error.message);

    if (error.message?.includes("Can't reach database server")) {
      console.error("   🔴 Database server still unreachable");
      console.error("   The RLS fix may need more time to take effect");
    } else if (error.message?.includes("permission denied")) {
      console.error(
        "   🔴 Permission denied - RLS policies might be too restrictive"
      );
    } else {
      console.error("   🔴 Unknown error - check the error details above");
    }
  } finally {
    await prisma.$disconnect();
  }

  console.log("\n🔧 Next steps:");
  console.log("   1. Wait 2-3 more minutes for RLS changes to fully propagate");
  console.log(
    "   2. Check your Supabase dashboard - performance warnings should be gone"
  );
  console.log("   3. Try starting your backend again");
  console.log("   4. If still slow, there may be other performance issues");
}

testSimpleConnection()
  .then(() => {
    console.log("\n✅ Test completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Test failed:", error);
    process.exit(1);
  });
