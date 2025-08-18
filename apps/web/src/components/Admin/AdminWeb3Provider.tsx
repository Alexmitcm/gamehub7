import { WALLETCONNECT_PROJECT_ID } from "@hey/data/constants";
import { familyAccountsConnector } from "family";
import type { ReactNode } from "react";
import { http } from "viem";
import { createConfig, WagmiProvider } from "wagmi";
import { arbitrum } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";

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
      message.context === "core/history" &&
      (message.msg === "Restore will override. history" || message.level === 50)
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
    // Handle object-based errors from Wagmi
    if (
      typeof message === "object" &&
      message &&
      "context" in message &&
      message.context === "core/history" &&
      (message.msg === "Restore will override. history" || message.level === 50)
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
          (logData.msg === "Restore will override. history" || logData.level === 50)
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
          (logData.msg === "Restore will override. history" || logData.level === 50)
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
          (logData.msg === "Restore will override. history" || logData.level === 50)
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

// Admin panel specific configuration for Arbitrum One
const connectors = [
  // Wrap family connector in try-catch to handle initialization errors
  (() => {
    try {
      return familyAccountsConnector();
    } catch (error) {
      console.warn("Failed to initialize family connector:", error);
      return null;
    }
  })(),
  walletConnect({ projectId: WALLETCONNECT_PROJECT_ID }),
  injected()
].filter(Boolean); // Remove null connectors

const config = createConfig({
  chains: [arbitrum], // Only Arbitrum One for admin panel
  connectors,
  transports: {
    [arbitrum.id]: http("https://arb1.arbitrum.io/rpc") // Public Arbitrum RPC
  }
});

interface AdminWeb3ProviderProps {
  children: ReactNode;
}

const AdminWeb3Provider = ({ children }: AdminWeb3ProviderProps) => {
  return <WagmiProvider config={config}>{children}</WagmiProvider>;
};

export default AdminWeb3Provider;
