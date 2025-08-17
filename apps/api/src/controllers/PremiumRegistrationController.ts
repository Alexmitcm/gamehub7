import type { Context } from "hono";
import { UserStatus } from "../generated/prisma-client";
import UserStatusService from "@/services/UserStatusService";
import SmartContractService from "@/services/SmartContractService";
import logger from "@hey/helpers/logger";

export interface PremiumRegistrationRequest {
  userAddress: string;
  referrerAddress: string;
  lensProfileId?: string;
  lensWalletAddress?: string;
  transactionHash?: string;
}

export interface PremiumRegistrationResponse {
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
  transactionHash?: string;
  rejectionReason?: string;
}

export class PremiumRegistrationController {
  private readonly userStatusService: UserStatusService;
  private readonly smartContractService: SmartContractService;

  constructor() {
    this.userStatusService = new UserStatusService();
    this.smartContractService = new SmartContractService();
  }

  /**
   * Get user's premium status
   */
  async getPremiumStatus(ctx: Context): Promise<Response> {
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
      logger.error("Error getting premium status:", error);
      return ctx.json({
        success: false,
        message: "Internal server error"
      }, 500);
    }
  }

  /**
   * Handle premium registration request
   */
  async handlePremiumRegistration(ctx: Context): Promise<Response> {
    try {
      const request: PremiumRegistrationRequest = await ctx.req.json();
      
      if (!request.userAddress || !request.referrerAddress) {
        return ctx.json({
          success: false,
          message: "User address and referrer address are required"
        }, 400);
      }

      // Check if user is already premium
      const currentStatus = await this.userStatusService.getUserStatus(
        request.userAddress,
        request.lensProfileId
      );

      if (currentStatus.status === UserStatus.Premium) {
        return ctx.json({
          success: false,
          message: "User is already premium",
          userStatus: currentStatus.status
        });
      }

      // Check if referrer is valid
      const isReferrerValid = await this.smartContractService.isWalletPremium(request.referrerAddress);
      if (!isReferrerValid) {
        return ctx.json({
          success: false,
          message: "Invalid referrer address"
        }, 400);
      }

      // If this is a completion request with transaction hash
      if (request.transactionHash) {
        const completionResult = await this.userStatusService.handlePremiumRegistrationCompletion(
          request.userAddress,
          request.transactionHash,
          request.lensProfileId
        );

        if (completionResult.success) {
          return ctx.json({
            success: true,
            message: "Premium registration completed successfully",
            userStatus: completionResult.userStatus.status,
            linkedProfile: completionResult.userStatus.linkedProfile,
            transactionHash: request.transactionHash
          });
        } else {
          return ctx.json({
            success: false,
            message: completionResult.message,
            rejectionReason: completionResult.rejectionReason,
            userStatus: completionResult.userStatus.status
          }, 400);
        }
      }

      // This is an initial registration request
      // Check if MetaMask connection is required
      const isPremiumOnChain = await this.smartContractService.isWalletPremium(request.userAddress);
      
      if (!isPremiumOnChain) {
        return ctx.json({
          success: false,
          message: "MetaMask connection required for premium registration",
          userStatus: currentStatus.status,
          requiresMetaMaskConnection: true,
          requiresNetworkSwitch: true
        });
      }

      // User is premium on-chain, proceed with profile linking
      if (request.lensProfileId) {
        const linkResult = await this.userStatusService.linkProfileToWallet(
          request.userAddress,
          request.lensProfileId
        );

        if (linkResult.success) {
          return ctx.json({
            success: true,
            message: "Profile linked successfully",
            userStatus: linkResult.userStatus.status,
            linkedProfile: linkResult.userStatus.linkedProfile
          });
        } else {
          return ctx.json({
            success: false,
            message: linkResult.message,
            rejectionReason: linkResult.rejectionReason,
            userStatus: linkResult.userStatus.status
          }, 400);
        }
      } else {
        return ctx.json({
          success: false,
          message: "Lens profile ID required for linking",
          userStatus: currentStatus.status
        });
      }
    } catch (error) {
      logger.error("Error handling premium registration:", error);
      return ctx.json({
        success: false,
        message: "Internal server error"
      }, 500);
    }
  }

  /**
   * Verify registration and link profile
   */
  async verifyRegistrationAndLinkProfile(ctx: Context): Promise<Response> {
    try {
      const { walletAddress, lensProfileId, transactionHash } = await ctx.req.json();
      
      if (!walletAddress || !transactionHash) {
        return ctx.json({
          success: false,
          message: "Wallet address and transaction hash are required"
        }, 400);
      }

      const result = await this.userStatusService.handlePremiumRegistrationCompletion(
        walletAddress,
        transactionHash,
        lensProfileId
      );

      if (result.success) {
        return ctx.json({
          success: true,
          message: "Registration verified and profile linked successfully",
          userStatus: result.userStatus.status,
          linkedProfile: result.userStatus.linkedProfile,
          transactionHash
        });
      } else {
        return ctx.json({
          success: false,
          message: result.message,
          rejectionReason: result.rejectionReason,
          userStatus: result.userStatus.status
        }, 400);
      }
    } catch (error) {
      logger.error("Error verifying registration:", error);
      return ctx.json({
        success: false,
        message: "Internal server error"
      }, 500);
    }
  }

  /**
   * Auto-link first available profile for a premium wallet
   */
  async autoLinkFirstProfile(ctx: Context): Promise<Response> {
    try {
      const { walletAddress, lensProfileId } = await ctx.req.json();
      
      if (!walletAddress || !lensProfileId) {
        return ctx.json({
          success: false,
          message: "Wallet address and lens profile ID are required"
        }, 400);
      }

      const result = await this.userStatusService.autoLinkFirstProfile(walletAddress, lensProfileId);

      if (result.success) {
        return ctx.json({
          success: true,
          message: "Profile auto-linked successfully",
          userStatus: result.userStatus.status,
          linkedProfile: result.userStatus.linkedProfile,
          linkedProfileId: result.linkedProfileId
        });
      } else {
        return ctx.json({
          success: false,
          message: result.message,
          userStatus: result.userStatus.status
        }, 400);
      }
    } catch (error) {
      logger.error("Error auto-linking profile:", error);
      return ctx.json({
        success: false,
        message: "Internal server error"
      }, 500);
    }
  }

  /**
   * Manually link profile to wallet
   */
  async linkProfileToWallet(ctx: Context): Promise<Response> {
    try {
      const { walletAddress, profileId } = await ctx.req.json();
      
      if (!walletAddress || !profileId) {
        return ctx.json({
          success: false,
          message: "Wallet address and profile ID are required"
        }, 400);
      }

      const result = await this.userStatusService.linkProfileToWallet(walletAddress, profileId);

      if (result.success) {
        return ctx.json({
          success: true,
          message: "Profile linked successfully",
          userStatus: result.userStatus.status,
          linkedProfile: result.userStatus.linkedProfile
        });
      } else {
        return ctx.json({
          success: false,
          message: result.message,
          rejectionReason: result.rejectionReason,
          userStatus: result.userStatus.status
        }, 400);
      }
    } catch (error) {
      logger.error("Error linking profile:", error);
      return ctx.json({
        success: false,
        message: "Internal server error"
      }, 500);
    }
  }

  /**
   * Check wallet connection status for MetaMask validation
   */
  async checkWalletConnectionStatus(ctx: Context): Promise<Response> {
    try {
      const { walletAddress } = ctx.req.query();
      
      if (!walletAddress) {
        return ctx.json({
          success: false,
          message: "Wallet address is required"
        }, 400);
      }

      // Check if wallet is premium on-chain
      const isPremium = await this.smartContractService.isWalletPremium(walletAddress);
      
      // For now, we'll return basic connection info
      // Frontend will handle actual wallet connection validation
      return ctx.json({
        success: true,
        data: {
          walletAddress,
          isPremium,
          requiresMetaMaskConnection: !isPremium,
          requiresNetworkSwitch: !isPremium,
          message: isPremium 
            ? "Wallet is premium and ready for profile linking"
            : "MetaMask connection required for premium registration"
        }
      });
    } catch (error) {
      logger.error("Error checking wallet connection status:", error);
      return ctx.json({
        success: false,
        message: "Internal server error"
      }, 500);
    }
  }

  /**
   * Validate wallet for reward claiming
   */
  async validateWalletForRewardClaiming(ctx: Context): Promise<Response> {
    try {
      const { walletAddress } = ctx.req.query();
      
      if (!walletAddress) {
        return ctx.json({
          success: false,
          message: "Wallet address is required"
        }, 400);
      }

      const validation = await this.userStatusService.validateWalletForRewardClaiming(walletAddress);

      return ctx.json({
        success: true,
        data: validation
      });
    } catch (error) {
      logger.error("Error validating wallet for reward claiming:", error);
      return ctx.json({
        success: false,
        message: "Internal server error"
      }, 500);
    }
  }

  /**
   * Get comprehensive user status
   */
  async getComprehensiveUserStatus(ctx: Context): Promise<Response> {
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
      logger.error("Error getting comprehensive user status:", error);
      return ctx.json({
        success: false,
        message: "Internal server error"
      }, 500);
    }
  }
}

export default new PremiumRegistrationController();
