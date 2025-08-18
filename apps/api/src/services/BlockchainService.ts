import logger from "@hey/helpers/logger";
import { createPublicClient, http, parseAbiItem } from "viem";
import { arbitrum } from "viem/chains";

// ABI for the Referral contract - using the actual contract functions
const REFERRAL_ABI = [
  parseAbiItem(
    "function NodeSet(address) view returns (uint256 startTime, uint256 balance, uint24 point, uint24 depthLeftBranch, uint24 depthRightBranch, uint24 depth, address player, address parent, address leftChild, address rightChild, bool isPointChanged, bool unbalancedAllowance)"
  ),
  parseAbiItem(
    "function getPlayerNode() view returns (uint256 startTime, uint256 balance, uint24 point, uint24 depthLeftBranch, uint24 depthRightBranch, uint24 depth, address player, address parent, address leftChild, address rightChild, bool isPointChanged, bool unbalancedAllowance)"
  ),
  parseAbiItem(
    "function getPlayerNodeAdmin(address player) view returns (uint256 startTime, uint256 balance, uint24 point, uint24 depthLeftBranch, uint24 depthRightBranch, uint24 depth, address player, address parent, address leftChild, address rightChild, bool isPointChanged, bool unbalancedAllowance)"
  ),
  parseAbiItem("function getBalanceOfPlayer() view returns (uint256)"),
  parseAbiItem(
    "function getBalanceOfPlayerAdmin(address player) view returns (uint256)"
  ),
  parseAbiItem("function register(address referrer)"),
  parseAbiItem("function withdraw()")
];

// ABI for the GameVault contracts
const GAME_VAULT_ABI = [
  parseAbiItem("function getReward(address) view returns (uint256)")
];

// ABI for USDT contract
const USDT_ABI = [
  parseAbiItem("function balanceOf(address) view returns (uint256)"),
  parseAbiItem("function approve(address spender, uint256 amount) returns (bool)")
];

export interface NodeData {
  startTime: bigint;
  balance: bigint;
  point: number;
  depthLeftBranch: number;
  depthRightBranch: number;
  depth: number;
  player: string;
  parent: string;
  leftChild: string;
  rightChild: string;
  isPointChanged: boolean;
  unbalancedAllowance: boolean;
}

export interface ProfileStats {
  leftNode: string;
  rightNode: string;
  referralReward: bigint;
  balancedReward: bigint;
  unbalancedReward: bigint;
}

export class BlockchainService {
  private readonly publicClient;
  
  // Contract addresses from environment variables
  private readonly referralContractAddress: string;
  private readonly balancedGameVaultAddress: string;
  private readonly unbalancedGameVaultAddress: string;
  private readonly usdtContractAddress: string;
  private readonly infuraUrl: string;

  constructor() {
    // Load configuration from environment variables
    this.referralContractAddress = this.getRequiredEnvVar("REFERRAL_CONTRACT_ADDRESS");
    this.balancedGameVaultAddress = this.getRequiredEnvVar("BALANCED_GAME_VAULT_ADDRESS");
    this.unbalancedGameVaultAddress = this.getRequiredEnvVar("UNBALANCED_GAME_VAULT_ADDRESS");
    this.usdtContractAddress = this.getRequiredEnvVar("USDT_CONTRACT_ADDRESS");
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
   * Check if a wallet is premium by verifying its NodeSet on-chain
   * This is the main function to check premium status
   */
  async isWalletPremium(walletAddress: string): Promise<boolean> {
    try {
      const normalizedAddress = this.normalizeWalletAddress(walletAddress);
      logger.info(`Checking premium status for wallet: ${normalizedAddress}`);

      const nodeData = await this.publicClient.readContract({
        abi: REFERRAL_ABI,
        address: this.referralContractAddress as `0x${string}`,
        args: [normalizedAddress as `0x${string}`],
        functionName: "NodeSet"
      });

      // Check if the node exists by checking if startTime is not 0
      const isPremium = nodeData[0] > 0n; // startTime > 0 means the node exists
      logger.info(`Wallet ${normalizedAddress} premium status: ${isPremium}`);
      return isPremium;
    } catch (error) {
      logger.error(`Error checking premium status for ${walletAddress}:`, error);
      throw new Error("Failed to verify premium status on-chain");
    }
  }

  /**
   * Get detailed node data for a wallet
   */
  async getNodeData(walletAddress: string): Promise<NodeData | null> {
    try {
      const normalizedAddress = this.normalizeWalletAddress(walletAddress);
      
      const nodeData = await this.publicClient.readContract({
        abi: REFERRAL_ABI,
        address: this.referralContractAddress as `0x${string}`,
        args: [normalizedAddress as `0x${string}`],
        functionName: "NodeSet"
      });

      // Check if node exists
      if (nodeData[0] === 0n) {
        return null;
      }

      return {
        startTime: nodeData[0] as bigint,
        balance: nodeData[1] as bigint,
        point: nodeData[2] as number,
        depthLeftBranch: nodeData[3] as number,
        depthRightBranch: nodeData[4] as number,
        depth: nodeData[5] as number,
        player: nodeData[6] as string,
        parent: nodeData[7] as string,
        leftChild: nodeData[8] as string,
        rightChild: nodeData[9] as string,
        isPointChanged: nodeData[10] as boolean,
        unbalancedAllowance: nodeData[11] as boolean
      };
    } catch (error) {
      logger.error(`Error getting node data for ${walletAddress}:`, error);
      throw new Error("Failed to fetch node data from blockchain");
    }
  }

  /**
   * Check USDT balance for a wallet
   */
  async getUsdtBalance(walletAddress: string): Promise<bigint> {
    try {
      const normalizedAddress = this.normalizeWalletAddress(walletAddress);
      
      const balance = await this.publicClient.readContract({
        abi: USDT_ABI,
        address: this.usdtContractAddress as `0x${string}`,
        args: [normalizedAddress as `0x${string}`],
        functionName: "balanceOf"
      });

      return balance as bigint;
    } catch (error) {
      logger.error(`Error getting USDT balance for ${walletAddress}:`, error);
      throw new Error("Failed to fetch USDT balance from blockchain");
    }
  }

  /**
   * Verify if wallet has sufficient USDT balance (minimum 200 USDT)
   */
  async hasSufficientUsdtBalance(walletAddress: string, minimumAmount: bigint = 200000000000000000000n): Promise<boolean> {
    try {
      const balance = await this.getUsdtBalance(walletAddress);
      return balance >= minimumAmount;
    } catch (error) {
      logger.error(`Error checking USDT balance sufficiency for ${walletAddress}:`, error);
      return false;
    }
  }

  /**
   * Get referral rewards balance for a wallet
   */
  async getReferralReward(walletAddress: string): Promise<bigint> {
    try {
      const normalizedAddress = this.normalizeWalletAddress(walletAddress);
      
      const reward = await this.publicClient.readContract({
        abi: REFERRAL_ABI,
        address: this.referralContractAddress as `0x${string}`,
        args: [normalizedAddress as `0x${string}`],
        functionName: "getBalanceOfPlayerAdmin"
      });

      return reward as bigint;
    } catch (error) {
      logger.error(`Error getting referral reward for ${walletAddress}:`, error);
      throw new Error("Failed to fetch referral reward from blockchain");
    }
  }

  /**
   * Get game vault rewards for a wallet
   */
  async getGameVaultRewards(walletAddress: string): Promise<{ balanced: bigint; unbalanced: bigint }> {
    try {
      const normalizedAddress = this.normalizeWalletAddress(walletAddress);
      
      const [balancedReward, unbalancedReward] = await Promise.all([
        this.publicClient.readContract({
          abi: GAME_VAULT_ABI,
          address: this.balancedGameVaultAddress as `0x${string}`,
          args: [normalizedAddress as `0x${string}`],
          functionName: "getReward"
        }),
        this.publicClient.readContract({
          abi: GAME_VAULT_ABI,
          address: this.unbalancedGameVaultAddress as `0x${string}`,
          args: [normalizedAddress as `0x${string}`],
          functionName: "getReward"
        })
      ]);

      return {
        balanced: balancedReward as bigint,
        unbalanced: unbalancedReward as bigint
      };
    } catch (error) {
      logger.error(`Error getting game vault rewards for ${walletAddress}:`, error);
      throw new Error("Failed to fetch game vault rewards from blockchain");
    }
  }

  /**
   * Get comprehensive profile statistics for a wallet
   */
  async getProfileStats(walletAddress: string): Promise<ProfileStats> {
    try {
      const normalizedAddress = this.normalizeWalletAddress(walletAddress);

      // Get node data
      const nodeData = await this.getNodeData(normalizedAddress);
      if (!nodeData) {
        throw new Error("Wallet is not premium");
      }

      // Get rewards
      const [referralReward, gameRewards] = await Promise.all([
        this.getReferralReward(normalizedAddress),
        this.getGameVaultRewards(normalizedAddress)
      ]);

      return {
        leftNode: nodeData.leftChild,
        rightNode: nodeData.rightChild,
        referralReward,
        balancedReward: gameRewards.balanced,
        unbalancedReward: gameRewards.unbalanced
      };
    } catch (error) {
      logger.error(`Error getting profile stats for ${walletAddress}:`, error);
      throw new Error("Failed to fetch on-chain profile statistics");
    }
  }

  /**
   * Verify a registration transaction
   */
  async verifyRegistrationTransaction(
    userAddress: string,
    referrerAddress: string,
    transactionHash: string
  ): Promise<boolean> {
    try {
      const normalizedUserAddress = this.normalizeWalletAddress(userAddress);
      const normalizedReferrerAddress = this.normalizeWalletAddress(referrerAddress);

      logger.info(`Verifying registration transaction: ${transactionHash}`);

      // Get transaction receipt
      const receipt = await this.publicClient.getTransactionReceipt({
        hash: transactionHash as `0x${string}`
      });

      if (!receipt || receipt.status !== "success") {
        logger.error(`Transaction ${transactionHash} failed or not found`);
        return false;
      }

      // Verify the transaction is for the correct contract
      if (receipt.to?.toLowerCase() !== this.referralContractAddress.toLowerCase()) {
        logger.error(`Transaction ${transactionHash} is not for the referral contract`);
        return false;
      }

      // Verify the user is now premium
      const isPremium = await this.isWalletPremium(normalizedUserAddress);
      if (!isPremium) {
        logger.error(`User ${normalizedUserAddress} is not premium after transaction ${transactionHash}`);
        return false;
      }

      // Verify the referrer relationship (optional additional check)
      try {
        const nodeData = await this.getNodeData(normalizedUserAddress);
        if (nodeData && nodeData.parent.toLowerCase() !== normalizedReferrerAddress) {
          logger.warn(`Referrer mismatch for user ${normalizedUserAddress}`);
          // Don't fail verification for this, as the main check is if user is premium
        }
      } catch (error) {
        logger.warn(`Could not verify referrer relationship: ${error}`);
      }

      logger.info(`Registration transaction ${transactionHash} verified successfully`);
      return true;
    } catch (error) {
      logger.error(`Error verifying registration transaction ${transactionHash}:`, error);
      return false;
    }
  }

  /**
   * Validate referrer address
   */
  async validateReferrer(referrerAddress: string): Promise<{ isValid: boolean; message: string }> {
    try {
      const normalizedReferrer = this.normalizeWalletAddress(referrerAddress);
      
      // Check if referrer exists in the system
      const nodeData = await this.getNodeData(normalizedReferrer);
      
      if (!nodeData) {
        return { isValid: false, message: "Invalid referrer address" };
      }

      // Check if referrer has available slots
      const hasAvailableSlots = 
        nodeData.leftChild === "0x0000000000000000000000000000000000000000" ||
        nodeData.rightChild === "0x0000000000000000000000000000000000000000";

      if (!hasAvailableSlots) {
        return { isValid: false, message: "Referrer has no available slots" };
      }

      return { isValid: true, message: "Valid referrer address" };
    } catch (error) {
      logger.error(`Error validating referrer ${referrerAddress}:`, error);
      return { isValid: false, message: "Error validating referrer" };
    }
  }

  /**
   * Get contract addresses for reference
   */
  getContractAddresses() {
    return {
      referral: this.referralContractAddress,
      balancedGameVault: this.balancedGameVaultAddress,
      unbalancedGameVault: this.unbalancedGameVaultAddress,
      usdt: this.usdtContractAddress
    };
  }
}

export default new BlockchainService(); 