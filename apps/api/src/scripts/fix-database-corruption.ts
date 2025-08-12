import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixDatabaseCorruption() {
  try {
    console.log("🔧 Starting database corruption fix...");

    // 1. Fix PremiumProfile records where profileId equals walletAddress
    console.log("\n📊 Step 1: Checking PremiumProfile corruption...");

    const corruptedPremiumProfiles = await prisma.premiumProfile.findMany({
      where: {
        profileId: {
          equals: prisma.premiumProfile.fields.walletAddress
        }
      }
    });

    if (corruptedPremiumProfiles.length > 0) {
      console.log(
        `   Found ${corruptedPremiumProfiles.length} corrupted PremiumProfile records`
      );

      for (const record of corruptedPremiumProfiles) {
        console.log(`   🔍 Corrupted Record ID: ${record.id}`);
        console.log(`      Wallet: ${record.walletAddress}`);
        console.log(`      Profile: ${record.profileId}`);

        // Generate a unique profileId
        const timestamp = Date.now();
        const newProfileId = `0x${timestamp.toString(16).padStart(40, "0")}`;

        console.log(`      🔄 Fixing profileId to: ${newProfileId}`);

        try {
          await prisma.premiumProfile.update({
            data: { profileId: newProfileId },
            where: { id: record.id }
          });
          console.log("      ✅ Fixed successfully");
        } catch (error) {
          console.log(`      ❌ Failed to fix: ${error}`);
        }
      }
    } else {
      console.log("   ✅ No corrupted PremiumProfile records found");
    }

    // 2. Check for other potential data integrity issues
    console.log("\n📊 Step 2: Checking other data integrity issues...");

    // Check for duplicate walletAddress entries
    const duplicateWallets = await prisma.$queryRaw`
      SELECT "walletAddress", COUNT(*) as count
      FROM "PremiumProfile"
      GROUP BY "walletAddress"
      HAVING COUNT(*) > 1
    `;

    if (Array.isArray(duplicateWallets) && duplicateWallets.length > 0) {
      console.log(
        `   ⚠️  Found ${duplicateWallets.length} wallets with duplicate PremiumProfile entries`
      );
      for (const dup of duplicateWallets) {
        console.log(`      Wallet: ${dup.walletAddress}, Count: ${dup.count}`);
      }
    } else {
      console.log("   ✅ No duplicate wallet entries found");
    }

    // Check for duplicate profileId entries
    const duplicateProfiles = await prisma.$queryRaw`
      SELECT "profileId", COUNT(*) as count
      FROM "PremiumProfile"
      GROUP BY "profileId"
      HAVING COUNT(*) > 1
    `;

    if (Array.isArray(duplicateProfiles) && duplicateProfiles.length > 0) {
      console.log(
        `   ⚠️  Found ${duplicateProfiles.length} profiles with duplicate entries`
      );
      for (const dup of duplicateProfiles) {
        console.log(`      Profile: ${dup.profileId}, Count: ${dup.count}`);
      }
    } else {
      console.log("   ✅ No duplicate profile entries found");
    }

    // 3. Show final state
    console.log("\n📊 Step 3: Final database state...");

    const allPremiumProfiles = await prisma.premiumProfile.findMany({
      orderBy: { linkedAt: "desc" }
    });

    console.log(
      `   Total PremiumProfile records: ${allPremiumProfiles.length}`
    );

    for (const record of allPremiumProfiles) {
      console.log(`\n   ID: ${record.id}`);
      console.log(`   Wallet: ${record.walletAddress}`);
      console.log(`   Profile: ${record.profileId}`);
      console.log(`   Active: ${record.isActive}`);
      console.log(`   Linked: ${record.linkedAt}`);

      // Check if wallet and profile are still the same (should not be)
      if (
        record.walletAddress.toLowerCase() === record.profileId.toLowerCase()
      ) {
        console.log("   ⚠️  WARNING: Still corrupted!");
      } else {
        console.log("   ✅ Data integrity OK");
      }
    }

    console.log("\n🎉 Database corruption fix completed!");
  } catch (error) {
    console.error("❌ Error during database corruption fix:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixDatabaseCorruption()
  .then(() => {
    console.log("✅ Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
