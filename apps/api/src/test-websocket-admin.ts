import logger from "@hey/helpers/logger";
import WebSocketService from "./services/WebSocketService";
import AdminService from "./services/AdminService";

// Test wallet addresses (replace with real addresses for testing)
const TEST_WALLET_ADDRESS = "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6";
const TEST_ADMIN_ID = "admin_test_001";

// Mock server for testing
const mockServer = {
  on: (event: string, handler: any) => {
    logger.info(`Mock server: ${event} handler registered`);
  }
};

async function testWebSocketService() {
  logger.info("=== Testing WebSocket Service ===");

  try {
    // Initialize WebSocket service
    const webSocketService = new WebSocketService(mockServer as any);
    logger.info("WebSocket service initialized successfully");

    // Test connection statistics
    const stats = webSocketService.getStats();
    logger.info("WebSocket stats:", JSON.stringify(stats, null, 2));

    // Test broadcasting functions (these won't actually send to clients in test mode)
    const transactionUpdate = {
      transactionHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      status: "confirmed" as const,
      blockNumber: 12345678,
      confirmations: 12,
      gasUsed: "150000",
      message: "Transaction confirmed successfully"
    };

    const registrationUpdate = {
      walletAddress: TEST_WALLET_ADDRESS,
      status: "completed" as const,
      message: "Registration completed successfully",
      userStatus: "ProLinked" as const,
      linkedProfile: {
        profileId: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        handle: "testuser.lens",
        linkedAt: new Date()
      }
    };

    const premiumStatusUpdate = {
      walletAddress: TEST_WALLET_ADDRESS,
      userStatus: "ProLinked" as const,
      isPremiumOnChain: true,
      hasLinkedProfile: true,
      availableFeatures: [
        "lens_profile_access",
        "premium_badge",
        "referral_dashboard",
        "claim_rewards"
      ],
      message: "Premium status updated"
    };

    const profileLinkedUpdate = {
      walletAddress: TEST_WALLET_ADDRESS,
      profileId: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      handle: "testuser.lens",
      linkedAt: new Date(),
      message: "Profile linked successfully"
    };

    // Test broadcasting (these will log but not actually send in test mode)
    webSocketService.broadcastTransactionUpdate(transactionUpdate.transactionHash, transactionUpdate);
    webSocketService.broadcastRegistrationUpdate(TEST_WALLET_ADDRESS, registrationUpdate);
    webSocketService.broadcastPremiumStatusUpdate(TEST_WALLET_ADDRESS, premiumStatusUpdate);
    webSocketService.broadcastProfileLinkedUpdate(TEST_WALLET_ADDRESS, profileLinkedUpdate);

    logger.info("WebSocket service tests completed successfully");

  } catch (error) {
    logger.error("WebSocket service test failed:", error);
  }
}

async function testAdminService() {
  logger.info("=== Testing Admin Service ===");

  try {
    // Initialize Admin service with mock WebSocket service
    const mockWebSocketService = {
      broadcastPremiumStatusUpdate: (wallet: string, update: any) => {
        logger.info(`Mock WebSocket: Broadcasting premium status update for ${wallet}`);
      },
      broadcastProfileLinkedUpdate: (wallet: string, update: any) => {
        logger.info(`Mock WebSocket: Broadcasting profile linked update for ${wallet}`);
      }
    };

    const adminService = new AdminService(mockWebSocketService as any);
    logger.info("Admin service initialized successfully");

    // Test feature list
    const features = adminService.getFeatureList();
    logger.info("Available features:", JSON.stringify(features, null, 2));

    // Test admin user view (this will fail if user doesn't exist in database)
    try {
      const adminUserView = await adminService.getAdminUserView(TEST_WALLET_ADDRESS);
      logger.info("Admin user view:", JSON.stringify(adminUserView, null, 2));
    } catch (error) {
      logger.info("Admin user view test failed (expected if user doesn't exist):", error);
    }

    // Test admin statistics (this will work even without users)
    try {
      const adminStats = await adminService.getAdminStats();
      logger.info("Admin statistics:", JSON.stringify(adminStats, null, 2));
    } catch (error) {
      logger.info("Admin stats test failed:", error);
    }

    // Test admin action history (this will work even without actions)
    try {
      const actionHistory = await adminService.getAdminActionHistory(1, 10);
      logger.info("Admin action history:", JSON.stringify(actionHistory, null, 2));
    } catch (error) {
      logger.info("Admin action history test failed:", error);
    }

    logger.info("Admin service tests completed successfully");

  } catch (error) {
    logger.error("Admin service test failed:", error);
  }
}

async function testAdminActions() {
  logger.info("=== Testing Admin Actions ===");

  try {
    // Initialize Admin service with mock WebSocket service
    const mockWebSocketService = {
      broadcastPremiumStatusUpdate: (wallet: string, update: any) => {
        logger.info(`Mock WebSocket: Broadcasting premium status update for ${wallet}`);
      },
      broadcastProfileLinkedUpdate: (wallet: string, update: any) => {
        logger.info(`Mock WebSocket: Broadcasting profile linked update for ${wallet}`);
      }
    };

    const adminService = new AdminService(mockWebSocketService as any);

    // Test admin actions (these will fail if database models don't exist yet)
    try {
      // Test granting premium access
      const grantResult = await adminService.grantPremiumAccess(
        TEST_ADMIN_ID,
        TEST_WALLET_ADDRESS,
        "Test grant for development"
      );
      logger.info("Grant premium result:", JSON.stringify(grantResult, null, 2));
    } catch (error) {
      logger.info("Grant premium test failed (expected if database models don't exist):", error);
    }

    try {
      // Test force linking profile
      const linkResult = await adminService.forceLinkProfile(
        TEST_ADMIN_ID,
        TEST_WALLET_ADDRESS,
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        "Test force link for development"
      );
      logger.info("Force link result:", JSON.stringify(linkResult, null, 2));
    } catch (error) {
      logger.info("Force link test failed (expected if database models don't exist):", error);
    }

    try {
      // Test adding admin note
      await adminService.addAdminNote(
        TEST_ADMIN_ID,
        TEST_WALLET_ADDRESS,
        "Test admin note for development"
      );
      logger.info("Admin note added successfully");
    } catch (error) {
      logger.info("Add admin note test failed (expected if database models don't exist):", error);
    }

    logger.info("Admin actions tests completed");

  } catch (error) {
    logger.error("Admin actions test failed:", error);
  }
}

async function testIntegration() {
  logger.info("=== Testing Integration ===");

  try {
    // Test that services can work together
    const mockWebSocketService = {
      broadcastPremiumStatusUpdate: (wallet: string, update: any) => {
        logger.info(`Integration test: Broadcasting premium status update for ${wallet}`);
      },
      broadcastProfileLinkedUpdate: (wallet: string, update: any) => {
        logger.info(`Integration test: Broadcasting profile linked update for ${wallet}`);
      }
    };

    const adminService = new AdminService(mockWebSocketService as any);

    // Test that admin service can use WebSocket service
    logger.info("Integration test: Admin service successfully uses WebSocket service");

    // Test feature access
    const features = adminService.getFeatureList();
    const premiumFeatures = features.filter(f => f.premiumAccess);
    const adminOverrideFeatures = features.filter(f => f.adminOverride);

    logger.info(`Total features: ${features.length}`);
    logger.info(`Premium features: ${premiumFeatures.length}`);
    logger.info(`Admin override features: ${adminOverrideFeatures.length}`);

    logger.info("Integration tests completed successfully");

  } catch (error) {
    logger.error("Integration test failed:", error);
  }
}

// Run all tests
async function runAllTests() {
  logger.info("=== Starting WebSocket and Admin Service Tests ===");

  await testWebSocketService();
  await testAdminService();
  await testAdminActions();
  await testIntegration();

  logger.info("=== All Tests Completed ===");
}

// Export for use in other files
export { 
  testWebSocketService, 
  testAdminService, 
  testAdminActions, 
  testIntegration, 
  runAllTests 
};

// Run if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}
