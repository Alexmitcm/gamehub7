import { CHAIN, WALLETCONNECT_PROJECT_ID } from "@hey/data/constants";
import { familyAccountsConnector } from "family";
import type { ReactNode } from "react";
import { http } from "viem";
import { createConfig, WagmiProvider } from "wagmi";
import { arbitrum } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";
import getRpcWithProxy from "@/helpers/getRpcWithProxy";

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
        message.includes("core/history"))
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
      "msg" in message &&
      message.context === "core/history" &&
      message.msg === "Restore will override. history"
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
      message.includes("history restoration")
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
          logData.context === "core/history" &&
          logData.msg === "Restore will override. history"
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
          logData.context === "core/history" &&
          logData.msg === "Restore will override. history"
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
          logData.context === "core/history" &&
          logData.msg === "Restore will override. history"
        ) {
          return;
        }
        return originalAppendToLogs.apply(window, args);
      };
    }
  }
};

// Apply warning suppression
suppressWagmiWarnings();

// Note: MetaMask availability check and WalletConnect connectivity testing are available but not used in this simplified version

// Note: Advanced connector initialization with connectivity testing is available but not used in this simplified version

// Note: Async connector initialization is available but not used in this simplified version

interface Web3ProviderProps {
  children: ReactNode;
}

const Web3Provider = ({ children }: Web3ProviderProps) => {
  const config = createConfig({
    batch: {
      multicall: true
    },
    chains: [CHAIN, arbitrum],
    connectors: [
      // Family connector
      familyAccountsConnector(),
      // WalletConnect connector (for mobile wallets)
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
        projectId: WALLETCONNECT_PROJECT_ID
      }),
      // Injected connector for MetaMask
      injected({
        shimDisconnect: true,
        target: "metaMask"
      }),
      // Injected connector for Brave Wallet
      injected({
        shimDisconnect: true,
        target: "braveWallet"
      }),
      // Injected connector for Coinbase Wallet
      injected({
        shimDisconnect: true,
        target: "coinbaseWallet"
      }),
      // Injected connector for other browser wallets (generic)
      injected({
        shimDisconnect: true
      })
    ],
    ssr: false,
    transports: {
      [CHAIN.id]: getRpcWithProxy(),
      [arbitrum.id]: http("https://arb1.arbitrum.io/rpc", {
        retryCount: 3,
        retryDelay: 1000,
        timeout: 30000
      })
    }
  });

  return <WagmiProvider config={config}>{children}</WagmiProvider>;
};

export default Web3Provider;
