import { LENS_API_URL } from "@hey/data/constants";
import logger from "@hey/helpers/logger";

interface LensProfile {
  id: string;
  handle: string;
  ownedBy: string;
  isDefault: boolean;
}

export class ProfileService {
  private readonly lensApiUrl: string;

  constructor() {
    this.lensApiUrl = LENS_API_URL;
  }

  async getProfilesByWallet(walletAddress: string): Promise<LensProfile[]> {
    try {
      // For now, return a mock profile since the Lens API has changed
      // This will be replaced once we figure out the correct API structure
      logger.info(`Mock profile lookup for wallet: ${walletAddress}`);

      // Return a mock profile based on the wallet address
      // This is a temporary fix until we resolve the Lens API issue
      return [
        {
          handle: "soli",
          id: walletAddress,
          isDefault: true,
          ownedBy: walletAddress
        }
      ];
    } catch (error) {
      logger.error("Error fetching profiles from Lens API:", error);
      throw new Error("Failed to fetch user profiles");
    }
  }

  async validateProfileOwnership(
    walletAddress: string,
    profileId: string
  ): Promise<boolean> {
    try {
      const profiles = await this.getProfilesByWallet(walletAddress);
      return profiles.some((profile) => profile.id === profileId);
    } catch (error) {
      logger.error("Error validating profile ownership:", error);
      return false;
    }
  }

  async getProfileById(profileId: string): Promise<LensProfile | null> {
    try {
      const query = `
        query GetProfile($request: ProfileRequest!) {
          profile(request: $request) {
            id
            handle {
              fullHandle
            }
            ownedBy {
              address
            }
            isDefault
          }
        }
      `;

      const response = await fetch(this.lensApiUrl, {
        body: JSON.stringify({
          query,
          variables: {
            request: {
              profileId
            }
          }
        }),
        headers: {
          "Content-Type": "application/json"
        },
        method: "POST"
      });

      if (!response.ok) {
        throw new Error(`Lens API request failed: ${response.status}`);
      }

      const result = await response.json();

      if (result.data?.profile) {
        const profile = result.data.profile;
        return {
          handle: profile.handle?.fullHandle || "",
          id: profile.id,
          isDefault: profile.isDefault || false,
          ownedBy: profile.ownedBy?.address || ""
        };
      }

      return null;
    } catch (error) {
      logger.error("Error fetching profile by ID:", error);
      return null;
    }
  }
}

export default new ProfileService();
