import { KeyIcon } from "@heroicons/react/24/outline";
import type { FC } from "react";
import { Link } from "react-router";
import type { Connector } from "wagmi";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { toast } from "sonner";
import cn from "@/helpers/cn";
import getWalletDetails from "@/helpers/getWalletDetails";
import { 
  isMetaMaskAvailable, 
  getWalletErrorMessage 
} from "@/helpers/walletDetection";

const WalletSelector: FC = () => {
  const { connectAsync, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { connector: activeConnector } = useAccount();

  const allowedConnectors = [
    "familyAccountsProvider",
    "injected",
    "walletConnect"
  ];

  const filteredConnectors = connectors
    .filter((connector: any) => allowedConnectors.includes(connector.id))
    .sort(
      (a: Connector, b: Connector) =>
        allowedConnectors.indexOf(a.id) - allowedConnectors.indexOf(a.id)
    );

  const handleConnect = async (connector: Connector) => {
    try {
      await connectAsync({ connector });
    } catch (error) {
      // Use the utility function for better error messages
      const errorMessage = error instanceof Error 
        ? getWalletErrorMessage(error)
        : "Connection failed. Please try again.";
      
      toast.error(errorMessage);
    }
  };

  // Check if MetaMask is available for better UX
  const metaMaskAvailable = isMetaMaskAvailable();

  // Filter out MetaMask connector if not available
  const availableConnectors = filteredConnectors.filter((connector: any) => {
    if (connector.id === "injected" && !metaMaskAvailable) {
      return false;
    }
    return true;
  });

  return activeConnector?.id ? (
    <div className="space-y-2.5">
      <button
        className="flex items-center space-x-1 text-sm underline"
        onClick={() => disconnect?.()}
        type="reset"
      >
        <KeyIcon className="size-4" />
        <div>Change wallet</div>
      </button>
    </div>
  ) : (
    <div className="inline-block w-full space-y-3 overflow-hidden text-left align-middle">
      {availableConnectors.map((connector: any) => {
        const walletDetails = getWalletDetails(connector.id);
        const isConnectorDisabled = connector.id === activeConnector?.id || isPending;
        
        return (
          <button
            className={cn(
              {
                "hover:bg-gray-100 dark:hover:bg-gray-700":
                  !isConnectorDisabled
              },
              "flex w-full items-center justify-between space-x-2.5 overflow-hidden rounded-xl border border-gray-200 px-4 py-3 outline-hidden dark:border-gray-700"
            )}
            disabled={isConnectorDisabled}
            key={connector.id}
            onClick={() => handleConnect(connector)}
            type="button"
          >
            <span>{walletDetails.name}</span>
            <img
              alt={connector.id}
              className="size-6"
              draggable={false}
              height={24}
              src={walletDetails.logo}
              width={24}
            />
          </button>
        );
      })}
      
      {!metaMaskAvailable && (
        <div className="text-xs text-gray-500 text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
          MetaMask not detected. Install the{" "}
          <a 
            href="https://metamask.io/download/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            MetaMask extension
          </a>{" "}
          for the best experience.
        </div>
      )}
      
      <div className="linkify text-gray-500 text-sm">
        By connecting wallet, you agree to our{" "}
        <Link target="_blank" to="/terms">
          Terms
        </Link>{" "}
        and{" "}
        <Link target="_blank" to="/privacy">
          Policy
        </Link>
        .
      </div>
    </div>
  );
};

export default WalletSelector;
