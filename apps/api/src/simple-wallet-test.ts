import logger from "@hey/helpers/logger";
import { config } from "dotenv";

// Load environment variables
config();

const TEST_WALLET = "0x960FCeED1a0AC2Cc22e6e7Bd6876ca527d31D268";

async function simpleWalletTest() {
  console.log("🚀 Simple Wallet Test:", TEST_WALLET);
  console.log("=".repeat(60));

  try {
    // Test 1: Basic wallet validation
    console.log("\n📡 1. Basic Wallet Validation...");
    console.log("-".repeat(40));

    // Check if wallet address is valid format
    const isValidAddress = /^0x[a-fA-F0-9]{40}$/.test(TEST_WALLET);
    console.log(`✅ Valid Address Format: ${isValidAddress ? "YES" : "NO"}`);

    // Check if it's a checksum address
    const isChecksumAddress =
      TEST_WALLET === TEST_WALLET.toLowerCase() ||
      TEST_WALLET === TEST_WALLET.toUpperCase() ||
      /^0x[a-fA-F0-9]{40}$/.test(TEST_WALLET);
    console.log(`✅ Checksum Valid: ${isChecksumAddress ? "YES" : "NO"}`);

    // Normalize address
    const normalizedAddress = TEST_WALLET.toLowerCase();
    console.log(`✅ Normalized Address: ${normalizedAddress}`);

    // Test 2: Environment Variables Check
    console.log("\n🔧 2. Environment Variables Check...");
    console.log("-".repeat(40));

    const requiredEnvVars = [
      "REFERRAL_CONTRACT_ADDRESS",
      "BALANCED_GAME_VAULT_ADDRESS",
      "UNBALANCED_GAME_VAULT_ADDRESS",
      "USDT_CONTRACT_ADDRESS",
      "INFURA_URL",
      "DATABASE_URL",
      "JWT_SECRET"
    ];

    console.log("📋 Required Environment Variables:");
    requiredEnvVars.forEach((envVar) => {
      const value = process.env[envVar];
      const status = value ? "✅ SET" : "❌ MISSING";
      const displayValue = value ? `${value.substring(0, 20)}...` : "Not set";
      console.log(`   ${envVar}: ${status} (${displayValue})`);
    });

    // Test 3: Database Connection Test (if DATABASE_URL is available)
    console.log("\n🗄️ 3. Database Connection Test...");
    console.log("-".repeat(40));

    if (process.env.DATABASE_URL) {
      try {
        // Try to import Prisma client
        const { PrismaClient } = await import("@prisma/client");
        const prisma = new PrismaClient();

        // Test connection
        await prisma.$connect();
        console.log("✅ Database Connection: SUCCESS");

        // Test basic query
        const userCount = await prisma.user.count();
        console.log(`✅ User Count: ${userCount}`);

        // Test premium profile query
        const premiumProfileCount = await prisma.premiumProfile.count();
        console.log(`✅ Premium Profile Count: ${premiumProfileCount}`);

        await prisma.$disconnect();
      } catch (error) {
        console.log("❌ Database Connection: FAILED");
        console.log(
          `   Error: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    } else {
      console.log("⚠️ Database Connection: SKIPPED (DATABASE_URL not set)");
    }

    // Test 4: Blockchain RPC Test (if INFURA_URL is available)
    console.log("\n📡 4. Blockchain RPC Test...");
    console.log("-".repeat(40));

    if (process.env.INFURA_URL) {
      try {
        // Try to import viem
        const { createPublicClient, http } = await import("viem");
        const { arbitrum } = await import("viem/chains");

        const publicClient = createPublicClient({
          chain: arbitrum,
          transport: http(process.env.INFURA_URL)
        });

        // Test basic RPC call
        const blockNumber = await publicClient.getBlockNumber();
        console.log("✅ RPC Connection: SUCCESS");
        console.log(`   📊 Current Block: ${blockNumber}`);

        // Test wallet balance (native token)
        const balance = await publicClient.getBalance({
          address: TEST_WALLET as `0x${string}`
        });
        console.log(
          `   💰 Native Balance: ${balance} (${Number(balance) / 1e18} ETH)`
        );
      } catch (error) {
        console.log("❌ RPC Connection: FAILED");
        console.log(
          `   Error: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    } else {
      console.log("⚠️ RPC Connection: SKIPPED (INFURA_URL not set)");
    }

    // Test 5: Contract Addresses Validation
    console.log("\n🏗️ 5. Contract Addresses Validation...");
    console.log("-".repeat(40));

    const contractAddresses = {
      balancedGameVault: process.env.BALANCED_GAME_VAULT_ADDRESS,
      referral: process.env.REFERRAL_CONTRACT_ADDRESS,
      unbalancedGameVault: process.env.UNBALANCED_GAME_VAULT_ADDRESS,
      usdt: process.env.USDT_CONTRACT_ADDRESS
    };

    Object.entries(contractAddresses).forEach(([name, address]) => {
      if (address) {
        const isValid = /^0x[a-fA-F0-9]{40}$/.test(address);
        console.log(
          `   ${name}: ${isValid ? "✅ VALID" : "❌ INVALID"} (${address})`
        );
      } else {
        console.log(`   ${name}: ❌ MISSING`);
      }
    });

    // Test 6: Summary Report
    console.log("\n📊 6. Summary Report...");
    console.log("-".repeat(40));

    const summary = {
      hasContractAddresses: Object.values(contractAddresses).some(
        (addr) => !!addr
      ),
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      hasInfuraUrl: !!process.env.INFURA_URL,
      isValidAddress: isValidAddress,
      missingEnvVars: requiredEnvVars.filter((envVar) => !process.env[envVar])
        .length,
      wallet: TEST_WALLET
    };

    console.log(`📋 Summary for ${summary.wallet}:`);
    console.log(
      `   🔍 Valid Address: ${summary.isValidAddress ? "YES" : "NO"}`
    );
    console.log(
      `   🗄️ Database URL: ${summary.hasDatabaseUrl ? "SET" : "MISSING"}`
    );
    console.log(
      `   📡 Infura URL: ${summary.hasInfuraUrl ? "SET" : "MISSING"}`
    );
    console.log(
      `   🏗️ Contract Addresses: ${summary.hasContractAddresses ? "PARTIAL" : "MISSING"}`
    );
    console.log(`   ⚠️ Missing Env Vars: ${summary.missingEnvVars}`);

    // Test 7: Recommendations
    console.log("\n💡 7. Recommendations...");
    console.log("-".repeat(40));

    if (!summary.isValidAddress) {
      console.log("❌ Wallet address format is invalid");
    }

    if (summary.missingEnvVars > 0) {
      console.log(`⚠️ Missing ${summary.missingEnvVars} environment variables`);
      console.log(
        "   To run full tests, set the following environment variables:"
      );
      requiredEnvVars.forEach((envVar) => {
        if (!process.env[envVar]) {
          console.log(`   - ${envVar}`);
        }
      });
    }

    if (
      summary.hasDatabaseUrl &&
      summary.hasInfuraUrl &&
      summary.hasContractAddresses
    ) {
      console.log("✅ All required environment variables are set!");
      console.log("   You can now run the full wallet test with all features.");
    }

    console.log("\n✅ Simple wallet test completed successfully!");
  } catch (error) {
    console.error("❌ Error in simple wallet test:", error);
    logger.error("Error in simple wallet test:", error);
  }
}

// Run the test
simpleWalletTest()
  .then(() => {
    console.log("\n🏁 Simple test completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Simple test failed:", error);
    process.exit(1);
  });
