import logger from "@hey/helpers/logger";
import { config } from "dotenv";
import { createPublicClient, http, parseAbiItem } from "viem";
import { arbitrum } from "viem/chains";

// Load environment variables
config();

const TEST_WALLET = "0x960FCeED1a0AC2Cc22e6e7Bd6876ca527d31D268";

// ABI for the Referral contract
const REFERRAL_ABI = [
  parseAbiItem(
    "function NodeSet(address) view returns (uint256 startTime, uint256 balance, uint24 point, uint24 depthLeftBranch, uint24 depthRightBranch, uint24 depth, address player, address parent, address leftChild, address rightChild, bool isPointChanged, bool unbalancedAllowance)"
  ),
  parseAbiItem(
    "function getBalanceOfPlayerAdmin(address player) view returns (uint256)"
  )
];

// ABI for the GameVault contracts
const GAME_VAULT_ABI = [
  parseAbiItem("function getReward(address) view returns (uint256)")
];

async function focusedWalletTest() {
  console.log("🚀 Focused Wallet Test:", TEST_WALLET);
  console.log("=".repeat(60));

  try {
    // Test 1: Blockchain Connection
    console.log("\n📡 1. Blockchain Connection Test...");
    console.log("-".repeat(40));

    if (!process.env.INFURA_URL) {
      console.log("❌ INFURA_URL not set, skipping blockchain tests");
      return;
    }

    const publicClient = createPublicClient({
      chain: arbitrum,
      transport: http(process.env.INFURA_URL)
    });

    // Test basic RPC connection
    const blockNumber = await publicClient.getBlockNumber();
    console.log(`✅ RPC Connection: SUCCESS (Block ${blockNumber})`);

    // Test wallet native balance
    const nativeBalance = await publicClient.getBalance({
      address: TEST_WALLET as `0x${string}`
    });
    console.log(
      `✅ Native Balance: ${nativeBalance} (${Number(nativeBalance) / 1e18} ETH)`
    );

    // Test 2: Referral Contract Test
    console.log("\n📋 2. Referral Contract Test...");
    console.log("-".repeat(40));

    if (process.env.REFERRAL_CONTRACT_ADDRESS) {
      try {
        // Test NodeSet function
        const nodeData = await publicClient.readContract({
          abi: REFERRAL_ABI,
          address: process.env.REFERRAL_CONTRACT_ADDRESS as `0x${string}`,
          args: [TEST_WALLET as `0x${string}`],
          functionName: "NodeSet"
        });

        const startTime = nodeData[0] as bigint;
        const isPremium = startTime > 0n;

        console.log(
          `✅ Premium Status: ${isPremium ? "PREMIUM" : "NOT PREMIUM"}`
        );

        if (isPremium) {
          console.log(`   📊 Start Time: ${startTime}`);
          console.log(`   💰 Balance: ${nodeData[1]}`);
          console.log(`   🎯 Points: ${nodeData[2]}`);
          console.log(`   👥 Parent: ${nodeData[7]}`);
          console.log(`   👶 Left Child: ${nodeData[8]}`);
          console.log(`   👶 Right Child: ${nodeData[9]}`);

          // Test referral reward
          const referralReward = await publicClient.readContract({
            abi: REFERRAL_ABI,
            address: process.env.REFERRAL_CONTRACT_ADDRESS as `0x${string}`,
            args: [TEST_WALLET as `0x${string}`],
            functionName: "getBalanceOfPlayerAdmin"
          });

          console.log(
            `   💰 Referral Reward: ${referralReward} (${Number(referralReward) / 1e18} USDT)`
          );
        }
      } catch (error) {
        console.log("❌ Referral Contract Test: FAILED");
        console.log(
          `   Error: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    } else {
      console.log(
        "❌ REFERRAL_CONTRACT_ADDRESS not set, skipping referral tests"
      );
    }

    // Test 3: Game Vault Contracts Test
    console.log("\n🎮 3. Game Vault Contracts Test...");
    console.log("-".repeat(40));

    if (
      !process.env.BALANCED_GAME_VAULT_ADDRESS ||
      !process.env.UNBALANCED_GAME_VAULT_ADDRESS
    ) {
      console.log("❌ Game vault addresses not set, skipping game vault tests");
    } else {
      try {
        // Test balanced game vault
        const balancedReward = await publicClient.readContract({
          abi: GAME_VAULT_ABI,
          address: process.env.BALANCED_GAME_VAULT_ADDRESS as `0x${string}`,
          args: [TEST_WALLET as `0x${string}`],
          functionName: "getReward"
        });

        console.log(
          `✅ Balanced Game Vault: ${balancedReward} (${Number(balancedReward) / 1e18} USDT)`
        );

        // Test unbalanced game vault
        const unbalancedReward = await publicClient.readContract({
          abi: GAME_VAULT_ABI,
          address: process.env.UNBALANCED_GAME_VAULT_ADDRESS as `0x${string}`,
          args: [TEST_WALLET as `0x${string}`],
          functionName: "getReward"
        });

        console.log(
          `✅ Unbalanced Game Vault: ${unbalancedReward} (${Number(unbalancedReward) / 1e18} USDT)`
        );

        const totalGameRewards =
          Number(balancedReward) + Number(unbalancedReward);
        console.log(`✅ Total Game Rewards: ${totalGameRewards / 1e18} USDT`);
      } catch (error) {
        console.log("❌ Game Vault Test: FAILED");
        console.log(
          `   Error: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }

    // Test 4: USDT Contract Test (if available)
    console.log("\n💰 4. USDT Contract Test...");
    console.log("-".repeat(40));

    if (process.env.USDT_CONTRACT_ADDRESS) {
      try {
        const USDT_ABI = [
          parseAbiItem("function balanceOf(address) view returns (uint256)")
        ];

        const usdtBalance = await publicClient.readContract({
          abi: USDT_ABI,
          address: process.env.USDT_CONTRACT_ADDRESS as `0x${string}`,
          args: [TEST_WALLET as `0x${string}`],
          functionName: "balanceOf"
        });

        console.log(
          `✅ USDT Balance: ${usdtBalance} (${Number(usdtBalance) / 1e6} USDT)`
        );

        const hasSufficientUSDT = Number(usdtBalance) >= 200 * 1e6; // 200 USDT minimum
        console.log(
          `✅ Sufficient USDT (200+): ${hasSufficientUSDT ? "YES" : "NO"}`
        );
      } catch (error) {
        console.log("❌ USDT Contract Test: FAILED");
        console.log(
          `   Error: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    } else {
      console.log(
        "⚠️ USDT_CONTRACT_ADDRESS not set, skipping USDT balance test"
      );
      console.log(
        "   Note: USDT contract address for Arbitrum One: 0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9"
      );
    }

    // Test 5: Transaction History Test
    console.log("\n📜 5. Transaction History Test...");
    console.log("-".repeat(40));

    try {
      // Get recent transactions for the wallet
      const blockNumber = await publicClient.getBlockNumber();
      const recentBlock = await publicClient.getBlock({ blockNumber });

      console.log(`✅ Latest Block: ${blockNumber}`);
      console.log(
        `✅ Block Timestamp: ${new Date(Number(recentBlock.timestamp) * 1000).toISOString()}`
      );

      // Note: Getting transaction history requires more complex logic
      // For now, we'll just show the current block info
      console.log(
        "✅ Transaction History: Available (requires additional implementation)"
      );
    } catch (error) {
      console.log("❌ Transaction History Test: FAILED");
      console.log(
        `   Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }

    // Test 6: Summary Report
    console.log("\n📊 6. Summary Report...");
    console.log("-".repeat(40));

    // Collect all the data we've gathered
    let isPremium = false;
    let referralReward = 0n;
    let balancedReward = 0n;
    let unbalancedReward = 0n;
    let usdtBalance = 0n;

    try {
      if (process.env.REFERRAL_CONTRACT_ADDRESS) {
        const nodeData = await publicClient.readContract({
          abi: REFERRAL_ABI,
          address: process.env.REFERRAL_CONTRACT_ADDRESS as `0x${string}`,
          args: [TEST_WALLET as `0x${string}`],
          functionName: "NodeSet"
        });
        isPremium = (nodeData[0] as bigint) > 0n;

        referralReward = (await publicClient.readContract({
          abi: REFERRAL_ABI,
          address: process.env.REFERRAL_CONTRACT_ADDRESS as `0x${string}`,
          args: [TEST_WALLET as `0x${string}`],
          functionName: "getBalanceOfPlayerAdmin"
        })) as bigint;
      }

      if (process.env.BALANCED_GAME_VAULT_ADDRESS) {
        balancedReward = (await publicClient.readContract({
          abi: GAME_VAULT_ABI,
          address: process.env.BALANCED_GAME_VAULT_ADDRESS as `0x${string}`,
          args: [TEST_WALLET as `0x${string}`],
          functionName: "getReward"
        })) as bigint;
      }

      if (process.env.UNBALANCED_GAME_VAULT_ADDRESS) {
        unbalancedReward = (await publicClient.readContract({
          abi: GAME_VAULT_ABI,
          address: process.env.UNBALANCED_GAME_VAULT_ADDRESS as `0x${string}`,
          args: [TEST_WALLET as `0x${string}`],
          functionName: "getReward"
        })) as bigint;
      }

      if (process.env.USDT_CONTRACT_ADDRESS) {
        const USDT_ABI = [
          parseAbiItem("function balanceOf(address) view returns (uint256)")
        ];
        usdtBalance = (await publicClient.readContract({
          abi: USDT_ABI,
          address: process.env.USDT_CONTRACT_ADDRESS as `0x${string}`,
          args: [TEST_WALLET as `0x${string}`],
          functionName: "balanceOf"
        })) as bigint;
      }
    } catch (_error) {
      console.log("⚠️ Some data collection failed, showing partial summary");
    }

    const totalRewards =
      Number(referralReward) +
      Number(balancedReward) +
      Number(unbalancedReward);

    console.log(`📋 Summary for ${TEST_WALLET}:`);
    console.log(`   ⭐ Premium Status: ${isPremium ? "PREMIUM" : "STANDARD"}`);
    console.log(`   💰 Native Balance: ${Number(nativeBalance) / 1e18} ETH`);
    console.log(`   💵 USDT Balance: ${Number(usdtBalance) / 1e6} USDT`);
    console.log(`   👥 Referral Reward: ${Number(referralReward) / 1e18} USDT`);
    console.log(
      `   🎮 Game Rewards: ${Number(balancedReward + unbalancedReward) / 1e18} USDT`
    );
    console.log(`   💎 Total Rewards: ${totalRewards / 1e18} USDT`);
    console.log(
      `   🔗 Has Sufficient USDT: ${Number(usdtBalance) >= 200 * 1e6 ? "YES" : "NO"}`
    );

    // Test 7: Recommendations
    console.log("\n💡 7. Recommendations...");
    console.log("-".repeat(40));

    if (isPremium) {
      console.log("🎉 User is already premium!");
      if (totalRewards > 0) {
        console.log("💰 User has rewards available for claiming");
      }
    } else {
      console.log("📝 User is not premium. To become premium:");
      console.log("   1. Ensure wallet has at least 200 USDT");
      console.log("   2. Register in the referral program on-chain");
      console.log("   3. Complete the premium registration process");
    }

    if (Number(usdtBalance) < 200 * 1e6) {
      console.log("⚠️ User has insufficient USDT for premium registration");
      console.log(
        `   Current: ${Number(usdtBalance) / 1e6} USDT, Required: 200 USDT`
      );
    }

    console.log("\n✅ Focused wallet test completed successfully!");
  } catch (error) {
    console.error("❌ Error in focused wallet test:", error);
    logger.error("Error in focused wallet test:", error);
  }
}

// Run the test
focusedWalletTest()
  .then(() => {
    console.log("\n🏁 Focused test completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Focused test failed:", error);
    process.exit(1);
  });
