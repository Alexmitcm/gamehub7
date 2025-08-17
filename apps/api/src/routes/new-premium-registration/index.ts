import { Status } from "@hey/data/enums";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import {
  getUserStatus,
  getUserStatusPost,
  handlePremiumRegistration,
  linkProfileToWallet,
  checkWalletPremium,
  checkWalletPremiumPost,
  canLinkProfile,
  canLinkProfilePost
} from "@/controllers/NewPremiumRegistrationController";
import rateLimiter from "@/middlewares/rateLimiter";

const app = new Hono();

// Validation schemas
const walletAddressSchema = z.object({
  walletAddress: z.string().min(1, "Wallet address is required")
});

const registrationRequestSchema = z.object({
  userAddress: z.string().min(1, "User address is required"),
  referrerAddress: z.string().min(1, "Referrer address is required"),
  lensProfileId: z.string().optional(),
  lensWalletAddress: z.string().optional()
});

const linkProfileSchema = z.object({
  walletAddress: z.string().min(1, "Wallet address is required"),
  profileId: z.string().min(1, "Profile ID is required")
});

// Routes

/**
 * GET /new-premium-registration/user-status
 * Get comprehensive premium status for a user
 */
app.get(
  "/user-status",
  rateLimiter({ requests: 100 }),
  zValidator("query", walletAddressSchema),
  getUserStatus
);

/**
 * POST /new-premium-registration/user-status
 * Get comprehensive premium status for a user (alternative to GET)
 */
app.post(
  "/user-status",
  rateLimiter({ requests: 100 }),
  zValidator("json", walletAddressSchema),
  getUserStatusPost
);

/**
 * POST /new-premium-registration/register
 * Handle premium registration process
 */
app.post(
  "/register",
  rateLimiter({ requests: 10 }),
  zValidator("json", registrationRequestSchema),
  handlePremiumRegistration
);

/**
 * POST /new-premium-registration/link-profile
 * Link a profile to a premium wallet
 */
app.post(
  "/link-profile",
  rateLimiter({ requests: 10 }),
  zValidator("json", linkProfileSchema),
  linkProfileToWallet
);

/**
 * GET /new-premium-registration/check-wallet-premium
 * Check if a wallet is premium
 */
app.get(
  "/check-wallet-premium",
  rateLimiter({ requests: 50 }),
  zValidator("query", walletAddressSchema),
  checkWalletPremium
);

/**
 * POST /new-premium-registration/check-wallet-premium
 * Check if a wallet is premium (alternative to GET)
 */
app.post(
  "/check-wallet-premium",
  rateLimiter({ requests: 50 }),
  zValidator("json", walletAddressSchema),
  checkWalletPremiumPost
);

/**
 * GET /new-premium-registration/can-link-profile
 * Check if a profile can be linked to a wallet
 */
app.get(
  "/can-link-profile",
  rateLimiter({ requests: 50 }),
  zValidator("query", linkProfileSchema),
  canLinkProfile
);

/**
 * POST /new-premium-registration/can-link-profile
 * Check if a profile can be linked to a wallet (alternative to GET)
 */
app.post(
  "/can-link-profile",
  rateLimiter({ requests: 50 }),
  zValidator("json", linkProfileSchema),
  canLinkProfilePost
);

/**
 * GET /new-premium-registration/health
 * Health check endpoint
 */
app.get("/health", async (c) => {
  return c.json({
    status: "healthy",
    service: "new-premium-registration",
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /
 * Root endpoint with service information
 */
app.get("/", async (c) => {
  return c.json({
    service: "New Premium Registration Service",
    version: "2.0.0",
    description: "Handles premium registration process with backend smart contract interactions",
    endpoints: {
      "GET /user-status": "Get comprehensive premium status for a user",
      "POST /user-status": "Get comprehensive premium status for a user (POST)",
      "POST /register": "Handle premium registration process",
      "POST /link-profile": "Link a profile to a premium wallet",
      "GET /check-wallet-premium": "Check if a wallet is premium",
      "POST /check-wallet-premium": "Check if a wallet is premium (POST)",
      "GET /can-link-profile": "Check if a profile can be linked to a wallet",
      "POST /can-link-profile": "Check if a profile can be linked to a wallet (POST)",
      "GET /health": "Health check"
    },
    status: Status.Success
  });
});

export default app;
