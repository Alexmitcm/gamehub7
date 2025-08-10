import { config } from "dotenv";
import logger from "@hey/helpers/logger";

// Load environment variables
config();

/**
 * Test database connection
 */
async function testDatabase() {
  try {
    logger.info("🧪 Testing database connection...");
    
    // Test 1: Import Prisma client
    logger.info("📦 Importing Prisma client...");
    const prisma = await import("./prisma/client");
    logger.info("✅ Prisma client imported");
    
    // Test 2: Test database connection
    logger.info("🔌 Testing database connection...");
    await prisma.default.$connect();
    logger.info("✅ Database connection successful");
    
    // Test 3: Test a simple query
    logger.info("🔍 Testing simple query...");
    const userCount = await prisma.default.user.count();
    logger.info(`✅ Query successful. User count: ${userCount}`);
    
    // Test 4: Disconnect
    await prisma.default.$disconnect();
    logger.info("✅ Database disconnected");
    
    logger.info("✅ Database test completed successfully");
    return true;
    
  } catch (error) {
    logger.error("❌ Database test failed:", error);
    
    if (error instanceof Error) {
      logger.error("Error name:", error.name);
      logger.error("Error message:", error.message);
      logger.error("Error stack:", error.stack);
    }
    
    return false;
  }
}

// Run the test
testDatabase()
  .then((success) => {
    logger.info(success ? "✅ Database test passed!" : "❌ Database test failed!");
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    logger.error("💥 Database test execution failed:", error);
    process.exit(1);
  }); 