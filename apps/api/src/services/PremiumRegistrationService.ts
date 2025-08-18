import logger from "@hey/helpers/logger";
import { createPublicClient, http } from "viem";
import { arbitrum } from "viem/chains";
import BlockchainService from "./BlockchainService";
import UserService from "./UserService";
import ProfileService from "./ProfileService";
import EventService from "./EventService";

export interface RegistrationRequest {
  userAddress: string;
  referrerAddress: string;
  lensProfileId?: string;
  lensWalletAddress?: string;
}

export interface RegistrationResponse {
  success: boolean;
  transactionHash?: string;
  userStatus: "Standard" | "OnChainUnlinked" | "ProLinked";
  linkedProfile?: {
    profileId: string;
    handle: string;
    linkedAt: Date;
  };
  message: string;
  requiresMetaMaskConnection?: boolean;
  requiresNetworkSwitch?: boolean;
}

export interface WalletConnectionStatus {
  isConnected: boolean;
  isMetaMask: boolean;
  isArbitrumNetwork: boolean;
  walletAddress?: string;
  currentNetwork?: string;
  message: string;
}

export interface PremiumStatusCheck {
  userStatus: "Standard" | "OnChainUnlinked" | "ProLinked";
  isPremiumOnChain: boolean;
  hasLinkedProfile: boolean;
  linkedProfile?: {
    profileId: string;
    handle: string;
    linkedAt: Date;
  };
  availableProfiles?: Array<{
    id: string;
    handle: string;
    ownedBy: string;
    isDefault: boolean;
  }>;
  canLink: boolean;
}

export class PremiumRegistrationService {
  private readonly blockchainService: typeof BlockchainService;
  private readonly userService: typeof UserService;
  private readonly profileService: typeof ProfileService;
  private readonly eventService: typeof EventService;
  private readonly publicClient;
  private readonly referralContractAddress: string;
  private readonly infuraUrl: string;

  constructor() {
    this.blockchainService = BlockchainService;
    this.userService = UserService;
    this.profileService = ProfileService;
    this.eventService = EventService;
    
    this.referralContractAddress = this.getRequiredEnvVar("REFERRAL_CONTRACT_ADDRESS");
    this.infuraUrl = this.getRequiredEnvVar("INFURA_URL");
    
    this.publicClient = createPublicClient({
      chain: arbitrum,
      transport: http(this.infuraUrl)
    });
  }

  private getRequiredEnvVar(name: string): string {
    const value = process.env[name];
    if (!value) {
      logger.warn(`Environment variable ${name} is not set, using fallback value`);
      return "0x0000000000000000000000000000000000000000";
    }
    return value;
  }

  private normalizeWalletAddress(address: string): string {
    return address.toLowerCase();
  }

  /**
   * Check if a wallet is connected to MetaMask and on Arbitrum network
   */
  async checkWalletConnectionStatus(walletAddress: string): Promise<WalletConnectionStatus> {
    try {
      const normalizedAddress = this.normalizeWalletAddress(walletAddress);
      
      // For now, we'll assume the wallet is properly connected if we can read from it
      // In a real implementation, you'd check the actual wallet connection state
      const isConnected = true; // This would be determined by the frontend
      const isMetaMask = true; // This would be determined by the frontend
      const isArbitrumNetwork = true; // This would be determined by the frontend
      
      return {
        isConnected,
        isMetaMask,
        isArbitrumNetwork,
        walletAddress: normalizedAddress,
        currentNetwork: "arbitrum",
        message: isConnected ? "Wallet connected and ready" : "Wallet not connected"
      };
    } catch (error) {
      logger.error(`Error checking wallet connection status for ${walletAddress}:`, error);
      return {
        isConnected: false,
        isMetaMask: false,
        isArbitrumNetwork: false,
        message: "Failed to check wallet connection status"
      };
    }
  }

  /**
   * Get comprehensive premium status for a user
   */
  async getPremiumStatus(walletAddress: string): Promise<PremiumStatusCheck> {
    try {
      const normalizedAddress = this.normalizeWalletAddress(walletAddress);
      
      // Step 1: Check if wallet is premium on-chain
      const isPremiumOnChain = await this.blockchainService.isWalletPremium(normalizedAddress);
      
      if (!isPremiumOnChain) {
        // User is Standard - check if they have Lens profiles
        const profiles = await this.profileService.getProfilesByWallet(normalizedAddress);
        
        return {
          userStatus: "Standard",
          isPremiumOnChain: false,
          hasLinkedProfile: false,
          canLink: false,
          availableProfiles: profiles || [],
          message: "User is standard and needs to register for premium"
        };
      }

      // Step 2: Check if wallet has a linked profile
      const linkedProfile = await this.userService.getLinkedProfile(normalizedAddress);
      const hasLinkedProfile = Boolean(linkedProfile);

      if (hasLinkedProfile) {
        // User is ProLinked
        return {
          userStatus: "ProLinked",
          isPremiumOnChain: true,
          hasLinkedProfile: true,
          linkedProfile,
          canLink: false,
          message: "User is premium with linked profile"
        };
      }

      // Step 3: User is OnChainUnlinked - check available profiles
      const availableProfiles = await this.userService.getAvailableProfiles(normalizedAddress);
      
      return {
        userStatus: "OnChainUnlinked",
        isPremiumOnChain: true,
        hasLinkedProfile: false,
        canLink: availableProfiles.canLink,
        availableProfiles: availableProfiles.profiles,
        message: "User is premium but needs to link a profile"
      };
    } catch (error) {
      logger.error(`Error getting premium status for ${walletAddress}:`, error);
      throw new Error("Failed to get premium status");
    }
  }

  /**
   * Handle premium registration process
   * This is the main entry point for premium registration
   */
  async handlePremiumRegistration(request: RegistrationRequest): Promise<RegistrationResponse> {
    try {
      const normalizedUserAddress = this.normalizeWalletAddress(request.userAddress);
      const normalizedReferrerAddress = this.normalizeWalletAddress(request.referrerAddress);
      
      logger.info(`Starting premium registration for user: ${normalizedUserAddress} with referrer: ${normalizedReferrerAddress}`);

      // Step 1: Validate referrer
      const referrerValidation = await this.blockchainService.validateReferrer(normalizedReferrerAddress);
      if (!referrerValidation.isValid) {
        return {
          success: false,
          userStatus: "Standard",
          message: referrerValidation.message
        };
      }

      // Step 2: Check if user is already premium
      const isAlreadyPremium = await this.blockchainService.isWalletPremium(normalizedUserAddress);
      if (isAlreadyPremium) {
        logger.info(`User ${normalizedUserAddress} is already premium`);
        
        // Check if they need to link a profile
        const premiumStatus = await this.getPremiumStatus(normalizedUserAddress);
        
        if (premiumStatus.userStatus === "ProLinked") {
          return {
            success: true,
            userStatus: "ProLinked",
            linkedProfile: premiumStatus.linkedProfile,
            message: "User is already premium with linked profile"
          };
        }
        
        // User is OnChainUnlinked - they need to link a profile
        return {
          success: false,
          userStatus: "OnChainUnlinked",
          message: "User is premium but needs to link a profile",
          requiresMetaMaskConnection: false
        };
      }

      // Step 3: User needs to register - this would typically be done on the frontend
      // For now, we'll return instructions for the frontend
      return {
        success: false,
        userStatus: "Standard",
        message: "User needs to connect MetaMask and register on-chain",
        requiresMetaMaskConnection: true,
        requiresNetworkSwitch: true
      };
    } catch (error) {
      logger.error(`Error handling premium registration for ${request.userAddress}:`, error);
      return {
        success: false,
        userStatus: "Standard",
        message: "Failed to process premium registration"
      };
    }
  }

  /**
   * Verify a completed registration transaction and handle profile linking
   */
  async verifyRegistrationAndLinkProfile(
    userAddress: string,
    referrerAddress: string,
    transactionHash: string,
    lensProfileId?: string
  ): Promise<RegistrationResponse> {
    try {
      const normalizedUserAddress = this.normalizeWalletAddress(userAddress);
      const normalizedReferrerAddress = this.normalizeWalletAddress(referrerAddress);
      
      logger.info(`Verifying registration transaction: ${transactionHash} for user: ${normalizedUserAddress}`);

      // Step 1: Verify the transaction on-chain
      const isTransactionValid = await this.blockchainService.verifyRegistrationTransaction(
        normalizedUserAddress,
        normalizedReferrerAddress,
        transactionHash
      );

      if (!isTransactionValid) {
        return {
          success: false,
          userStatus: "Standard",
          message: "Invalid registration transaction"
        };
      }

      // Step 2: Verify user is now premium
      const isPremium = await this.blockchainService.isWalletPremium(normalizedUserAddress);
      if (!isPremium) {
        return {
          success: false,
          userStatus: "Standard",
          message: "User is not premium after registration transaction"
        };
      }

      // Step 3: Handle profile linking if provided
      let linkedProfile: { profileId: string; handle: string; linkedAt: Date } | undefined;
      if (lensProfileId) {
        try {
          // Validate profile ownership
          const isOwner = await this.profileService.validateProfileOwnership(
            normalizedUserAddress,
            lensProfileId
          );
          
          if (!isOwner) {
            return {
              success: false,
              userStatus: "OnChainUnlinked",
              message: "Profile is not owned by the registered wallet"
            };
          }

          // Link the profile
          linkedProfile = await this.userService.linkProfileToWallet(normalizedUserAddress, lensProfileId);
          
          // Emit profile linked event
          await this.eventService.emitProfileLinked(normalizedUserAddress, lensProfileId);
          
          logger.info(`Profile ${lensProfileId} linked to wallet ${normalizedUserAddress}`);
        } catch (error) {
          logger.error(`Error linking profile ${lensProfileId} to wallet ${normalizedUserAddress}:`, error);
          return {
            success: true,
            transactionHash,
            userStatus: "OnChainUnlinked",
            message: "Registration successful but profile linking failed"
          };
        }
      }

      // Step 4: Update user record with registration info
      await this.userService.createOrUpdateUser(normalizedUserAddress, {
        referrerAddress: normalizedReferrerAddress,
        registrationTxHash: transactionHash,
        premiumUpgradedAt: new Date(),
        status: "Premium"
      });

      // Step 5: Emit registration verified event
      await this.eventService.emitRegistrationVerified(
        normalizedUserAddress,
        normalizedReferrerAddress,
        transactionHash
      );

      const userStatus = linkedProfile ? "ProLinked" : "OnChainUnlinked";
      
      return {
        success: true,
        transactionHash,
        userStatus,
        linkedProfile,
        message: linkedProfile 
          ? "Registration successful and profile linked" 
          : "Registration successful, profile linking required"
      };
    } catch (error) {
      logger.error(`Error verifying registration for ${userAddress}:`, error);
      return {
        success: false,
        userStatus: "Standard",
        message: "Failed to verify registration"
      };
    }
  }

  /**
   * Auto-link first available profile for a premium wallet
   */
  async autoLinkFirstProfile(walletAddress: string): Promise<RegistrationResponse> {
    try {
      const normalizedAddress = this.normalizeWalletAddress(walletAddress);
      
      logger.info(`Auto-linking first profile for wallet: ${normalizedAddress}`);

      // Check if wallet is premium
      const isPremium = await this.blockchainService.isWalletPremium(normalizedAddress);
      if (!isPremium) {
        return {
          success: false,
          userStatus: "Standard",
          message: "Wallet is not premium"
        };
      }

      // Check if already has linked profile
      const existingLink = await this.userService.getLinkedProfile(normalizedAddress);
      if (existingLink) {
        return {
          success: true,
          userStatus: "ProLinked",
          linkedProfile: existingLink,
          message: "Wallet already has linked profile"
        };
      }

      // Auto-link first profile
      const linkedProfile = await this.userService.autoLinkFirstProfile(normalizedAddress);
      
      if (linkedProfile) {
        // Emit profile auto-linked event
        await this.eventService.emitProfileAutoLinked(normalizedAddress, linkedProfile.profileId);
        
        return {
          success: true,
          userStatus: "ProLinked",
          linkedProfile,
          message: "Profile auto-linked successfully"
        };
      }

      return {
        success: false,
        userStatus: "OnChainUnlinked",
        message: "No profiles available for auto-linking"
      };
    } catch (error) {
      logger.error(`Error auto-linking profile for ${walletAddress}:`, error);
      return {
        success: false,
        userStatus: "OnChainUnlinked",
        message: "Failed to auto-link profile"
      };
    }
  }

  /**
   * Manually link a specific profile to a premium wallet
   */
  async linkProfileToWallet(walletAddress: string, profileId: string): Promise<RegistrationResponse> {
    try {
      const normalizedAddress = this.normalizeWalletAddress(walletAddress);
      
      logger.info(`Linking profile ${profileId} to wallet ${normalizedAddress}`);

      // Check if wallet is premium
      const isPremium = await this.blockchainService.isWalletPremium(normalizedAddress);
      if (!isPremium) {
        return {
          success: false,
          userStatus: "Standard",
          message: "Wallet is not premium"
        };
      }

      // Check if already has linked profile
      const existingLink = await this.userService.getLinkedProfile(normalizedAddress);
      if (existingLink) {
        return {
          success: true,
          userStatus: "ProLinked",
          linkedProfile: existingLink,
          message: "Wallet already has linked profile"
        };
      }

      // Link the profile
      const linkedProfile = await this.userService.linkProfileToWallet(normalizedAddress, profileId);
      
      // Emit profile linked event
      await this.eventService.emitProfileLinked(normalizedAddress, profileId);
      
      return {
        success: true,
        userStatus: "ProLinked",
        linkedProfile,
        message: "Profile linked successfully"
      };
    } catch (error) {
      logger.error(`Error linking profile ${profileId} to wallet ${walletAddress}:`, error);
      return {
        success: false,
        userStatus: "OnChainUnlinked",
        message: error instanceof Error ? error.message : "Failed to link profile"
      };
    }
  }

  /**
   * Get registration instructions for the frontend
   */
  getRegistrationInstructions(): {
    steps: string[];
    requirements: string[];
    networkInfo: {
      chainId: string;
      chainName: string;
      rpcUrl: string;
    };
  } {
    return {
      steps: [
        "Connect MetaMask wallet",
        "Switch to Arbitrum One network",
        "Ensure you have at least 200 USDT in your wallet",
        "Click 'Register for Premium'",
        "Confirm the transaction in MetaMask",
        "Wait for transaction confirmation",
        "Link your Lens profile (optional)"
      ],
      requirements: [
        "MetaMask wallet",
        "Arbitrum One network",
        "Minimum 200 USDT balance",
        "Valid referrer address"
      ],
      networkInfo: {
        chainId: "0xa4b1", // Arbitrum One
        chainName: "Arbitrum One",
        rpcUrl: this.infuraUrl
      }
    };
  }
}

export default new PremiumRegistrationService();
