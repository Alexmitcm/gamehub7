import logger from "@hey/helpers/logger";
import { config } from "dotenv";

// Load environment variables
config();

/**
 * Test if all required environment variables are set
 */
function testEnvironmentVariables() {
  const requiredVars = [
    "REFERRAL_CONTRACT_ADDRESS",
    "BALANCED_GAME_VAULT_ADDRESS",
    "UNBALANCED_GAME_VAULT_ADDRESS",
    "USDT_CONTRACT_ADDRESS",
    "INFURA_URL",
    "JWT_SECRET",
    "DATABASE_URL"
  ];

  logger.info("🧪 Testing required environment variables");

  const missingVars: string[] = [];

  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (value) {
      logger.info(`✅ Found: ${varName}`);
    } else {
      missingVars.push(varName);
      logger.error(`❌ Missing: ${varName}`);
    }
  }

  if (missingVars.length > 0) {
    logger.error(`\n❌ Missing ${missingVars.length} environment variables:`);
    for (const varName of missingVars) {
      logger.error(`   - ${varName}`);
    }
    logger.error("\nPlease set these variables in your .env file");
    return false;
  }
  logger.info("\n✅ All required environment variables are set!");
  return true;
}

// Run the test
const success = testEnvironmentVariables();
process.exit(success ? 0 : 1);
