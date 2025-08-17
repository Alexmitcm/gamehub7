import logger from "@hey/helpers/logger";
import { Hono } from "hono";
import { z } from "zod";
import AuthService, {
  type LoginRequest,
  type SyncLensRequest
} from "../services/AuthService";
import AuthController from "../controllers/AuthController";

const auth = new Hono();

// Validation schemas
const loginSchema = z.object({
  selectedProfileId: z.string().min(1, "Profile ID is required"),
  walletAddress: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid wallet address format")
});

const syncLensSchema = z.object({
  lensAccessToken: z.string().min(1, "Lens access token is required")
});

const profileUpdateSchema = z.object({
  avatarUrl: z.string().url().optional(),
  bio: z.string().max(500).optional(),
  displayName: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  location: z.string().max(100).optional(),
  twitterHandle: z.string().max(50).optional(),
  username: z.string().min(1).max(50).optional(),
  website: z.string().url().optional()
});

/**
 * POST /api/auth/login
 * Unified login and onboarding endpoint
 * Handles both new user registration and existing user login
 */
auth.post("/login", async (c) => {
  try {
    const body = await c.req.json();

    // Validate request body
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      return c.json(
        {
          details: validationResult.error.errors,
          error: "Invalid request data",
          success: false
        },
        400
      );
    }

    const { walletAddress, selectedProfileId } =
      validationResult.data as LoginRequest;

    logger.info(
      `Login request received for wallet: ${walletAddress}, profile: ${selectedProfileId}`
    );

    // Process login/onboarding
    const result = await AuthService.loginOrOnboard({
      selectedProfileId,
      walletAddress
    });

    logger.info(
      `Login successful for wallet: ${walletAddress}, isNewUser: ${result.isNewUser}`
    );

    return c.json(result);
  } catch (error) {
    logger.error("Error in login endpoint:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Authentication failed";

    return c.json(
      {
        error: errorMessage,
        success: false
      },
      500
    );
  }
});

/**
 * POST /api/auth/sync-lens
 * Sync Lens authentication with our backend system
 * Validates Lens access token and creates our own JWT
 */
auth.post("/sync-lens", async (c) => {
  try {
    const body = await c.req.json();

    // Validate request body
    const validationResult = syncLensSchema.safeParse(body);
    if (!validationResult.success) {
      return c.json(
        {
          details: validationResult.error.errors,
          error: "Invalid request data",
          success: false
        },
        400
      );
    }

    const { lensAccessToken } = validationResult.data as SyncLensRequest;

    logger.info("Lens sync request received");

    // Process Lens sync
    const result = await AuthService.syncLens({ lensAccessToken });

    logger.info("Lens sync successful");

    return c.json(result);
  } catch (error) {
    logger.error("Error in sync-lens endpoint:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Lens sync failed";

    // Check if this is a client error (invalid token, etc.)
    if (
      errorMessage.includes("Invalid Lens access token") ||
      errorMessage.includes("Invalid request data")
    ) {
      return c.json(
        {
          error: errorMessage,
          success: false
        },
        400
      );
    }

    // Server errors get 500
    return c.json(
      {
        error: errorMessage,
        success: false
      },
      500
    );
  }
});

/**
 * GET /api/auth/profile
 * Get user profile by wallet address (requires authentication)
 */
auth.get("/profile", async (c) => {
  try {
    // Get wallet address from query params or headers
    const walletAddress =
      c.req.query("walletAddress") || c.req.header("X-Wallet-Address");

    if (!walletAddress) {
      return c.json(
        {
          error: "Wallet address is required",
          success: false
        },
        400
      );
    }

    const profile = await AuthService.getUserProfile(walletAddress);

    if (!profile) {
      return c.json(
        {
          error: "User not found",
          success: false
        },
        404
      );
    }

    return c.json({
      profile,
      success: true
    });
  } catch (error) {
    logger.error("Error getting user profile:", error);

    return c.json(
      {
        error: "Failed to get user profile",
        success: false
      },
      500
    );
  }
});

/**
 * PUT /api/auth/profile
 * Update user profile (requires authentication)
 */
auth.put("/profile", async (c) => {
  try {
    const body = await c.req.json();

    // Validate request body
    const validationResult = profileUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return c.json(
        {
          details: validationResult.error.errors,
          error: "Invalid request data",
          success: false
        },
        400
      );
    }

    const walletAddress =
      c.req.query("walletAddress") || c.req.header("X-Wallet-Address");

    if (!walletAddress) {
      return c.json(
        {
          error: "Wallet address is required",
          success: false
        },
        400
      );
    }

    const updatedProfile = await AuthService.updateUserProfile(
      walletAddress,
      validationResult.data
    );

    logger.info(`Profile updated for wallet: ${walletAddress}`);

    return c.json({
      profile: updatedProfile,
      success: true
    });
  } catch (error) {
    logger.error("Error updating user profile:", error);

    return c.json(
      {
        error: "Failed to update user profile",
        success: false
      },
      500
    );
  }
});

/**
 * GET /api/auth/profiles
 * Get available profiles for a wallet
 */
auth.get("/profiles", async (c) => {
  try {
    const walletAddress = c.req.query("walletAddress");

    if (!walletAddress) {
      return c.json(
        {
          error: "Wallet address is required",
          success: false
        },
        400
      );
    }

    const result = await AuthService.getAvailableProfiles(walletAddress);

    return c.json({
      linkedProfileId: result.linkedProfileId,
      profiles: result.profiles,
      success: true
    });
  } catch (error) {
    logger.error("Error getting available profiles:", error);

    return c.json(
      {
        error: "Failed to get available profiles",
        success: false
      },
      500
    );
  }
});

/**
 * POST /api/auth/validate
 * Validate JWT token and return user data
 */
auth.post("/validate", async (c) => {
  try {
    const body = await c.req.json();
    const { token } = body;

    if (!token) {
      return c.json(
        {
          error: "Token is required",
          success: false
        },
        400
      );
    }

    const userProfile = await AuthService.validateToken(token);

    if (!userProfile) {
      return c.json(
        {
          error: "Invalid or expired token",
          success: false
        },
        401
      );
    }

    return c.json({
      profile: userProfile,
      success: true
    });
  } catch (error) {
    logger.error("Error validating token:", error);

    return c.json(
      {
        error: "Failed to validate token",
        success: false
      },
      500
    );
  }
});

/**
 * GET /api/auth/health
 * Health check endpoint
 */
auth.get("/health", (c) => {
  return c.json({
    message: "Auth service is healthy",
    success: true,
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /api/auth/debug-token
 * Debug endpoint to inspect Lens token without validation
 */
auth.post("/debug-token", async (c) => {
  try {
    const body = await c.req.json();
    const { lensAccessToken } = body;

    if (!lensAccessToken) {
      return c.json(
        {
          error: "Lens access token is required",
          success: false
        },
        400
      );
    }

    // Try to decode the JWT token
    try {
      const tokenParts = lensAccessToken.split(".");
      if (tokenParts.length !== 3) {
        return c.json(
          {
            error: "Invalid JWT format",
            success: false,
            tokenParts: tokenParts.length
          },
          400
        );
      }

      // Decode the payload (second part of JWT)
      const payload = JSON.parse(
        Buffer.from(tokenParts[1], "base64").toString()
      );

      return c.json({
        success: true,
        tokenInfo: {
          expiresAt: payload.exp
            ? new Date(payload.exp * 1000).toISOString()
            : null,
          hasValidFormat: true,
          isExpired: payload.exp ? Date.now() > payload.exp * 1000 : null,
          issuedAt: payload.iat
            ? new Date(payload.iat * 1000).toISOString()
            : null,
          payload: payload,
          profileId: payload.profileId || payload.id,
          walletAddress: payload.sub
        }
      });
    } catch (decodeError) {
      return c.json(
        {
          decodeError:
            decodeError instanceof Error
              ? decodeError.message
              : "Unknown error",
          error: "Failed to decode JWT token",
          success: false
        },
        400
      );
    }
  } catch (error) {
    logger.error("Error in debug-token endpoint:", error);
    return c.json(
      {
        error: "Failed to process token",
        success: false
      },
      500
    );
  }
});

/**
 * POST /api/auth/user-status
 * Get comprehensive user status with new logic
 */
auth.post("/user-status", async (c) => {
  try {
    const body = await c.req.json();
    const { walletAddress, lensProfileId } = body;

    if (!walletAddress) {
      return c.json({
        success: false,
        message: "Wallet address is required"
      }, 400);
    }

    // Import the controller dynamically to avoid circular dependencies
    const { default: AuthController } = await import("../controllers/AuthController");
    const controller = new AuthController();
    
    return controller.getUserStatus(c);
  } catch (error) {
    logger.error("Error getting user status:", error);
    return c.json({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

/**
 * POST /api/auth/login-enhanced
 * Enhanced login with new user status logic
 */
auth.post("/login-enhanced", async (c) => {
  try {
    const body = await c.req.json();
    const { walletAddress, lensProfileId } = body;

    if (!walletAddress) {
      return c.json({
        success: false,
        message: "Wallet address is required"
      }, 400);
    }

    return AuthController.handleUserLogin(c);
  } catch (error) {
    logger.error("Error in enhanced login:", error);
    return c.json({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

/**
 * GET /api/auth/premium-access
 * Check if user can access premium features
 */
auth.get("/premium-access", async (c) => {
  try {
    const { walletAddress } = c.req.query();
    
    if (!walletAddress) {
      return c.json({
        success: false,
        message: "Wallet address is required"
      }, 400);
    }

    return AuthController.checkPremiumAccess(c);
  } catch (error) {
    logger.error("Error checking premium access:", error);
    return c.json({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

/**
 * GET /api/auth/premium-wallet
 * Get user's premium wallet for reward claiming
 */
auth.get("/premium-wallet", async (c) => {
  try {
    const { lensProfileId } = c.req.query();
    
    if (!lensProfileId) {
      return c.json({
        success: false,
        message: "Lens profile ID is required"
      }, 400);
    }

    return AuthController.getPremiumWallet(c);
  } catch (error) {
    logger.error("Error getting premium wallet:", error);
    return c.json({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

export default auth;
