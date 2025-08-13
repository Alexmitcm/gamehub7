import { config } from "dotenv";
import logger from "@hey/helpers/logger";

// Load environment variables
config();

/**
 * Test if the server can start without crashing
 */
async function testServerStart() {
  try {
    logger.info("🧪 Testing server startup...");
    
    // Test 1: Import all required modules
    logger.info("📦 Testing imports...");
    
    const { serve } = await import("@hono/node-server");
    logger.info("✅ @hono/node-server imported");
    
    const { Hono } = await import("hono");
    logger.info("✅ Hono imported");
    
    const authRouter = await import("./routes/auth");
    logger.info("✅ Auth router imported");
    
    const BlockchainService = await import("./services/BlockchainService");
    logger.info("✅ BlockchainService imported");
    
    const AuthService = await import("./services/AuthService");
    logger.info("✅ AuthService imported");
    
    // Test 2: Create Hono app
    logger.info("🔧 Creating Hono app...");
    const app = new Hono();
    logger.info("✅ Hono app created");
    
    // Test 3: Add routes
    logger.info("🛣️ Adding routes...");
    app.route("/auth", authRouter.default);
    logger.info("✅ Auth routes added");
    
    // Test 4: Test basic endpoint
    logger.info("🧪 Testing basic endpoint...");
    app.get("/test", (c) => c.json({ message: "Server is working!" }));
    logger.info("✅ Test endpoint added");
    
    // Test 5: Try to start server
    logger.info("🚀 Attempting to start server...");
    const port = 3009;
    
    const server = serve({ 
      fetch: app.fetch, 
      port, 
      hostname: "0.0.0.0" 
    }, (info) => {
      logger.info(`✅ Server started successfully on port ${info.port}`);
    });
    
    // Wait a moment to see if server starts
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    logger.info("✅ Server startup test completed successfully");
    return true;
    
  } catch (error) {
    logger.error("❌ Server startup test failed:", error);
    
    if (error instanceof Error) {
      logger.error("Error name:", error.name);
      logger.error("Error message:", error.message);
      logger.error("Error stack:", error.stack);
    }
    
    return false;
  }
}

// Run the test
testServerStart()
  .then((success) => {
    logger.info(success ? "✅ All tests passed!" : "❌ Tests failed!");
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    logger.error("💥 Test execution failed:", error);
    process.exit(1);
  }); 