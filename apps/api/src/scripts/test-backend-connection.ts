import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testBackendConnection() {
  try {
    console.log("🔍 Testing backend database connection...");

    // Test 1: Basic connection
    console.log("\n📊 Test 1: Basic database connection");
    await prisma.$connect();
    console.log("   ✅ Database connection successful");

    // Test 2: Simple query
    console.log("\n📊 Test 2: Simple database query");
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log(`   ✅ Query successful: ${JSON.stringify(result)}`);

    // Test 3: PremiumProfile table access
    console.log("\n📊 Test 3: PremiumProfile table access");
    const premiumCount = await prisma.premiumProfile.count();
    console.log(`   ✅ PremiumProfile count: ${premiumCount}`);

    // Test 4: Check data integrity
    console.log("\n📊 Test 4: Data integrity check");
    const premiumProfiles = await prisma.premiumProfile.findMany({
      select: {
        id: true,
        isActive: true,
        profileId: true,
        walletAddress: true
      }
    });

    console.log(`   📊 Found ${premiumProfiles.length} premium profiles:`);
    for (const profile of premiumProfiles) {
      const isCorrupted = profile.walletAddress === profile.profileId;
      console.log(`      ID: ${profile.id}`);
      console.log(`      Wallet: ${profile.walletAddress}`);
      console.log(`      Profile: ${profile.profileId}`);
      console.log(`      Status: ${isCorrupted ? "❌ CORRUPTED" : "✅ OK"}`);
      console.log("");
    }

    // Test 5: User table access
    console.log("\n📊 Test 5: User table access");
    const userCount = await prisma.user.count();
    console.log(`   ✅ User count: ${userCount}`);

    // Test 6: Preference table access
    console.log("\n📊 Test 6: Preference table access");
    const preferenceCount = await prisma.preference.count();
    console.log(`   ✅ Preference count: ${preferenceCount}`);

    console.log(
      "\n🎉 Backend database connection test completed successfully!"
    );
    console.log(
      "   The backend should now be able to connect and function properly."
    );
  } catch (error) {
    console.error("❌ Backend database connection test failed:");
    console.error("   Error details:", error);

    if (error.message?.includes("Can't reach database server")) {
      console.error("   🔴 Database server still unreachable");
      console.error(
        "   This suggests the RLS fix didn't resolve the connection issue"
      );
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
}

// Run the test
testBackendConnection()
  .then(() => {
    console.log("✅ Test completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });
