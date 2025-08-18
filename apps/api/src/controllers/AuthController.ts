import type { Context } from "hono";
import { UserStatus } from "@prisma/client";
import UserStatusService from "@/services/UserStatusService";
import logger from "@hey/helpers/logger";

export interface LoginRequest {
  walletAddress: string;
  lensProfileId?: string;
  signature?: string;
  message?: string;
  walletProvider?: string;
  networkId?: number;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  userStatus: UserStatus;
  requiresMetaMaskConnection?: boolean;
  requiresNetworkSwitch?: boolean;
  linkedProfile?: {
    profileId: string;
    handle: string;
    linkedAt: Date;
  };
  premiumWalletAddress?: string;
  lensWalletAddress?: string;
  walletSeparation?: {
    premiumWalletAddress?: string;
    lensWalletAddress?: string;
    isWalletSeparated: boolean;
  };
}

export class AuthController {
  private readonly userStatusService: UserStatusService;

  constructor() {
    this.userStatusService = new UserStatusService();
  }

  /**
   * Handle enhanced user login/registration flow
   */
  async handleEnhancedUserLogin(ctx: Context): Promise<Response> {
    try {
      const request: LoginRequest = await ctx.req.json();
      
      if (!request.walletAddress) {
        return ctx.json({
          success: false,
          message: "Wallet address is required"
        }, 400);
      }

      // Handle the login flow with enhanced logic
      const loginResult = await this.userStatusService.handleUserLogin(
        request.walletAddress,
        request.lensProfileId
      );

      if (loginResult.success) {
        // Get enhanced user status with wallet separation
        const enhancedStatus = await this.userStatusService.getEnhancedUserStatus(
          request.walletAddress,
          request.lensProfileId,
          request.walletProvider,
          request.networkId
        );

        return ctx.json({
          success: true,
          message: loginResult.message,
          userStatus: loginResult.userStatus.status,
          requiresMetaMaskConnection: enhancedStatus.walletRequirements.requiresMetaMaskConnection,
          requiresNetworkSwitch: enhancedStatus.walletRequirements.requiresNetworkSwitch,
          linkedProfile: enhancedStatus.linkedProfile,
          premiumWalletAddress: enhancedStatus.walletSeparation.premiumWalletAddress,
          lensWalletAddress: enhancedStatus.walletSeparation.lensWalletAddress,
          walletSeparation: enhancedStatus.walletSeparation
        });
      } else {
        return ctx.json({
          success: false,
          message: loginResult.message,
          userStatus: loginResult.userStatus.status
        }, 400);
      }
    } catch (error) {
      logger.error("Error handling enhanced user login:", error);
      return ctx.json({
        success: false,
        message: "Internal server error"
      }, 500);
    }
  }

  /**
   * Get enhanced user status with wallet separation
   */
  async getEnhancedUserStatus(ctx: Context): Promise<Response> {
    try {
      const { walletAddress, lensProfileId, walletProvider, networkId } = ctx.req.query();
      
      if (!walletAddress) {
        return ctx.json({
          success: false,
          message: "Wallet address is required"
        }, 400);
      }

      const result = await this.userStatusService.getEnhancedUserStatus(
        walletAddress,
        lensProfileId,
        walletProvider,
        networkId
      );

      return ctx.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error("Error getting enhanced user status:", error);
      return ctx.json({
        success: false,
        message: "Internal server error"
      }, 500);
    }
  }

  /**
   * Check if user can access premium features
   */
  async checkPremiumAccess(ctx: Context): Promise<Response> {
    try {
      const { walletAddress } = ctx.req.query();
      
      if (!walletAddress) {
        return ctx.json({
          success: false,
          message: "Wallet address is required"
        }, 400);
      }

      const canAccess = await this.userStatusService.canAccessPremiumFeatures(walletAddress);

      return ctx.json({
        success: true,
        data: {
          canAccess,
          message: canAccess 
            ? "User can access premium features"
            : "User cannot access premium features"
        }
      });
    } catch (error) {
      logger.error("Error checking premium access:", error);
      return ctx.json({
        success: false,
        message: "Internal server error"
      }, 500);
    }
  }

  /**
   * Get user's premium wallet for reward claiming
   */
  async getPremiumWallet(ctx: Context): Promise<Response> {
    try {
      const { lensProfileId } = ctx.req.query();
      
      if (!lensProfileId) {
        return ctx.json({
          success: false,
          message: "Lens profile ID is required"
        }, 400);
      }

      const premiumWallet = await this.userStatusService.getPremiumWalletForUser(lensProfileId);

      return ctx.json({
        success: true,
        data: {
          premiumWalletAddress: premiumWallet,
          message: premiumWallet 
            ? "Premium wallet found"
            : "No premium wallet found for this profile"
        }
      });
    } catch (error) {
      logger.error("Error getting premium wallet:", error);
      return ctx.json({
        success: false,
        message: "Internal server error"
      }, 500);
    }
  }

  /**
   * Get account verification status for display in account selection
   */
  async getAccountVerificationStatus(ctx: Context): Promise<Response> {
    try {
      const { walletAddress, profileId } = ctx.req.query();
      
      if (!walletAddress || !profileId) {
        return ctx.json({
          success: false,
          message: "Wallet address and profile ID are required"
        }, 400);
      }

      const verificationStatus = await this.userStatusService.getAccountVerificationStatus(
        walletAddress,
        profileId
      );

      return ctx.json({
        success: true,
        data: verificationStatus
      });
    } catch (error) {
      logger.error("Error getting account verification status:", error);
      return ctx.json({
        success: false,
        message: "Internal server error"
      }, 500);
    }
  }

  /**
   * Check if wallet can register for premium (strict rule enforcement)
   */
  async checkWalletPremiumRegistrationEligibility(ctx: Context): Promise<Response> {
    try {
      const { walletAddress } = ctx.req.query();
      
      if (!walletAddress) {
        return ctx.json({
          success: false,
          message: "Wallet address is required"
        }, 400);
      }

      const eligibility = await this.userStatusService.canWalletRegisterForPremium(walletAddress);

      return ctx.json({
        success: true,
        data: eligibility
      });
    } catch (error) {
      logger.error("Error checking wallet premium registration eligibility:", error);
      return ctx.json({
        success: false,
        message: "Internal server error"
      }, 500);
    }
  }

  /**
   * Check if profile can attempt premium registration
   */
  async checkProfilePremiumRegistrationEligibility(ctx: Context): Promise<Response> {
    try {
      const { walletAddress, profileId } = ctx.req.query();
      
      if (!walletAddress || !profileId) {
        return ctx.json({
          success: false,
          message: "Wallet address and profile ID are required"
        }, 400);
      }

      const eligibility = await this.userStatusService.canProfileAttemptPremiumRegistration(
        walletAddress,
        profileId
      );

      return ctx.json({
        success: true,
        data: eligibility
      });
    } catch (error) {
      logger.error("Error checking profile premium registration eligibility:", error);
      return ctx.json({
        success: false,
        message: "Internal server error"
      }, 500);
    }
  }
}

export default new AuthController();
