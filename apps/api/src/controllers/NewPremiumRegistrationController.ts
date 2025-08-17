import { Status } from "@hey/data/enums";
import type { Context } from "hono";
import { z } from "zod";
import NewPremiumRegistrationService from "@/services/NewPremiumRegistrationService";
import LensProfileService from "@/services/LensProfileService";
import NetworkManagementService from "@/services/NetworkManagementService";
import handleApiError from "@/utils/handleApiError";

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

const service = new NewPremiumRegistrationService();
const lensProfileService = new LensProfileService();
const networkService = new NetworkManagementService();

/**
 * Get comprehensive premium status for a user
 */
export async function getUserStatus(ctx: Context) {
  try {
    const { walletAddress } = walletAddressSchema.parse(ctx.req.query());

    const result = await service.getUserStatus(walletAddress);

    return ctx.json({
      data: result,
      status: Status.Success
    });
  } catch (error) {
    return handleApiError(ctx, error);
  }
}

/**
 * POST endpoint for getting premium status
 */
export async function getUserStatusPost(ctx: Context) {
  try {
    const body = await ctx.req.json();
    const { walletAddress } = walletAddressSchema.parse(body);

    const result = await service.getUserStatus(walletAddress);

    return ctx.json({
      data: result,
      status: Status.Success
    });
  } catch (error) {
    return handleApiError(ctx, error);
  }
}

/**
 * Handle premium registration process
 */
export async function handlePremiumRegistration(ctx: Context) {
  try {
    const body = await ctx.req.json();
    const request = registrationRequestSchema.parse(body);

    const result = await service.handlePremiumRegistration(request);

    return ctx.json({
      data: result,
      status: Status.Success
    });
  } catch (error) {
    return handleApiError(ctx, error);
  }
}

/**
 * Link a profile to a premium wallet
 */
export async function linkProfileToWallet(ctx: Context) {
  try {
    const body = await ctx.req.json();
    const { walletAddress, profileId } = linkProfileSchema.parse(body);

    const result = await service.linkProfileToWallet(walletAddress, profileId);

    return ctx.json({
      data: result,
      status: Status.Success
    });
  } catch (error) {
    return handleApiError(ctx, error);
  }
}

/**
 * Check if a wallet is premium
 */
export async function checkWalletPremium(ctx: Context) {
  try {
    const { walletAddress } = walletAddressSchema.parse(ctx.req.query());

    const isPremium = await service.isWalletPremium(walletAddress);

    return ctx.json({
      data: { isPremium, walletAddress },
      status: Status.Success
    });
  } catch (error) {
    return handleApiError(ctx, error);
  }
}

/**
 * POST endpoint for checking wallet premium status
 */
export async function checkWalletPremiumPost(ctx: Context) {
  try {
    const body = await ctx.req.json();
    const { walletAddress } = walletAddressSchema.parse(body);

    const isPremium = await service.isWalletPremium(walletAddress);

    return ctx.json({
      data: { isPremium, walletAddress },
      status: Status.Success
    });
  } catch (error) {
    return handleApiError(ctx, error);
  }
}

/**
 * Check if a profile can be linked to a wallet
 */
export async function canLinkProfile(ctx: Context) {
  try {
    const { walletAddress, profileId } = linkProfileSchema.parse(ctx.req.query());

    const canLink = await service.canLinkProfile(walletAddress, profileId);

    return ctx.json({
      data: { canLink, walletAddress, profileId },
      status: Status.Success
    });
  } catch (error) {
    return handleApiError(ctx, error);
  }
}

/**
 * POST endpoint for checking profile linkability
 */
export async function canLinkProfilePost(ctx: Context) {
  try {
    const body = await ctx.req.json();
    const { walletAddress, profileId } = linkProfileSchema.parse(body);

    const canLink = await service.canLinkProfile(walletAddress, profileId);

    return ctx.json({
      data: { canLink, walletAddress, profileId },
      status: Status.Success
    });
  } catch (error) {
    return handleApiError(ctx, error);
  }
}

/**
 * Discover available profiles for a wallet
 */
export async function discoverProfiles(ctx: Context) {
  try {
    const { walletAddress } = walletAddressSchema.parse(ctx.req.query());

    const result = await lensProfileService.discoverProfilesForWallet(walletAddress);

    return ctx.json({
      data: result,
      status: Status.Success
    });
  } catch (error) {
    return handleApiError(ctx, error);
  }
}

/**
 * POST endpoint for discovering profiles
 */
export async function discoverProfilesPost(ctx: Context) {
  try {
    const body = await ctx.req.json();
    const { walletAddress } = walletAddressSchema.parse(body);

    const result = await lensProfileService.discoverProfilesForWallet(walletAddress);

    return ctx.json({
      data: result,
      status: Status.Success
    });
  } catch (error) {
    return handleApiError(ctx, error);
  }
}

/**
 * Auto-link first available profile for a premium wallet
 */
export async function autoLinkProfile(ctx: Context) {
  try {
    const body = await ctx.req.json();
    const { walletAddress } = walletAddressSchema.parse(body);

    const result = await service.autoLinkFirstProfile(walletAddress);

    return ctx.json({
      data: result,
      status: Status.Success
    });
  } catch (error) {
    return handleApiError(ctx, error);
  }
}

/**
 * Get profile details by ID
 */
export async function getProfileById(ctx: Context) {
  try {
    const { profileId } = ctx.req.param();
    
    if (!profileId) {
      return ctx.json({
        error: "Profile ID is required",
        status: Status.Error
      }, 400);
    }

    const profile = await lensProfileService.getProfileById(profileId);

    if (!profile) {
      return ctx.json({
        error: "Profile not found",
        status: Status.Error
      }, 404);
    }

    return ctx.json({
      data: profile,
      status: Status.Success
    });
  } catch (error) {
    return handleApiError(ctx, error);
  }
}

/**
 * Validate network for premium registration
 */
export async function validateNetwork(ctx: Context) {
  try {
    const { chainId } = ctx.req.query();
    
    if (!chainId) {
      return ctx.json({
        error: "Chain ID is required",
        status: Status.Error
      }, 400);
    }

    const validation = networkService.validateNetworkForPremiumRegistration(chainId);
    const instructions = networkService.getNetworkSwitchingInstructions(chainId);

    return ctx.json({
      data: {
        validation,
        instructions,
        supportedNetworks: networkService.getSupportedNetworks()
      },
      status: Status.Success
    });
  } catch (error) {
    return handleApiError(ctx, error);
  }
}

/**
 * POST endpoint for network validation
 */
export async function validateNetworkPost(ctx: Context) {
  try {
    const body = await ctx.req.json();
    const { chainId } = body;
    
    if (!chainId) {
      return ctx.json({
        error: "Chain ID is required",
        status: Status.Error
      }, 400);
    }

    const validation = networkService.validateNetworkForPremiumRegistration(chainId);
    const instructions = networkService.getNetworkSwitchingInstructions(chainId);

    return ctx.json({
      data: {
        validation,
        instructions,
        supportedNetworks: networkService.getSupportedNetworks()
      },
      status: Status.Success
    });
  } catch (error) {
    return handleApiError(ctx, error);
  }
}

/**
 * Get supported networks
 */
export async function getSupportedNetworks(ctx: Context) {
  try {
    const networks = networkService.getSupportedNetworks();
    
    return ctx.json({
      data: networks,
      status: Status.Success
    });
  } catch (error) {
    return handleApiError(ctx, error);
  }
}

/**
 * Get Arbitrum One network configuration
 */
export async function getArbitrumOneNetwork(ctx: Context) {
  try {
    const network = networkService.getArbitrumOneNetwork();
    
    return ctx.json({
      data: network,
      status: Status.Success
    });
  } catch (error) {
    return handleApiError(ctx, error);
  }
}
