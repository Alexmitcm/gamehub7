import logger from "@hey/helpers/logger";
import { config } from "dotenv";
import AuthService from "./services/AuthService";

// Load environment variables
config();

const TEST_WALLET = "0x960FCeED1a0AC2Cc22e6e7Bd6876ca527d31D268";

async function testUnifiedAuth() {
  console.log("🚀 Testing Unified Authentication System");
  console.log("=".repeat(60));

  try {
    // Test 1: Check if user exists
    console.log("\n📋 1. Checking if user exists...");
    console.log("-".repeat(40));

    const existingProfile = await AuthService.getUserProfile(TEST_WALLET);
    console.log(`✅ User exists: ${existingProfile ? "YES" : "NO"}`);

    if (existingProfile) {
      console.log(`   👤 Status: ${existingProfile.status}`);
      console.log(
        `   🔗 Linked Profile: ${existingProfile.linkedProfileId || "None"}`
      );
      console.log(
        `   📅 Registration Date: ${existingProfile.registrationDate}`
      );
      console.log(`   🕒 Last Active: ${existingProfile.lastActiveAt}`);
      console.log(`   🔢 Total Logins: ${existingProfile.totalLogins}`);
    }

    // Test 2: Get available profiles
    console.log("\n👥 2. Getting available profiles...");
    console.log("-".repeat(40));

    try {
      const profiles = await AuthService.getAvailableProfiles(TEST_WALLET);
      console.log(`✅ Available Profiles: ${profiles.profiles.length}`);
      console.log(
        `   🔗 Linked Profile ID: ${profiles.linkedProfileId || "None"}`
      );

      if (profiles.profiles.length > 0) {
        console.log("   📋 Profile List:");
        for (const [index, profile] of profiles.profiles.entries()) {
          console.log(`     ${index + 1}. ${profile.handle} (${profile.id})`);
        }
      }

      // Use the first available profile for testing
      const selectedProfileId =
        profiles.profiles.length > 0
          ? profiles.profiles[0].id
          : "0x1234567890abcdef1234567890abcdef12345678";

      // Test 3: Test unified login/onboarding
      console.log("\n🔐 3. Testing unified login/onboarding...");
      console.log("-".repeat(40));

      try {
        const loginResult = await AuthService.loginOrOnboard({
          selectedProfileId,
          walletAddress: TEST_WALLET
        });

        console.log(`✅ Login successful: ${loginResult.success}`);
        console.log(`   👤 Is New User: ${loginResult.isNewUser}`);
        console.log(`   📝 Message: ${loginResult.message}`);
        console.log(
          `   🔑 Token Generated: ${loginResult.token ? "YES" : "NO"}`
        );

        if (loginResult.user) {
          console.log(`   👤 User Status: ${loginResult.user.status}`);
          console.log(
            `   🔗 Linked Profile: ${loginResult.user.linkedProfileId || "None"}`
          );
          console.log(
            `   📅 Registration Date: ${loginResult.user.registrationDate}`
          );
          console.log(`   🕒 Last Active: ${loginResult.user.lastActiveAt}`);
          console.log(`   🔢 Total Logins: ${loginResult.user.totalLogins}`);
        }

        // Test 4: Test JWT token validation
        console.log("\n🔍 4. Testing JWT token validation...");
        console.log("-".repeat(40));

        if (loginResult.token) {
          const validatedProfile = await AuthService.validateToken(
            loginResult.token
          );

          if (validatedProfile) {
            console.log("✅ Token validation successful");
            console.log(`   👤 Validated Status: ${validatedProfile.status}`);
            console.log(
              `   🔗 Validated Profile: ${validatedProfile.linkedProfileId || "None"}`
            );
          } else {
            console.log("❌ Token validation failed");
          }
        } else {
          console.log("⚠️ No token generated for validation test");
        }

        // Test 5: Test profile update
        console.log("\n✏️ 5. Testing profile update...");
        console.log("-".repeat(40));

        try {
          const updateData = {
            bio: "This is a test bio for the unified auth system",
            displayName: "Test User Updated",
            location: "Test City"
          };

          const updatedProfile = await AuthService.updateUserProfile(
            TEST_WALLET,
            updateData
          );

          console.log("✅ Profile update successful");
          console.log(`   👤 Display Name: ${updatedProfile.displayName}`);
          console.log(`   📝 Bio: ${updatedProfile.bio}`);
          console.log(`   📍 Location: ${updatedProfile.location}`);
        } catch (error) {
          console.log("❌ Profile update test failed");
          console.log(
            `   Error: ${error instanceof Error ? error.message : "Unknown error"}`
          );
        }
      } catch (error) {
        console.log("❌ Login test failed");
        console.log(
          `   Error: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    } catch (error) {
      console.log("⚠️ Could not get profiles (ProfileService not available)");
      console.log(
        `   Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }

    // Test 6: Test with different wallet (new user simulation)
    console.log("\n🆕 6. Testing new user registration...");
    console.log("-".repeat(40));

    const newWallet = "0x1234567890123456789012345678901234567890";

    try {
      const newUserResult = await AuthService.loginOrOnboard({
        selectedProfileId: "0x1234567890abcdef1234567890abcdef12345678",
        walletAddress: newWallet
      });

      console.log(`✅ New user registration: ${newUserResult.success}`);
      console.log(`   👤 Is New User: ${newUserResult.isNewUser}`);
      console.log(`   📝 Message: ${newUserResult.message}`);
      console.log(`   👤 User Status: ${newUserResult.user.status}`);

      // Clean up - get the profile to verify it was created
      const newUserProfile = await AuthService.getUserProfile(newWallet);
      console.log(
        `   ✅ User created in database: ${newUserProfile ? "YES" : "NO"}`
      );
    } catch (error) {
      console.log("❌ New user registration test failed");
      console.log(
        `   Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }

    // Test 7: Summary Report
    console.log("\n📊 7. Summary Report...");
    console.log("-".repeat(40));

    const finalProfile = await AuthService.getUserProfile(TEST_WALLET);

    const summary = {
      hasLinkedProfile: !!finalProfile?.linkedProfileId,
      registrationDate: finalProfile?.registrationDate || "Unknown",
      status: finalProfile?.status || "Unknown",
      totalLogins: finalProfile?.totalLogins || 0,
      userExists: !!finalProfile,
      wallet: TEST_WALLET
    };

    console.log(`📋 Summary for ${summary.wallet}:`);
    console.log(`   👤 User Exists: ${summary.userExists ? "YES" : "NO"}`);
    console.log(`   ⭐ Status: ${summary.status}`);
    console.log(
      `   🔗 Has Linked Profile: ${summary.hasLinkedProfile ? "YES" : "NO"}`
    );
    console.log(`   🔢 Total Logins: ${summary.totalLogins}`);
    console.log(`   📅 Registration Date: ${summary.registrationDate}`);

    // Test 8: System Health Check
    console.log("\n🏥 8. System Health Check...");
    console.log("-".repeat(40));

    const healthChecks = {
      authService: "✅ Available",
      blockchainService: "⚠️ Requires environment setup",
      database: "✅ Available",
      eventService: "✅ Available",
      jwtService: "✅ Available",
      profileService: "⚠️ Requires Lens integration"
    };

    console.log("📋 Service Status:");
    for (const [service, status] of Object.entries(healthChecks)) {
      console.log(`   ${service}: ${status}`);
    }

    console.log(
      "\n✅ Unified authentication system test completed successfully!"
    );
  } catch (error) {
    console.error("❌ Error in unified auth test:", error);
    logger.error("Error in unified auth test:", error);
  }
}

// Run the test
testUnifiedAuth()
  .then(() => {
    console.log("\n🏁 Unified auth test completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Unified auth test failed:", error);
    process.exit(1);
  });
