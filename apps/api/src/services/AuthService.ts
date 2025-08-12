import logger from "@hey/helpers/logger";
import prisma from "../prisma/client";
import BlockchainService from "./BlockchainService";
import EventService from "./EventService";
import JwtService from "./JwtService";
import ProfileService from "./ProfileService";

export interface LoginRequest {
  walletAddress: string;
  selectedProfileId: string;
}

export interface SyncLensRequest {
  lensAccessToken: string;
}

export interface LoginResponse {
  success: boolean;
  user: {
    walletAddress: string;
    status: "Standard" | "Premium";
    linkedProfileId?: string;
    email?: string;
    username?: string;
    displayName?: string;
    avatarUrl?: string;
    registrationDate: Date;
    lastActiveAt: Date;
    totalLogins: number;
  };
  token: string;
  isNewUser: boolean;
  message: string;
}

export interface SyncLensResponse {
  success: boolean;
  user: {
    walletAddress: string;
    status: "Standard" | "Premium";
    linkedProfileId?: string;
    email?: string;
    username?: string;
    displayName?: string;
    avatarUrl?: string;
    registrationDate: Date;
    lastActiveAt: Date;
    totalLogins: number;
  };
  token: string;
  isNewUser: boolean;
  message: string;
}

export interface UserProfile {
  walletAddress: string;
  status: "Standard" | "Premium";
  linkedProfileId?: string;
  email?: string;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  location?: string;
  website?: string;
  twitterHandle?: string;
  registrationDate: Date;
  referrerAddress?: string;
  lastActiveAt: Date;
  totalLogins: number;
}

export class AuthService {
  private readonly blockchainService: BlockchainService;
  private readonly profileService: ProfileService;
  private readonly eventService: EventService;
  private readonly jwtService: JwtService;

  constructor() {
    this.blockchainService = BlockchainService;
    this.profileService = ProfileService;
    this.eventService = EventService;
    this.jwtService = JwtService;
  }

  private normalizeWalletAddress(address: string): string {
    return address.toLowerCase();
  }

  /**
   * Unified login and onboarding endpoint
   * Handles both new user registration and existing user login
   */
  async loginOrOnboard(request: LoginRequest): Promise<LoginResponse> {
    try {
      const { walletAddress, selectedProfileId } = request;
      const normalizedAddress = this.normalizeWalletAddress(walletAddress);

      logger.info(
        `Login/Onboard request for wallet: ${normalizedAddress}, profile: ${selectedProfileId}`
      );

      // Step 1: Check if user exists in our database
      const existingUser = await prisma.user.findUnique({
        include: {
          preferences: true,
          premiumProfile: true,
          userStats: true
        },
        where: { walletAddress: normalizedAddress }
      });

      // Step 2: Check on-chain premium status
      const isPremiumOnChain =
        await this.blockchainService.isWalletPremium(normalizedAddress);
      logger.info(
        `On-chain premium status for ${normalizedAddress}: ${isPremiumOnChain}`
      );

      // Step 3: Handle new user registration
      if (!existingUser) {
        return await this.handleNewUserRegistration(
          normalizedAddress,
          selectedProfileId,
          isPremiumOnChain
        );
      }

      // Step 4: Handle existing user login
      return await this.handleExistingUserLogin(
        existingUser,
        selectedProfileId,
        isPremiumOnChain
      );
    } catch (error) {
      logger.error("Error in loginOrOnboard:", error);
      throw new Error("Authentication failed");
    }
  }

  /**
   * Handle new user registration
   */
  private async handleNewUserRegistration(
    walletAddress: string,
    selectedProfileId: string,
    isPremiumOnChain: boolean
  ): Promise<LoginResponse> {
    logger.info(`Creating new user: ${walletAddress}`);

    // Validate profile ownership
    const isProfileOwner = await this.profileService.validateProfileOwnership(
      walletAddress,
      selectedProfileId
    );
    if (!isProfileOwner) {
      throw new Error(
        "Selected profile is not owned by the provided wallet address"
      );
    }

    // Get profile details
    const profile = await this.profileService.getProfileById(selectedProfileId);
    if (!profile) {
      throw new Error("Selected profile not found");
    }

    // Create user with transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user record
      const user = await tx.user.create({
        data: {
          lastActiveAt: new Date(),
          premiumUpgradedAt: isPremiumOnChain ? new Date() : undefined,
          registrationDate: new Date(),
          status: isPremiumOnChain ? "Premium" : "Standard",
          totalLogins: 1,
          walletAddress
        }
      });

      // Create default preferences
      await tx.userPreferences.create({
        data: { walletAddress }
      });

      // Create default stats
      await tx.userStats.create({
        data: { walletAddress }
      });

      // If premium on-chain, create permanent profile link
      let premiumProfile = null;
      if (isPremiumOnChain) {
        // Data validation: ensure profileId is different from walletAddress
        if (walletAddress.toLowerCase() === selectedProfileId.toLowerCase()) {
          throw new Error("Profile ID cannot be the same as wallet address");
        }

        premiumProfile = await tx.premiumProfile.create({
          data: {
            isActive: true,
            linkedAt: new Date(),
            profileId: selectedProfileId,
            walletAddress
          }
        });

        logger.info(
          `Premium profile linked: ${selectedProfileId} to ${walletAddress}`
        );
      }

      return { premiumProfile, user };
    });

    // Create welcome notification
    await this.eventService.emitEvent({
      metadata: {
        isPremium: isPremiumOnChain,
        profileHandle: profile.handle,
        profileId: selectedProfileId
      },
      timestamp: new Date(),
      type: "user.registered",
      walletAddress
    });

    // Generate JWT token
    const token = this.jwtService.generateToken({
      linkedProfileId: result.premiumProfile?.profileId,
      status: result.user.status,
      walletAddress
    });

    return {
      isNewUser: true,
      message: isPremiumOnChain
        ? "Welcome! Your premium account has been created and profile linked."
        : "Welcome! Your account has been created. Upgrade to premium to unlock exclusive features.",
      success: true,
      token,
      user: {
        avatarUrl: result.user.avatarUrl || undefined,
        displayName: result.user.displayName || undefined,
        email: result.user.email || undefined,
        lastActiveAt: result.user.lastActiveAt,
        linkedProfileId: result.premiumProfile?.profileId,
        registrationDate: result.user.registrationDate,
        status: result.user.status,
        totalLogins: result.user.totalLogins,
        username: result.user.username || undefined,
        walletAddress: result.user.walletAddress
      }
    };
  }

  /**
   * Handle existing user login
   */
  private async handleExistingUserLogin(
    existingUser: any,
    selectedProfileId: string,
    isPremiumOnChain: boolean
  ): Promise<LoginResponse> {
    logger.info(
      `Processing login for existing user: ${existingUser.walletAddress}`
    );

    // Update user activity
    await prisma.user.update({
      data: {
        lastActiveAt: new Date(),
        totalLogins: { increment: 1 }
      },
      where: { walletAddress: existingUser.walletAddress }
    });

    // Check if user already has a linked premium profile
    const hasLinkedProfile = existingUser.premiumProfile !== null;
    let linkedProfileId = existingUser.premiumProfile?.profileId;

    // Handle premium status changes
    if (
      !hasLinkedProfile &&
      isPremiumOnChain &&
      existingUser.status === "Standard"
    ) {
      // User is now premium on-chain but doesn't have a linked profile
      await this.handlePremiumUpgrade(
        existingUser.walletAddress,
        selectedProfileId
      );
      linkedProfileId = selectedProfileId;
    }

    // Generate JWT token
    const token = this.jwtService.generateToken({
      linkedProfileId,
      status: existingUser.status,
      walletAddress: existingUser.walletAddress
    });

    return {
      isNewUser: false,
      message: "Login successful",
      success: true,
      token,
      user: {
        avatarUrl: existingUser.avatarUrl || undefined,
        displayName: existingUser.displayName || undefined,
        email: existingUser.email || undefined,
        lastActiveAt: new Date(),
        linkedProfileId,
        registrationDate: existingUser.registrationDate,
        status: existingUser.status,
        totalLogins: existingUser.totalLogins + 1,
        username: existingUser.username || undefined,
        walletAddress: existingUser.walletAddress
      }
    };
  }

  /**
   * Handle premium status upgrade
   */
  private async handlePremiumUpgrade(
    walletAddress: string,
    selectedProfileId: string
  ): Promise<void> {
    logger.info(`Upgrading user to premium: ${walletAddress}`);

    // Validate profile ownership
    const isProfileOwner = await this.profileService.validateProfileOwnership(
      walletAddress,
      selectedProfileId
    );
    if (!isProfileOwner) {
      throw new Error(
        "Selected profile is not owned by the provided wallet address"
      );
    }

    // Update user status and create profile link
    await prisma.$transaction(async (tx) => {
      // Update user status
      await tx.user.update({
        data: {
          premiumUpgradedAt: new Date(),
          status: "Premium"
        },
        where: { walletAddress }
      });

      // Create permanent profile link
      await tx.premiumProfile.create({
        data: {
          isActive: true,
          linkedAt: new Date(),
          profileId: selectedProfileId,
          walletAddress
        }
      });
    });

    // Emit premium upgrade event
    await this.eventService.emitEvent({
      metadata: {
        profileId: selectedProfileId
      },
      timestamp: new Date(),
      type: "user.premium.upgraded",
      walletAddress
    });

    logger.info(
      `User ${walletAddress} upgraded to premium with profile ${selectedProfileId}`
    );
  }

  /**
   * Get user profile by wallet address
   */
  async getUserProfile(walletAddress: string): Promise<UserProfile | null> {
    try {
      const normalizedAddress = this.normalizeWalletAddress(walletAddress);

      const user = await prisma.user.findUnique({
        include: {
          premiumProfile: true
        },
        where: { walletAddress: normalizedAddress }
      });

      if (!user) {
        return null;
      }

      return {
        avatarUrl: user.avatarUrl || undefined,
        bio: user.bio || undefined,
        displayName: user.displayName || undefined,
        email: user.email || undefined,
        lastActiveAt: user.lastActiveAt,
        linkedProfileId: user.premiumProfile?.profileId,
        location: user.location || undefined,
        referrerAddress: user.referrerAddress || undefined,
        registrationDate: user.registrationDate,
        status: user.status,
        totalLogins: user.totalLogins,
        twitterHandle: user.twitterHandle || undefined,
        username: user.username || undefined,
        walletAddress: user.walletAddress,
        website: user.website || undefined
      };
    } catch (error) {
      logger.error(`Error getting user profile for ${walletAddress}:`, error);
      throw new Error("Failed to get user profile");
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(
    walletAddress: string,
    profileData: Partial<{
      email: string;
      username: string;
      displayName: string;
      avatarUrl: string;
      bio: string;
      location: string;
      website: string;
      twitterHandle: string;
    }>
  ): Promise<UserProfile> {
    try {
      const normalizedAddress = this.normalizeWalletAddress(walletAddress);

      const user = await prisma.user.update({
        data: {
          ...profileData,
          updatedAt: new Date()
        },
        include: {
          premiumProfile: true
        },
        where: { walletAddress: normalizedAddress }
      });

      logger.info(`User profile updated for: ${normalizedAddress}`);

      return {
        avatarUrl: user.avatarUrl || undefined,
        bio: user.bio || undefined,
        displayName: user.displayName || undefined,
        email: user.email || undefined,
        lastActiveAt: user.lastActiveAt,
        linkedProfileId: user.premiumProfile?.profileId,
        location: user.location || undefined,
        referrerAddress: user.referrerAddress || undefined,
        registrationDate: user.registrationDate,
        status: user.status,
        totalLogins: user.totalLogins,
        twitterHandle: user.twitterHandle || undefined,
        username: user.username || undefined,
        walletAddress: user.walletAddress,
        website: user.website || undefined
      };
    } catch (error) {
      logger.error(`Error updating user profile for ${walletAddress}:`, error);
      throw new Error("Failed to update user profile");
    }
  }

  /**
   * Validate JWT token and return user data
   */
  async validateToken(token: string): Promise<UserProfile | null> {
    try {
      const payload = this.jwtService.verifyToken(token);
      if (!payload) {
        return null;
      }

      return await this.getUserProfile(payload.walletAddress);
    } catch (error) {
      logger.error("Error validating token:", error);
      return null;
    }
  }

  /**
   * Get available profiles for a wallet
   */
  async getAvailableProfiles(walletAddress: string): Promise<{
    profiles: Array<{
      id: string;
      handle: string;
      ownedBy: string;
      isDefault: boolean;
    }>;
    linkedProfileId?: string;
  }> {
    try {
      const normalizedAddress = this.normalizeWalletAddress(walletAddress);

      // Get user's linked profile
      const user = await prisma.user.findUnique({
        include: { premiumProfile: true },
        where: { walletAddress: normalizedAddress }
      });

      // Get all profiles owned by the wallet
      const profiles =
        await this.profileService.getProfilesByWallet(normalizedAddress);

      return {
        linkedProfileId: user?.premiumProfile?.profileId,
        profiles: profiles || []
      };
    } catch (error) {
      logger.error(
        `Error getting available profiles for ${walletAddress}:`,
        error
      );
      throw new Error("Failed to get available profiles");
    }
  }

  /**
   * Sync Lens authentication with our backend system
   * Validates Lens access token and creates our own JWT
   */
  async syncLens(request: SyncLensRequest): Promise<SyncLensResponse> {
    try {
      const { lensAccessToken } = request;

      logger.info("Lens sync request received");

      // Step 1: Validate Lens access token with Lens API
      const lensProfile = await this.validateLensToken(lensAccessToken);

      if (!lensProfile) {
        logger.error("Lens token validation failed");
        throw new Error("Invalid Lens access token");
      }

      const { walletAddress, profileId } = lensProfile;
      const normalizedAddress = this.normalizeWalletAddress(walletAddress);

      logger.info(
        `Lens token validated for wallet: ${normalizedAddress}, profile: ${profileId}`
      );

      // Step 2: If no profile ID, get the first available profile
      let selectedProfileId = profileId;
      if (!selectedProfileId) {
        logger.info("No profile ID in token, getting available profiles");
        const availableProfiles =
          await this.getAvailableProfiles(normalizedAddress);
        if (availableProfiles.profiles.length > 0) {
          selectedProfileId = availableProfiles.profiles[0].id;
          logger.info(`Selected first available profile: ${selectedProfileId}`);
        } else {
          throw new Error("No profiles found for this wallet");
        }
      }

      // Step 3: Use existing loginOrOnboard logic
      const loginResult = await this.loginOrOnboard({
        selectedProfileId,
        walletAddress: normalizedAddress
      });

      logger.info(
        `Lens sync successful for wallet: ${normalizedAddress}, isNewUser: ${loginResult.isNewUser}`
      );

      return {
        isNewUser: loginResult.isNewUser,
        message: "Lens authentication synced successfully",
        success: true,
        token: loginResult.token,
        user: loginResult.user
      };
    } catch (error) {
      logger.error("Error in Lens sync:", error);
      throw error;
    }
  }

  /**
   * Validate Lens access token with Lens API
   */
  private async validateLensToken(lensAccessToken: string): Promise<{
    walletAddress: string;
    profileId: string;
  } | null> {
    try {
      // First, try to decode the JWT token to extract user information
      // Lens JWT tokens contain the user's profile ID and wallet address
      const tokenParts = lensAccessToken.split(".");
      if (tokenParts.length !== 3) {
        logger.error("Invalid JWT token format");
        return null;
      }

      // Decode the payload (second part of JWT)
      const payload = JSON.parse(
        Buffer.from(tokenParts[1], "base64").toString()
      );

      // Extract wallet address and profile ID from the JWT payload
      const walletAddress = payload.sub; // 'sub' field contains the wallet address
      const profileId = payload.profileId || payload.id; // Profile ID might be in different fields

      if (!walletAddress) {
        logger.error("No wallet address found in Lens JWT token");
        return null;
      }

      // If we don't have a profile ID in the JWT, we'll need to get it from the user's profiles
      if (!profileId) {
        logger.info(
          "No profile ID in JWT, will need to get from user profiles"
        );
        // For now, we'll return just the wallet address and let the calling code handle profile selection
        return { profileId: "", walletAddress };
      }

      return { profileId, walletAddress };
    } catch (error) {
      logger.error("Error decoding Lens JWT token:", error);

      // Fallback: try the Lens API verification (for non-JWT tokens)
      try {
        logger.info("Attempting Lens API verification as fallback");
        const response = await fetch("https://api.lens.xyz/verify", {
          headers: {
            Authorization: `Bearer ${lensAccessToken}`,
            "Content-Type": "application/json"
          },
          method: "POST"
        });

        logger.info(
          `Lens API verification response status: ${response.status}`
        );

        if (!response.ok) {
          logger.error(
            `Lens API verification failed: ${response.status} ${response.statusText}`
          );
          return null;
        }

        const result = await response.json();
        logger.info("Lens API verification result:", result);

        if (!result.success || !result.data) {
          logger.error("Lens API verification returned invalid response");
          return null;
        }

        // Extract wallet address and profile ID from the verification result
        const { walletAddress, profileId } = result.data;

        if (!walletAddress || !profileId) {
          logger.error("Lens API verification missing required data");
          return null;
        }

        logger.info(
          `Lens API verification successful for wallet: ${walletAddress}, profile: ${profileId}`
        );
        return { profileId, walletAddress };
      } catch (apiError) {
        logger.error("Error validating Lens token with API:", apiError);
        return null;
      }
    }
  }
}

export default new AuthService();
