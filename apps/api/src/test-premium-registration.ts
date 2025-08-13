import logger from "@hey/helpers/logger";
import PremiumRegistrationService from "./services/PremiumRegistrationService";
import BlockchainService from "./services/BlockchainService";
import UserService from "./services/UserService";

// Test wallet addresses (replace with real addresses for testing)
const TEST_WALLET_ADDRESS = "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6";
const TEST_REFERRER_ADDRESS = "0x3bC03e9793d2E67298fb30871a08050414757Ca7";
const TEST_TRANSACTION_HASH = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";

async function testPremiumRegistrationService() {
  logger.info("Starting Premium Registration Service tests...");

  try {
    // Test 1: Get premium status for a wallet
    logger.info("Test 1: Getting premium status...");
    const premiumStatus = await PremiumRegistrationService.getPremiumStatus(TEST_WALLET_ADDRESS);
    logger.info("Premium status result:", JSON.stringify(premiumStatus, null, 2));

    // Test 2: Check wallet connection status
    logger.info("Test 2: Checking wallet connection status...");
    const connectionStatus = await PremiumRegistrationService.checkWalletConnectionStatus(TEST_WALLET_ADDRESS);
    logger.info("Connection status result:", JSON.stringify(connectionStatus, null, 2));

    // Test 3: Handle premium registration
    logger.info("Test 3: Handling premium registration...");
    const registrationResult = await PremiumRegistrationService.handlePremiumRegistration({
      userAddress: TEST_WALLET_ADDRESS,
      referrerAddress: TEST_REFERRER_ADDRESS
    });
    logger.info("Registration result:", JSON.stringify(registrationResult, null, 2));

    // Test 4: Get registration instructions
    logger.info("Test 4: Getting registration instructions...");
    const instructions = PremiumRegistrationService.getRegistrationInstructions();
    logger.info("Registration instructions:", JSON.stringify(instructions, null, 2));

    // Test 5: Verify registration transaction (this would fail with fake transaction hash)
    logger.info("Test 5: Verifying registration transaction...");
    try {
      const verificationResult = await PremiumRegistrationService.verifyRegistrationAndLinkProfile(
        TEST_WALLET_ADDRESS,
        TEST_REFERRER_ADDRESS,
        TEST_TRANSACTION_HASH
      );
      logger.info("Verification result:", JSON.stringify(verificationResult, null, 2));
    } catch (error) {
      logger.info("Verification failed as expected (fake transaction hash):", error);
    }

    // Test 6: Auto-link first profile (this would fail if wallet is not premium)
    logger.info("Test 6: Auto-linking first profile...");
    try {
      const autoLinkResult = await PremiumRegistrationService.autoLinkFirstProfile(TEST_WALLET_ADDRESS);
      logger.info("Auto-link result:", JSON.stringify(autoLinkResult, null, 2));
    } catch (error) {
      logger.info("Auto-link failed as expected (wallet not premium):", error);
    }

    // Test 7: Check if wallet is premium on-chain
    logger.info("Test 7: Checking if wallet is premium on-chain...");
    const isPremium = await BlockchainService.isWalletPremium(TEST_WALLET_ADDRESS);
    logger.info(`Wallet ${TEST_WALLET_ADDRESS} is premium: ${isPremium}`);

    // Test 8: Validate referrer
    logger.info("Test 8: Validating referrer...");
    const referrerValidation = await BlockchainService.validateReferrer(TEST_REFERRER_ADDRESS);
    logger.info("Referrer validation result:", JSON.stringify(referrerValidation, null, 2));

    // Test 9: Get available profiles
    logger.info("Test 9: Getting available profiles...");
    try {
      const availableProfiles = await UserService.getAvailableProfiles(TEST_WALLET_ADDRESS);
      logger.info("Available profiles result:", JSON.stringify(availableProfiles, null, 2));
    } catch (error) {
      logger.info("Available profiles failed as expected (wallet not premium):", error);
    }

    // Test 10: Get linked profile
    logger.info("Test 10: Getting linked profile...");
    const linkedProfile = await UserService.getLinkedProfile(TEST_WALLET_ADDRESS);
    logger.info("Linked profile result:", JSON.stringify(linkedProfile, null, 2));

    logger.info("All tests completed successfully!");

  } catch (error) {
    logger.error("Test failed:", error);
  }
}

async function testWithRealWallet() {
  logger.info("Testing with real wallet addresses...");
  
  // You can replace these with real wallet addresses for testing
  const realWalletAddress = process.env.TEST_WALLET_ADDRESS || TEST_WALLET_ADDRESS;
  const realReferrerAddress = process.env.REFERRAL_CONTRACT_ADDRESS || TEST_REFERRER_ADDRESS;

  logger.info(`Testing with wallet: ${realWalletAddress}`);
  logger.info(`Testing with referrer: ${realReferrerAddress}`);

  try {
    // Test premium status
    const status = await PremiumRegistrationService.getPremiumStatus(realWalletAddress);
    logger.info("Real wallet premium status:", JSON.stringify(status, null, 2));

    // Test registration process
    const registration = await PremiumRegistrationService.handlePremiumRegistration({
      userAddress: realWalletAddress,
      referrerAddress: realReferrerAddress
    });
    logger.info("Real wallet registration result:", JSON.stringify(registration, null, 2));

  } catch (error) {
    logger.error("Real wallet test failed:", error);
  }
}

// Run tests
async function runTests() {
  logger.info("=== Premium Registration Service Tests ===");
  
  await testPremiumRegistrationService();
  
  logger.info("\n=== Real Wallet Tests ===");
  await testWithRealWallet();
  
  logger.info("\n=== Tests Complete ===");
}

// Export for use in other files
export { testPremiumRegistrationService, testWithRealWallet, runTests };

// Run if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}
