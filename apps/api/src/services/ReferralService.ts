import { createPublicClient, http } from "viem";
import { arbitrum } from "viem/chains";
import { logger } from "@/utils/logger";

// Referral contract ABI - only the functions we need
const REFERRAL_ABI = [
  {
    inputs: [{ name: "player", type: "address" }],
    name: "getPlayerNode",
    outputs: [
      { name: "startTime", type: "uint256" },
      { name: "balance", type: "uint256" },
      { name: "point", type: "uint24" },
      { name: "depth", type: "uint24" },
      { name: "parent", type: "address" },
      { name: "leftChild", type: "address" },
      { name: "rightChild", type: "address" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "player", type: "address" }],
    name: "getUnbalancedPlayerNode",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getBalanceOfPlayer",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  }
] as const;

export interface ReferralNode {
  wallet: string;
  parent: string | null;
  leftChild: string | null;
  rightChild: string | null;
  depth: number;
  balance: string;
  startTime: number;
  isUnbalanced: boolean;
}

export class ReferralService {
  private readonly publicClient;
  private readonly referralContractAddress: string;
  private readonly infuraUrl: string;

  constructor() {
    // Use default values for development/testing
    this.infuraUrl = process.env.INFURA_URL || "https://arbitrum-mainnet.infura.io/v3/test";
    this.referralContractAddress = process.env.REFERRAL_CONTRACT_ADDRESS || "0x1234567890123456789012345678901234567890";

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
   * Build the user's own referral tree (downline only)
   * This is secure because it only fetches the user's own structure
   */
  async buildUserReferralTree(
    userWallet: string,
    maxDepth = 3
  ): Promise<ReferralNode[]> {
    if (!userWallet || maxDepth < 0) return [];

    try {
      // For testing, return mock data
      if (!process.env.INFURA_URL || process.env.INFURA_URL.includes("test")) {
        return this.getMockReferralTree(userWallet, maxDepth);
      }

      const normalizedAddress = this.normalizeWalletAddress(userWallet);

      // Start building the tree from the user's wallet
      return await this.buildTreeRecursively(normalizedAddress, 0, maxDepth);
    } catch (error) {
      logger.error(
        `Error building user referral tree for ${userWallet}:`,
        error
      );
      return [];
    }
  }

  private getMockReferralTree(userWallet: string, maxDepth: number): ReferralNode[] {
    const mockNodes: ReferralNode[] = [
      {
        wallet: userWallet,
        parent: null,
        leftChild: "0x1111111111111111111111111111111111111111",
        rightChild: "0x2222222222222222222222222222222222222222",
        depth: 0,
        balance: "1000000", // 1 USDT in wei
        startTime: Date.now(),
        isUnbalanced: false
      }
    ];

    if (maxDepth > 0) {
      mockNodes.push(
        {
          wallet: "0x1111111111111111111111111111111111111111",
          parent: userWallet,
          leftChild: null,
          rightChild: null,
          depth: 1,
          balance: "500000", // 0.5 USDT
          startTime: Date.now() - 86400000, // 1 day ago
          isUnbalanced: true
        },
        {
          wallet: "0x2222222222222222222222222222222222222222",
          parent: userWallet,
          leftChild: null,
          rightChild: null,
          depth: 1,
          balance: "750000", // 0.75 USDT
          startTime: Date.now() - 172800000, // 2 days ago
          isUnbalanced: false
        }
      );
    }

    return mockNodes;
  }

  /**
   * Recursively build the tree structure
   */
  private async buildTreeRecursively(
    walletAddress: string,
    currentDepth: number,
    maxDepth: number
  ): Promise<ReferralNode[]> {
    if (currentDepth > maxDepth) return [];

    try {
      // Get node data using getPlayerNode
      const nodeData = await this.publicClient.readContract({
        abi: REFERRAL_ABI,
        address: this.referralContractAddress as `0x${string}`,
        args: [walletAddress as `0x${string}`],
        functionName: "getPlayerNode"
      });

      // Check if node exists (startTime > 0)
      if (nodeData[0] === 0n) {
        return [];
      }

      // Check if node is unbalanced
      const isUnbalanced = await this.publicClient.readContract({
        abi: REFERRAL_ABI,
        address: this.referralContractAddress as `0x${string}`,
        args: [walletAddress as `0x${string}`],
        functionName: "getUnbalancedPlayerNode"
      });

      const leftChild = nodeData[5] as string;
      const rightChild = nodeData[6] as string;
      const parent = nodeData[4] as string;

      const currentNode: ReferralNode = {
        balance: nodeData[1].toString(),
        depth: currentDepth,
        isUnbalanced: isUnbalanced as boolean,
        leftChild:
          leftChild === "0x0000000000000000000000000000000000000000"
            ? null
            : leftChild,
        parent:
          parent === "0x0000000000000000000000000000000000000000"
            ? null
            : parent,
        rightChild:
          rightChild === "0x0000000000000000000000000000000000000000"
            ? null
            : rightChild,
        startTime: Number(nodeData[0]),
        wallet: walletAddress
      };

      // Recursively fetch children (downline only)
      const leftBranch =
        leftChild && leftChild !== "0x0000000000000000000000000000000000000000"
          ? await this.buildTreeRecursively(
              leftChild,
              currentDepth + 1,
              maxDepth
            )
          : [];

      const rightBranch =
        rightChild &&
        rightChild !== "0x0000000000000000000000000000000000000000"
          ? await this.buildTreeRecursively(
              rightChild,
              currentDepth + 1,
              maxDepth
            )
          : [];

      return [currentNode, ...leftBranch, ...rightBranch];
    } catch (error) {
      logger.error(
        `Error fetching node data for ${walletAddress} at depth ${currentDepth}:`,
        error
      );
      return [];
    }
  }

  /**
   * Get the total balance for a specific player
   */
  async getPlayerBalance(walletAddress: string): Promise<string> {
    try {
      const balance = await this.publicClient.readContract({
        abi: REFERRAL_ABI,
        address: this.referralContractAddress as `0x${string}`,
        args: [],
        functionName: "getBalanceOfPlayer"
      });

      return balance.toString();
    } catch (error) {
      logger.error(`Error fetching balance for ${walletAddress}:`, error);
      return "0";
    }
  }
}

export default new ReferralService();
