import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixPremiumProfileData() {
  try {
    console.log("🔧 Starting PremiumProfile data fix...");

    // Find all PremiumProfile records where profileId equals walletAddress
    const incorrectRecords = await prisma.premiumProfile.findMany({
      where: {
        profileId: {
          equals: prisma.premiumProfile.fields.walletAddress
        }
      }
    });

    console.log(`📊 Found ${incorrectRecords.length} incorrect records:`);

    for (const record of incorrectRecords) {
      console.log(`\n🔍 Record ID: ${record.id}`);
      console.log(`   Wallet Address: ${record.walletAddress}`);
      console.log(`   Profile ID: ${record.profileId}`);
      console.log(`   Is Active: ${record.isActive}`);
      console.log(`   Linked At: ${record.linkedAt}`);

      // Check if this wallet has any User records
      const user = await prisma.user.findUnique({
        where: { walletAddress: record.walletAddress }
      });

      if (user) {
        console.log("   ✅ Found User record for wallet");

        // Create a unique profileId that's different from walletAddress
        // We'll use the wallet address with a suffix to make it unique
        const timestamp = Date.now();
        const newProfileId = `0x${timestamp.toString(16).padStart(40, "0")}`;

        console.log(`   🔄 Updating profileId to: ${newProfileId}`);

        // Update the record
        await prisma.premiumProfile.update({
          data: { profileId: newProfileId },
          where: { id: record.id }
        });

        console.log("   ✅ Record updated successfully");
      } else {
        console.log("   ❌ No User record found for wallet - skipping");
      }
    }

    console.log("\n🎉 PremiumProfile data fix completed!");

    // Show final state
    const allRecords = await prisma.premiumProfile.findMany();
    console.log("\n📊 Final PremiumProfile table state:");

    for (const record of allRecords) {
      console.log(`\n   ID: ${record.id}`);
      console.log(`   Wallet: ${record.walletAddress}`);
      console.log(`   Profile: ${record.profileId}`);
      console.log(`   Active: ${record.isActive}`);
    }
  } catch (error) {
    console.error("❌ Error fixing PremiumProfile data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixPremiumProfileData()
  .then(() => {
    console.log("✅ Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
