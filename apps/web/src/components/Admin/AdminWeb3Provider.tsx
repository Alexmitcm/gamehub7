import { familyAccountsConnector } from "family";
import type { ReactNode } from "react";
import { http } from "viem";
import { createConfig, WagmiProvider } from "wagmi";
import { arbitrum } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";
import { WALLETCONNECT_PROJECT_ID } from "@hey/data/constants";

// Admin panel specific configuration for Arbitrum One
const connectors = [
  familyAccountsConnector(),
  walletConnect({ projectId: WALLETCONNECT_PROJECT_ID }),
  injected()
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