import { CHAIN } from "@hey/data/constants";
import logger from "@hey/helpers/logger";
import { useConnections, useSwitchChain } from "wagmi";

// Arbitrum One chain ID
const ARBITRUM_ONE_CHAIN_ID = 42161;

const useHandleWrongNetwork = () => {
  const activeConnection = useConnections();
  const { switchChainAsync } = useSwitchChain();

  const isConnected = () => activeConnection[0] !== undefined;
  const isWrongNetwork = () => activeConnection[0]?.chainId !== CHAIN.id;

  // Check if connected wallet is MetaMask
  const isMetaMaskWallet = () => {
    const connector = activeConnection[0]?.connector;
    return (
      connector?.name === "MetaMask" ||
      connector?.name === "Injected" ||
      (window as any).ethereum?.isMetaMask
    );
  };

  const handleWrongNetwork = async () => {
    if (!isConnected()) {
      logger.warn("No active connection found.");
      return;
    }

    // Only switch to Arbitrum One for MetaMask wallets
    if (isMetaMaskWallet() && isWrongNetwork()) {
      try {
        await switchChainAsync({ chainId: ARBITRUM_ONE_CHAIN_ID });
      } catch (error) {
        logger.error("Failed to switch chains:", error);
      }
    }
  };

  return handleWrongNetwork;
};

export default useHandleWrongNetwork;
