/**
 * Utility functions for detecting and checking wallet availability
 */

export interface WalletInfo {
  id: string;
  name: string;
  isAvailable: boolean;
  isInstalled: boolean;
  canConnect: boolean;
}

/**
 * Check if MetaMask is available and can be used
 */
export const isMetaMaskAvailable = (): boolean => {
  if (typeof window === "undefined") return false;
  
  const ethereum = (window as any).ethereum;
  if (!ethereum) return false;
  
  return Boolean(ethereum.isMetaMask);
};

/**
 * Check if Brave Wallet is available
 */
export const isBraveWalletAvailable = (): boolean => {
  if (typeof window === "undefined") return false;
  
  const ethereum = (window as any).ethereum;
  if (!ethereum) return false;
  
  return Boolean(ethereum.isBraveWallet);
};

/**
 * Check if Coinbase Wallet is available
 */
export const isCoinbaseWalletAvailable = (): boolean => {
  if (typeof window === "undefined") return false;
  
  const ethereum = (window as any).ethereum;
  if (!ethereum) return false;
  
  return Boolean(ethereum.isCoinbaseWallet);
};

/**
 * Check if any injected wallet is available
 */
export const isAnyInjectedWalletAvailable = (): boolean => {
  return isMetaMaskAvailable() || isBraveWalletAvailable() || isCoinbaseWalletAvailable();
};

/**
 * Get detailed information about available wallets
 */
export const getAvailableWallets = (): WalletInfo[] => {
  const wallets: WalletInfo[] = [
    {
      id: "familyAccountsProvider",
      name: "Family Accounts",
      isAvailable: true,
      isInstalled: true,
      canConnect: true
    },
    {
      id: "walletConnect",
      name: "WalletConnect",
      isAvailable: true,
      isInstalled: true,
      canConnect: true
    }
  ];

  // Add MetaMask if available
  if (isMetaMaskAvailable()) {
    wallets.push({
      id: "injected",
      name: "MetaMask",
      isAvailable: true,
      isInstalled: true,
      canConnect: true
    });
  }

  // Add Brave Wallet if available
  if (isBraveWalletAvailable()) {
    wallets.push({
      id: "injected",
      name: "Brave Wallet",
      isAvailable: true,
      isInstalled: true,
      canConnect: true
    });
  }

  // Add Coinbase Wallet if available
  if (isCoinbaseWalletAvailable()) {
    wallets.push({
      id: "injected",
      name: "Coinbase Wallet",
      isAvailable: true,
      isInstalled: true,
      canConnect: true
    });
  }

  // Add generic injected wallet if any wallet is available
  if (isAnyInjectedWalletAvailable()) {
    wallets.push({
      id: "injected",
      name: "Browser Wallet",
      isAvailable: true,
      isInstalled: true,
      canConnect: true
    });
  }

  return wallets;
};

/**
 * Check if a specific wallet type is available
 */
export const isWalletAvailable = (walletId: string): boolean => {
  switch (walletId) {
    case "metaMask":
      return isMetaMaskAvailable();
    case "braveWallet":
      return isBraveWalletAvailable();
    case "coinbaseWallet":
      return isCoinbaseWalletAvailable();
    case "injected":
      return isAnyInjectedWalletAvailable();
    case "familyAccountsProvider":
    case "walletConnect":
      return true;
    default:
      return false;
  }
};

/**
 * Get user-friendly error message for wallet connection issues
 */
export const getWalletErrorMessage = (error: Error): string => {
  const message = error.message.toLowerCase();
  
  if (message.includes("metamask extension not found")) {
    return "MetaMask not found. Please install the MetaMask extension and refresh the page.";
  }
  
  if (message.includes("user rejected")) {
    return "Connection was rejected. Please try again.";
  }
  
  if (message.includes("already processing")) {
    return "Connection already in progress. Please wait.";
  }
  
  if (message.includes("failed to connect")) {
    return "Failed to connect to wallet. Please try again.";
  }
  
  if (message.includes("no provider")) {
    return "No wallet provider found. Please install a compatible wallet extension.";
  }
  
  return "Connection failed. Please try again.";
};
