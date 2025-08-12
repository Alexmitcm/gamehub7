import { useMemo } from "react";
import { createConfig } from "wagmi";
import { CHAIN, IS_MAINNET, WALLETCONNECT_PROJECT_ID } from "@hey/data/constants";
import { familyAccountsConnector } from "family";
import { http } from "viem";
import { arbitrum } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";
import getRpc from "@/helpers/getRpc";

export const useWagmiConfig = () => {
  return useMemo(() => {
    // Clear any existing Wagmi storage to prevent conflicts
    if (typeof window !== "undefined") {
      const keys = Object.keys(localStorage);
      const wagmiKeys = keys.filter(
        (key) =>
          key.startsWith("wagmi") ||
          key.startsWith("wc") ||
          key.includes("walletconnect")
      );
      
      // Only clear if there are conflicting keys
      if (wagmiKeys.length > 0) {
        for (const key of wagmiKeys) {
          localStorage.removeItem(key);
        }
        console.log("Cleared conflicting Wagmi storage keys:", wagmiKeys);
      }
    }

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
