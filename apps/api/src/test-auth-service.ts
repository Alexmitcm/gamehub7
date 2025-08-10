import logger from "@hey/helpers/logger";
import { config } from "dotenv";
import AuthService from "./services/AuthService";

// Load environment variables
config();

/**
 * Test the AuthService.syncLens method directly
 */
async function testAuthService() {
  try {
    logger.info("🧪 Testing AuthService.syncLens directly");

    // Test the syncLens method
    const result = await AuthService.syncLens({
      lensAccessToken: "test_token_123"
    });

    logger.info("✅ AuthService.syncLens test successful");
    logger.info(`Result: ${JSON.stringify(result, null, 2)}`);
  } catch (error) {
    logger.error("❌ AuthService.syncLens test failed:", error);

    // Log the full error details
    if (error instanceof Error) {
      logger.error("Error name:", error.name);
      logger.error("Error message:", error.message);
      logger.error("Error stack:", error.stack);
    }
  }
}

// Run the test
testAuthService()
  .then(() => {
    logger.info("🏁 AuthService test completed");
    process.exit(0);
  })
  .catch((error) => {
    logger.error("💥 AuthService test failed:", error);
    process.exit(1);
  });
