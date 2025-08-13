import { Status } from "@hey/data/enums";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import {
  getPremiumStatus,
  getPremiumStatusPost,
  handlePremiumRegistration,
  verifyRegistrationAndLinkProfile,
  autoLinkFirstProfile,
  linkProfileToWallet,
  checkWalletConnectionStatus,
  checkWalletConnectionStatusPost,
  getRegistrationInstructions,
  validateReferrer,
  validateReferrerPost
} from "@/controllers/PremiumRegistrationController";
import rateLimiter from "@/middlewares/rateLimiter";

const app = new Hono();

// Validation schemas
const walletAddressSchema = z.object({
  walletAddress: z.string().min(1, "Wallet address is required")
});

const referrerAddressSchema = z.object({
  referrerAddress: z.string().min(1, "Referrer address is required")
});

// Routes

/**
 * GET /premium-status
 * Get comprehensive premium status for a user
 */
app.get(
  "/premium-status",
  rateLimiter({ requests: 100 }),
  zValidator("query", walletAddressSchema),
  getPremiumStatus
);

/**
 * POST /premium-status
 * Get comprehensive premium status for a user (alternative to GET)
 */
app.post(
  "/premium-status",
  rateLimiter({ requests: 100 }),
  zValidator("json", walletAddressSchema),
  getPremiumStatusPost
);

/**
 * POST /register
 * Handle premium registration process
 */
app.post(
  "/register",
  rateLimiter({ requests: 10 }),
  handlePremiumRegistration
);

/**
 * POST /verify-registration
 * Verify a completed registration transaction and handle profile linking
 */
app.post(
  "/verify-registration",
  rateLimiter({ requests: 10 }),
  verifyRegistrationAndLinkProfile
);

/**
 * POST /auto-link-profile
 * Auto-link first available profile for a premium wallet
 */
app.post(
  "/auto-link-profile",
  rateLimiter({ requests: 10 }),
  autoLinkFirstProfile
);

/**
 * POST /link-profile
 * Manually link a specific profile to a premium wallet
 */
app.post(
  "/link-profile",
  rateLimiter({ requests: 10 }),
  linkProfileToWallet
);

/**
 * GET /wallet-connection-status
 * Check wallet connection status
 */
app.get(
  "/wallet-connection-status",
  rateLimiter({ requests: 50 }),
  zValidator("query", walletAddressSchema),
  checkWalletConnectionStatus
);

/**
 * POST /wallet-connection-status
 * Check wallet connection status (alternative to GET)
 */
app.post(
  "/wallet-connection-status",
  rateLimiter({ requests: 50 }),
  zValidator("json", walletAddressSchema),
  checkWalletConnectionStatusPost
);

/**
 * GET /registration-instructions
 * Get registration instructions for the frontend
 */
app.get(
  "/registration-instructions",
  rateLimiter({ requests: 20 }),
  getRegistrationInstructions
);

/**
 * GET /validate-referrer
 * Validate referrer address
 */
app.get(
  "/validate-referrer",
  rateLimiter({ requests: 50 }),
  zValidator("query", referrerAddressSchema),
  validateReferrer
);

/**
 * POST /validate-referrer
 * Validate referrer address (alternative to GET)
 */
app.post(
  "/validate-referrer",
  rateLimiter({ requests: 50 }),
  zValidator("json", referrerAddressSchema),
  validateReferrerPost
);

/**
 * GET /health
 * Health check endpoint
 */
app.get("/health", async (c) => {
  return c.json({
    status: "healthy",
    service: "premium-registration",
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /
 * Root endpoint with service information
 */
app.get("/", async (c) => {
  return c.json({
    service: "Premium Registration Service",
    version: "1.0.0",
    description: "Handles premium registration process, profile linking, and status checks",
    endpoints: {
      "GET /premium-status": "Get comprehensive premium status for a user",
      "POST /premium-status": "Get comprehensive premium status for a user (POST)",
      "POST /register": "Handle premium registration process",
      "POST /verify-registration": "Verify registration transaction and link profile",
      "POST /auto-link-profile": "Auto-link first available profile",
      "POST /link-profile": "Manually link a specific profile",
      "GET /wallet-connection-status": "Check wallet connection status",
      "POST /wallet-connection-status": "Check wallet connection status (POST)",
      "GET /registration-instructions": "Get registration instructions",
      "GET /validate-referrer": "Validate referrer address",
      "POST /validate-referrer": "Validate referrer address (POST)",
      "GET /health": "Health check"
    },
    status: Status.Success
  });
});

export default app;
