import logger from "@hey/helpers/logger";
import type { ProfileStats } from "./BlockchainService";
import BlockchainService from "./BlockchainService";
import EventService from "./EventService";
import type {
  AvailableProfilesResult,
  LinkedProfile,
  UserPremiumStatus
} from "./UserService";
import UserService from "./UserService";

export class PremiumService {
  private readonly blockchainService: typeof BlockchainService;
  private readonly userService: typeof UserService;
  private readonly eventService: typeof EventService;

  constructor() {
    this.blockchainService = BlockchainService;
    this.userService = UserService;
    this.eventService = EventService;
  }

  /**
   * Check if a wallet is premium on-chain
   */
  async checkWalletStatus(walletAddress: string): Promise<boolean> {
    return this.blockchainService.isWalletPremium(walletAddress);
  }

  /**
   * Verify if a wallet is premium by checking the NodeSet (alias for checkWalletStatus)
   * This is the function that tests expect
   */
  async verifyPremiumByNodeset(walletAddress: string): Promise<boolean> {
    return this.checkWalletStatus(walletAddress);
  }

  /**
   * Get user's premium status with enhanced linking logic
   * Returns: 'Standard' | 'OnChainUnlinked' | 'ProLinked'
   */
  async getUserPremiumStatus(
    walletAddress: string
  ): Promise<UserPremiumStatus> {
    try {
      // Step 1: Check if wallet is premium on-chain
      const isPremium =
        await this.blockchainService.isWalletPremium(walletAddress);

      if (!isPremium) {
        logger.info(`Wallet ${walletAddress} is not premium (not in NodeSet)`);
        return { userStatus: "Standard" };
      }

      // Step 2: Get user status from database
      const userStatus =
        await this.userService.getUserPremiumStatus(walletAddress);

      // Emit status change event if needed
      await this.eventService.emitPremiumStatusChanged(
        walletAddress,
        "Standard",
        userStatus.userStatus
      );

      return userStatus;
    } catch (error) {
      logger.error(`Error getting premium status for ${walletAddress}:`, error);
      throw new Error("Failed to get premium status");
    }
  }

  /**
   * Auto-link the first profile for premium wallets that are not linked
   * This enforces the business rule: first selected profile becomes permanent
   */
  async autoLinkFirstProfile(
    walletAddress: string
  ): Promise<LinkedProfile | null> {
    try {
      // Step 1: Verify wallet is premium on-chain
      const isPremium =
        await this.blockchainService.isWalletPremium(walletAddress);
      if (!isPremium) {
        throw new Error("Wallet is not premium (not in NodeSet)");
      }

      // Step 2: Auto-link first profile
      const linkedProfile =
        await this.userService.autoLinkFirstProfile(walletAddress);

      if (linkedProfile) {
        // Emit profile auto-linked event
        await this.eventService.emitProfileAutoLinked(
          walletAddress,
          linkedProfile.profileId
        );
      }

      return linkedProfile;
    } catch (error) {
      logger.error(
        `Error auto-linking first profile for ${walletAddress}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Manual profile linking - ONLY for premium wallets that are not linked
   * This enforces the business rule: first selected profile becomes permanent
   */
  async linkProfile(walletAddress: string, profileId: string): Promise<void> {
    try {
      // Step 1: Verify wallet is premium on-chain
      const isPremium =
        await this.blockchainService.isWalletPremium(walletAddress);
      if (!isPremium) {
        throw new Error("Wallet is not premium (not in NodeSet)");
      }

      // Step 2: Link profile to wallet
      const linkedProfile = await this.userService.linkProfileToWallet(
        walletAddress,
        profileId
      );

      // Step 3: Emit profile linked event
      await this.eventService.emitProfileLinked(
        walletAddress,
        linkedProfile.profileId
      );
    } catch (error) {
      logger.error(
        `Error linking profile ${profileId} to wallet ${walletAddress}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Get premium status for a specific profile (legacy method for backward compatibility)
   */
  async getPremiumStatus(
    walletAddress: string,
    profileId: string
  ): Promise<boolean> {
    return this.userService.getPremiumStatus(walletAddress, profileId);
  }

  /**
   * BLOCKED: Profile unlinking is not allowed per business rules
   */
  async unlinkProfile(): Promise<void> {
    return this.userService.unlinkProfile();
  }

  /**
   * Get profiles for a wallet with business logic enforcement
   * Returns only unlinked profiles for premium wallets that haven't linked yet
   */
  async getAvailableProfiles(
    walletAddress: string
  ): Promise<AvailableProfilesResult> {
    try {
      // Step 1: Check if wallet is premium on-chain
      const isPremium =
        await this.blockchainService.isWalletPremium(walletAddress);

      if (!isPremium) {
        logger.info(`Wallet ${walletAddress} is not premium (not in NodeSet)`);
        return { canLink: false, profiles: [] };
      }

      // Step 2: Get available profiles from user service
      return await this.userService.getAvailableProfiles(walletAddress);
    } catch (error) {
      logger.error(
        `Error getting available profiles for ${walletAddress}:`,
        error
      );
      throw new Error("Failed to get available profiles");
    }
  }

  async getProfileStats(walletAddress: string): Promise<ProfileStats> {
    return this.blockchainService.getProfileStats(walletAddress);
  }

  async getLinkedProfile(walletAddress: string): Promise<LinkedProfile | null> {
    return this.userService.getLinkedProfile(walletAddress);
  }

  async verifyRegistrationTransaction(
    userAddress: string,
    referrerAddress: string,
    transactionHash: string
  ): Promise<boolean> {
    const isValid = await this.blockchainService.verifyRegistrationTransaction(
      userAddress,
      referrerAddress,
      transactionHash
    );

    if (isValid) {
      // Emit registration verified event
      await this.eventService.emitRegistrationVerified(
        userAddress,
        referrerAddress,
        transactionHash
      );
    }

    return isValid;
  }

  async registerUser(
    userAddress: string,
    referrerAddress: string
  ): Promise<string> {
    try {
      logger.info(
        `Registering user ${userAddress} with referrer ${referrerAddress}`
      );

      // Check if user is already premium
      const isPremium =
        await this.blockchainService.isWalletPremium(userAddress);

      if (isPremium) {
        logger.info(`User ${userAddress} is already premium`);
        return "User already premium";
      }

      // In a real implementation, this would be a transaction that the user signs
      // For now, we'll return a message indicating the user needs to register on-chain
      logger.info(
        `User ${userAddress} needs to register on-chain with referrer ${referrerAddress}`
      );
      return "User needs to register on-chain";
    } catch (error) {
      logger.error(`Error registering user ${userAddress}:`, error);
      throw new Error("Failed to register user");
    }
  }

  async generatePremiumJWT(userAddress: string): Promise<string> {
    try {
      const { SignJWT } = await import("jose");

      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error(
          "JWT_SECRET environment variable is required but not set"
        );
      }

      const secret = new TextEncoder().encode(jwtSecret);

      const jwt = await new SignJWT({
        address: userAddress,
        isPremium: true,
        type: "premium-registration"
      })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("1y")
        .sign(secret);

      logger.info(`Generated premium JWT for user ${userAddress}`);
      return jwt;
    } catch (error) {
      logger.error(`Error generating premium JWT for ${userAddress}:`, error);
      throw new Error("Failed to generate premium JWT");
    }
  }
}

export default new PremiumService();
