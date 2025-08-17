import logger from "@hey/helpers/logger";
import { PrismaClient, UserStatus } from "@prisma/client";
import SmartContractService from "./SmartContractService";
import LensProfileService from "./LensProfileService";

const prisma = new PrismaClient();

// Types
export interface UserStatusData {
  status: UserStatus;
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
  premiumWalletAddress?: string;
  lensWalletAddress?: string;
}

export interface ProfileLinkingResult {
  success: boolean;
  message: string;
  userStatus: UserStatusData;
  rejectionReason?: string;
}

export interface AutoLinkResult {
  success: boolean;
  message: string;
  userStatus: UserStatusData;
  linkedProfileId?: string;
}

export interface LoginResult {
  success: boolean;
  userStatus: UserStatusData;
  message: string;
  requiresMetaMaskConnection?: boolean;
  requiresNetworkSwitch?: boolean;
}

export class UserStatusService {
  private readonly smartContractService: SmartContractService;
  private readonly lensProfileService: LensProfileService;

  constructor() {
    this.smartContractService = new SmartContractService();
    this.lensProfileService = new LensProfileService();
  }

  /**
   * Get comprehensive user status based on the new logic
   */
  async getUserStatus(walletAddress: string, lensProfileId?: string): Promise<UserStatusData> {
    try {
      const normalizedAddress = walletAddress.toLowerCase();
      
      // Check if wallet is premium on-chain via NodeSet API
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

      // Determine user status based on the new logic
      let status: UserStatus = UserStatus.Standard;
      
      if (isPremiumOnChain && linkedProfile) {
        status = UserStatus.Premium;
      } else if (isPremiumOnChain && !linkedProfile) {
        status = UserStatus.OnChainUnlinked;
      }

      // Check if profile can be linked
      const canLinkProfile = await this.canLinkProfile(normalizedAddress, lensProfileId);

      // Get premium wallet address if this is a lens profile
      let premiumWalletAddress: string | undefined;
      let lensWalletAddress: string | undefined;

      if (lensProfileId) {
        // This is a lens profile, so the current wallet is the lens wallet
        lensWalletAddress = normalizedAddress;
        
        // Find the premium wallet for this profile
        const premiumProfile = await prisma.premiumProfile.findUnique({
          where: { profileId: lensProfileId }
        });
        premiumWalletAddress = premiumProfile?.walletAddress;
      } else if (isPremiumOnChain) {
        // This is a premium wallet
        premiumWalletAddress = normalizedAddress;
      }

      return {
        status,
        walletAddress: normalizedAddress,
        lensProfileId,
        linkedProfile,
        isPremiumOnChain,
        hasLinkedProfile: !!linkedProfile,
        registrationTxHash: user?.registrationTxHash || undefined,
        premiumUpgradedAt: user?.premiumUpgradedAt || undefined,
        referrerAddress: user?.referrerAddress || undefined,
        canLinkProfile,
        premiumWalletAddress,
        lensWalletAddress
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
   * Auto-link first available profile for a premium wallet (permanent linking)
   */
  async autoLinkFirstProfile(walletAddress: string, lensProfileId: string): Promise<AutoLinkResult> {
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

      // Check if this profile is already linked to another wallet
      const existingProfileLink = await prisma.premiumProfile.findUnique({
        where: { profileId: lensProfileId }
      });

      if (existingProfileLink) {
        return {
          success: false,
          message: "Profile is already linked to another wallet",
          userStatus: currentStatus
        };
      }

      // Create the permanent link
      await prisma.premiumProfile.create({
        data: {
          walletAddress: normalizedAddress,
          profileId: lensProfileId,
          isActive: true,
          linkedAt: new Date()
        }
      });

      // Update user status to Premium
      await prisma.user.update({
        where: { walletAddress: normalizedAddress },
        data: { 
          status: UserStatus.Premium,
          premiumUpgradedAt: new Date()
        }
      });

      const updatedStatus = await this.getUserStatus(normalizedAddress, lensProfileId);
      
      return {
        success: true,
        message: `Successfully permanently linked profile ${lensProfileId}`,
        userStatus: updatedStatus,
        linkedProfileId: lensProfileId
      };
    } catch (error) {
      logger.error("Error in auto-linking profile:", error);
      throw error;
    }
  }

  /**
   * Manually link a profile to a premium wallet (permanent linking)
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
      const existingProfileLink = await prisma.premiumProfile.findUnique({
        where: { profileId }
      });

      if (existingProfileLink) {
        return {
          success: false,
          message: "Profile is already linked to another wallet",
          userStatus: await this.getUserStatus(normalizedAddress),
          rejectionReason: "Your premium wallet is already connected to another one of your Lens profiles and is premium. You are not allowed to make this profile premium."
        };
      }

      // Check if wallet already has a linked profile (permanent rule)
      const walletHasLinkedProfile = await prisma.premiumProfile.findFirst({
        where: { walletAddress: normalizedAddress }
      });

      if (walletHasLinkedProfile) {
        return {
          success: false,
          message: "Wallet already has a permanently linked profile",
          userStatus: await this.getUserStatus(normalizedAddress),
          rejectionReason: "Your premium wallet is already connected to another one of your Lens profiles and is premium. You are not allowed to make this profile premium."
        };
      }

      // Create the permanent link
      await prisma.premiumProfile.create({
        data: {
          walletAddress: normalizedAddress,
          profileId,
          isActive: true,
          linkedAt: new Date()
        }
      });

      // Update user status to Premium
      await prisma.user.update({
        where: { walletAddress: normalizedAddress },
        data: { 
          status: UserStatus.Premium,
          premiumUpgradedAt: new Date()
        }
      });

      const updatedStatus = await this.getUserStatus(normalizedAddress, profileId);
      
      return {
        success: true,
        message: "Profile permanently linked successfully",
        userStatus: updatedStatus
      };
    } catch (error) {
      logger.error("Error linking profile:", error);
      throw error;
    }
  }

  /**
   * Handle user login/registration flow with the new logic
   */
  async handleUserLogin(walletAddress: string, lensProfileId?: string): Promise<LoginResult> {
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
          // Auto-link the first profile permanently
          const autoLinkResult = await this.autoLinkFirstProfile(normalizedAddress, lensProfileId);
          if (autoLinkResult.success) {
            return {
              success: true,
              userStatus: autoLinkResult.userStatus,
              message: "Profile automatically linked to premium wallet"
            };
          }
        }
      }

      // Get final user status
      const userStatus = await this.getUserStatus(normalizedAddress, lensProfileId);
      
      // Determine if MetaMask connection is required
      const requiresMetaMaskConnection = !isPremium && userStatus.status === UserStatus.Standard;
      
      return {
        success: true,
        userStatus,
        message: "Login successful",
        requiresMetaMaskConnection
      };
    } catch (error) {
      logger.error("Error handling user login:", error);
      throw error;
    }
  }

  /**
   * Handle premium registration completion
   */
  async handlePremiumRegistrationCompletion(
    walletAddress: string, 
    transactionHash: string,
    lensProfileId?: string
  ): Promise<ProfileLinkingResult> {
    try {
      const normalizedAddress = walletAddress.toLowerCase();
      
      // Verify the wallet is now premium
      const isPremium = await this.smartContractService.isWalletPremium(normalizedAddress);
      if (!isPremium) {
        return {
          success: false,
          message: "Wallet is not premium after registration",
          userStatus: await this.getUserStatus(normalizedAddress, lensProfileId)
        };
      }

      // Update user with transaction hash
      await prisma.user.update({
        where: { walletAddress: normalizedAddress },
        data: { 
          registrationTxHash: transactionHash,
          premiumUpgradedAt: new Date()
        }
      });

      // If lensProfileId is provided, link it permanently
      if (lensProfileId) {
        const linkResult = await this.linkProfileToWallet(normalizedAddress, lensProfileId);
        return linkResult;
      }

      // Get updated status
      const updatedStatus = await this.getUserStatus(normalizedAddress, lensProfileId);
      
      return {
        success: true,
        message: "Premium registration completed successfully",
        userStatus: updatedStatus
      };
    } catch (error) {
      logger.error("Error handling premium registration completion:", error);
      throw error;
    }
  }

  /**
   * Check if user can access premium features
   */
  async canAccessPremiumFeatures(walletAddress: string): Promise<boolean> {
    try {
      const userStatus = await this.getUserStatus(walletAddress);
      return userStatus.status === UserStatus.Premium;
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
    requiresNetworkSwitch: boolean;
  }> {
    try {
      const normalizedAddress = walletAddress.toLowerCase();
      
      // Check if wallet is premium
      const isPremium = await this.smartContractService.isWalletPremium(normalizedAddress);
      
      if (!isPremium) {
        return {
          isValid: false,
          message: "To claim rewards, you must use your premium wallet, which is MetaMask.",
          isPremiumWallet: false,
          requiresNetworkSwitch: false
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
          isPremiumWallet: false,
          requiresNetworkSwitch: false
        };
      }

      return {
        isValid: true,
        message: "Wallet validated for reward claiming",
        isPremiumWallet: true,
        requiresNetworkSwitch: false
      };
    } catch (error) {
      logger.error("Error validating wallet for reward claiming:", error);
      return {
        isValid: false,
        message: "Error validating wallet",
        isPremiumWallet: false,
        requiresNetworkSwitch: false
      };
    }
  }

  /**
   * Get comprehensive user status for frontend
   */
  async getComprehensiveUserStatus(walletAddress: string, lensProfileId?: string): Promise<{
    userStatus: UserStatusData;
    requiresMetaMaskConnection: boolean;
    requiresNetworkSwitch: boolean;
    canAccessPremiumFeatures: boolean;
    canClaimRewards: boolean;
  }> {
    try {
      const userStatus = await this.getUserStatus(walletAddress, lensProfileId);
      const canAccessPremiumFeatures = await this.canAccessPremiumFeatures(walletAddress);
      const canClaimRewards = userStatus.status === UserStatus.Premium;
      
      // Determine requirements
      const requiresMetaMaskConnection = !userStatus.isPremiumOnChain && userStatus.status === UserStatus.Standard;
      const requiresNetworkSwitch = false; // This will be handled by frontend wallet connection

      return {
        userStatus,
        requiresMetaMaskConnection,
        requiresNetworkSwitch,
        canAccessPremiumFeatures,
        canClaimRewards
      };
    } catch (error) {
      logger.error("Error getting comprehensive user status:", error);
      throw error;
    }
  }
}

export default UserStatusService;
