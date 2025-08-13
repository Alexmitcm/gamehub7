import { Status } from "@hey/data/enums";
import type { Context } from "hono";
import { z } from "zod";
import PremiumRegistrationService from "@/services/PremiumRegistrationService";
import handleApiError from "@/utils/handleApiError";

// Validation schemas
const registrationRequestSchema = z.object({
  userAddress: z.string().min(1, "User address is required"),
  referrerAddress: z.string().min(1, "Referrer address is required"),
  lensProfileId: z.string().optional(),
  lensWalletAddress: z.string().optional()
});

const verifyRegistrationSchema = z.object({
  userAddress: z.string().min(1, "User address is required"),
  referrerAddress: z.string().min(1, "Referrer address is required"),
  transactionHash: z.string().min(1, "Transaction hash is required"),
  lensProfileId: z.string().optional()
});

const linkProfileSchema = z.object({
  walletAddress: z.string().min(1, "Wallet address is required"),
  profileId: z.string().min(1, "Profile ID is required")
});

const walletAddressSchema = z.object({
  walletAddress: z.string().min(1, "Wallet address is required")
});

/**
 * Get comprehensive premium status for a user
 */
export async function getPremiumStatus(ctx: Context) {
  try {
    const { walletAddress } = walletAddressSchema.parse(ctx.req.query());

    const result = await PremiumRegistrationService.getPremiumStatus(walletAddress);

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
export async function getPremiumStatusPost(ctx: Context) {
  try {
    const body = await ctx.req.json();
    const { walletAddress } = walletAddressSchema.parse(body);

    const result = await PremiumRegistrationService.getPremiumStatus(walletAddress);

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

    const result = await PremiumRegistrationService.handlePremiumRegistration(request);

    return ctx.json({
      data: result,
      status: Status.Success
    });
  } catch (error) {
    return handleApiError(ctx, error);
  }
}

/**
 * Verify a completed registration transaction and handle profile linking
 */
export async function verifyRegistrationAndLinkProfile(ctx: Context) {
  try {
    const body = await ctx.req.json();
    const { userAddress, referrerAddress, transactionHash, lensProfileId } = verifyRegistrationSchema.parse(body);

    const result = await PremiumRegistrationService.verifyRegistrationAndLinkProfile(
      userAddress,
      referrerAddress,
      transactionHash,
      lensProfileId
    );

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
export async function autoLinkFirstProfile(ctx: Context) {
  try {
    const body = await ctx.req.json();
    const { walletAddress } = walletAddressSchema.parse(body);

    const result = await PremiumRegistrationService.autoLinkFirstProfile(walletAddress);

    return ctx.json({
      data: result,
      status: Status.Success
    });
  } catch (error) {
    return handleApiError(ctx, error);
  }
}

/**
 * Manually link a specific profile to a premium wallet
 */
export async function linkProfileToWallet(ctx: Context) {
  try {
    const body = await ctx.req.json();
    const { walletAddress, profileId } = linkProfileSchema.parse(body);

    const result = await PremiumRegistrationService.linkProfileToWallet(walletAddress, profileId);

    return ctx.json({
      data: result,
      status: Status.Success
    });
  } catch (error) {
    return handleApiError(ctx, error);
  }
}

/**
 * Check wallet connection status
 */
export async function checkWalletConnectionStatus(ctx: Context) {
  try {
    const { walletAddress } = walletAddressSchema.parse(ctx.req.query());

    const result = await PremiumRegistrationService.checkWalletConnectionStatus(walletAddress);

    return ctx.json({
      data: result,
      status: Status.Success
    });
  } catch (error) {
    return handleApiError(ctx, error);
  }
}

/**
 * POST endpoint for checking wallet connection status
 */
export async function checkWalletConnectionStatusPost(ctx: Context) {
  try {
    const body = await ctx.req.json();
    const { walletAddress } = walletAddressSchema.parse(body);

    const result = await PremiumRegistrationService.checkWalletConnectionStatus(walletAddress);

    return ctx.json({
      data: result,
      status: Status.Success
    });
  } catch (error) {
    return handleApiError(ctx, error);
  }
}

/**
 * Get registration instructions for the frontend
 */
export async function getRegistrationInstructions(ctx: Context) {
  try {
    const instructions = PremiumRegistrationService.getRegistrationInstructions();

    return ctx.json({
      data: instructions,
      status: Status.Success
    });
  } catch (error) {
    return handleApiError(ctx, error);
  }
}

/**
 * Validate referrer address
 */
export async function validateReferrer(ctx: Context) {
  try {
    const { referrerAddress } = z.object({
      referrerAddress: z.string().min(1, "Referrer address is required")
    }).parse(ctx.req.query());

    // This would typically use the BlockchainService to validate
    // For now, we'll return a basic validation
    const isValid = referrerAddress.length === 42 && referrerAddress.startsWith('0x');

    return ctx.json({
      data: {
        isValid,
        message: isValid ? "Valid referrer address" : "Invalid referrer address format"
      },
      status: Status.Success
    });
  } catch (error) {
    return handleApiError(ctx, error);
  }
}

/**
 * POST endpoint for validating referrer address
 */
export async function validateReferrerPost(ctx: Context) {
  try {
    const body = await ctx.req.json();
    const { referrerAddress } = z.object({
      referrerAddress: z.string().min(1, "Referrer address is required")
    }).parse(body);

    // This would typically use the BlockchainService to validate
    // For now, we'll return a basic validation
    const isValid = referrerAddress.length === 42 && referrerAddress.startsWith('0x');

    return ctx.json({
      data: {
        isValid,
        message: isValid ? "Valid referrer address" : "Invalid referrer address format"
      },
      status: Status.Success
    });
  } catch (error) {
    return handleApiError(ctx, error);
  }
}
