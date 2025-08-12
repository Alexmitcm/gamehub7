import { WALLETCONNECT_PROJECT_ID } from "@hey/data/constants";
import { familyAccountsConnector } from "family";
import { useMemo } from "react";
import { http } from "viem";
import { createConfig } from "wagmi";
import { arbitrum } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";
import { clearWagmiStorage } from "@/helpers/clearWagmiStorage";

// Clear any existing Wagmi storage to prevent conflicts immediately when module loads
clearWagmiStorage();

export const useAdminWagmiConfig = () => {
  return useMemo(() => {
    const connectors = [
      familyAccountsConnector(),
      walletConnect({ projectId: WALLETCONNECT_PROJECT_ID }),
      injected()
    ];

    return createConfig({
      chains: [arbitrum], // Only Arbitrum One for admin panel
      connectors,
      ssr: false,
      transports: {
        [arbitrum.id]: http("https://arb1.arbitrum.io/rpc") // Public Arbitrum RPC
      }
    });
  }, []);
};
