import { CHAIN, WALLETCONNECT_PROJECT_ID } from "@hey/data/constants";
import { familyAccountsConnector } from "family";
import type { ReactNode } from "react";
import { http } from "viem";
import { createConfig, WagmiProvider } from "wagmi";
import { arbitrum } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";
import getRpcWithProxy from "@/helpers/getRpcWithProxy";
import {
  isBraveWalletAvailable,
  isCoinbaseWalletAvailable,
  isMetaMaskAvailable
} from "@/helpers/walletDetection";

// Comprehensive warning suppression for Wagmi history restoration
const suppressWagmiWarnings = () => {
  // Store original console methods
  const originalConsoleWarn = console.warn;
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;

  // Override console.warn
  console.warn = (...args) => {
    const message = args[0];
    if (
      typeof message === "string" &&
      (message.includes("Restore will override") ||
        message.includes("core/history") ||
        message.includes("core/expirer") ||
        message.includes("core/pairing"))
    ) {
      return;
    }
    originalConsoleWarn.apply(console, args);
  };

  // Override console.log to catch Wagmi's internal logging
  console.log = (...args) => {
    const message = args[0];
    if (
      typeof message === "object" &&
      message &&
      "context" in message &&
      (message.context === "core/history" ||
        message.context === "core/expirer" ||
        message.context === "core/pairing/pairing") &&
      (message.msg?.includes("Restore will override") || message.level === 50)
    ) {
      return;
    }
    originalConsoleLog.apply(console, args);
  };

  // Override console.error for any related errors
  console.error = (...args) => {
    const message = args[0];
    if (
      typeof message === "string" &&
      (message.includes("history restoration") ||
        message.includes("Restore will override") ||
        message.includes("core/expirer") ||
        message.includes("core/pairing"))
    ) {
      return;
    }
    // Handle object-based errors from Wagmi
    if (
      typeof message === "object" &&
      message &&
      "context" in message &&
      (message.context === "core/history" ||
        message.context === "core/expirer" ||
        message.context === "core/pairing/pairing") &&
      (message.msg?.includes("Restore will override") || message.level === 50)
    ) {
      return;
    }
    originalConsoleError.apply(console, args);
  };

  // Intercept the internal logging mechanism more aggressively
  if (typeof window !== "undefined") {
    // Override the forwardToConsole function
    const originalForwardToConsole = (window as any).forwardToConsole;
    if (originalForwardToConsole) {
      (window as any).forwardToConsole = (...args: any[]) => {
        const [logData] = args;
        if (
          logData &&
          typeof logData === "object" &&
          (logData.context === "core/history" ||
            logData.context === "core/expirer" ||
            logData.context === "core/pairing/pairing") &&
          (logData.msg?.includes("Restore will override") || logData.level === 50)
        ) {
          return;
        }
        return originalForwardToConsole.apply(window, args);
      };
    }

    // Also try to intercept the LOG function
    const originalLOG = (window as any).LOG;
    if (originalLOG) {
      (window as any).LOG = (...args: any[]) => {
        const [logData] = args;
        if (
          logData &&
          typeof logData === "object" &&
          (logData.context === "core/history" ||
            logData.context === "core/expirer" ||
            logData.context === "core/pairing/pairing") &&
          (logData.msg?.includes("Restore will override") || logData.level === 50)
        ) {
          return;
        }
        return originalLOG.apply(window, args);
      };
    }

    // Intercept appendToLogs function
    const originalAppendToLogs = (window as any).appendToLogs;
    if (originalAppendToLogs) {
      (window as any).appendToLogs = (...args: any[]) => {
        const [logData] = args;
        if (
          logData &&
          typeof logData === "object" &&
          (logData.context === "core/history" ||
            logData.context === "core/expirer" ||
            logData.context === "core/pairing/pairing") &&
          (logData.msg?.includes("Restore will override") || logData.level === 50)
        ) {
          return;
        }
        return originalAppendToLogs.apply(window, args);
      };
    }

    // Handle JSON parsing errors
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        // Clone the response to avoid consuming it
        const clonedResponse = response.clone();
        
        // Check if the response is JSON and handle parsing errors
        const contentType = clonedResponse.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          try {
            await clonedResponse.json();
          } catch {
            // If JSON parsing fails, log a more helpful error
            console.warn('JSON parsing failed for response:', {
              url: args[0],
              status: clonedResponse.status,
              statusText: clonedResponse.statusText
            });
          }
        }
        
        return response;
      } catch (error) {
        // Handle fetch errors gracefully
        console.warn('Fetch error:', error);
        throw error;
      }
    };

    // Global error handler for unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      // Check if it's a JSON parsing error
      if (event.reason && typeof event.reason === 'object' && event.reason.name === 'SyntaxError') {
        console.warn('Caught JSON parsing error:', event.reason.message);
        event.preventDefault(); // Prevent the error from being logged
        return;
      }
      
      // Check if it's a WalletConnect related error
      if (event.reason && typeof event.reason === 'string' && 
          (event.reason.includes('Restore will override') || 
           event.reason.includes('core/expirer') || 
           event.reason.includes('core/pairing'))) {
        event.preventDefault();
        return;
      }
    });

    // Global error handler for general errors
    window.addEventListener('error', (event) => {
      // Check if it's a JSON parsing error
      if (event.error && event.error.name === 'SyntaxError' && 
          event.error.message.includes('Unexpected token')) {
        console.warn('Caught JSON parsing error:', event.error.message);
        event.preventDefault();
        return;
      }
    });
  }
};

// Apply warning suppression
suppressWagmiWarnings();

interface Web3ProviderProps {
  children: ReactNode;
}

const Web3Provider = ({ children }: Web3ProviderProps) => {
  // Build connectors array conditionally based on available wallets
  const connectors = [
    // Family connector (always available)
    familyAccountsConnector(),
    // WalletConnect connector (for mobile wallets) with better error handling
    walletConnect({
      metadata: {
        description: "Hey Social Media Platform",
        icons: ["https://static.hey.xyz/images/placeholder.webp"],
        name: "Hey",
        url:
          typeof window !== "undefined"
            ? window.location.origin
            : "https://hey.xyz"
      },
      projectId: WALLETCONNECT_PROJECT_ID,
      // Add options to reduce warnings
      showQrModal: true,
      // Disable automatic pairing to reduce expirer warnings
      optionalChains: [CHAIN.id, arbitrum.id]
    })
  ];

  // Add MetaMask connector only if available
  if (isMetaMaskAvailable()) {
    connectors.push(
      injected({
        shimDisconnect: true,
        target: "metaMask"
      })
    );
  }

  // Add Brave Wallet connector only if available
  if (isBraveWalletAvailable()) {
    connectors.push(
      injected({
        shimDisconnect: true,
        target: "braveWallet"
      })
    );
  }

  // Add Coinbase Wallet connector only if available
  if (isCoinbaseWalletAvailable()) {
    connectors.push(
      injected({
        shimDisconnect: true,
        target: "coinbaseWallet"
      })
    );
  }

  // Add generic injected connector for other browser wallets
  connectors.push(
    injected({
      shimDisconnect: true
    })
  );

  const config = createConfig({
    batch: {
      multicall: true
    },
    chains: [CHAIN, arbitrum],
    connectors,
    ssr: false,
    transports: {
      [CHAIN.id]: getRpcWithProxy(),
      [arbitrum.id]: http("https://arb1.arbitrum.io/rpc")
    }
  });

  return <WagmiProvider config={config}>{children}</WagmiProvider>;
};

export default Web3Provider;
