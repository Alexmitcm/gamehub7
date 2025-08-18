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
        linkedAt: user.premiumProfile.linkedAt.toISOString() // Convert Date to ISO string
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
      const isAlreadyPremium = await this.smartContractService.isWalletPremium(normalizedAddress);
      
      if (isAlreadyPremium) {
        // Get the existing premium account
        const existingPremiumProfile = await prisma.premiumProfile.findFirst({
          where: { walletAddress: normalizedAddress }
        });

        if (existingPremiumProfile) {
          // Wallet already has a premium account - cannot register again
          return {
            canRegister: false,
            reason: "This wallet is already registered as premium and linked to another account. Only one account per wallet can be premium.",
            existingPremiumAccount: {
              profileId: existingPremiumProfile.profileId,
              linkedAt: existingPremiumProfile.linkedAt
            }
          };
        } else {
          // Wallet is premium but no profile linked yet - can link first profile
          return {
            canRegister: false,
            reason: "This wallet is already premium. Please link it to a profile instead of registering again.",
            existingPremiumAccount: undefined
          };
        }
      }

      // Wallet is not premium - can register
      return {
        canRegister: true,
        reason: "Wallet can register for premium",
        existingPremiumAccount: undefined
      };
    } catch (error) {
      logger.error("Error checking wallet premium registration eligibility:", error);
      return {
        canRegister: false,
        reason: "Error checking wallet status",
        existingPremiumAccount: undefined
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
      const isWalletPremium = await this.smartContractService.isWalletPremium(normalizedAddress);
      
      if (isWalletPremium) {
        // Get the existing premium account
        const existingPremiumProfile = await prisma.premiumProfile.findFirst({
          where: { walletAddress: normalizedAddress }
        });

        if (existingPremiumProfile) {
          // Check if this profile is the exclusive premium account
          const isExclusivePremium = existingPremiumProfile.profileId === profileId;
          
          if (isExclusivePremium) {
            return {
              canAttempt: false,
              reason: "This account is already premium and cannot register again.",
              isExclusivePremium: true,
              existingPremiumAccount: {
                profileId: existingPremiumProfile.profileId,
                linkedAt: existingPremiumProfile.linkedAt
              }
            };
          } else {
            // This profile cannot be premium because wallet is already linked to another profile
            return {
              canAttempt: false,
              reason: "Your premium wallet is already connected to another one of your Lens profiles and is premium. You are not allowed to make this profile premium.",
              isExclusivePremium: false,
              existingPremiumAccount: {
                profileId: existingPremiumProfile.profileId,
                linkedAt: existingPremiumProfile.linkedAt
              }
            };
          }
        } else {
          // Wallet is premium but no profile linked - this profile can be linked
          return {
            canAttempt: false,
            reason: "This wallet is already premium. Please link it to this profile instead of registering.",
            isExclusivePremium: false,
            existingPremiumAccount: undefined
          };
        }
      }

      // Wallet is not premium - profile can attempt registration
      return {
        canAttempt: true,
        reason: "Profile can attempt premium registration",
        isExclusivePremium: false,
        existingPremiumAccount: undefined
      };
    } catch (error) {
      logger.error("Error checking profile premium registration eligibility:", error);
      return {
        canAttempt: false,
        reason: "Error checking profile status",
        isExclusivePremium: false,
        existingPremiumAccount: undefined
      };
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
   * Validate wallet for reward claiming with enhanced logic
   */
  async validateWalletForRewardClaiming(walletAddress: string, lensProfileId?: string): Promise<{
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
      const isPremium = await this.smartContractService.isWalletPremium(normalizedAddress);
      
      if (!isPremium) {
        // Get wallet separation to provide better error message
        const walletSeparation = await this.determineWalletSeparation(normalizedAddress, lensProfileId);
        
        if (walletSeparation.premiumWalletAddress && walletSeparation.isWalletSeparated) {
          return {
            isValid: false,
            message: "To claim rewards, you must use your premium wallet, which is MetaMask.",
            isPremiumWallet: false,
            requiresNetworkSwitch: false,
            premiumWalletAddress: walletSeparation.premiumWalletAddress,
            lensWalletAddress: walletSeparation.lensWalletAddress,
            rejectionReason: "Your premium wallet is already connected to another one of your Lens profiles and is premium. You are not allowed to make this profile premium."
          };
        } else {
          return {
            isValid: false,
            message: "To claim rewards, you must use your premium wallet, which is MetaMask.",
            isPremiumWallet: false,
            requiresNetworkSwitch: false,
            premiumWalletAddress: walletSeparation.premiumWalletAddress,
            lensWalletAddress: walletSeparation.lensWalletAddress
          };
        }
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

      // Get wallet separation info
      const walletSeparation = await this.determineWalletSeparation(normalizedAddress, lensProfileId);

      return {
        isValid: true,
        message: "Wallet validated for reward claiming",
        isPremiumWallet: true,
        requiresNetworkSwitch: false,
        premiumWalletAddress: walletSeparation.premiumWalletAddress,
        lensWalletAddress: walletSeparation.lensWalletAddress
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
   * Validate MetaMask wallet for premium registration
   */
  async validateMetaMaskWallet(walletAddress: string, walletProvider?: string, networkId?: number): Promise<WalletValidationResult> {
    try {
      const normalizedAddress = walletAddress.toLowerCase();
      
      // Check if wallet is premium on-chain
      const isPremium = await this.smartContractService.isWalletPremium(normalizedAddress);
      
      // Validate MetaMask requirement
      const isMetaMaskWallet = walletProvider === 'metamask';
      
      if (!isMetaMaskWallet && !isPremium) {
        return {
          isValid: false,
          message: "Premium registration requires MetaMask wallet",
          isMetaMaskWallet: false,
          isPremiumWallet: false,
          requiresNetworkSwitch: false
        };
      }
      
      // Validate Arbitrum One network requirement
      const isCorrectNetwork = networkId === 42161; // Arbitrum One
      const requiresNetworkSwitch = !isCorrectNetwork;
      
      if (requiresNetworkSwitch) {
        return {
          isValid: false,
          message: "Please switch to Arbitrum One network for premium registration",
          isMetaMaskWallet,
          isPremiumWallet: isPremium,
          requiresNetworkSwitch: true,
          networkId
        };
      }
      
      return {
        isValid: true,
        message: "Wallet validation successful",
        isMetaMaskWallet,
        isPremiumWallet: isPremium,
        requiresNetworkSwitch: false,
        networkId
      };
    } catch (error) {
      logger.error("Error validating MetaMask wallet:", error);
      return {
        isValid: false,
        message: "Error validating wallet",
        isMetaMaskWallet: false,
        isPremiumWallet: false,
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
      const walletValidation = walletProvider ? 
        await this.validateMetaMaskWallet(walletAddress, walletProvider, networkId) : 
        null;
      
      // Determine wallet separation
      const walletSeparation = await this.determineWalletSeparation(walletAddress, lensProfileId);
      
      // Get pro features status
      const proFeatures = await this.getProFeaturesStatus(walletAddress, lensProfileId);
      
      // Get exclusive premium account info
      const exclusivePremiumAccount = await this.getExclusivePremiumAccount(walletAddress);
      if (exclusivePremiumAccount && lensProfileId) {
        exclusivePremiumAccount.isCurrentAccount = exclusivePremiumAccount.profileId === lensProfileId;
      }
      
      // Determine requirements
      const requiresMetaMaskConnection = !baseStatus.isPremiumOnChain && baseStatus.status === UserStatus.Standard;
      const requiresNetworkSwitch = walletValidation?.requiresNetworkSwitch ?? false;
      
      return {
        ...baseStatus,
        walletRequirements: {
          requiresMetaMaskConnection,
          requiresNetworkSwitch,
          isMetaMaskWallet: walletValidation?.isMetaMaskWallet ?? false,
          networkId
        },
        walletSeparation,
        proFeatures,
        exclusivePremiumAccount
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
    verificationType: 'premium' | 'standard' | 'none';
    proFeatures: ProFeaturesStatus;
  }> {
    try {
      // Check if this account is the exclusive premium account
      const isExclusivePremium = await this.isExclusivePremiumAccount(walletAddress, profileId);
      
      // Get pro features status
      const proFeatures = await this.getProFeaturesStatus(walletAddress, profileId);
      
      if (isExclusivePremium) {
        return {
          isVerified: true,
          isPremiumAccount: true,
          verificationType: 'premium',
          proFeatures
        };
      }
      
      // Check if wallet is premium but this account is not the exclusive one
      const isWalletPremium = await this.smartContractService.isWalletPremium(walletAddress);
      if (isWalletPremium) {
        return {
          isVerified: false,
          isPremiumAccount: false,
          verificationType: 'standard',
          proFeatures
        };
      }
      
      return {
        isVerified: false,
        isPremiumAccount: false,
        verificationType: 'none',
        proFeatures
      };
    } catch (error) {
      logger.error("Error getting account verification status:", error);
      return {
        isVerified: false,
        isPremiumAccount: false,
        verificationType: 'none',
        proFeatures: {
          isActive: false,
          features: {
            referralDashboard: false,
            rewardClaiming: false,
            premiumBadge: false,
            exclusiveContent: false,
            advancedAnalytics: false
          },
          linkedAccount: {
            profileId: "",
            linkedAt: new Date(0).toISOString(), // Convert Date to string
            isExclusive: false
          }
        }
      };
    }
  }

  /**
   * Determine wallet separation for the user
   */
  private async determineWalletSeparation(walletAddress: string, lensProfileId?: string): Promise<{
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
        const isWalletSeparated = Boolean(premiumWalletAddress && premiumWalletAddress !== lensWalletAddress);
        
        return {
          premiumWalletAddress,
          lensWalletAddress,
          isWalletSeparated
        };
      } else {
        // This is a direct wallet login
        const isPremium = await this.smartContractService.isWalletPremium(normalizedAddress);
        
        if (isPremium) {
          // This is a premium wallet
          return {
            premiumWalletAddress: normalizedAddress,
            lensWalletAddress: undefined,
            isWalletSeparated: false
          };
        } else {
          // This is a standard wallet
          return {
            premiumWalletAddress: undefined,
            lensWalletAddress: normalizedAddress,
            isWalletSeparated: false
          };
        }
      }
    } catch (error) {
      logger.error("Error determining wallet separation:", error);
      return {
        premiumWalletAddress: undefined,
        lensWalletAddress: undefined,
        isWalletSeparated: false
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
      const isPremium = await this.smartContractService.isWalletPremium(normalizedAddress);
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
        const profile = await this.lensProfileService.getProfileById(premiumProfile.profileId);
        handle = profile?.handle;
      } catch (error) {
        logger.warn(`Could not fetch profile handle for ${premiumProfile.profileId}`);
      }

      return {
        profileId: premiumProfile.profileId,
        handle,
        linkedAt: premiumProfile.linkedAt.toISOString(), // Convert Date to string
        isCurrentAccount: false // Will be set by caller
      };
    } catch (error) {
      logger.error("Error getting exclusive premium account:", error);
      return null;
    }
  }

  /**
   * Check if current account is the exclusive premium account
   */
  async isExclusivePremiumAccount(walletAddress: string, lensProfileId: string): Promise<boolean> {
    try {
      const exclusiveAccount = await this.getExclusivePremiumAccount(walletAddress);
      return exclusiveAccount?.profileId === lensProfileId;
    } catch (error) {
      logger.error("Error checking exclusive premium account:", error);
      return false;
    }
  }

  /**
   * Get pro features status for a user
   */
  async getProFeaturesStatus(walletAddress: string, lensProfileId?: string): Promise<ProFeaturesStatus> {
    try {
      const normalizedAddress = walletAddress.toLowerCase();
      
      // Check if wallet is premium
      const isPremium = await this.smartContractService.isWalletPremium(normalizedAddress);
      
      if (!isPremium) {
        return {
          isActive: false,
          features: {
            referralDashboard: false,
            rewardClaiming: false,
            premiumBadge: false,
            exclusiveContent: false,
            advancedAnalytics: false
          },
          linkedAccount: {
            profileId: "",
            linkedAt: new Date(0).toISOString(), // Convert Date to string
            isExclusive: false
          }
        };
      }

      // Get the exclusive premium profile
      const exclusiveAccount = await this.getExclusivePremiumAccount(normalizedAddress);
      
      if (!exclusiveAccount) {
        return {
          isActive: false,
          features: {
            referralDashboard: false,
            rewardClaiming: false,
            premiumBadge: false,
            exclusiveContent: false,
            advancedAnalytics: false
          },
          linkedAccount: {
            profileId: "",
            linkedAt: new Date(0).toISOString(), // Convert Date to string
            isExclusive: false
          }
        };
      }

      // Check if current account is the exclusive premium account
      const isCurrentAccountPremium = lensProfileId ? 
        await this.isExclusivePremiumAccount(normalizedAddress, lensProfileId) : false;

      return {
        isActive: isCurrentAccountPremium,
        features: {
          referralDashboard: isCurrentAccountPremium,
          rewardClaiming: isCurrentAccountPremium,
          premiumBadge: isCurrentAccountPremium,
          exclusiveContent: isCurrentAccountPremium,
          advancedAnalytics: isCurrentAccountPremium
        },
        activationDate: exclusiveAccount.linkedAt ? new Date(exclusiveAccount.linkedAt) : undefined, // Convert string back to Date for activationDate
        linkedAccount: {
          ...exclusiveAccount,
          isExclusive: true
        }
      };
    } catch (error) {
      logger.error("Error getting pro features status:", error);
      return {
        isActive: false,
        features: {
          referralDashboard: false,
          rewardClaiming: false,
          premiumBadge: false,
          exclusiveContent: false,
          advancedAnalytics: false
        },
        linkedAccount: {
          profileId: "",
          linkedAt: new Date(0).toISOString(), // Convert Date to string
          isExclusive: false
        }
      };
    }
  }
}

export default UserStatusService;
