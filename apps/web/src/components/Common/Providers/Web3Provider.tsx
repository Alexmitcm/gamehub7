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
    metadata: {
      description: "Decentralized social media platform",
      icons: ["https://hey.xyz/favicon.ico"],
      name: "Hey Social",
      url:
        typeof window !== "undefined"
          ? window.location.origin
          : "https://hey.xyz"
    },
    projectId: WALLETCONNECT_PROJECT_ID,
    showQrModal: true
  }),
  injected({
    shimDisconnect: true,
    target: "metaMask"
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
