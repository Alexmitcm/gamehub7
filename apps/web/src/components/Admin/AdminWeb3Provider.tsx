import { WALLETCONNECT_PROJECT_ID } from "@hey/data/constants";
import { familyAccountsConnector } from "family";
import type { ReactNode } from "react";
import { http } from "viem";
import { createConfig, WagmiProvider } from "wagmi";
import { arbitrum } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";

// Admin panel specific configuration for Arbitrum One
const connectors = [
  familyAccountsConnector(),
  walletConnect({
    metadata: {
      description: "Admin panel for Hey social media platform",
      icons: ["https://hey.xyz/favicon.ico"],
      name: "Hey Admin Panel",
      url:
        typeof window !== "undefined"
          ? window.location.origin
          : "https://hey.xyz"
    },
    // Add optional parameters for better error handling
    optionalChains: [arbitrum],
    projectId: WALLETCONNECT_PROJECT_ID,
    showQrModal: true
  }),
  injected({
    shimDisconnect: true,
    target: "metaMask"
  })
];

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
