import logger from "@hey/helpers/logger";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import PremiumService from "../../services/PremiumService";

const app = new Hono();

// Validation schemas
const validateWalletSchema = z.object({
  chainId: z.number().optional(),
  provider: z.string().optional(),
  walletAddress: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid wallet address")
});

const verifyPremiumSchema = z.object({
  walletAddress: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid wallet address")
});

const linkProfileSchema = z.object({
  profileId: z.string(),
  walletAddress: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid wallet address")
});

/**
 * POST /premium/enhanced-registration/validate-wallet
 * Validate wallet requirements for premium registration
 */
app.post(
  "/validate-wallet",
  zValidator("json", validateWalletSchema),
  async (c) => {
    try {
      const { walletAddress, chainId, provider } = c.req.valid("json");

      logger.info(`Validating wallet requirements for ${walletAddress}`);

      const validation = await PremiumService.validateWalletRequirements(
        walletAddress,
        chainId,
        provider
      );

      return c.json({
        data: validation,
        success: true
      });
    } catch (error) {
      logger.error("Error validating wallet requirements:", error);
      return c.json(
        {
          error: "Failed to validate wallet requirements",
          success: false
        },
        500
      );
    }
  }
);

/**
 * POST /premium/enhanced-registration/verify-premium
 * Verify premium status using NodeSet data
 */
app.post(
  "/verify-premium",
  zValidator("json", verifyPremiumSchema),
  async (c) => {
    try {
      const { walletAddress } = c.req.valid("json");

      logger.info(
        `Verifying premium status for ${walletAddress} using NodeSet`
      );

      const result = await PremiumService.verifyAndUpdatePremiumStatus(
        walletAddress
      );

      return c.json({
        data: result,
        success: result.success
      });
    } catch (error) {
      logger.error("Error verifying transaction:", error);
      return c.json(
        {
          error: "Failed to verify transaction",
          success: false
        },
        500
      );
    }
  }
);

/**
 * POST /premium/enhanced-registration/link-profile
 * Link profile with wallet validation
 */
app.post("/link-profile", zValidator("json", linkProfileSchema), async (c) => {
  try {
    const { walletAddress, profileId } = c.req.valid("json");

    logger.info(`Linking profile ${profileId} to wallet ${walletAddress}`);

    // First check if wallet already has a linked profile
    const rejectionMessage =
      await PremiumService.getPremiumRejectionMessage(walletAddress);
    if (rejectionMessage) {
      return c.json(
        {
          error: "WALLET_ALREADY_LINKED",
          message: rejectionMessage,
          success: false
        },
        400
      );
    }

    // Link the profile
    await PremiumService.linkProfile(walletAddress, profileId);

    // Get updated status
    const userStatus = await PremiumService.getUserPremiumStatus(walletAddress);

    return c.json({
      data: {
        message: "Profile linked successfully",
        userStatus
      },
      success: true
    });
  } catch (error) {
    logger.error("Error linking profile:", error);
    return c.json(
      {
        error: "Failed to link profile",
        message: error instanceof Error ? error.message : "Unknown error",
        success: false
      },
      500
    );
  }
});

/**
 * GET /premium/enhanced-registration/rejection-message/:walletAddress
 * Get rejection message for already linked premium wallets
 */
app.get("/rejection-message/:walletAddress", async (c) => {
  try {
    const walletAddress = c.req.param("walletAddress");

    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return c.json(
        {
          error: "Invalid wallet address",
          success: false
        },
        400
      );
    }

    const rejectionMessage =
      await PremiumService.getPremiumRejectionMessage(walletAddress);

    return c.json({
      data: {
        hasRejectionMessage: !!rejectionMessage,
        message: rejectionMessage
      },
      success: true
    });
  } catch (error) {
    logger.error("Error getting rejection message:", error);
    return c.json(
      {
        error: "Failed to get rejection message",
        success: false
      },
      500
    );
  }
});

/**
 * GET /premium/enhanced-registration/status/:walletAddress
 * Get comprehensive premium status with wallet info
 */
app.get("/status/:walletAddress", async (c) => {
  try {
    const walletAddress = c.req.param("walletAddress");

    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return c.json(
        {
          error: "Invalid wallet address",
          success: false
        },
        400
      );
    }

    // Get premium status
    const userStatus = await PremiumService.getUserPremiumStatus(walletAddress);

    // Get rejection message if applicable
    const rejectionMessage =
      await PremiumService.getPremiumRejectionMessage(walletAddress);

    // Get available profiles
    const availableProfiles =
      await PremiumService.getAvailableProfiles(walletAddress);

    return c.json({
      data: {
        availableProfiles,
        rejectionMessage,
        userStatus
      },
      success: true
    });
  } catch (error) {
    logger.error("Error getting enhanced status:", error);
    return c.json(
      {
        error: "Failed to get status",
        success: false
      },
      500
    );
  }
});

export default app;
