import { Status } from "@hey/data/enums";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import {
  checkWalletStatus,
  getAvailableProfiles,
  getLinkedProfile,
  getPremiumStatus,
  getProfileStats,
  getProfiles,
  linkProfile,
  registerUser,
  verifyRegistration
} from "@/controllers/PremiumController";
import authMiddleware from "@/middlewares/authMiddleware";
import rateLimiter from "@/middlewares/rateLimiter";
import PremiumService from "@/services/PremiumService";
import debugStatus from "./debug-status";
import debugWallet from "./debug-wallet";
import simpleStatus from "./simple-status";
import tree from "./tree";

const app = new Hono();

// Validation schemas
const linkProfileSchema = z.object({
  profileId: z.string().min(1, "Profile ID is required")
});

const walletAddressSchema = z.object({
  walletAddress: z.string().min(1, "Wallet address is required")
});

const statusSchema = z.object({
  walletAddress: z.string().min(1, "Wallet address is required")
});

const profilesSchema = z.object({
  walletAddress: z.string().min(1, "Wallet address is required")
});

const autoLinkSchema = z.object({
  walletAddress: z.string().min(1, "Wallet address is required")
});

const linkProfileWithWalletSchema = z.object({
  profileId: z.string().min(1, "Profile ID is required"),
  walletAddress: z.string().min(1, "Wallet address is required")
});

const verifyRegistrationSchema = z.object({
  blockNumber: z.number().min(0, "Block number is required"),
  referrerAddress: z.string().min(1, "Referrer address is required"),
  transactionHash: z.string().min(1, "Transaction hash is required"),
  userAddress: z.string().min(1, "User address is required")
});

const registerUserSchema = z.object({
  referrerAddress: z.string().min(1, "Referrer address is required"),
  userAddress: z.string().min(1, "User address is required")
});

// Routes

/**
 * Get user's premium status with enhanced linking logic
 * Returns: 'Standard' | 'OnChainUnlinked' | 'ProLinked'
 */
app.get("/user-status", rateLimiter({ requests: 100 }), async (c) => {
  try {
    // Try to get wallet address from auth context first
    let walletAddress = c.get("walletAddress");

    if (!walletAddress) {
      // If no wallet address from auth, try to get it from query params
      const queryWalletAddress = c.req.query("walletAddress");

      if (!queryWalletAddress) {
        return c.json(
          {
            error: "Authentication required or wallet address must be provided",
            message:
              "Either provide a valid JWT token or pass walletAddress as query parameter"
          },
          401
        );
      }

      walletAddress = queryWalletAddress;
    }

    const result = await PremiumService.getUserPremiumStatus(walletAddress);

    return c.json({
      data: result,
      status: Status.Success
    });
  } catch (error) {
    console.error("Error getting premium status:", error);
    return c.json(
      {
        error: "Failed to get premium status",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      500
    );
  }
});

/**
 * POST endpoint for getting user premium status
 */
app.post(
  "/user-status",
  rateLimiter({ requests: 100 }),
  zValidator("json", statusSchema),
  async (c) => {
    try {
      const body = await c.req.json();
      const { walletAddress } = body;

      const result = await PremiumService.getUserPremiumStatus(walletAddress);
      return c.json({
        data: result,
        status: Status.Success
      });
    } catch (error) {
      console.error("Error getting premium status:", error);
      return c.json({ error: "Failed to get premium status" }, 500);
    }
  }
);

/**
 * Get available profiles for linking with business logic enforcement
 * Only returns profiles for wallets that can still link (not already linked)
 */
app.get(
  "/available-profiles",
  rateLimiter({ requests: 50 }),
  authMiddleware,
  getAvailableProfiles
);

/**
 * POST endpoint for available profiles (alternative to GET)
 */
app.post(
  "/profiles",
  rateLimiter({ requests: 50 }),
  zValidator("json", profilesSchema),
  async (c) => {
    try {
      const body = await c.req.json();
      const { walletAddress } = body;

      const result = await PremiumService.getAvailableProfiles(walletAddress);
      return c.json({
        data: result,
        status: Status.Success
      });
    } catch (error) {
      console.error("Error getting available profiles:", error);
      return c.json({ error: "Failed to get available profiles" }, 500);
    }
  }
);

/**
 * POST endpoint for getting available profiles
 */
app.post(
  "/available-profiles",
  rateLimiter({ requests: 50 }),
  zValidator("json", profilesSchema),
  async (c) => {
    try {
      const body = await c.req.json();
      const { walletAddress } = body;

      const result = await PremiumService.getAvailableProfiles(walletAddress);
      return c.json({
        data: result,
        status: Status.Success
      });
    } catch (error) {
      console.error("Error getting available profiles:", error);
      return c.json({ error: "Failed to get available profiles" }, 500);
    }
  }
);

app.post(
  "/link-profile",
  rateLimiter({ requests: 10 }),
  authMiddleware,
  zValidator("json", linkProfileSchema),
  linkProfile
);

/**
 * POST endpoint for linking profile with wallet address
 */
app.post(
  "/link",
  rateLimiter({ requests: 10 }),
  zValidator("json", linkProfileWithWalletSchema),
  async (c) => {
    try {
      const body = await c.req.json();
      const { walletAddress, profileId } = body;

      await PremiumService.linkProfile(walletAddress, profileId);

      // Get the linked profile details
      const linkedProfile =
        await PremiumService.getLinkedProfile(walletAddress);

      if (!linkedProfile) {
        return c.json({ error: "Failed to retrieve linked profile" }, 500);
      }

      return c.json({
        data: linkedProfile,
        status: Status.Success
      });
    } catch (error) {
      console.error("Error linking profile:", error);
      return c.json(
        {
          error: "Failed to link profile",
          message: error instanceof Error ? error.message : "Unknown error"
        },
        500
      );
    }
  }
);

app.get("/status", rateLimiter({ requests: 100 }), getPremiumStatus);

app.get(
  "/profiles",
  rateLimiter({ requests: 50 }),
  zValidator("query", walletAddressSchema),
  getProfiles
);

app.get(
  "/stats",
  rateLimiter({ requests: 50 }),
  authMiddleware,
  getProfileStats
);

app.get(
  "/linked-profile",
  rateLimiter({ requests: 50 }),
  authMiddleware,
  getLinkedProfile
);

app.get(
  "/wallet-status",
  rateLimiter({ requests: 50 }),
  zValidator("query", walletAddressSchema),
  checkWalletStatus
);

/**
 * POST endpoint for auto-linking first profile
 */
app.post(
  "/auto-link",
  rateLimiter({ requests: 10 }),
  zValidator("json", autoLinkSchema),
  async (c) => {
    try {
      const body = await c.req.json();
      const { walletAddress } = body;

      const linkedProfile =
        await PremiumService.autoLinkFirstProfile(walletAddress);

      if (!linkedProfile) {
        return c.json({ error: "No profiles available for auto-linking" }, 400);
      }

      return c.json({
        data: linkedProfile,
        status: Status.Success
      });
    } catch (error) {
      console.error("Error auto-linking profile:", error);
      return c.json(
        {
          error: "Failed to auto-link profile",
          message: error instanceof Error ? error.message : "Unknown error"
        },
        500
      );
    }
  }
);

/**
 * POST endpoint for auto-linking first profile with auth
 */
app.post(
  "/auto-link-profile",
  rateLimiter({ requests: 10 }),
  authMiddleware,
  async (c) => {
    try {
      const walletAddress = c.get("walletAddress");
      if (!walletAddress) {
        return c.json({ error: "Authentication required" }, 401);
      }

      const linkedProfile =
        await PremiumService.autoLinkFirstProfile(walletAddress);

      if (!linkedProfile) {
        return c.json({ error: "No profiles available for auto-linking" }, 400);
      }

      return c.json({
        data: linkedProfile,
        status: Status.Success
      });
    } catch (error) {
      console.error("Error auto-linking profile:", error);
      return c.json(
        {
          error: "Failed to auto-link profile",
          message: error instanceof Error ? error.message : "Unknown error"
        },
        500
      );
    }
  }
);

app.post(
  "/verify-registration",
  rateLimiter({ requests: 10 }),
  zValidator("json", verifyRegistrationSchema),
  verifyRegistration
);

app.post(
  "/register",
  rateLimiter({ requests: 10 }),
  zValidator("json", registerUserSchema),
  registerUser
);

// Debug endpoint for troubleshooting
app.route("/debug", debugStatus);

// Simple premium status endpoint
app.route("/simple-status", simpleStatus);
app.route("/debug-wallet", debugWallet);
app.route("/tree", tree);

export default app;
