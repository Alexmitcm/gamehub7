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
  canLinkProfilePost,
  discoverProfiles,
  discoverProfilesPost,
  autoLinkProfile,
  getProfileById,
  validateNetwork,
  validateNetworkPost,
  getSupportedNetworks,
  getArbitrumOneNetwork
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
 * GET /new-premium-registration/discover-profiles
 * Discover available profiles for a wallet
 */
app.get(
  "/discover-profiles",
  rateLimiter({ requests: 50 }),
  zValidator("query", walletAddressSchema),
  discoverProfiles
);

/**
 * POST /new-premium-registration/discover-profiles
 * Discover available profiles for a wallet (POST)
 */
app.post(
  "/discover-profiles",
  rateLimiter({ requests: 50 }),
  zValidator("json", walletAddressSchema),
  discoverProfilesPost
);

/**
 * POST /new-premium-registration/auto-link-profile
 * Auto-link first available profile for a premium wallet
 */
app.post(
  "/auto-link-profile",
  rateLimiter({ requests: 10 }),
  zValidator("json", walletAddressSchema),
  autoLinkProfile
);

/**
 * GET /new-premium-registration/profile/:profileId
 * Get profile details by ID
 */
app.get(
  "/profile/:profileId",
  rateLimiter({ requests: 100 }),
  getProfileById
);

/**
 * GET /new-premium-registration/validate-network
 * Validate network for premium registration
 */
app.get(
  "/validate-network",
  rateLimiter({ requests: 50 }),
  zValidator("query", z.object({ chainId: z.string().min(1, "Chain ID is required") })),
  validateNetwork
);

/**
 * POST /new-premium-registration/validate-network
 * Validate network for premium registration (POST)
 */
app.post(
  "/validate-network",
  rateLimiter({ requests: 50 }),
  zValidator("json", z.object({ chainId: z.string().min(1, "Chain ID is required") })),
  validateNetworkPost
);

/**
 * GET /new-premium-registration/supported-networks
 * Get supported networks
 */
app.get(
  "/supported-networks",
  rateLimiter({ requests: 100 }),
  getSupportedNetworks
);

/**
 * GET /new-premium-registration/arbitrum-one-network
 * Get Arbitrum One network configuration
 */
app.get(
  "/arbitrum-one-network",
  rateLimiter({ requests: 100 }),
  getArbitrumOneNetwork
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
      "GET /discover-profiles": "Discover available profiles for a wallet",
      "POST /discover-profiles": "Discover available profiles for a wallet (POST)",
      "POST /auto-link-profile": "Auto-link first available profile for a premium wallet",
      "GET /profile/:profileId": "Get profile details by ID",
      "GET /validate-network": "Validate network for premium registration",
      "POST /validate-network": "Validate network for premium registration (POST)",
      "GET /supported-networks": "Get supported networks",
      "GET /arbitrum-one-network": "Get Arbitrum One network configuration",
      "GET /health": "Health check"
    },
    status: Status.Success
  });
});

export default app;
