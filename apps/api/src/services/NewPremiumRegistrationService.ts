import logger from "@hey/helpers/logger";
import prisma from "../prisma/client";
import { createPublicClient, http, createWalletClient, parseAbiItem } from "viem";
import { arbitrum } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

// Smart Contract ABIs
const REFERRAL_ABI = [
  parseAbiItem("function NodeSet(address) view returns (uint256 startTime, uint256 balance, uint24 point, uint24 depthLeftBranch, uint24 depthRightBranch, uint24 depth, address player, address parent, address leftChild, address rightChild, bool isPointChanged, bool unbalancedAllowance)"),
  parseAbiItem("function register(address referrer)"),
  parseAbiItem("function getPlayerNode() view returns (uint256 startTime, uint256 balance, uint24 point, uint24 depthLeftBranch, uint24 depthRightBranch, uint24 depth, address player, address parent, address leftChild, address rightChild, bool isPointChanged, bool unbalancedAllowance)")
];

const USDT_ABI = [
  parseAbiItem("function balanceOf(address) view returns (uint256)"),
  parseAbiItem("function approve(address spender, uint256 amount) returns (bool)")
];

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
}

export interface RegistrationRequest {
  userAddress: string;
  referrerAddress: string;
  lensProfileId?: string;
  lensWalletAddress?: string;
}

export interface RegistrationResult {
  success: boolean;
  transactionHash?: string;
  message: string;
  userStatus: UserStatus;
}

export interface ProfileLinkingResult {
  success: boolean;
  message: string;
  userStatus: UserStatus;
}

export interface ProfileLinkingResult {
  success: boolean;
  message: string;
  userStatus: UserStatus;
}

export class NewPremiumRegistrationService {
  private readonly publicClient;
  private readonly walletClient;
  private readonly referralContractAddress: string;
  private readonly usdtContractAddress: string;
  private readonly infuraUrl: string;
  private readonly privateKey: string;

  constructor() {
    this.referralContractAddress = this.getRequiredEnvVar("REFERRAL_CONTRACT_ADDRESS");
    this.usdtContractAddress = this.getRequiredEnvVar("USDT_CONTRACT_ADDRESS");
    this.infuraUrl = this.getRequiredEnvVar("INFURA_URL");
    this.privateKey = this.getRequiredEnvVar("PRIVATE_KEY");

    this.publicClient = createPublicClient({
      chain: arbitrum,
      transport: http(this.infuraUrl)
    });

    const account = privateKeyToAccount(this.privateKey as `0x${string}`);
    this.walletClient = createWalletClient({
      account,
      chain: arbitrum,
      transport: http(this.infuraUrl)
    });
  }

  private getRequiredEnvVar(name: string): string {
    const value = process.env[name];
    if (!value) {
      throw new Error(`Required environment variable ${name} is not set`);
    }
    return value;
  }

  private normalizeWalletAddress(address: string): string {
    return address.toLowerCase();
  }

  /**
   * Check if a wallet is premium by verifying its NodeSet on-chain
   */
  async isWalletPremium(walletAddress: string): Promise<boolean> {
    try {
      const normalizedAddress = this.normalizeWalletAddress(walletAddress);
      
      const nodeData = await this.publicClient.readContract({
        address: this.referralContractAddress as `0x${string}`,
        abi: REFERRAL_ABI,
        functionName: "NodeSet",
        args: [normalizedAddress as `0x${string}`]
      });

      return nodeData && nodeData.balance > 0n;
    } catch (error) {
      logger.error(`Error checking premium status for ${walletAddress}:`, error);
      return false;
    }
  }

  /**
   * Get comprehensive user status
   */
  async getUserStatus(walletAddress: string): Promise<UserStatus> {
    try {
      const normalizedAddress = this.normalizeWalletAddress(walletAddress);
      
      const isPremiumOnChain = await this.isWalletPremium(normalizedAddress);
      
      const user = await prisma.user.findUnique({
        where: { walletAddress: normalizedAddress },
        include: { premiumProfile: true }
      });

      const linkedProfile = user?.premiumProfile ? {
        profileId: user.premiumProfile.profileId,
        handle: user.premiumProfile.profileId,
        linkedAt: user.premiumProfile.linkedAt
      } : undefined;

      let status: "Standard" | "Premium" | "OnChainUnlinked" = "Standard";
      
      if (isPremiumOnChain && linkedProfile) {
        status = "Premium";
      } else if (isPremiumOnChain && !linkedProfile) {
        status = "OnChainUnlinked";
      }

      return {
        status,
        walletAddress: normalizedAddress,
        lensProfileId: user?.premiumProfile?.profileId,
        linkedProfile,
        isPremiumOnChain,
        hasLinkedProfile: !!linkedProfile,
        registrationTxHash: user?.registrationTxHash || undefined,
        premiumUpgradedAt: user?.premiumUpgradedAt || undefined
      };
    } catch (error) {
      logger.error(`Error getting user status for ${walletAddress}:`, error);
      throw error;
    }
  }

  /**
   * Handle premium registration process
   */
  async handlePremiumRegistration(request: RegistrationRequest): Promise<RegistrationResult> {
    try {
      const { userAddress, referrerAddress } = request;
      const normalizedUserAddress = this.normalizeWalletAddress(userAddress);
      const normalizedReferrerAddress = this.normalizeWalletAddress(referrerAddress);

      const currentStatus = await this.getUserStatus(normalizedUserAddress);
      if (currentStatus.isPremiumOnChain) {
        return {
          success: false,
          message: "User is already premium",
          userStatus: currentStatus
        };
      }

      const isReferrerValid = await this.isWalletPremium(normalizedReferrerAddress);
      if (!isReferrerValid) {
        return {
          success: false,
          message: "Invalid referrer address",
          userStatus: currentStatus
        };
      }

      const transactionHash = await this.executeRegistrationTransaction(
        normalizedUserAddress,
        normalizedReferrerAddress
      );

      await this.updateUserAfterRegistration(
        normalizedUserAddress,
        normalizedReferrerAddress,
        transactionHash
      );

      const updatedStatus = await this.getUserStatus(normalizedUserAddress);

      return {
        success: true,
        transactionHash,
        message: "Premium registration successful",
        userStatus: updatedStatus
      };
    } catch (error) {
      logger.error("Error in premium registration:", error);
      throw error;
    }
  }

  /**
   * Execute the actual registration transaction on-chain
   */
  private async executeRegistrationTransaction(
    userAddress: string,
    referrerAddress: string
  ): Promise<string> {
    try {
      logger.info(`Executing registration transaction for ${userAddress} with referrer ${referrerAddress}`);
      
      // Mock transaction hash for now
      const mockTxHash = `0x${Math.random().toString(16).substring(2)}${Date.now().toString(16)}`;
      
      return mockTxHash;
    } catch (error) {
      logger.error("Error executing registration transaction:", error);
      throw error;
    }
  }

  /**
   * Update user record after successful registration
   */
  private async updateUserAfterRegistration(
    userAddress: string,
    referrerAddress: string,
    transactionHash: string
  ): Promise<void> {
    try {
      await prisma.user.upsert({
        where: { walletAddress: userAddress },
        update: {
          referrerAddress,
          registrationTxHash: transactionHash,
          premiumUpgradedAt: new Date(),
          status: "Premium"
        },
        create: {
          walletAddress: userAddress,
          referrerAddress,
          registrationTxHash: transactionHash,
          premiumUpgradedAt: new Date(),
          status: "Premium"
        }
      });
    } catch (error) {
      logger.error("Error updating user after registration:", error);
      throw error;
    }
  }

  /**
   * Auto-link first available profile for a premium wallet
   */
  async autoLinkFirstProfile(walletAddress: string): Promise<ProfileLinkingResult> {
    try {
      const normalizedAddress = this.normalizeWalletAddress(walletAddress);
      
      // Check if wallet is premium
      const isPremium = await this.isWalletPremium(normalizedAddress);
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

      // For now, we'll need to implement profile discovery logic
      // This would typically involve checking Lens API for available profiles
      
      return {
        success: false,
        message: "Profile auto-linking not yet implemented",
        userStatus: currentStatus
      };
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
      const normalizedAddress = this.normalizeWalletAddress(walletAddress);
      
      // Check if wallet is premium
      const isPremium = await this.isWalletPremium(normalizedAddress);
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
          userStatus: await this.getUserStatus(normalizedAddress)
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
   * Check if a premium wallet can be linked to a profile
   */
  async canLinkProfile(walletAddress: string, profileId: string): Promise<boolean> {
    try {
      const normalizedAddress = this.normalizeWalletAddress(walletAddress);
      
      // Check if wallet is premium
      const isPremium = await this.isWalletPremium(normalizedAddress);
      if (!isPremium) {
        return false;
      }

      // Check if profile is already linked
      const existingLink = await prisma.premiumProfile.findUnique({
        where: { profileId }
      });

      return !existingLink;
    } catch (error) {
      logger.error("Error checking profile linkability:", error);
      return false;
    }
  }
}

export default NewPremiumRegistrationService;
