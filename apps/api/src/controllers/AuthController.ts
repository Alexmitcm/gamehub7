import type { Context } from "hono";
import { UserStatus } from "@prisma/client";
import UserStatusService from "@/services/UserStatusService";
import logger from "@hey/helpers/logger";

export interface LoginRequest {
  walletAddress: string;
  lensProfileId?: string;
  signature?: string;
  message?: string;
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
}

export class AuthController {
  private readonly userStatusService: UserStatusService;

  constructor() {
    this.userStatusService = new UserStatusService();
  }

  /**
   * Handle user login/registration flow
   */
  async handleUserLogin(ctx: Context): Promise<Response> {
    try {
      const request: LoginRequest = await ctx.req.json();
      
      if (!request.walletAddress) {
        return ctx.json({
          success: false,
          message: "Wallet address is required"
        }, 400);
      }

      // Handle the login flow with the new logic
      const loginResult = await this.userStatusService.handleUserLogin(
        request.walletAddress,
        request.lensProfileId
      );

      if (loginResult.success) {
        return ctx.json({
          success: true,
          message: loginResult.message,
          userStatus: loginResult.userStatus.status,
          requiresMetaMaskConnection: loginResult.requiresMetaMaskConnection,
          requiresNetworkSwitch: loginResult.requiresNetworkSwitch,
          linkedProfile: loginResult.userStatus.linkedProfile,
          premiumWalletAddress: loginResult.userStatus.premiumWalletAddress,
          lensWalletAddress: loginResult.userStatus.lensWalletAddress
        });
      } else {
        return ctx.json({
          success: false,
          message: loginResult.message,
          userStatus: loginResult.userStatus.status
        }, 400);
      }
    } catch (error) {
      logger.error("Error handling user login:", error);
      return ctx.json({
        success: false,
        message: "Internal server error"
      }, 500);
    }
  }

  /**
   * Get user's current status
   */
  async getUserStatus(ctx: Context): Promise<Response> {
    try {
      const { walletAddress, lensProfileId } = ctx.req.query();
      
      if (!walletAddress) {
        return ctx.json({
          success: false,
          message: "Wallet address is required"
        }, 400);
      }

      const result = await this.userStatusService.getComprehensiveUserStatus(
        walletAddress,
        lensProfileId
      );

      return ctx.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error("Error getting user status:", error);
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
}

export default new AuthController();
