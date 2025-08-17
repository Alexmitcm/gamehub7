import logger from "@hey/helpers/logger";
import { createPublicClient, http } from "viem";
import { arbitrum } from "viem/chains";

export interface WalletValidationResult {
  isValid: boolean;
  isMetaMask: boolean;
  isArbitrumNetwork: boolean;
  currentNetwork?: string;
  message: string;
  requiresNetworkSwitch: boolean;
  requiresMetaMaskConnection: boolean;
}

export interface NetworkSwitchResult {
  success: boolean;
  message: string;
  targetNetwork: string;
  currentNetwork?: string;
}

export class WalletValidationService {
  private readonly publicClient;

  constructor() {
    // Initialize with Arbitrum One network
    this.publicClient = createPublicClient({
      chain: arbitrum,
      transport: http(process.env.INFURA_URL || "https://arbitrum-mainnet.infura.io/v3/your-key")
    });
  }

  /**
   * Validate wallet connection and network
   */
  async validateWallet(
    walletAddress: string,
    currentNetwork?: string,
    walletType?: string
  ): Promise<WalletValidationResult> {
    try {
      // Check if wallet address is valid
      if (!walletAddress || !walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
        return {
          isValid: false,
          isMetaMask: false,
          isArbitrumNetwork: false,
          message: "Invalid wallet address format",
          requiresNetworkSwitch: false,
          requiresMetaMaskConnection: true
        };
      }

      // Determine if this is MetaMask (this would typically come from frontend)
      const isMetaMask = walletType === "metamask" || this.isLikelyMetaMask(walletAddress);
      
      // Check if network is Arbitrum One
      const isArbitrumNetwork = currentNetwork === "arbitrum" || 
                               currentNetwork === "42161" || 
                               currentNetwork === "0xa4b1";

      // Determine requirements
      const requiresMetaMaskConnection = !isMetaMask;
      const requiresNetworkSwitch = !isArbitrumNetwork;

      // Create appropriate message
      let message = "Wallet validation successful";
      if (requiresMetaMaskConnection) {
        message = "MetaMask connection required for premium registration";
      } else if (requiresNetworkSwitch) {
        message = "Please switch to Arbitrum One network";
      }

      return {
        isValid: true,
        isMetaMask,
        isArbitrumNetwork,
        currentNetwork,
        message,
        requiresNetworkSwitch,
        requiresMetaMaskConnection
      };
    } catch (error) {
      logger.error("Error validating wallet:", error);
      return {
        isValid: false,
        isMetaMask: false,
        isArbitrumNetwork: false,
        message: "Error validating wallet",
        requiresNetworkSwitch: false,
        requiresMetaMaskConnection: true
      };
    }
  }

  /**
   * Check if wallet is likely MetaMask (heuristic approach)
   * In production, this should be determined by the frontend
   */
  private isLikelyMetaMask(walletAddress: string): boolean {
    // This is a placeholder - in reality, the frontend should tell us
    // what type of wallet is connected
    return true;
  }

  /**
   * Get network switching instructions
   */
  getNetworkSwitchInstructions(): NetworkSwitchResult {
    return {
      success: true,
      message: "Please switch your wallet to Arbitrum One network (Chain ID: 42161)",
      targetNetwork: "arbitrum",
      currentNetwork: undefined
    };
  }

  /**
   * Validate wallet for premium registration
   */
  async validateWalletForPremiumRegistration(
    walletAddress: string,
    currentNetwork?: string,
    walletType?: string
  ): Promise<WalletValidationResult> {
    try {
      const validation = await this.validateWallet(walletAddress, currentNetwork, walletType);
      
      // For premium registration, we require MetaMask and Arbitrum network
      if (!validation.isMetaMask) {
        return {
          ...validation,
          message: "Premium registration requires MetaMask wallet connection",
          requiresMetaMaskConnection: true
        };
      }

      if (!validation.isArbitrumNetwork) {
        return {
          ...validation,
          message: "Premium registration requires Arbitrum One network. Please switch networks.",
          requiresNetworkSwitch: true
        };
      }

      return {
        ...validation,
        message: "Wallet ready for premium registration"
      };
    } catch (error) {
      logger.error("Error validating wallet for premium registration:", error);
      return {
        isValid: false,
        isMetaMask: false,
        isArbitrumNetwork: false,
        message: "Error validating wallet for premium registration",
        requiresNetworkSwitch: false,
        requiresMetaMaskConnection: true
      };
    }
  }

  /**
   * Validate wallet for reward claiming
   */
  async validateWalletForRewardClaiming(
    walletAddress: string,
    currentNetwork?: string,
    walletType?: string
  ): Promise<WalletValidationResult> {
    try {
      const validation = await this.validateWallet(walletAddress, currentNetwork, walletType);
      
      // For reward claiming, we require MetaMask and Arbitrum network
      if (!validation.isMetaMask) {
        return {
          ...validation,
          message: "Reward claiming requires MetaMask wallet connection",
          requiresMetaMaskConnection: true
        };
      }

      if (!validation.isArbitrumNetwork) {
        return {
          ...validation,
          message: "Reward claiming requires Arbitrum One network. Please switch networks.",
          requiresNetworkSwitch: true
        };
      }

      return {
        ...validation,
        message: "Wallet ready for reward claiming"
      };
    } catch (error) {
      logger.error("Error validating wallet for reward claiming:", error);
      return {
        isValid: false,
        isMetaMask: false,
        isArbitrumNetwork: false,
        message: "Error validating wallet for reward claiming",
        requiresNetworkSwitch: false,
        requiresMetaMaskConnection: true
      };
    }
  }

  /**
   * Get supported networks information
   */
  getSupportedNetworks(): Array<{
    name: string;
    chainId: string;
    networkId: string;
    description: string;
    isRequired: boolean;
  }> {
    return [
      {
        name: "Arbitrum One",
        chainId: "0xa4b1",
        networkId: "42161",
        description: "Mainnet for premium features and reward claiming",
        isRequired: true
      },
      {
        name: "Arbitrum Sepolia",
        chainId: "0x66eee",
        networkId: "421614",
        description: "Testnet for development and testing",
        isRequired: false
      }
    ];
  }
}

export default WalletValidationService;
