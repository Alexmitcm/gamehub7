import logger from "@hey/helpers/logger";
import { createPublicClient, http, parseAbiItem } from "viem";
import { arbitrum } from "viem/chains";
import prisma from "../prisma/client";

// ABI for the Referral contract - NodeSet function
const REFERRAL_ABI = [
  parseAbiItem(
    "function NodeSet(address) view returns (uint256 startTime, uint256 balance, uint24 point, uint24 depthLeftBranch, uint24 depthRightBranch, uint24 depth, address player, address parent, address leftChild, address rightChild, bool isPointChanged, bool unbalancedAllowance)"
  )
];

export interface ReferralNode {
  address: string;
  parent: string | null;
  leftChild?: string;
  rightChild?: string;
  depth: number;
  balance: string;
  point: number;
  startTime: string;
}

export class SimplePremiumService {
  private readonly publicClient;
  private readonly referralContractAddress: string;
  private readonly infuraUrl: string;

  constructor() {
    this.referralContractAddress = process.env.REFERRAL_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";
    this.infuraUrl = process.env.INFURA_URL || "https://arbitrum-mainnet.infura.io/v3/your-key";

    this.publicClient = createPublicClient({
      chain: arbitrum,
      transport: http(this.infuraUrl)
    });
  }

  private getRequiredEnvVar(name: string): string {
    const value = process.env[name];
    if (!value) {
      logger.warn(`Environment variable ${name} is not set, using fallback value`);
      return "";
    }
    return value;
  }

  private normalizeWalletAddress(address: string): string {
    return address.toLowerCase();
  }

  /**
   * Check if wallet is premium by querying NodeSet contract
   */
  async isPremiumWallet(walletAddress: string): Promise<boolean> {
    try {
      const normalizedAddress = this.normalizeWalletAddress(walletAddress);

      const nodeData = await this.publicClient.readContract({
        abi: REFERRAL_ABI,
        address: this.referralContractAddress as `0x${string}`,
        args: [normalizedAddress as `0x${string}`],
        functionName: "NodeSet"
      });

      // Check if the node exists by checking if startTime is not 0
      const isPremium = nodeData[0] > 0n;
      logger.info(`Wallet ${normalizedAddress} premium status: ${isPremium}`);
      return isPremium;
    } catch (error) {
      logger.error(
        `Error checking premium status for ${walletAddress}:`,
        error
      );
      return false;
    }
  }

  /**
   * Get premium status and handle auto-linking
   * Returns: { userStatus: "Standard" | "ProLinked", linkedProfile?: {...} }
   */
  async getPremiumStatus(
    walletAddress: string,
    currentProfileId?: string
  ): Promise<{
    userStatus: "Standard" | "ProLinked";
    linkedProfile?: {
      profileId: string;
      linkedAt: string;
    };
  }> {
    try {
      const normalizedAddress = this.normalizeWalletAddress(walletAddress);

      // Step 1: Check if wallet is premium
      const isPremium = await this.isPremiumWallet(normalizedAddress);

      if (!isPremium) {
        return { userStatus: "Standard" };
      }

      // Step 2: Check if wallet already has a linked profile
      let existingLink = null;
      try {
        existingLink = await prisma.premiumProfile.findUnique({
          where: { walletAddress: normalizedAddress }
        });
      } catch (dbError) {
        logger.warn(`Database operation failed for ${normalizedAddress}, assuming no linked profile:`, dbError);
        // Continue without database access
      }

      if (existingLink) {
        // Profile is already linked
        return {
          linkedProfile: {
            linkedAt: existingLink.linkedAt.toISOString(),
            profileId: existingLink.profileId
          },
          userStatus: "ProLinked"
        };
      }

      // Step 3: Auto-link current profile if provided
      if (currentProfileId) {
        await this.linkProfile(normalizedAddress, currentProfileId);

        return {
          linkedProfile: {
            linkedAt: new Date().toISOString(),
            profileId: currentProfileId
          },
          userStatus: "ProLinked"
        };
      }

      // Step 4: Premium wallet but no profile to link
      return { userStatus: "Standard" };
    } catch (error) {
      logger.error(`Error getting premium status for ${walletAddress}:`, error);
      return { userStatus: "Standard" };
    }
  }

  /**
   * Link a profile to a premium wallet permanently
   */
  async linkProfile(walletAddress: string, profileId: string): Promise<void> {
    const normalizedAddress = this.normalizeWalletAddress(walletAddress);

    try {
      // Verify wallet is premium
      const isPremium = await this.isPremiumWallet(normalizedAddress);
      if (!isPremium) {
        throw new Error("Wallet is not premium");
      }

      // Check if already linked
      let existingLink = null;
      try {
        existingLink = await prisma.premiumProfile.findUnique({
          where: { walletAddress: normalizedAddress }
        });
      } catch (dbError) {
        logger.warn(`Database operation failed for ${normalizedAddress}, assuming no linked profile:`, dbError);
        // Continue without database access
      }

      if (existingLink) {
        throw new Error("Wallet already has a linked premium profile");
      }

      // Create the permanent link
      try {
        await prisma.premiumProfile.create({
          data: {
            isActive: true,
            linkedAt: new Date(),
            profileId,
            walletAddress: normalizedAddress
          }
        });
      } catch (dbError) {
        logger.error(`Failed to create premium profile link for ${normalizedAddress}:`, dbError);
        throw new Error("Database operation failed - unable to link profile");
      }

      logger.info(
        `Successfully linked profile ${profileId} to wallet ${normalizedAddress}`
      );
    } catch (error) {
      logger.error(
        `Error linking profile ${profileId} to wallet ${normalizedAddress}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Build referral tree recursively from a root wallet
   */
  async buildReferralTree(
    rootWallet: string,
    depth = 0,
    maxDepth = 5
  ): Promise<ReferralNode[]> {
    if (!rootWallet || depth > maxDepth) return [];

    try {
      const normalizedAddress = this.normalizeWalletAddress(rootWallet);

      const nodeData = await this.publicClient.readContract({
        abi: REFERRAL_ABI,
        address: this.referralContractAddress as `0x${string}`,
        args: [normalizedAddress as `0x${string}`],
        functionName: "NodeSet"
      });

      // Check if node exists (startTime > 0)
      if (nodeData[0] === 0n) {
        return [];
      }

      const leftChild = nodeData[8] as string;
      const rightChild = nodeData[9] as string;
      const parent = nodeData[7] as string;

      const current: ReferralNode = {
        address: normalizedAddress,
        balance: nodeData[1].toString(),
        depth,
        leftChild:
          leftChild === "0x0000000000000000000000000000000000000000"
            ? undefined
            : leftChild,
        parent:
          parent === "0x0000000000000000000000000000000000000000"
            ? null
            : parent,
        point: Number(nodeData[2]),
        rightChild:
          rightChild === "0x0000000000000000000000000000000000000000"
            ? undefined
            : rightChild,
        startTime: nodeData[0].toString()
      };

      const leftBranch =
        leftChild && leftChild !== "0x0000000000000000000000000000000000000000"
          ? await this.buildReferralTree(leftChild, depth + 1, maxDepth)
          : [];

      const rightBranch =
        rightChild &&
        rightChild !== "0x0000000000000000000000000000000000000000"
          ? await this.buildReferralTree(rightChild, depth + 1, maxDepth)
          : [];

      return [current, ...leftBranch, ...rightBranch];
    } catch (error) {
      logger.error(
        `Error building referral tree for ${rootWallet} at depth ${depth}:`,
        error
      );
      return [];
    }
  }
}

export default new SimplePremiumService();
