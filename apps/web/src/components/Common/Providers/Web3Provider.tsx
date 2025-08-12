import {
  CHAIN,
  IS_MAINNET,
  WALLETCONNECT_PROJECT_ID
} from "@hey/data/constants";
import { familyAccountsConnector } from "family";
import type { ReactNode } from "react";
import { http } from "viem";
import { createConfig, WagmiProvider } from "wagmi";
import { arbitrum } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";
import getRpc from "@/helpers/getRpc";

// Enhanced connector configuration with better error handling
const connectors = [
  familyAccountsConnector(),
  walletConnect({
    projectId: WALLETCONNECT_PROJECT_ID,
    metadata: {
      name: "Hey Social",
      description: "Decentralized social media platform",
      url:
        typeof window !== "undefined"
          ? window.location.origin
          : "https://hey.xyz",
      icons: ["https://hey.xyz/favicon.ico"]
    }
  }),
  injected({
    target: "metaMask",
    shimDisconnect: true
  })
];

const config = createConfig({
  chains: [CHAIN, arbitrum],
  connectors,
  transports: {
    [CHAIN.id]: getRpc({ mainnet: IS_MAINNET }),
    [arbitrum.id]: http("https://arb1.arbitrum.io/rpc")
  }
});

interface Web3ProviderProps {
  children: ReactNode;
}

const Web3Provider = ({ children }: Web3ProviderProps) => {
  return <WagmiProvider config={config}>{children}</WagmiProvider>;
};

export default Web3Provider;
