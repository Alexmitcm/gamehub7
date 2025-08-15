import type { FallbackTransport } from "viem";
import { fallback, http } from "viem";
import { IS_MAINNET } from "@hey/data/constants";
import { LENS_MAINNET_RPCS, LENS_TESTNET_RPCS } from "@hey/data/rpcs";

// Get API URL from environment or use default
const getApiUrl = () => {
  // Check if we're in development mode
  if (
    typeof window !== "undefined" &&
    window.location.hostname === "localhost"
  ) {
    return "http://localhost:8080";
  }

  // For production, use the Railway URL
  return "https://gamehub4-production.up.railway.app";
};

const BATCH_SIZE = 10;

const getRpcWithProxy = (): FallbackTransport => {
  // Use the API proxy endpoint instead of direct RPC calls
  const proxyRpc = `${getApiUrl()}/rpc`;
  
  // Get fallback RPCs in case proxy fails
  const fallbackRpcs = IS_MAINNET ? LENS_MAINNET_RPCS : LENS_TESTNET_RPCS;

  return fallback([
    http(proxyRpc, {
      batch: { batchSize: BATCH_SIZE },
      // Add retry logic for failed requests
      retryCount: 3,
      retryDelay: 1000,
      // Add timeout to prevent hanging requests
      timeout: 30000
    }),
    // Fallback to direct RPC endpoints if proxy fails
    ...fallbackRpcs.map(rpcUrl => 
      http(rpcUrl, {
        timeout: 30000,
        retryCount: 2,
        retryDelay: 1000
      })
    )
  ]);
};

export default getRpcWithProxy;
