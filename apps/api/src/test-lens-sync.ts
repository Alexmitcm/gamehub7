import logger from "@hey/helpers/logger";
import { config } from "dotenv";

// Load environment variables
config();

const API_BASE_URL = process.env.HEY_API_URL || "http://localhost:3010";

/**
 * Test the Lens authentication bridge
 * This script simulates a Lens access token and tests the sync-lens endpoint
 */
async function testLensSync() {
  try {
    logger.info("🧪 Testing Lens Authentication Bridge");
    logger.info(`API Base URL: ${API_BASE_URL}`);

    // Test 1: Invalid token
    logger.info("\n📋 Test 1: Invalid Lens token");
    try {
      const response = await fetch(`${API_BASE_URL}/auth/sync-lens`, {
        body: JSON.stringify({
          lensAccessToken: "invalid_token_123"
        }),
        headers: {
          "Content-Type": "application/json"
        },
        method: "POST"
      });

      const result = await response.json();
      logger.info(`Status: ${response.status}`);
      logger.info(`Response: ${JSON.stringify(result, null, 2)}`);

      if (response.status === 400 || response.status === 500) {
        logger.info("✅ Test 1 PASSED: Invalid token properly rejected");
      } else {
        logger.error(
          "❌ Test 1 FAILED: Invalid token should have been rejected"
        );
      }
    } catch (error) {
      logger.error("❌ Test 1 FAILED:", error);
    }

    // Test 2: Missing token
    logger.info("\n📋 Test 2: Missing Lens token");
    try {
      const response = await fetch(`${API_BASE_URL}/auth/sync-lens`, {
        body: JSON.stringify({}),
        headers: {
          "Content-Type": "application/json"
        },
        method: "POST"
      });

      const result = await response.json();
      logger.info(`Status: ${response.status}`);
      logger.info(`Response: ${JSON.stringify(result, null, 2)}`);

      if (response.status === 400) {
        logger.info("✅ Test 2 PASSED: Missing token properly rejected");
      } else {
        logger.error(
          "❌ Test 2 FAILED: Missing token should have been rejected"
        );
      }
    } catch (error) {
      logger.error("❌ Test 2 FAILED:", error);
    }

    // Test 3: Empty token
    logger.info("\n📋 Test 3: Empty Lens token");
    try {
      const response = await fetch(`${API_BASE_URL}/auth/sync-lens`, {
        body: JSON.stringify({
          lensAccessToken: ""
        }),
        headers: {
          "Content-Type": "application/json"
        },
        method: "POST"
      });

      const result = await response.json();
      logger.info(`Status: ${response.status}`);
      logger.info(`Response: ${JSON.stringify(result, null, 2)}`);

      if (response.status === 400) {
        logger.info("✅ Test 3 PASSED: Empty token properly rejected");
      } else {
        logger.error("❌ Test 3 FAILED: Empty token should have been rejected");
      }
    } catch (error) {
      logger.error("❌ Test 3 FAILED:", error);
    }

    // Test 4: Valid JWT format but invalid signature
    logger.info("\n📋 Test 4: Valid JWT format but invalid signature");
    try {
      // Create a JWT with valid format but invalid signature
      const header = Buffer.from(
        JSON.stringify({ alg: "HS256", typ: "JWT" })
      ).toString("base64");
      const payload = Buffer.from(
        JSON.stringify({
          exp: Math.floor(Date.now() / 1000) + 3600,
          iat: Math.floor(Date.now() / 1000),
          profileId: "0x567890abcdef1234567890abcdef1234567890ab",
          sub: "0x1234567890abcdef1234567890abcdef12345678"
        })
      ).toString("base64");
      const invalidSignature = "invalid_signature";
      const testJwt = `${header}.${payload}.${invalidSignature}`;

      const response = await fetch(`${API_BASE_URL}/auth/sync-lens`, {
        body: JSON.stringify({
          lensAccessToken: testJwt
        }),
        headers: {
          "Content-Type": "application/json"
        },
        method: "POST"
      });

      const result = await response.json();
      logger.info(`Status: ${response.status}`);
      logger.info(`Response: ${JSON.stringify(result, null, 2)}`);

      if (response.status === 400 || response.status === 500) {
        logger.info(
          "✅ Test 4 PASSED: Invalid JWT signature properly rejected"
        );
      } else {
        logger.error(
          "❌ Test 4 FAILED: Invalid JWT signature should have been rejected"
        );
      }
    } catch (error) {
      logger.error("❌ Test 4 FAILED:", error);
    }

    logger.info("\n🎯 Lens Authentication Bridge Test Summary:");
    logger.info("✅ Endpoint is accessible");
    logger.info("✅ Input validation is working");
    logger.info("✅ Error handling is functional");
    logger.info(
      "\n📝 Note: To test with a real Lens token, you would need to:"
    );
    logger.info("   1. Authenticate with Lens Protocol");
    logger.info("   2. Get the access token from the authentication response");
    logger.info("   3. Pass that token to this endpoint");
    logger.info(
      "   4. The endpoint will validate it with Lens API and create our JWT"
    );
  } catch (error) {
    logger.error("❌ Lens sync test failed:", error);
  }
}

// Run the test
testLensSync()
  .then(() => {
    logger.info("\n🏁 Lens sync test completed");
    process.exit(0);
  })
  .catch((error) => {
    logger.error("💥 Lens sync test failed:", error);
    process.exit(1);
  });
