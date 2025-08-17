import logger from "@hey/helpers/logger";

// Types
export interface LensProfile {
  id: string;
  handle: string;
  ownedBy: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileDiscoveryResult {
  success: boolean;
  profiles: LensProfile[];
  message: string;
  totalCount: number;
}

export interface AutoLinkResult {
  success: boolean;
  message: string;
  linkedProfileId?: string;
  profileCount: number;
}

export class LensProfileService {
  private readonly lensApiUrl: string;
  private readonly lensNetwork: string;

  constructor() {
    this.lensApiUrl = this.getRequiredEnvVar("LENS_API_URL") || "https://api.lens.dev";
    this.lensNetwork = this.getRequiredEnvVar("NEXT_PUBLIC_LENS_NETWORK") || "mainnet";
  }

  private getRequiredEnvVar(name: string): string {
    const value = process.env[name];
    if (!value) {
      logger.warn(`Environment variable ${name} not set, using default`);
      return "";
    }
    return value;
  }

  /**
   * Discover available profiles for a wallet address
   */
  async discoverProfilesForWallet(walletAddress: string): Promise<ProfileDiscoveryResult> {
    try {
      const normalizedAddress = walletAddress.toLowerCase();
      
      // GraphQL query to find profiles owned by the wallet
      const query = `
        query Profiles($ownedBy: [EthereumAddress!]) {
          profiles(request: { ownedBy: $ownedBy }) {
            items {
              id
              handle {
                fullHandle
              }
              ownedBy {
                address
              }
              isDefault
              createdAt
              updatedAt
            }
            pageInfo {
              totalCount
            }
          }
        }
      `;

      const response = await fetch(this.lensApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          variables: {
            ownedBy: [normalizedAddress]
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Lens API request failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.errors) {
        throw new Error(`Lens API errors: ${JSON.stringify(data.errors)}`);
      }

      const profiles = data.data.profiles.items.map((item: any) => ({
        id: item.id,
        handle: item.handle.fullHandle,
        ownedBy: item.ownedBy.address,
        isDefault: item.isDefault,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      }));

      return {
        success: true,
        profiles,
        message: `Found ${profiles.length} profiles for wallet ${normalizedAddress}`,
        totalCount: data.data.profiles.pageInfo.totalCount
      };
    } catch (error) {
      logger.error(`Error discovering profiles for wallet ${walletAddress}:`, error);
      return {
        success: false,
        profiles: [],
        message: `Failed to discover profiles: ${error instanceof Error ? error.message : 'Unknown error'}`,
        totalCount: 0
      };
    }
  }

  /**
   * Find the best profile to auto-link for a premium wallet
   */
  async findBestProfileForAutoLinking(walletAddress: string): Promise<LensProfile | null> {
    try {
      const discoveryResult = await this.discoverProfilesForWallet(walletAddress);
      
      if (!discoveryResult.success || discoveryResult.profiles.length === 0) {
        return null;
      }

      // Priority order for auto-linking:
      // 1. Default profile (most important)
      // 2. First profile by creation date
      // 3. Any available profile

      const defaultProfile = discoveryResult.profiles.find(p => p.isDefault);
      if (defaultProfile) {
        logger.info(`Auto-linking default profile ${defaultProfile.handle} for wallet ${walletAddress}`);
        return defaultProfile;
      }

      // Sort by creation date (oldest first) and take the first one
      const sortedProfiles = discoveryResult.profiles.sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      const firstProfile = sortedProfiles[0];
      logger.info(`Auto-linking first profile ${firstProfile.handle} for wallet ${walletAddress}`);
      return firstProfile;
    } catch (error) {
      logger.error(`Error finding best profile for auto-linking: ${error}`);
      return null;
    }
  }

  /**
   * Validate if a profile can be linked to a wallet
   */
  async validateProfileForLinking(profileId: string, walletAddress: string): Promise<{
    canLink: boolean;
    reason?: string;
    profile?: LensProfile;
  }> {
    try {
      const discoveryResult = await this.discoverProfilesForWallet(walletAddress);
      
      if (!discoveryResult.success) {
        return {
          canLink: false,
          reason: "Failed to discover profiles"
        };
      }

      const targetProfile = discoveryResult.profiles.find(p => p.id === profileId);
      if (!targetProfile) {
        return {
          canLink: false,
          reason: "Profile not found or not owned by this wallet"
        };
      }

      // Check if profile is already linked elsewhere
      // This would require checking our database
      // For now, we'll assume it can be linked

      return {
        canLink: true,
        profile: targetProfile
      };
    } catch (error) {
      logger.error(`Error validating profile for linking: ${error}`);
      return {
        canLink: false,
        reason: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get profile details by ID
   */
  async getProfileById(profileId: string): Promise<LensProfile | null> {
    try {
      const query = `
        query Profile($profileId: ProfileId!) {
          profile(request: { profileId: $profileId }) {
            id
            handle {
              fullHandle
            }
            ownedBy {
              address
            }
            isDefault
            createdAt
            updatedAt
          }
        }
      `;

      const response = await fetch(this.lensApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          variables: {
            profileId
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Lens API request failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.errors) {
        throw new Error(`Lens API errors: ${JSON.stringify(data.errors)}`);
      }

      if (!data.data.profile) {
        return null;
      }

      const profile = data.data.profile;
      return {
        id: profile.id,
        handle: profile.handle.fullHandle,
        ownedBy: profile.ownedBy.address,
        isDefault: profile.isDefault,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt
      };
    } catch (error) {
      logger.error(`Error getting profile by ID ${profileId}:`, error);
      return null;
    }
  }

  /**
   * Check if a profile exists and is accessible
   */
  async profileExists(profileId: string): Promise<boolean> {
    try {
      const profile = await this.getProfileById(profileId);
      return profile !== null;
    } catch (error) {
      logger.error(`Error checking if profile exists: ${error}`);
      return false;
    }
  }
}

export default LensProfileService;
