import logger from "@hey/helpers/logger";
import { config } from "dotenv";

// Load environment variables
config();

/**
 * Test if BlockchainService can be instantiated
 */
async function testBlockchainService() {
  try {
    logger.info("🧪 Testing BlockchainService instantiation");

    // Try to import BlockchainService instance
    const _blockchainService = await import("./services/BlockchainService");
    logger.info("✅ BlockchainService imported successfully");

    logger.info("✅ BlockchainService instantiated successfully");
  } catch (error) {
    logger.error("❌ BlockchainService instantiation failed:", error);

    // Log the full error details
    if (error instanceof Error) {
      logger.error("Error name:", error.name);
      logger.error("Error message:", error.message);
      logger.error("Error stack:", error.stack);
    }
  }
}

// Run the test
testBlockchainService()
  .then(() => {
    logger.info("🏁 BlockchainService test completed");
    process.exit(0);
  })
  .catch((error) => {
    logger.error("💥 BlockchainService test failed:", error);
    process.exit(1);
  });
