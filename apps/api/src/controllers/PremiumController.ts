import { Status } from "@hey/data/enums";
import type { Context } from "hono";
import { z } from "zod";
import PremiumService from "@/services/PremiumService";
import ProfileService from "@/services/ProfileService";
import handleApiError from "@/utils/handleApiError";

// Validation schemas
const linkProfileSchema = z.object({
  profileId: z.string().min(1, "Profile ID is required")
});

const getProfilesSchema = z.object({
  walletAddress: z.string().min(1, "Wallet address is required")
});

const verifyRegistrationSchema = z.object({
  referrerAddress: z.string().min(1, "Referrer address is required"),
  transactionHash: z.string().min(1, "Transaction hash is required"),
  userAddress: z.string().min(1, "User address is required")
});

const registerUserSchema = z.object({
  referrerAddress: z.string().min(1, "Referrer address is required"),
  userAddress: z.string().min(1, "User address is required")
});

/**
 * Get user's premium status with strict business logic enforcement
 * Returns: 'Standard' | 'OnChainUnlinked' | 'ProLinked'
 */
export async function getUserPremiumStatus(ctx: Context) {
  try {
    const walletAddress = ctx.get("walletAddress");
    if (!walletAddress) {
      return ctx.json(
        { error: "Authentication required", status: Status.Error },
        401
      );
    }

    const result = await PremiumService.getUserPremiumStatus(walletAddress);

    return ctx.json({
      data: result,
      status: Status.Success
    });
  } catch (error) {
    return handleApiError(ctx, error);
  }
}

/**
 * Get available profiles for linking with business logic enforcement
 * Only returns profiles for wallets that can still link (not already linked)
 */
export async function getAvailableProfiles(ctx: Context) {
  try {
    const walletAddress = ctx.get("walletAddress");
    if (!walletAddress) {
      return ctx.json(
        { error: "Authentication required", status: Status.Error },
        401
      );
    }

    const result = await PremiumService.getAvailableProfiles(walletAddress);

    return ctx.json({
      data: result,
      status: Status.Success
    });
  } catch (error) {
    return handleApiError(ctx, error);
  }
}

export async function linkProfile(ctx: Context) {
  try {
    const body = await ctx.req.json();
    const { profileId } = linkProfileSchema.parse(body);

    const walletAddress = ctx.get("walletAddress");
    if (!walletAddress) {
      return ctx.json(
        { error: "Authentication required", status: Status.Error },
        401
      );
    }

    await PremiumService.linkProfile(walletAddress, profileId);

    return ctx.json({
      message: "Profile linked successfully",
      status: Status.Success
    });
  } catch (error) {
    return handleApiError(ctx, error);
  }
}

export async function getPremiumStatus(ctx: Context) {
  try {
    const walletAddress = ctx.get("walletAddress");
    const profileId = ctx.get("profileId");

    // If user is not authenticated, return default status
    if (!walletAddress || !profileId) {
      return ctx.json({
        data: {
          isPremium: false,
          userStatus: "Standard"
        },
        status: Status.Success
      });
    }

    const isPremium = await PremiumService.getPremiumStatus(
      walletAddress,
      profileId
    );

    return ctx.json({
      data: {
        isPremium,
        userStatus: isPremium ? "ProLinked" : "Standard"
      },
      status: Status.Success
    });
  } catch (error) {
    return handleApiError(ctx, error);
  }
}

export async function getProfiles(ctx: Context) {
  try {
    const { walletAddress } = getProfilesSchema.parse(ctx.req.query());

    const profiles = await ProfileService.getProfilesByWallet(walletAddress);

    return ctx.json({
      data: { profiles },
      status: Status.Success
    });
  } catch (error) {
    return handleApiError(ctx, error);
  }
}

export async function getProfileStats(ctx: Context) {
  try {
    const walletAddress = ctx.get("walletAddress");
    if (!walletAddress) {
      return ctx.json(
        { error: "Authentication required", status: Status.Error },
        401
      );
    }

    const stats = await PremiumService.getProfileStats(walletAddress);

    return ctx.json({
      data: {
        balancedReward: stats.balancedReward.toString(),
        leftNode: stats.leftNode,
        referralReward: stats.referralReward.toString(),
        rightNode: stats.rightNode,
        unbalancedReward: stats.unbalancedReward.toString()
      },
      status: Status.Success
    });
  } catch (error) {
    return handleApiError(ctx, error);
  }
}

export async function getLinkedProfile(ctx: Context) {
  try {
    const walletAddress = ctx.get("walletAddress");
    if (!walletAddress) {
      return ctx.json(
        { error: "Authentication required", status: Status.Error },
        401
      );
    }

    const linkedProfile = await PremiumService.getLinkedProfile(walletAddress);

    return ctx.json({
      data: { linkedProfile },
      status: Status.Success
    });
  } catch (error) {
    return handleApiError(ctx, error);
  }
}

export async function checkWalletStatus(ctx: Context) {
  try {
    const { walletAddress } = getProfilesSchema.parse(ctx.req.query());

    const isRegistered = await PremiumService.checkWalletStatus(walletAddress);

    return ctx.json({
      data: { isRegistered },
      status: Status.Success
    });
  } catch (error) {
    return handleApiError(ctx, error);
  }
}

export async function autoLinkFirstProfile(ctx: Context) {
  try {
    const walletAddress = ctx.get("walletAddress");
    if (!walletAddress) {
      return ctx.json(
        { error: "Authentication required", status: Status.Error },
        401
      );
    }

    const linkedProfile =
      await PremiumService.autoLinkFirstProfile(walletAddress);

    if (!linkedProfile) {
      return ctx.json(
        {
          error: "No profiles available for auto-linking",
          status: Status.Error
        },
        404
      );
    }

    return ctx.json({
      data: { linkedProfile },
      status: Status.Success
    });
  } catch (error) {
    return handleApiError(ctx, error);
  }
}

export async function verifyRegistration(ctx: Context) {
  try {
    const body = await ctx.req.json();
    const { userAddress, referrerAddress, transactionHash } =
      verifyRegistrationSchema.parse(body);

    // Verify the transaction on-chain
    const isValid = await PremiumService.verifyRegistrationTransaction(
      userAddress,
      referrerAddress,
      transactionHash
    );

    if (!isValid) {
      return ctx.json(
        { error: "Invalid registration transaction", status: Status.Error },
        400
      );
    }

    // Generate JWT with premium status
    const jwt = await PremiumService.generatePremiumJWT(userAddress);

    return ctx.json({
      data: { jwt, verified: true },
      status: Status.Success
    });
  } catch (error) {
    return handleApiError(ctx, error);
  }
}

export async function registerUser(ctx: Context) {
  try {
    const body = await ctx.req.json();
    const { userAddress, referrerAddress } = registerUserSchema.parse(body);

    const result = await PremiumService.registerUser(
      userAddress,
      referrerAddress
    );

    return ctx.json({
      message: result,
      status: Status.Success
    });
  } catch (error) {
    return handleApiError(ctx, error);
  }
}
