import logger from "@hey/helpers/logger";
import prisma from "../prisma/client";
import SmartContractService from "./SmartContractService";
import LensProfileService from "./LensProfileService";

// Types
export interface UserStatus {
  status: "Standard" | "Premium" | "OnChainUnlinked";
  walletAddress: string;
  lensProfileId?: string;
  linkedProfile?: {
    profileId: string;
    handle: string;
    linkedAt: Date;
  };
  isPremiumOnChain: boolean;
  hasLinkedProfile: boolean;
  registrationTxHash?: string;
  premiumUpgradedAt?: Date;
  referrerAddress?: string;
  canLinkProfile: boolean;
  rejectionReason?: string;
}

export interface ProfileLinkingResult {
  success: boolean;
  message: string;
  userStatus: UserStatus;
  rejectionReason?: string;
}

export interface AutoLinkResult {
  success: boolean;
  message: string;
  userStatus: UserStatus;
  linkedProfileId?: string;
}

export class UserStatusService {
  private readonly smartContractService: SmartContractService;
  private readonly lensProfileService: LensProfileService;

  constructor() {
    this.smartContractService = new SmartContractService();
    this.lensProfileService = new LensProfileService();
  }

  /**
   * Get comprehensive user status
   */
  async getUserStatus(walletAddress: string): Promise<UserStatus> {
    try {
      const normalizedAddress = walletAddress.toLowerCase();
      
      // Check if wallet is premium on-chain
      const isPremiumOnChain = await this.smartContractService.isWalletPremium(normalizedAddress);
      
      // Get user from database
      const user = await prisma.user.findUnique({
        where: { walletAddress: normalizedAddress },
        include: {
          premiumProfile: true,
          preferences: true
        }
      });

      // Check if user has a linked profile
      const linkedProfile = user?.premiumProfile ? {
        profileId: user.premiumProfile.profileId,
        handle: user.premiumProfile.profileId, // You might want to store handle separately
        linkedAt: user.premiumProfile.linkedAt
      } : undefined;

      // Determine user status
      let status: "Standard" | "Premium" | "OnChainUnlinked" = "Standard";
      
      if (isPremiumOnChain && linkedProfile) {
        status = "Premium";
      } else if (isPremiumOnChain && !linkedProfile) {
        status = "OnChainUnlinked";
      }

      // Check if profile can be linked
      const canLinkProfile = await this.canLinkProfile(normalizedAddress);

      return {
        status,
        walletAddress: normalizedAddress,
        lensProfileId: user?.premiumProfile?.profileId,
        linkedProfile,
        isPremiumOnChain,
        hasLinkedProfile: !!linkedProfile,
        registrationTxHash: user?.registrationTxHash || undefined,
        premiumUpgradedAt: user?.premiumUpgradedAt || undefined,
        referrerAddress: user?.referrerAddress || undefined,
        canLinkProfile
      };
    } catch (error) {
      logger.error(`Error getting user status for ${walletAddress}:`, error);
      throw error;
    }
  }

  /**
   * Check if a profile can be linked to a wallet
   */
  async canLinkProfile(walletAddress: string, profileId?: string): Promise<boolean> {
    try {
      const normalizedAddress = walletAddress.toLowerCase();
      
      // Check if wallet is premium
      const isPremium = await this.smartContractService.isWalletPremium(normalizedAddress);
      if (!isPremium) {
        return false;
      }

      // If no specific profile ID provided, check if wallet can link any profile
      if (!profileId) {
        // Check if wallet already has a linked profile
        const existingLink = await prisma.premiumProfile.findFirst({
          where: { walletAddress: normalizedAddress }
        });
        return !existingLink;
      }

      // Check if specific profile is already linked
      const existingLink = await prisma.premiumProfile.findUnique({
        where: { profileId }
      });

      return !existingLink;
    } catch (error) {
      logger.error("Error checking profile linkability:", error);
      return false;
    }
  }

  /**
   * Auto-link first available profile for a premium wallet
   */
  async autoLinkFirstProfile(walletAddress: string): Promise<AutoLinkResult> {
    try {
      const normalizedAddress = walletAddress.toLowerCase();
      
      // Check if wallet is premium
      const isPremium = await this.smartContractService.isWalletPremium(normalizedAddress);
      if (!isPremium) {
        return {
          success: false,
          message: "Wallet is not premium",
          userStatus: await this.getUserStatus(normalizedAddress)
        };
      }

      // Check if already linked
      const currentStatus = await this.getUserStatus(normalizedAddress);
      if (currentStatus.hasLinkedProfile) {
        return {
          success: false,
          message: "Profile already linked",
          userStatus: currentStatus
        };
      }

      // Discover available profiles using Lens API
      const bestProfile = await this.lensProfileService.findBestProfileForAutoLinking(normalizedAddress);
      
      if (!bestProfile) {
        return {
          success: false,
          message: "No available profiles found for auto-linking",
          userStatus: currentStatus
        };
      }

      // Auto-link the best profile
      const linkResult = await this.linkProfileToWallet(normalizedAddress, bestProfile.id);
      
      if (linkResult.success) {
        return {
          success: true,
          message: `Successfully auto-linked profile ${bestProfile.handle}`,
          userStatus: linkResult.userStatus,
          linkedProfileId: bestProfile.id
        };
      } else {
        return {
          success: false,
          message: `Failed to auto-link profile: ${linkResult.message}`,
          userStatus: linkResult.userStatus
        };
      }
    } catch (error) {
      logger.error("Error in auto-linking profile:", error);
      throw error;
    }
  }

  /**
   * Manually link a profile to a premium wallet
   */
  async linkProfileToWallet(walletAddress: string, profileId: string): Promise<ProfileLinkingResult> {
    try {
      const normalizedAddress = walletAddress.toLowerCase();
      
      // Check if wallet is premium
      const isPremium = await this.smartContractService.isWalletPremium(normalizedAddress);
      if (!isPremium) {
        return {
          success: false,
          message: "Wallet is not premium",
          userStatus: await this.getUserStatus(normalizedAddress)
        };
      }

      // Check if profile is already linked to another wallet
      const existingLink = await prisma.premiumProfile.findUnique({
        where: { profileId }
      });

      if (existingLink) {
        return {
          success: false,
          message: "Profile is already linked to another wallet",
          userStatus: await this.getUserStatus(normalizedAddress),
          rejectionReason: "Your premium wallet is already connected to another one of your Lens profiles and is premium. You are not allowed to make this profile premium."
        };
      }

      // Check if wallet already has a linked profile
      const walletHasLinkedProfile = await prisma.premiumProfile.findFirst({
        where: { walletAddress: normalizedAddress }
      });

      if (walletHasLinkedProfile) {
        return {
          success: false,
          message: "Wallet already has a linked profile",
          userStatus: await this.getUserStatus(normalizedAddress),
          rejectionReason: "Your premium wallet is already connected to another one of your Lens profiles and is premium. You are not allowed to make this profile premium."
        };
      }

      // Create the link
      await prisma.premiumProfile.create({
        data: {
          walletAddress: normalizedAddress,
          profileId,
          isActive: true,
          linkedAt: new Date()
        }
      });

      // Update user status
      await prisma.user.update({
        where: { walletAddress: normalizedAddress },
        data: { status: "Premium" }
      });

      const updatedStatus = await this.getUserStatus(normalizedAddress);
      
      return {
        success: true,
        message: "Profile linked successfully",
        userStatus: updatedStatus
      };
    } catch (error) {
      logger.error("Error linking profile:", error);
      throw error;
    }
  }

  /**
   * Handle user login/registration flow
   */
  async handleUserLogin(walletAddress: string, lensProfileId?: string): Promise<UserStatus> {
    try {
      const normalizedAddress = walletAddress.toLowerCase();
      
      // Check if wallet is premium via NodeSet API
      const isPremium = await this.smartContractService.isWalletPremium(normalizedAddress);
      
      if (isPremium) {
        // Check if this is the first time linking a profile
        const existingLink = await prisma.premiumProfile.findFirst({
          where: { walletAddress: normalizedAddress }
        });

        if (!existingLink && lensProfileId) {
          // Auto-link the first profile
          await this.linkProfileToWallet(normalizedAddress, lensProfileId);
        }
      }

      // Get final user status
      return await this.getUserStatus(normalizedAddress);
    } catch (error) {
      logger.error("Error handling user login:", error);
      throw error;
    }
  }

  /**
   * Check if user can access premium features
   */
  async canAccessPremiumFeatures(walletAddress: string): Promise<boolean> {
    try {
      const userStatus = await this.getUserStatus(walletAddress);
      return userStatus.status === "Premium";
    } catch (error) {
      logger.error("Error checking premium feature access:", error);
      return false;
    }
  }

  /**
   * Get user's premium wallet for reward claiming
   */
  async getPremiumWalletForUser(lensProfileId: string): Promise<string | null> {
    try {
      const premiumProfile = await prisma.premiumProfile.findUnique({
        where: { profileId: lensProfileId }
      });

      return premiumProfile?.walletAddress || null;
    } catch (error) {
      logger.error("Error getting premium wallet for user:", error);
      return null;
    }
  }

  /**
   * Validate wallet for reward claiming
   */
  async validateWalletForRewardClaiming(walletAddress: string): Promise<{
    isValid: boolean;
    message: string;
    isPremiumWallet: boolean;
  }> {
    try {
      const normalizedAddress = walletAddress.toLowerCase();
      
      // Check if wallet is premium
      const isPremium = await this.smartContractService.isWalletPremium(normalizedAddress);
      
      if (!isPremium) {
        return {
          isValid: false,
          message: "To claim rewards, you must use your premium wallet, which is MetaMask.",
          isPremiumWallet: false
        };
      }

      // Check if this is the user's premium wallet
      const user = await prisma.user.findFirst({
        where: { walletAddress: normalizedAddress }
      });

      if (!user) {
        return {
          isValid: false,
          message: "This wallet is not associated with any user account.",
          isPremiumWallet: false
        };
      }

      return {
        isValid: true,
        message: "Wallet validated for reward claiming",
        isPremiumWallet: true
      };
    } catch (error) {
      logger.error("Error validating wallet for reward claiming:", error);
      return {
        isValid: false,
        message: "Error validating wallet",
        isPremiumWallet: false
      };
    }
  }
}

export default UserStatusService;
