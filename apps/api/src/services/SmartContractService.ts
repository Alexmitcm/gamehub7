import logger from "@hey/helpers/logger";
import { createPublicClient, http, createWalletClient, parseAbiItem, encodeFunctionData, type Address, type Hex } from "viem";
import { arbitrum } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

// Smart Contract ABIs
const REFERRAL_ABI = [
  parseAbiItem("function NodeSet(address) view returns (uint256 startTime, uint256 balance, uint24 point, uint24 depthLeftBranch, uint24 depthRightBranch, uint24 depth, address player, address parent, address leftChild, address rightChild, bool isPointChanged, bool unbalancedAllowance)"),
  parseAbiItem("function register(address referrer)"),
  parseAbiItem("function getPlayerNode() view returns (uint256 startTime, uint256 balance, uint24 point, uint24 depthLeftBranch, uint24 depthRightBranch, uint24 depth, address player, address parent, address leftChild, address rightChild, bool isPointChanged, bool unbalancedAllowance)"),
  parseAbiItem("function withdraw()"),
  parseAbiItem("function getBalanceOfPlayer() view returns (uint256)"),
  parseAbiItem("function getBalanceOfPlayerAdmin(address player) view returns (uint256)")
];

const USDT_ABI = [
  parseAbiItem("function balanceOf(address) view returns (uint256)"),
  parseAbiItem("function approve(address spender, uint256 amount) returns (bool)"),
  parseAbiItem("function transfer(address to, uint256 amount) returns (bool)")
];

const GAME_VAULT_ABI = [
  parseAbiItem("function getReward(address) view returns (uint256)"),
  parseAbiItem("function claimReward(address player) returns (bool)")
];

// Types
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

export interface WalletStatus {
  isPremium: boolean;
  balance: bigint;
  registrationDate: Date;
  referrer: string;
  hasUnclaimedRewards: boolean;
  gameRewards: bigint;
  referralRewards: bigint;
}

export interface RegistrationTransaction {
  userAddress: string;
  referrerAddress: string;
  usdtAmount: bigint;
  gasEstimate: bigint;
  transactionHash?: string;
  status: "pending" | "confirmed" | "failed";
}

export class SmartContractService {
  private readonly publicClient;
  private readonly walletClient;
  private readonly referralContractAddress: Address;
  private readonly usdtContractAddress: Address;
  private readonly balancedGameVaultAddress: Address;
  private readonly unbalancedGameVaultAddress: Address;
  private readonly infuraUrl: string;
  private readonly privateKey: Hex;

  constructor() {
    // Initialize with default values for development/testing
    this.referralContractAddress = (process.env.REFERRAL_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000") as Address;
    this.usdtContractAddress = (process.env.USDT_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000") as Address;
    this.balancedGameVaultAddress = (process.env.BALANCED_GAME_VAULT_ADDRESS || "0x0000000000000000000000000000000000000000") as Address;
    this.unbalancedGameVaultAddress = (process.env.UNBALANCED_GAME_VAULT_ADDRESS || "0x0000000000000000000000000000000000000000") as Address;
    this.infuraUrl = process.env.INFURA_URL || "https://arbitrum-mainnet.infura.io/v3/your-project-id";
    this.privateKey = (process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000000") as Hex;

    try {
      this.publicClient = createPublicClient({
        chain: arbitrum,
        transport: http(this.infuraUrl)
      });

      if (this.privateKey !== "0x0000000000000000000000000000000000000000000000000000000000000000") {
        const account = privateKeyToAccount(this.privateKey);
        this.walletClient = createWalletClient({
          account,
          chain: arbitrum,
          transport: http(this.infuraUrl)
        });
      } else {
        // Create a dummy wallet client for development
        this.walletClient = createWalletClient({
          chain: arbitrum,
          transport: http(this.infuraUrl)
        });
      }
    } catch (error) {
      logger.warn("Failed to initialize blockchain clients, using mock mode:", error);
      // Create mock clients for development
      this.publicClient = createPublicClient({
        chain: arbitrum,
        transport: http("https://arbitrum-mainnet.infura.io/v3/mock")
      });
      this.walletClient = createWalletClient({
        chain: arbitrum,
        transport: http("https://arbitrum-mainnet.infura.io/v3/mock")
      });
    }
  }



  private normalizeWalletAddress(address: string): Address {
    return address.toLowerCase() as Address;
  }

  /**
   * Check if a wallet is premium by verifying its NodeSet on-chain
   */
  async isWalletPremium(walletAddress: string): Promise<boolean> {
    try {
      // For development/testing, return false for non-premium wallets
      // In production, this would check the actual blockchain
      const normalizedAddress = this.normalizeWalletAddress(walletAddress);
      
      // Check if we're in mock mode (no real blockchain connection)
      if (this.infuraUrl.includes("mock") || this.referralContractAddress === "0x0000000000000000000000000000000000000000") {
        logger.info(`Mock mode: returning false for wallet ${walletAddress}`);
        return false;
      }
      
      const nodeData = await this.publicClient.readContract({
        address: this.referralContractAddress,
        abi: REFERRAL_ABI,
        functionName: "NodeSet",
        args: [normalizedAddress]
      });

      // If NodeSet returns data and balance > 0, the wallet is premium
      return nodeData && nodeData.balance > 0n;
    } catch (error) {
      logger.error(`Error checking premium status for ${walletAddress}:`, error);
      // In development, return false instead of failing
      return false;
    }
  }

  /**
   * Get comprehensive wallet status including rewards
   */
  async getWalletStatus(walletAddress: string): Promise<WalletStatus> {
    try {
      const normalizedAddress = this.normalizeWalletAddress(walletAddress);
      
      // Check if wallet is premium
      const isPremium = await this.isWalletPremium(normalizedAddress);
      
      if (!isPremium) {
        return {
          isPremium: false,
          balance: 0n,
          registrationDate: new Date(0),
          referrer: "",
          hasUnclaimedRewards: false,
          gameRewards: 0n,
          referralRewards: 0n
        };
      }

      // Get NodeSet data
      const nodeData = await this.publicClient.readContract({
        address: this.referralContractAddress,
        abi: REFERRAL_ABI,
        functionName: "NodeSet",
        args: [normalizedAddress]
      });

      // Get game rewards
      const balancedRewards = await this.publicClient.readContract({
        address: this.balancedGameVaultAddress,
        abi: GAME_VAULT_ABI,
        functionName: "getReward",
        args: [normalizedAddress]
      });

      const unbalancedRewards = await this.publicClient.readContract({
        address: this.unbalancedGameVaultAddress,
        abi: GAME_VAULT_ABI,
        functionName: "getReward",
        args: [normalizedAddress]
      });

      const totalGameRewards = (balancedRewards || 0n) + (unbalancedRewards || 0n);
      const hasUnclaimedRewards = totalGameRewards > 0n;

      return {
        isPremium: true,
        balance: nodeData?.balance || 0n,
        registrationDate: new Date(Number(nodeData?.startTime || 0) * 1000),
        referrer: nodeData?.parent || "",
        hasUnclaimedRewards,
        gameRewards: totalGameRewards,
        referralRewards: nodeData?.balance || 0n
      };
    } catch (error) {
      logger.error(`Error getting wallet status for ${walletAddress}:`, error);
      throw error;
    }
  }

  /**
   * Execute premium registration transaction
   */
  async executePremiumRegistration(
    userAddress: string,
    referrerAddress: string
  ): Promise<RegistrationTransaction> {
    try {
      const normalizedUserAddress = this.normalizeWalletAddress(userAddress);
      const normalizedReferrerAddress = this.normalizeWalletAddress(referrerAddress);

      // Check if user is already premium
      const isAlreadyPremium = await this.isWalletPremium(normalizedUserAddress);
      if (isAlreadyPremium) {
        throw new Error("User is already premium");
      }

      // Check if referrer is valid
      const isReferrerValid = await this.isWalletPremium(normalizedReferrerAddress);
      if (!isReferrerValid) {
        throw new Error("Invalid referrer address");
      }

      // Estimate gas for registration
      const gasEstimate = await this.publicClient.estimateGas({
        account: this.walletClient.account,
        to: this.referralContractAddress,
        data: this.encodeRegistrationData(normalizedReferrerAddress)
      });

      // Execute registration transaction
      const hash = await this.walletClient.sendTransaction({
        to: this.referralContractAddress,
        data: this.encodeRegistrationData(normalizedReferrerAddress),
        gas: gasEstimate
      });

      logger.info(`Registration transaction sent: ${hash}`);

      return {
        userAddress: normalizedUserAddress,
        referrerAddress: normalizedReferrerAddress,
        usdtAmount: 0n, // This would be the actual USDT amount
        gasEstimate,
        transactionHash: hash,
        status: "pending"
      };
    } catch (error) {
      logger.error("Error executing premium registration:", error);
      throw error;
    }
  }

  /**
   * Wait for transaction confirmation
   */
  async waitForTransactionConfirmation(transactionHash: string): Promise<boolean> {
    try {
      const receipt = await this.publicClient.waitForTransactionReceipt({
        hash: transactionHash as Hex
      });

      return receipt.status === "success";
    } catch (error) {
      logger.error(`Error waiting for transaction confirmation: ${error}`);
      return false;
    }
  }

  /**
   * Claim game rewards for a user
   */
  async claimGameRewards(walletAddress: string): Promise<{ success: boolean; transactionHash?: string }> {
    try {
      const normalizedAddress = this.normalizeWalletAddress(walletAddress);
      
      // Check if wallet is premium
      const isPremium = await this.isWalletPremium(normalizedAddress);
      if (!isPremium) {
        throw new Error("Only premium wallets can claim rewards");
      }

      // Check if there are rewards to claim
      const walletStatus = await this.getWalletStatus(normalizedAddress);
      if (!walletStatus.hasUnclaimedRewards) {
        throw new Error("No rewards to claim");
      }

      // Claim from balanced vault
      let balancedHash: string | undefined;
      if (walletStatus.gameRewards > 0n) {
        balancedHash = await this.walletClient.sendTransaction({
          to: this.balancedGameVaultAddress,
          data: this.encodeClaimRewardData(normalizedAddress)
        });
      }

      // Claim from unbalanced vault
      let unbalancedHash: string | undefined;
      if (walletStatus.gameRewards > 0n) {
        unbalancedHash = await this.walletClient.sendTransaction({
          to: this.unbalancedGameVaultAddress,
          data: this.encodeClaimRewardData(normalizedAddress)
        });
      }

      return {
        success: true,
        transactionHash: balancedHash || unbalancedHash
      };
    } catch (error) {
      logger.error("Error claiming game rewards:", error);
      throw error;
    }
  }

  /**
   * Encode registration data for contract call
   */
  private encodeRegistrationData(referrerAddress: Address): Hex {
    try {
      // Encode the register function call with referrer address
      const encodedData = encodeFunctionData({
        abi: REFERRAL_ABI,
        functionName: "register",
        args: [referrerAddress]
      });
      
      logger.info(`Encoded registration data for referrer ${referrerAddress}: ${encodedData}`);
      return encodedData;
    } catch (error) {
      logger.error("Error encoding registration data:", error);
      throw new Error(`Failed to encode registration data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Encode claim reward data for contract call
   */
  private encodeClaimRewardData(playerAddress: Address): Hex {
    try {
      // Encode the claimReward function call with player address
      const encodedData = encodeFunctionData({
        abi: GAME_VAULT_ABI,
        functionName: "claimReward",
        args: [playerAddress]
      });
      
      logger.info(`Encoded claim reward data for player ${playerAddress}: ${encodedData}`);
      return encodedData;
    } catch (error) {
      logger.error("Error encoding claim reward data:", error);
      throw new Error(`Failed to encode claim reward data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get USDT balance for a wallet
   */
  async getUSDTBalance(walletAddress: string): Promise<bigint> {
    try {
      const normalizedAddress = this.normalizeWalletAddress(walletAddress);
      
      const balance = await this.publicClient.readContract({
        address: this.usdtContractAddress,
        abi: USDT_ABI,
        functionName: "balanceOf",
        args: [normalizedAddress]
      });

      return balance || 0n;
    } catch (error) {
      logger.error(`Error getting USDT balance for ${walletAddress}:`, error);
      return 0n;
    }
  }

  /**
   * Check if network is Arbitrum One
   */
  async checkNetwork(walletAddress: string): Promise<boolean> {
    try {
      // This would check the actual network
      // For now, return true as we're hardcoded to Arbitrum
      return true;
    } catch (error) {
      logger.error("Error checking network:", error);
      return false;
    }
  }
}

export default SmartContractService;
