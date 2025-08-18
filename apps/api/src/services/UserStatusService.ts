import logger from "@hey/helpers/logger";
import { PrismaClient, UserStatus } from "@prisma/client";
import LensProfileService from "./LensProfileService";
import SmartContractService from "./SmartContractService";

const prisma = new PrismaClient();

// Types
export interface UserStatusData {
  status: UserStatus;
  walletAddress: string;
  lensProfileId?: string;
  linkedProfile?: {
    profileId: string;
    handle: string;
    linkedAt: string; // Changed from Date to string to match frontend types
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

export interface WalletValidationResult {
  isValid: boolean;
  message: string;
  isMetaMaskWallet: boolean;
  isPremiumWallet: boolean;
  requiresNetworkSwitch: boolean;
  networkId?: number;
}

export interface ProFeaturesStatus {
  isActive: boolean;
  features: {
    referralDashboard: boolean;
    rewardClaiming: boolean;
    premiumBadge: boolean;
    exclusiveContent: boolean;
    advancedAnalytics: boolean;
  };
  activationDate?: Date;
  linkedAccount: {
    profileId: string;
    handle?: string;
    linkedAt: string; // Changed from Date to string
    isExclusive: boolean;
  };
}

export interface EnhancedUserStatusData extends UserStatusData {
  walletRequirements: {
    requiresMetaMaskConnection: boolean;
    requiresNetworkSwitch: boolean;
    isMetaMaskWallet: boolean;
    networkId?: number;
  };
  walletSeparation: {
    premiumWalletAddress?: string;
    lensWalletAddress?: string;
    isWalletSeparated: boolean;
  };
  proFeatures: ProFeaturesStatus;
  exclusivePremiumAccount: {
    profileId: string;
    handle?: string;
    linkedAt: string; // Changed from Date to string
    isCurrentAccount: boolean;
  } | null;
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
  async getUserStatus(
    walletAddress: string,
    lensProfileId?: string
  ): Promise<UserStatusData> {
    try {
      const normalizedAddress = walletAddress.toLowerCase();

      // Check if wallet is premium on-chain via NodeSet API
      const isPremiumOnChain =
        await this.smartContractService.isWalletPremium(normalizedAddress);

      // Get user from database
      const user = await prisma.user.findUnique({
        include: {
          preferences: true,
          premiumProfile: true
        },
        where: { walletAddress: normalizedAddress }
      });

      // Check if user has a linked profile
      let linkedProfile:
        | {
            handle: string;
            linkedAt: string;
            profileId: string;
          }
        | undefined;

      // Only show linked profile if this specific profile is the exclusive premium account
      if (
        user?.premiumProfile &&
        lensProfileId &&
        user.premiumProfile.profileId === lensProfileId
      ) {
        linkedProfile = {
          handle: user.premiumProfile.profileId, // You might want to store handle separately
          linkedAt: user.premiumProfile.linkedAt.toISOString(), // Convert Date to ISO string
          profileId: user.premiumProfile.profileId
        };
      }

      // Determine user status based on the new logic
      let status: UserStatus = UserStatus.Standard;

      if (isPremiumOnChain) {
        // Check if this specific profile is the exclusive premium account
        if (
          lensProfileId &&
          user?.premiumProfile?.profileId === lensProfileId
        ) {
          // This profile is the exclusive premium account
          status = UserStatus.Premium;
        } else {
          // This profile is NOT the exclusive premium account - should be Standard
          // Even if the wallet is premium, this profile is not the linked one
          status = UserStatus.Standard;
        }
      }

      // Check if profile can be linked
      const canLinkProfile = await this.canLinkProfile(
        normalizedAddress,
        lensProfileId
      );

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
        canLinkProfile,
        hasLinkedProfile: !!linkedProfile, // This will be true only if current profile is linked
        isPremiumOnChain,
        lensProfileId,
        lensWalletAddress,
        linkedProfile,
        premiumUpgradedAt: user?.premiumUpgradedAt || undefined,
        premiumWalletAddress,
        referrerAddress: user?.referrerAddress || undefined,
        registrationTxHash: user?.registrationTxHash || undefined,
        status,
        walletAddress: normalizedAddress
      };
    } catch (error) {
      logger.error(`Error getting user status for ${walletAddress}:`, error);
      throw error;
    }
  }

  /**
   * Check if a profile can be linked to a wallet
   */
  async canLinkProfile(
    walletAddress: string,
    profileId?: string
  ): Promise<boolean> {
    try {
      const normalizedAddress = walletAddress.toLowerCase();

      // Check if wallet is premium
      const isPremium =
        await this.smartContractService.isWalletPremium(normalizedAddress);
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
   * Check if wallet can register for premium (strict rule enforcement)
   */
  async canWalletRegisterForPremium(walletAddress: string): Promise<{
    canRegister: boolean;
    reason: string;
    existingPremiumAccount?: {
      profileId: string;
      handle?: string;
      linkedAt: Date;
    };
  }> {
    try {
      const normalizedAddress = walletAddress.toLowerCase();

      // Check if wallet is already premium
      const isAlreadyPremium =
        await this.smartContractService.isWalletPremium(normalizedAddress);

      if (isAlreadyPremium) {
        // Get the existing premium account
        const existingPremiumProfile = await prisma.premiumProfile.findFirst({
          where: { walletAddress: normalizedAddress }
        });

        if (existingPremiumProfile) {
          // Wallet already has a premium account - cannot register again
          return {
            canRegister: false,
            existingPremiumAccount: {
              linkedAt: existingPremiumProfile.linkedAt,
              profileId: existingPremiumProfile.profileId
            },
            reason:
              "This wallet is already registered as premium and linked to another account. Only one account per wallet can be premium."
          };
        }

        // Wallet is premium but no profile linked yet - can link first profile
        return {
          canRegister: false,
          existingPremiumAccount: undefined,
          reason:
            "This wallet is already premium. Please link it to a profile instead of registering again."
        };
      }

      // Wallet is not premium - can register
      return {
        canRegister: true,
        existingPremiumAccount: undefined,
        reason: "Wallet can register for premium"
      };
    } catch (error) {
      logger.error(
        "Error checking wallet premium registration eligibility:",
        error
      );
      return {
        canRegister: false,
        existingPremiumAccount: undefined,
        reason: "Error checking wallet status"
      };
    }
  }

  /**
   * Check if profile can attempt premium registration
   */
  async canProfileAttemptPremiumRegistration(
    walletAddress: string,
    profileId: string
  ): Promise<{
    canAttempt: boolean;
    reason: string;
    isExclusivePremium: boolean;
    existingPremiumAccount?: {
      profileId: string;
      handle?: string;
      linkedAt: Date;
    };
  }> {
    try {
      const normalizedAddress = walletAddress.toLowerCase();

      // Check if wallet is already premium
      const isWalletPremium =
        await this.smartContractService.isWalletPremium(normalizedAddress);

      if (isWalletPremium) {
        // Get the existing premium account
        const existingPremiumProfile = await prisma.premiumProfile.findFirst({
          where: { walletAddress: normalizedAddress }
        });

        if (existingPremiumProfile) {
          // Check if this profile is the exclusive premium account
          const isExclusivePremium =
            existingPremiumProfile.profileId === profileId;

          if (isExclusivePremium) {
            return {
              canAttempt: false,
              existingPremiumAccount: {
                linkedAt: existingPremiumProfile.linkedAt,
                profileId: existingPremiumProfile.profileId
              },
              isExclusivePremium: true,
              reason:
                "This account is already premium and cannot register again."
            };
          }

          // This profile cannot be premium because wallet is already linked to another profile
          return {
            canAttempt: false,
            existingPremiumAccount: {
              linkedAt: existingPremiumProfile.linkedAt,
              profileId: existingPremiumProfile.profileId
            },
            isExclusivePremium: false,
            reason:
              "Your premium wallet is already connected to another one of your Lens profiles and is premium. You are not allowed to make this profile premium."
          };
        }
        // Wallet is premium but no profile linked - this profile can be linked
        return {
          canAttempt: false,
          existingPremiumAccount: undefined,
          isExclusivePremium: false,
          reason:
            "This wallet is already premium. Please link it to this profile instead of registering."
        };
      }

      // Wallet is not premium - profile can attempt registration
      return {
        canAttempt: true,
        existingPremiumAccount: undefined,
        isExclusivePremium: false,
        reason: "Profile can attempt premium registration"
      };
    } catch (error) {
      logger.error(
        "Error checking profile premium registration eligibility:",
        error
      );
      return {
        canAttempt: false,
        existingPremiumAccount: undefined,
        isExclusivePremium: false,
        reason: "Error checking profile status"
      };
    }
  }

  /**
   * Auto-link first available profile for a premium wallet (permanent linking)
   */
  async autoLinkFirstProfile(
    walletAddress: string,
    lensProfileId: string
  ): Promise<AutoLinkResult> {
    try {
      const normalizedAddress = walletAddress.toLowerCase();

      // Check if wallet is premium
      const isPremium =
        await this.smartContractService.isWalletPremium(normalizedAddress);
      if (!isPremium) {
        return {
          message: "Wallet is not premium",
          success: false,
          userStatus: await this.getUserStatus(normalizedAddress)
        };
      }

      // Check if already linked
      const currentStatus = await this.getUserStatus(normalizedAddress);
      if (currentStatus.hasLinkedProfile) {
        return {
          message: "Profile already linked",
          success: false,
          userStatus: currentStatus
        };
      }

      // Check if this profile is already linked to another wallet
      const existingProfileLink = await prisma.premiumProfile.findUnique({
        where: { profileId: lensProfileId }
      });

      if (existingProfileLink) {
        return {
          message: "Profile is already linked to another wallet",
          success: false,
          userStatus: currentStatus
        };
      }

      // Create the permanent link
      await prisma.premiumProfile.create({
        data: {
          isActive: true,
          linkedAt: new Date(),
          profileId: lensProfileId,
          walletAddress: normalizedAddress
        }
      });

      // Update user status to Premium
      await prisma.user.update({
        data: {
          premiumUpgradedAt: new Date(),
          status: UserStatus.Premium
        },
        where: { walletAddress: normalizedAddress }
      });

      const updatedStatus = await this.getUserStatus(
        normalizedAddress,
        lensProfileId
      );

      return {
        linkedProfileId: lensProfileId,
        message: `Successfully permanently linked profile ${lensProfileId}`,
        success: true,
        userStatus: updatedStatus
      };
    } catch (error) {
      logger.error("Error in auto-linking profile:", error);
      throw error;
    }
  }

  /**
   * Manually link a profile to a premium wallet (permanent linking)
   */
  async linkProfileToWallet(
    walletAddress: string,
    profileId: string
  ): Promise<ProfileLinkingResult> {
    try {
      const normalizedAddress = walletAddress.toLowerCase();

      // Check if wallet is premium
      const isPremium =
        await this.smartContractService.isWalletPremium(normalizedAddress);
      if (!isPremium) {
        return {
          message: "Wallet is not premium",
          success: false,
          userStatus: await this.getUserStatus(normalizedAddress)
        };
      }

      // Check if profile is already linked to another wallet
      const existingProfileLink = await prisma.premiumProfile.findUnique({
        where: { profileId }
      });

      if (existingProfileLink) {
        return {
          message: "Profile is already linked to another wallet",
          rejectionReason:
            "Your premium wallet is already connected to another one of your Lens profiles and is premium. You are not allowed to make this profile premium.",
          success: false,
          userStatus: await this.getUserStatus(normalizedAddress)
        };
      }

      // Check if wallet already has a linked profile (permanent rule)
      const walletHasLinkedProfile = await prisma.premiumProfile.findFirst({
        where: { walletAddress: normalizedAddress }
      });

      if (walletHasLinkedProfile) {
        return {
          message: "Wallet already has a permanently linked profile",
          rejectionReason:
            "Your premium wallet is already connected to another one of your Lens profiles and is premium. You are not allowed to make this profile premium.",
          success: false,
          userStatus: await this.getUserStatus(normalizedAddress)
        };
      }

      // Create the permanent link
      await prisma.premiumProfile.create({
        data: {
          isActive: true,
          linkedAt: new Date(),
          profileId,
          walletAddress: normalizedAddress
        }
      });

      // Update user status to Premium
      await prisma.user.update({
        data: {
          premiumUpgradedAt: new Date(),
          status: UserStatus.Premium
        },
        where: { walletAddress: normalizedAddress }
      });

      const updatedStatus = await this.getUserStatus(
        normalizedAddress,
        profileId
      );

      return {
        message: "Profile permanently linked successfully",
        success: true,
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
  async handleUserLogin(
    walletAddress: string,
    lensProfileId?: string
  ): Promise<LoginResult> {
    try {
      const normalizedAddress = walletAddress.toLowerCase();

      // Check if wallet is premium via NodeSet API
      const isPremium =
        await this.smartContractService.isWalletPremium(normalizedAddress);

      if (isPremium) {
        // Check if this is the first time linking a profile
        const existingLink = await prisma.premiumProfile.findFirst({
          where: { walletAddress: normalizedAddress }
        });

        if (!existingLink && lensProfileId) {
          // Auto-link the first profile permanently
          const autoLinkResult = await this.autoLinkFirstProfile(
            normalizedAddress,
            lensProfileId
          );
          if (autoLinkResult.success) {
            return {
              message: "Profile automatically linked to premium wallet",
              success: true,
              userStatus: autoLinkResult.userStatus
            };
          }
        }
      }

      // Get final user status
      const userStatus = await this.getUserStatus(
        normalizedAddress,
        lensProfileId
      );

      // Determine if MetaMask connection is required
      const requiresMetaMaskConnection =
        !isPremium && userStatus.status === UserStatus.Standard;

      return {
        message: "Login successful",
        requiresMetaMaskConnection,
        success: true,
        userStatus
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
      const isPremium =
        await this.smartContractService.isWalletPremium(normalizedAddress);
      if (!isPremium) {
        return {
          message: "Wallet is not premium after registration",
          success: false,
          userStatus: await this.getUserStatus(normalizedAddress, lensProfileId)
        };
      }

      // Update user with transaction hash
      await prisma.user.update({
        data: {
          premiumUpgradedAt: new Date(),
          registrationTxHash: transactionHash
        },
        where: { walletAddress: normalizedAddress }
      });

      // If lensProfileId is provided, link it permanently
      if (lensProfileId) {
        const linkResult = await this.linkProfileToWallet(
          normalizedAddress,
          lensProfileId
        );
        return linkResult;
      }

      // Get updated status
      const updatedStatus = await this.getUserStatus(
        normalizedAddress,
        lensProfileId
      );

      return {
        message: "Premium registration completed successfully",
        success: true,
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
   * Validate wallet for reward claiming with enhanced logic
   */
  async validateWalletForRewardClaiming(
    walletAddress: string,
    lensProfileId?: string
  ): Promise<{
    isValid: boolean;
    message: string;
    isPremiumWallet: boolean;
    requiresNetworkSwitch: boolean;
    premiumWalletAddress?: string;
    lensWalletAddress?: string;
    rejectionReason?: string;
  }> {
    try {
      const normalizedAddress = walletAddress.toLowerCase();

      // Check if wallet is premium
      const isPremium =
        await this.smartContractService.isWalletPremium(normalizedAddress);

      if (!isPremium) {
        // Get wallet separation to provide better error message
        const walletSeparation = await this.determineWalletSeparation(
          normalizedAddress,
          lensProfileId
        );

        if (
          walletSeparation.premiumWalletAddress &&
          walletSeparation.isWalletSeparated
        ) {
          return {
            isPremiumWallet: false,
            isValid: false,
            lensWalletAddress: walletSeparation.lensWalletAddress,
            message:
              "To claim rewards, you must use your premium wallet, which is MetaMask.",
            premiumWalletAddress: walletSeparation.premiumWalletAddress,
            rejectionReason:
              "Your premium wallet is already connected to another one of your Lens profiles and is premium. You are not allowed to make this profile premium.",
            requiresNetworkSwitch: false
          };
        }
        return {
          isPremiumWallet: false,
          isValid: false,
          lensWalletAddress: walletSeparation.lensWalletAddress,
          message:
            "To claim rewards, you must use your premium wallet, which is MetaMask.",
          premiumWalletAddress: walletSeparation.premiumWalletAddress,
          requiresNetworkSwitch: false
        };
      }

      // Check if this is the user's premium wallet
      const user = await prisma.user.findFirst({
        where: { walletAddress: normalizedAddress }
      });

      if (!user) {
        return {
          isPremiumWallet: false,
          isValid: false,
          message: "This wallet is not associated with any user account.",
          requiresNetworkSwitch: false
        };
      }

      // Get wallet separation info
      const walletSeparation = await this.determineWalletSeparation(
        normalizedAddress,
        lensProfileId
      );

      return {
        isPremiumWallet: true,
        isValid: true,
        lensWalletAddress: walletSeparation.lensWalletAddress,
        message: "Wallet validated for reward claiming",
        premiumWalletAddress: walletSeparation.premiumWalletAddress,
        requiresNetworkSwitch: false
      };
    } catch (error) {
      logger.error("Error validating wallet for reward claiming:", error);
      return {
        isPremiumWallet: false,
        isValid: false,
        message: "Error validating wallet",
        requiresNetworkSwitch: false
      };
    }
  }

  /**
   * Validate MetaMask wallet for premium registration
   */
  async validateMetaMaskWallet(
    walletAddress: string,
    walletProvider?: string,
    networkId?: number
  ): Promise<WalletValidationResult> {
    try {
      const normalizedAddress = walletAddress.toLowerCase();

      // Check if wallet is premium on-chain
      const isPremium =
        await this.smartContractService.isWalletPremium(normalizedAddress);

      // Validate MetaMask requirement
      const isMetaMaskWallet = walletProvider === "metamask";

      if (!isMetaMaskWallet && !isPremium) {
        return {
          isMetaMaskWallet: false,
          isPremiumWallet: false,
          isValid: false,
          message: "Premium registration requires MetaMask wallet",
          requiresNetworkSwitch: false
        };
      }

      // Validate Arbitrum One network requirement
      const isCorrectNetwork = networkId === 42161; // Arbitrum One
      const requiresNetworkSwitch = !isCorrectNetwork;

      if (requiresNetworkSwitch) {
        return {
          isMetaMaskWallet,
          isPremiumWallet: isPremium,
          isValid: false,
          message:
            "Please switch to Arbitrum One network for premium registration",
          networkId,
          requiresNetworkSwitch: true
        };
      }

      return {
        isMetaMaskWallet,
        isPremiumWallet: isPremium,
        isValid: true,
        message: "Wallet validation successful",
        networkId,
        requiresNetworkSwitch: false
      };
    } catch (error) {
      logger.error("Error validating MetaMask wallet:", error);
      return {
        isMetaMaskWallet: false,
        isPremiumWallet: false,
        isValid: false,
        message: "Error validating wallet",
        requiresNetworkSwitch: false
      };
    }
  }

  /**
   * Get enhanced user status with pro features and exclusive account info
   */
  async getEnhancedUserStatus(
    walletAddress: string,
    lensProfileId?: string,
    walletProvider?: string,
    networkId?: number
  ): Promise<EnhancedUserStatusData> {
    try {
      const baseStatus = await this.getUserStatus(walletAddress, lensProfileId);

      // Validate MetaMask wallet if provided
      const walletValidation = walletProvider
        ? await this.validateMetaMaskWallet(
            walletAddress,
            walletProvider,
            networkId
          )
        : null;

      // Determine wallet separation
      const walletSeparation = await this.determineWalletSeparation(
        walletAddress,
        lensProfileId
      );

      // Get pro features status
      const proFeatures = await this.getProFeaturesStatus(
        walletAddress,
        lensProfileId
      );

      // Get exclusive premium account info
      const exclusivePremiumAccount =
        await this.getExclusivePremiumAccount(walletAddress);
      if (exclusivePremiumAccount && lensProfileId) {
        exclusivePremiumAccount.isCurrentAccount =
          exclusivePremiumAccount.profileId === lensProfileId;
      }

      // Determine requirements
      const requiresMetaMaskConnection =
        !baseStatus.isPremiumOnChain &&
        baseStatus.status === UserStatus.Standard;
      const requiresNetworkSwitch =
        walletValidation?.requiresNetworkSwitch ?? false;

      return {
        ...baseStatus,
        exclusivePremiumAccount,
        proFeatures,
        walletRequirements: {
          isMetaMaskWallet: walletValidation?.isMetaMaskWallet ?? false,
          networkId,
          requiresMetaMaskConnection,
          requiresNetworkSwitch
        },
        walletSeparation
      };
    } catch (error) {
      logger.error("Error getting enhanced user status:", error);
      throw error;
    }
  }

  /**
   * Get account verification status for display in account selection
   */
  async getAccountVerificationStatus(
    walletAddress: string,
    profileId: string
  ): Promise<{
    isVerified: boolean;
    isPremiumAccount: boolean;
    verificationType: "premium" | "standard" | "none";
    proFeatures: ProFeaturesStatus;
  }> {
    try {
      // Check if this account is the exclusive premium account
      const isExclusivePremium = await this.isExclusivePremiumAccount(
        walletAddress,
        profileId
      );

      // Get pro features status
      const proFeatures = await this.getProFeaturesStatus(
        walletAddress,
        profileId
      );

      if (isExclusivePremium) {
        return {
          isPremiumAccount: true,
          isVerified: true,
          proFeatures,
          verificationType: "premium"
        };
      }

      // Check if wallet is premium but this account is not the exclusive one
      const isWalletPremium =
        await this.smartContractService.isWalletPremium(walletAddress);
      if (isWalletPremium) {
        return {
          isPremiumAccount: false,
          isVerified: false,
          proFeatures,
          verificationType: "standard"
        };
      }

      return {
        isPremiumAccount: false,
        isVerified: false,
        proFeatures,
        verificationType: "none"
      };
    } catch (error) {
      logger.error("Error getting account verification status:", error);
      return {
        isPremiumAccount: false,
        isVerified: false,
        proFeatures: {
          features: {
            advancedAnalytics: false,
            exclusiveContent: false,
            premiumBadge: false,
            referralDashboard: false,
            rewardClaiming: false
          },
          isActive: false,
          linkedAccount: {
            isExclusive: false,
            linkedAt: new Date(0).toISOString(), // Convert Date to string
            profileId: ""
          }
        },
        verificationType: "none"
      };
    }
  }

  /**
   * Determine wallet separation for the user
   */
  private async determineWalletSeparation(
    walletAddress: string,
    lensProfileId?: string
  ): Promise<{
    premiumWalletAddress?: string;
    lensWalletAddress?: string;
    isWalletSeparated: boolean;
  }> {
    try {
      const normalizedAddress = walletAddress.toLowerCase();

      if (lensProfileId) {
        // This is a Lens profile login
        const lensWalletAddress = normalizedAddress;

        // Find the premium wallet for this profile
        const premiumProfile = await prisma.premiumProfile.findUnique({
          where: { profileId: lensProfileId }
        });

        const premiumWalletAddress = premiumProfile?.walletAddress;
        const isWalletSeparated = Boolean(
          premiumWalletAddress && premiumWalletAddress !== lensWalletAddress
        );

        return {
          isWalletSeparated,
          lensWalletAddress,
          premiumWalletAddress
        };
      }
      // This is a direct wallet login
      const isPremium =
        await this.smartContractService.isWalletPremium(normalizedAddress);

      if (isPremium) {
        // This is a premium wallet
        return {
          isWalletSeparated: false,
          lensWalletAddress: undefined,
          premiumWalletAddress: normalizedAddress
        };
      }
      // This is a standard wallet
      return {
        isWalletSeparated: false,
        lensWalletAddress: normalizedAddress,
        premiumWalletAddress: undefined
      };
    } catch {
      logger.error("Error determining wallet separation");
      return {
        isWalletSeparated: false,
        lensWalletAddress: undefined,
        premiumWalletAddress: undefined
      };
    }
  }

  /**
   * Get comprehensive user status for frontend
   */
  async getComprehensiveUserStatus(
    walletAddress: string,
    lensProfileId?: string
  ): Promise<{
    userStatus: UserStatusData;
    requiresMetaMaskConnection: boolean;
    requiresNetworkSwitch: boolean;
    canAccessPremiumFeatures: boolean;
    canClaimRewards: boolean;
  }> {
    try {
      const userStatus = await this.getUserStatus(walletAddress, lensProfileId);
      const canAccessPremiumFeatures =
        await this.canAccessPremiumFeatures(walletAddress);
      const canClaimRewards = userStatus.status === UserStatus.Premium;

      // Determine requirements
      const requiresMetaMaskConnection =
        !userStatus.isPremiumOnChain &&
        userStatus.status === UserStatus.Standard;
      const requiresNetworkSwitch = false; // This will be handled by frontend wallet connection

      return {
        canAccessPremiumFeatures,
        canClaimRewards,
        requiresMetaMaskConnection,
        requiresNetworkSwitch,
        userStatus
      };
    } catch (error) {
      logger.error("Error getting comprehensive user status:", error);
      throw error;
    }
  }

  /**
   * Get exclusive premium account for a wallet
   */
  async getExclusivePremiumAccount(walletAddress: string): Promise<{
    profileId: string;
    handle?: string;
    linkedAt: string; // Changed from Date to string
    isCurrentAccount: boolean;
  } | null> {
    try {
      const normalizedAddress = walletAddress.toLowerCase();

      // Check if wallet is premium
      const isPremium =
        await this.smartContractService.isWalletPremium(normalizedAddress);
      if (!isPremium) {
        return null;
      }

      // Get the exclusive premium profile link
      const premiumProfile = await prisma.premiumProfile.findFirst({
        where: { walletAddress: normalizedAddress }
      });

      if (!premiumProfile) {
        return null;
      }

      // Get profile details if available
      let handle: string | undefined;
      try {
        const profile = await this.lensProfileService.getProfileById(
          premiumProfile.profileId
        );
        handle = profile?.handle;
      } catch {
        logger.warn(
          `Could not fetch profile handle for ${premiumProfile.profileId}`
        );
      }

      return {
        handle,
        isCurrentAccount: false, // Will be set by caller
        linkedAt: premiumProfile.linkedAt.toISOString(), // Convert Date to string
        profileId: premiumProfile.profileId
      };
    } catch (error) {
      logger.error("Error getting exclusive premium account:", error);
      return null;
    }
  }

  /**
   * Check if current account is the exclusive premium account
   */
  async isExclusivePremiumAccount(
    walletAddress: string,
    lensProfileId: string
  ): Promise<boolean> {
    try {
      const exclusiveAccount =
        await this.getExclusivePremiumAccount(walletAddress);
      return exclusiveAccount?.profileId === lensProfileId;
    } catch (error) {
      logger.error("Error checking exclusive premium account:", error);
      return false;
    }
  }

  /**
   * Get pro features status for a user
   */
  async getProFeaturesStatus(
    walletAddress: string,
    lensProfileId?: string
  ): Promise<ProFeaturesStatus> {
    try {
      const normalizedAddress = walletAddress.toLowerCase();

      // Check if wallet is premium
      const isPremium =
        await this.smartContractService.isWalletPremium(normalizedAddress);

      if (!isPremium) {
        return {
          features: {
            advancedAnalytics: false,
            exclusiveContent: false,
            premiumBadge: false,
            referralDashboard: false,
            rewardClaiming: false
          },
          isActive: false,
          linkedAccount: {
            isExclusive: false,
            linkedAt: new Date(0).toISOString(), // Convert Date to string
            profileId: ""
          }
        };
      }

      // Get the exclusive premium profile
      const exclusiveAccount =
        await this.getExclusivePremiumAccount(normalizedAddress);

      if (!exclusiveAccount) {
        return {
          features: {
            advancedAnalytics: false,
            exclusiveContent: false,
            premiumBadge: false,
            referralDashboard: false,
            rewardClaiming: false
          },
          isActive: false,
          linkedAccount: {
            isExclusive: false,
            linkedAt: new Date(0).toISOString(), // Convert Date to string
            profileId: ""
          }
        };
      }

      // Check if current account is the exclusive premium account
      const isCurrentAccountPremium = lensProfileId
        ? await this.isExclusivePremiumAccount(normalizedAddress, lensProfileId)
        : false;

      return {
        activationDate: exclusiveAccount.linkedAt
          ? new Date(exclusiveAccount.linkedAt)
          : undefined, // Convert string back to Date for activationDate
        features: {
          advancedAnalytics: isCurrentAccountPremium,
          exclusiveContent: isCurrentAccountPremium,
          premiumBadge: isCurrentAccountPremium,
          referralDashboard: isCurrentAccountPremium,
          rewardClaiming: isCurrentAccountPremium
        },
        isActive: isCurrentAccountPremium,
        linkedAccount: {
          ...exclusiveAccount,
          isExclusive: true
        }
      };
    } catch (error) {
      logger.error("Error getting pro features status:", error);
      return {
        features: {
          advancedAnalytics: false,
          exclusiveContent: false,
          premiumBadge: false,
          referralDashboard: false,
          rewardClaiming: false
        },
        isActive: false,
        linkedAccount: {
          isExclusive: false,
          linkedAt: new Date(0).toISOString(), // Convert Date to string
          profileId: ""
        }
      };
    }
  }
}

export default UserStatusService;
