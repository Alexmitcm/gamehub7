import logger from "@hey/helpers/logger";

// Types
export interface NetworkInfo {
  chainId: string;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
  isArbitrumOne: boolean;
}

export interface NetworkSwitchResult {
  success: boolean;
  message: string;
  currentNetwork?: NetworkInfo;
  targetNetwork?: NetworkInfo;
  switched: boolean;
}

export class NetworkManagementService {
  private readonly arbitrumOneChainId = "0xa4b1"; // 42161 in hex
  private readonly arbitrumOneChainName = "Arbitrum One";
  
  constructor() {
    // This service is designed to work with frontend wallet connections
    // The backend can provide network information and validation
  }

  /**
   * Get Arbitrum One network configuration
   */
  getArbitrumOneNetwork(): NetworkInfo {
    return {
      chainId: this.arbitrumOneChainId,
      chainName: this.arbitrumOneChainName,
      nativeCurrency: {
        name: "Ether",
        symbol: "ETH",
        decimals: 18
      },
      rpcUrls: [
        "https://arb1.arbitrum.io/rpc",
        "https://arbitrum-one.publicnode.com"
      ],
      blockExplorerUrls: [
        "https://arbiscan.io"
      ],
      isArbitrumOne: true
    };
  }

  /**
   * Validate if a network is Arbitrum One
   */
  isArbitrumOne(chainId: string | number): boolean {
    const normalizedChainId = typeof chainId === "string" 
      ? chainId.toLowerCase() 
      : `0x${chainId.toString(16)}`;
    
    return normalizedChainId === this.arbitrumOneChainId.toLowerCase();
  }

  /**
   * Get network information by chain ID
   */
  getNetworkInfo(chainId: string | number): NetworkInfo | null {
    const normalizedChainId = typeof chainId === "string" 
      ? chainId.toLowerCase() 
      : `0x${chainId.toString(16)}`;
    
    if (this.isArbitrumOne(normalizedChainId)) {
      return this.getArbitrumOneNetwork();
    }

    // Return null for unknown networks
    return null;
  }

  /**
   * Generate network switch request for frontend
   */
  generateNetworkSwitchRequest(): {
    method: string;
    params: any[];
    networkInfo: NetworkInfo;
  } {
    const networkInfo = this.getArbitrumOneNetwork();
    
    return {
      method: "wallet_switchEthereumChain",
      params: [{ chainId: networkInfo.chainId }],
      networkInfo
    };
  }

  /**
   * Generate network add request for frontend (if network doesn't exist)
   */
  generateNetworkAddRequest(): {
    method: string;
    params: any[];
    networkInfo: NetworkInfo;
  } {
    const networkInfo = this.getArbitrumOneNetwork();
    
    return {
      method: "wallet_addEthereumChain",
      params: [{
        chainId: networkInfo.chainId,
        chainName: networkInfo.chainName,
        nativeCurrency: networkInfo.nativeCurrency,
        rpcUrls: networkInfo.rpcUrls,
        blockExplorerUrls: networkInfo.blockExplorerUrls
      }],
      networkInfo
    };
  }

  /**
   * Validate network for premium registration
   */
  validateNetworkForPremiumRegistration(chainId: string | number): {
    isValid: boolean;
    message: string;
    requiredNetwork: NetworkInfo;
    currentNetwork?: NetworkInfo;
  } {
    const requiredNetwork = this.getArbitrumOneNetwork();
    
    if (this.isArbitrumOne(chainId)) {
      return {
        isValid: true,
        message: "Network is correct for premium registration",
        requiredNetwork
      };
    }

    const currentNetwork = this.getNetworkInfo(chainId);
    
    return {
      isValid: false,
      message: `Premium registration requires Arbitrum One network. Current network: ${currentNetwork?.chainName || 'Unknown'}`,
      requiredNetwork,
      currentNetwork
    };
  }

  /**
   * Get network switching instructions for frontend
   */
  getNetworkSwitchingInstructions(currentChainId: string | number): {
    needsSwitch: boolean;
    instructions: string[];
    switchRequest: any;
    addRequest: any;
  } {
    const isCorrectNetwork = this.isArbitrumOne(currentChainId);
    
    if (isCorrectNetwork) {
      return {
        needsSwitch: false,
        instructions: ["Network is already Arbitrum One. No switching needed."],
        switchRequest: null,
        addRequest: null
      };
    }

    const switchRequest = this.generateNetworkSwitchRequest();
    const addRequest = this.generateNetworkAddRequest();
    
    const instructions = [
      "Your wallet is not connected to Arbitrum One network.",
      "Premium registration requires Arbitrum One network.",
      "Please switch your wallet to Arbitrum One network.",
      "If Arbitrum One is not available in your wallet, you may need to add it first."
    ];

    return {
      needsSwitch: true,
      instructions,
      switchRequest,
      addRequest
    };
  }

  /**
   * Log network validation for debugging
   */
  logNetworkValidation(chainId: string | number, operation: string): void {
    const networkInfo = this.getNetworkInfo(chainId);
    const isArbitrum = this.isArbitrumOne(chainId);
    
    logger.info(`Network validation for ${operation}:`, {
      chainId,
      networkName: networkInfo?.chainName || 'Unknown',
      isArbitrumOne: isArbitrum,
      operation
    });
  }

  /**
   * Get supported networks for the application
   */
  getSupportedNetworks(): NetworkInfo[] {
    return [
      this.getArbitrumOneNetwork()
      // Add other supported networks here if needed
    ];
  }

  /**
   * Check if a network is supported
   */
  isNetworkSupported(chainId: string | number): boolean {
    return this.isArbitrumOne(chainId);
  }
}

export default NetworkManagementService;
