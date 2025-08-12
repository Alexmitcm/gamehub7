import {
  CHAIN,
  IS_MAINNET,
  WALLETCONNECT_PROJECT_ID
} from "@hey/data/constants";
import { familyAccountsConnector } from "family";
import { useMemo } from "react";
import { http } from "viem";
import { createConfig } from "wagmi";
import { arbitrum } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";
import { clearWagmiStorage } from "@/helpers/clearWagmiStorage";
import getRpc from "@/helpers/getRpc";

// Clear any existing Wagmi storage to prevent conflicts immediately when module loads
clearWagmiStorage();

export const useWagmiConfig = () => {
  return useMemo(() => {
    const connectors = [
      familyAccountsConnector(),
      walletConnect({ projectId: WALLETCONNECT_PROJECT_ID }),
      injected()
    ];

    return createConfig({
      chains: [CHAIN, arbitrum],
      connectors,
      ssr: false,
      transports: {
        [CHAIN.id]: getRpc({ mainnet: IS_MAINNET }),
        [arbitrum.id]: http("https://arb1.arbitrum.io/rpc")
      }
    });
  }, []);
};
