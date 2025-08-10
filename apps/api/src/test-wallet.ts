import logger from "@hey/helpers/logger";
import { config } from "dotenv";
import BlockchainService from "./services/BlockchainService";
import EventService from "./services/EventService";
import PremiumService from "./services/PremiumService";
import UserService from "./services/UserService";

// Load environment variables
config();

const TEST_WALLET = "0x960FCeED1a0AC2Cc22e6e7Bd6876ca527d31D268";

async function testWallet() {
  console.log("🚀 Testing Wallet:", TEST_WALLET);
  console.log("=".repeat(60));

  try {
    // Test 1: Blockchain Service - On-chain Status
    console.log("\n📡 1. Testing Blockchain Service...");
    console.log("-".repeat(40));

    const isPremium = await BlockchainService.isWalletPremium(TEST_WALLET);
    console.log(`✅ Premium Status: ${isPremium ? "PREMIUM" : "NOT PREMIUM"}`);

    if (isPremium) {
      const nodeData = await BlockchainService.getNodeData(TEST_WALLET);
      console.log(`✅ Node Data: ${nodeData ? "EXISTS" : "NOT FOUND"}`);

      if (nodeData) {
        console.log(`   📊 Start Time: ${nodeData.startTime}`);
        console.log(`   💰 Balance: ${nodeData.balance}`);
        console.log(`   🎯 Points: ${nodeData.point}`);
        console.log(`   👥 Parent: ${nodeData.parent}`);
        console.log(`   👶 Left Child: ${nodeData.leftChild}`);
        console.log(`   👶 Right Child: ${nodeData.rightChild}`);
      }

      const usdtBalance = await BlockchainService.getUsdtBalance(TEST_WALLET);
      console.log(
        `✅ USDT Balance: ${usdtBalance} (${Number(usdtBalance) / 1e18} USDT)`
      );

      const hasSufficientBalance =
        await BlockchainService.hasSufficientUsdtBalance(TEST_WALLET);
      console.log(
        `✅ Sufficient USDT (200+): ${hasSufficientBalance ? "YES" : "NO"}`
      );

      const referralReward =
        await BlockchainService.getReferralReward(TEST_WALLET);
      console.log(
        `✅ Referral Reward: ${referralReward} (${Number(referralReward) / 1e18} USDT)`
      );

      const gameRewards =
        await BlockchainService.getGameVaultRewards(TEST_WALLET);
      console.log("✅ Game Vault Rewards:");
      console.log(
        `   🎮 Balanced: ${gameRewards.balanced} (${Number(gameRewards.balanced) / 1e18} USDT)`
      );
      console.log(
        `   🎮 Unbalanced: ${gameRewards.unbalanced} (${Number(gameRewards.unbalanced) / 1e18} USDT)`
      );

      const profileStats = await BlockchainService.getProfileStats(TEST_WALLET);
      console.log("✅ Profile Stats:");
      console.log(`   📊 Left Node: ${profileStats.leftNode}`);
      console.log(`   📊 Right Node: ${profileStats.rightNode}`);
      console.log(
        `   💰 Referral Reward: ${profileStats.referralReward} (${Number(profileStats.referralReward) / 1e18} USDT)`
      );
      console.log(
        `   🎮 Balanced Reward: ${profileStats.balancedReward} (${Number(profileStats.balancedReward) / 1e18} USDT)`
      );
      console.log(
        `   🎮 Unbalanced Reward: ${profileStats.unbalancedReward} (${Number(profileStats.unbalancedReward) / 1e18} USDT)`
      );
    }

    // Test 2: User Service - Database Operations
    console.log("\n🗄️ 2. Testing User Service...");
    console.log("-".repeat(40));

    const userProfile = await UserService.getUserProfile(TEST_WALLET);
    console.log(`✅ User Profile: ${userProfile ? "EXISTS" : "NOT FOUND"}`);

    if (userProfile) {
      console.log(`   👤 Email: ${userProfile.email || "Not set"}`);
      console.log(`   👤 Username: ${userProfile.username || "Not set"}`);
      console.log(
        `   👤 Display Name: ${userProfile.displayName || "Not set"}`
      );
      console.log(`   👤 Premium Status: ${userProfile.premiumStatus}`);
      console.log(`   📅 Registration Date: ${userProfile.registrationDate}`);
      console.log(`   👥 Referrer: ${userProfile.referrerAddress || "None"}`);
      console.log(`   🕒 Last Active: ${userProfile.lastActiveAt}`);
      console.log(`   🔢 Total Logins: ${userProfile.totalLogins}`);
    }

    const userStats = await UserService.getUserStats(TEST_WALLET);
    console.log(`✅ User Stats: ${userStats ? "EXISTS" : "NOT FOUND"}`);

    if (userStats) {
      console.log(`   📝 Total Posts: ${userStats.totalPosts}`);
      console.log(`   💬 Total Comments: ${userStats.totalComments}`);
      console.log(`   ❤️ Total Likes: ${userStats.totalLikes}`);
      console.log(`   👥 Total Followers: ${userStats.totalFollowers}`);
      console.log(`   👥 Total Following: ${userStats.totalFollowing}`);
      console.log(`   ⭐ Days as Premium: ${userStats.daysAsPremium}`);
      console.log(`   👥 Referral Count: ${userStats.referralCount}`);
      console.log(`   💰 Total Earnings: ${userStats.totalEarnings} USDT`);
      console.log(`   🎯 Quests Completed: ${userStats.questsCompleted}`);
      console.log(`   🎯 Quests In Progress: ${userStats.questsInProgress}`);
    }

    const linkedProfile = await UserService.getLinkedProfile(TEST_WALLET);
    console.log(`✅ Linked Profile: ${linkedProfile ? "EXISTS" : "NOT FOUND"}`);

    if (linkedProfile) {
      console.log(`   🆔 Profile ID: ${linkedProfile.profileId}`);
      console.log(`   📛 Handle: ${linkedProfile.handle}`);
      console.log(`   📅 Linked At: ${linkedProfile.linkedAt}`);
    }

    const availableProfiles =
      await UserService.getAvailableProfiles(TEST_WALLET);
    console.log("✅ Available Profiles:");
    console.log(`   🔗 Can Link: ${availableProfiles.canLink}`);
    console.log(`   📊 Profile Count: ${availableProfiles.profiles.length}`);
    if (availableProfiles.linkedProfile) {
      console.log(
        `   🔗 Already Linked: ${availableProfiles.linkedProfile.handle}`
      );
    }

    // Test 3: Premium Service - Orchestration
    console.log("\n🎯 3. Testing Premium Service...");
    console.log("-".repeat(40));

    const premiumStatus =
      await PremiumService.getUserPremiumStatus(TEST_WALLET);
    console.log(`✅ Premium Status: ${premiumStatus.userStatus}`);

    if (premiumStatus.linkedProfile) {
      console.log(
        `   🔗 Linked Profile: ${premiumStatus.linkedProfile.handle}`
      );
      console.log(`   📅 Linked At: ${premiumStatus.linkedProfile.linkedAt}`);
    }

    const walletStatus = await PremiumService.checkWalletStatus(TEST_WALLET);
    console.log(`✅ Wallet Status: ${walletStatus ? "PREMIUM" : "STANDARD"}`);

    const profileStatsFromPremium =
      await PremiumService.getProfileStats(TEST_WALLET);
    console.log("✅ Profile Stats from Premium Service:");
    console.log(
      `   💰 Referral Reward: ${profileStatsFromPremium.referralReward} (${Number(profileStatsFromPremium.referralReward) / 1e18} USDT)`
    );
    console.log(
      `   🎮 Balanced Reward: ${profileStatsFromPremium.balancedReward} (${Number(profileStatsFromPremium.balancedReward) / 1e18} USDT)`
    );
    console.log(
      `   🎮 Unbalanced Reward: ${profileStatsFromPremium.unbalancedReward} (${Number(profileStatsFromPremium.unbalancedReward) / 1e18} USDT)`
    );

    // Test 4: Event Service - Event System
    console.log("\n📢 4. Testing Event Service...");
    console.log("-".repeat(40));

    const eventTypes = EventService.getRegisteredEventTypes();
    console.log(`✅ Registered Event Types: ${eventTypes.join(", ")}`);

    const queueStatus = EventService.getQueueStatus();
    console.log("✅ Event Queue Status:");
    console.log(`   📊 Queue Length: ${queueStatus.queueLength}`);
    console.log(`   ⚙️ Is Processing: ${queueStatus.isProcessing}`);

    // Test 5: Comprehensive User Data Test
    console.log("\n🔍 5. Comprehensive User Data Test...");
    console.log("-".repeat(40));

    // Test user rewards
    const userRewards = await UserService.getUserRewards(TEST_WALLET);
    console.log(`✅ User Rewards: ${userRewards.length} rewards found`);

    if (userRewards.length > 0) {
      console.log(
        `   📊 Pending: ${userRewards.filter((r) => r.status === "Pending").length}`
      );
      console.log(
        `   ✅ Claimed: ${userRewards.filter((r) => r.status === "Claimed").length}`
      );
      console.log(
        `   ❌ Failed: ${userRewards.filter((r) => r.status === "Failed").length}`
      );
      console.log(
        `   ⏰ Expired: ${userRewards.filter((r) => r.status === "Expired").length}`
      );

      const totalPendingAmount = userRewards
        .filter((r) => r.status === "Pending")
        .reduce((sum, r) => sum + r.amount, 0);
      console.log(`   💰 Total Pending Amount: ${totalPendingAmount} USDT`);
    }

    // Test user quests
    const userQuests = await UserService.getUserQuests(TEST_WALLET);
    console.log(`✅ User Quests: ${userQuests.length} quests found`);

    if (userQuests.length > 0) {
      console.log(
        `   🎯 Active: ${userQuests.filter((q) => q.status === "Active").length}`
      );
      console.log(
        `   ✅ Completed: ${userQuests.filter((q) => q.status === "Completed").length}`
      );
      console.log(
        `   ⏰ Expired: ${userQuests.filter((q) => q.status === "Expired").length}`
      );
      console.log(
        `   ❌ Failed: ${userQuests.filter((q) => q.status === "Failed").length}`
      );
    }

    // Test user notifications
    const userNotifications = await UserService.getUserNotifications(
      TEST_WALLET,
      false,
      10
    );
    console.log(
      `✅ User Notifications: ${userNotifications.length} unread notifications`
    );

    if (userNotifications.length > 0) {
      const notificationTypes = [
        ...new Set(userNotifications.map((n) => n.type))
      ];
      console.log(`   📢 Notification Types: ${notificationTypes.join(", ")}`);
    }

    // Test 6: Contract Addresses
    console.log("\n🏗️ 6. Contract Configuration...");
    console.log("-".repeat(40));

    const contractAddresses = BlockchainService.getContractAddresses();
    console.log("✅ Contract Addresses:");
    console.log(`   📋 Referral: ${contractAddresses.referral}`);
    console.log(
      `   🎮 Balanced Game Vault: ${contractAddresses.balancedGameVault}`
    );
    console.log(
      `   🎮 Unbalanced Game Vault: ${contractAddresses.unbalancedGameVault}`
    );
    console.log(`   💰 USDT: ${contractAddresses.usdt}`);

    // Test 7: Summary Report
    console.log("\n📊 7. Summary Report...");
    console.log("-".repeat(40));

    const summary = {
      gameRewards: {
        balanced: Number(gameRewards.balanced) / 1e18,
        unbalanced: Number(gameRewards.unbalanced) / 1e18
      },
      hasLinkedProfile: !!linkedProfile,
      hasUserProfile: !!userProfile,
      isPremium: isPremium,
      referralReward: Number(referralReward) / 1e18,
      totalEarnings: userStats?.totalEarnings || 0,
      totalNotifications: userNotifications.length,
      totalQuests: userQuests.length,
      totalRewards: userRewards.length,
      wallet: TEST_WALLET
    };

    console.log(`📋 Summary for ${summary.wallet}:`);
    console.log(
      `   ⭐ Premium Status: ${summary.isPremium ? "PREMIUM" : "STANDARD"}`
    );
    console.log(
      `   👤 User Profile: ${summary.hasUserProfile ? "EXISTS" : "NOT FOUND"}`
    );
    console.log(
      `   🔗 Linked Profile: ${summary.hasLinkedProfile ? "EXISTS" : "NOT FOUND"}`
    );
    console.log(`   💰 Total Rewards: ${summary.totalRewards}`);
    console.log(`   🎯 Total Quests: ${summary.totalQuests}`);
    console.log(`   📢 Total Notifications: ${summary.totalNotifications}`);
    console.log(`   💵 Total Earnings: ${summary.totalEarnings} USDT`);
    console.log(`   👥 Referral Reward: ${summary.referralReward} USDT`);
    console.log(
      `   🎮 Game Rewards: ${summary.gameRewards.balanced + summary.gameRewards.unbalanced} USDT`
    );

    console.log("\n✅ Wallet test completed successfully!");
  } catch (error) {
    console.error("❌ Error testing wallet:", error);
    logger.error("Error testing wallet:", error);
  }
}

// Run the test
testWallet()
  .then(() => {
    console.log("\n🏁 Test completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Test failed:", error);
    process.exit(1);
  });
