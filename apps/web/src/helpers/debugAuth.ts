import {
  hydrateAuthTokens,
  hydrateBackendTokens
} from "@/store/persisted/useAuthStore";
import clearLocalStorage from "./clearLocalStorage";

/**
 * Utility to debug authentication state and clear problematic tokens
 */
export const debugAuthState = () => {
  console.log("🔍 Debugging authentication state...");

  // Check current auth state
  const { accessToken } = hydrateAuthTokens();
  const { backendToken, user } = hydrateBackendTokens();

  console.log("🔍 Current auth state:", {
    hasBackendToken: !!backendToken,
    hasLensToken: !!accessToken,
    hasUser: !!user,
    lensTokenLength: accessToken?.length || 0,
    userWallet: user?.walletAddress
  });

  // Check if Lens token is expired
  if (accessToken) {
    try {
      const tokenParts = accessToken.split(".");
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        const isExpired = payload.exp && payload.exp < currentTime;

        console.log("🔍 Lens token analysis:", {
          expiresAt: payload.exp
            ? new Date(payload.exp * 1000).toISOString()
            : "No expiration",
          isExpired,
          issuedAt: new Date(payload.iat * 1000).toISOString(),
          subject: payload.sub,
          timeUntilExpiry: payload.exp
            ? payload.exp - currentTime
            : "No expiration"
        });

        if (isExpired) {
          console.log(
            "🔍 Lens token is expired, clearing authentication state"
          );
          clearLocalStorage();
          return true;
        }
      }
    } catch (error) {
      console.error("🔍 Error analyzing Lens token:", error);
      console.log("🔍 Clearing invalid token");
      clearLocalStorage();
      return true;
    }
  }

  return false;
};

/**
 * Clear all authentication data and reload the page
 */
export const clearAuthAndReload = () => {
  console.log("🧹 Clearing authentication and reloading...");
  clearLocalStorage();
  window.location.reload();
};

/**
 * Check if there are any authentication issues and fix them
 */
export const checkAndFixAuthIssues = () => {
  const wasCleared = debugAuthState();

  if (wasCleared) {
    console.log(
      "🔧 Authentication issues detected and cleared. Please refresh the page."
    );
    return true;
  }

  return false;
};

/**
 * Debug Web3Provider state and storage
 */
export const debugWeb3State = () => {
  console.log("🔍 Debugging Web3Provider state...");

  // Check for Wagmi-related storage
  const wagmiStorage = localStorage.getItem("wagmi.wallet");
  const wagmiConnected = localStorage.getItem("wagmi.connected");
  const wagmiAccount = localStorage.getItem("wagmi.account");
  const wagmiChainId = localStorage.getItem("wagmi.chainId");

  console.log("🔍 Wagmi storage state:", {
    accountData: wagmiAccount ? JSON.parse(wagmiAccount) : null,
    chainIdData: wagmiChainId ? JSON.parse(wagmiChainId) : null,
    connectedData: wagmiConnected ? JSON.parse(wagmiConnected) : null,
    hasAccountStorage: !!wagmiAccount,
    hasChainIdStorage: !!wagmiChainId,
    hasConnectedStorage: !!wagmiConnected,
    hasWalletStorage: !!wagmiStorage,
    walletData: wagmiStorage ? JSON.parse(wagmiStorage) : null
  });

  // Check for family connector storage
  const familyStorage = localStorage.getItem("family-accounts");
  console.log("🔍 Family connector storage:", {
    familyData: familyStorage ? JSON.parse(familyStorage) : null,
    hasFamilyStorage: !!familyStorage
  });

  // Check for wallet connection state
  const walletConnectStorage = localStorage.getItem("walletconnect");
  console.log("🔍 WalletConnect storage:", {
    hasWalletConnectStorage: !!walletConnectStorage,
    walletConnectData: walletConnectStorage
      ? JSON.parse(walletConnectStorage)
      : null
  });

  // Check if there are any conflicting history entries
  const allKeys = Object.keys(localStorage);
  const historyKeys = allKeys.filter(
    (key) =>
      key.includes("history") ||
      key.includes("wagmi") ||
      key.includes("family") ||
      key.includes("walletconnect")
  );

  console.log("🔍 All history-related storage keys:", historyKeys);

  // Check for potential conflicts
  const hasMultipleWallets = wagmiStorage && familyStorage;
  const hasConflictingConnections = wagmiConnected && walletConnectStorage;

  console.log("🔍 Potential conflicts:", {
    hasConflictingConnections,
    hasMultipleWallets,
    recommendations: []
  });

  if (hasMultipleWallets) {
    console.log(
      "⚠️ Multiple wallet connectors detected - this may cause history conflicts"
    );
  }

  if (hasConflictingConnections) {
    console.log(
      "⚠️ Multiple connection states detected - this may cause history conflicts"
    );
  }

  return {
    familyData: familyStorage ? JSON.parse(familyStorage) : null,
    hasConflicts: hasMultipleWallets || hasConflictingConnections,
    wagmiData: {
      account: wagmiAccount ? JSON.parse(wagmiAccount) : null,
      chainId: wagmiChainId ? JSON.parse(wagmiChainId) : null,
      connected: wagmiConnected ? JSON.parse(wagmiConnected) : null,
      wallet: wagmiStorage ? JSON.parse(wagmiStorage) : null
    },
    walletConnectData: walletConnectStorage
      ? JSON.parse(walletConnectStorage)
      : null
  };
};

/**
 * Clear all Web3-related storage
 */
export const clearWeb3Storage = () => {
  console.log("🧹 Clearing Web3 storage...");

  // Clear Wagmi storage
  localStorage.removeItem("wagmi.wallet");
  localStorage.removeItem("wagmi.connected");
  localStorage.removeItem("wagmi.account");
  localStorage.removeItem("wagmi.chainId");

  // Clear family connector storage
  localStorage.removeItem("family-accounts");

  // Clear WalletConnect storage
  localStorage.removeItem("walletconnect");

  // Clear any other Web3-related storage
  const allKeys = Object.keys(localStorage);
  allKeys.forEach((key) => {
    if (
      key.includes("wagmi") ||
      key.includes("family") ||
      key.includes("walletconnect")
    ) {
      localStorage.removeItem(key);
    }
  });

  console.log("🧹 Web3 storage cleared.");
  return true;
};

/**
 * Prevent Web3 history conflicts by cleaning up conflicting storage entries
 */
export const preventWeb3Conflicts = () => {
  console.log("🔧 Preventing Web3 conflicts...");

  const wagmiStorage = localStorage.getItem("wagmi.wallet");
  const familyStorage = localStorage.getItem("family-accounts");
  const wagmiConnected = localStorage.getItem("wagmi.connected");

  // If both family and wagmi storage exist, prefer family connector
  if (wagmiStorage && familyStorage) {
    console.log(
      "🔧 Multiple wallet connectors detected, clearing Wagmi storage"
    );
    localStorage.removeItem("wagmi.wallet");
    localStorage.removeItem("wagmi.connected");
    localStorage.removeItem("wagmi.account");
    localStorage.removeItem("wagmi.chainId");
  }

  // Clear any stale connection states
  if (wagmiConnected) {
    try {
      const connectedData = JSON.parse(wagmiConnected);
      if (connectedData && connectedData.connected === false) {
        console.log("🔧 Clearing stale disconnected state");
        localStorage.removeItem("wagmi.connected");
      }
    } catch {
      console.log("🔧 Clearing invalid connection state");
      localStorage.removeItem("wagmi.connected");
    }
  }

  // Clear any WalletConnect storage if not actively connected
  const walletConnectStorage = localStorage.getItem("walletconnect");
  if (walletConnectStorage) {
    try {
      const wcData = JSON.parse(walletConnectStorage);
      if (!wcData || !wcData.connected) {
        console.log("🔧 Clearing inactive WalletConnect storage");
        localStorage.removeItem("walletconnect");
      }
    } catch {
      console.log("🔧 Clearing invalid WalletConnect storage");
      localStorage.removeItem("walletconnect");
    }
  }

  console.log("🔧 Web3 conflict prevention completed");
  return true;
};

/**
 * Handle MetaMask connection issues and provide diagnostics
 */
export const debugMetaMaskIssues = () => {
  console.log("🔍 Debugging MetaMask connection issues...");

  // Check if MetaMask is installed
  const isMetaMaskInstalled =
    typeof window !== "undefined" &&
    typeof (window as any).ethereum !== "undefined" &&
    (window as any).ethereum.isMetaMask;

  console.log("🔍 MetaMask installation status:", {
    ethereumType: typeof (window as any).ethereum,
    hasEthereum: typeof (window as any).ethereum !== "undefined",
    isMetaMaskInstalled
  });

  // Check for connection errors in localStorage
  const connectionErrors = localStorage.getItem("wagmi.connection.error");
  if (connectionErrors) {
    console.log("🔍 Previous connection errors:", JSON.parse(connectionErrors));
  }

  // Check for MetaMask-specific storage
  const metaMaskStorage = localStorage.getItem("wagmi.wallet");
  if (metaMaskStorage) {
    try {
      const walletData = JSON.parse(metaMaskStorage);
      console.log("🔍 MetaMask wallet data:", walletData);
    } catch {
      console.log("🔍 Invalid MetaMask wallet data, clearing...");
      localStorage.removeItem("wagmi.wallet");
    }
  }

  // Check for network issues
  if (isMetaMaskInstalled) {
    try {
      const chainId = (window as any).ethereum.chainId;
      const accounts = (window as any).ethereum.selectedAddress;
      console.log("🔍 MetaMask current state:", {
        chainId,
        isConnected: !!accounts,
        selectedAddress: accounts
      });
    } catch (error) {
      console.log("🔍 Error accessing MetaMask state:", error);
    }
  }

  // Provide recommendations
  const recommendations = [];
  if (!isMetaMaskInstalled) {
    recommendations.push("Install MetaMask extension");
  }
  if (connectionErrors) {
    recommendations.push("Clear connection errors and try again");
  }

  console.log("🔍 Recommendations:", recommendations);

  return {
    hasConnectionErrors: !!connectionErrors,
    isMetaMaskInstalled,
    recommendations
  };
};

/**
 * Clear MetaMask connection errors and reset connection state
 */
export const clearMetaMaskErrors = () => {
  console.log("🧹 Clearing MetaMask connection errors...");

  // Clear connection errors
  localStorage.removeItem("wagmi.connection.error");
  localStorage.removeItem("wagmi.connection.error.count");

  // Clear MetaMask-specific storage
  localStorage.removeItem("wagmi.wallet");
  localStorage.removeItem("wagmi.connected");
  localStorage.removeItem("wagmi.account");

  // Clear any other MetaMask-related errors
  const allKeys = Object.keys(localStorage);
  allKeys.forEach((key) => {
    if (key.includes("error") || key.includes("metaMask")) {
      localStorage.removeItem(key);
    }
  });

  console.log("🧹 MetaMask errors cleared. Please refresh the page.");
  return true;
};
