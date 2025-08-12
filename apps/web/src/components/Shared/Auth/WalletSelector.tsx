import { KeyIcon } from "@heroicons/react/24/outline";
import type { FC } from "react";
import { Link } from "react-router";
import type { Connector } from "wagmi";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import cn from "@/helpers/cn";
import { handleError } from "@/helpers/errorHandler";
import getWalletDetails from "@/helpers/getWalletDetails";

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
        allowedConnectors.indexOf(a.id) - allowedConnectors.indexOf(b.id)
    );

  const handleConnect = async (connector: Connector) => {
    try {
      await connectAsync({ connector });
    } catch (error: any) {
      handleError(error, "Wallet Connection");
    }
  };

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
      {filteredConnectors.map((connector: any) => {
        const walletDetails = getWalletDetails(connector.id);
        const isMetaMask = connector.id === "injected";

        return (
          <button
            className={cn(
              {
                "hover:bg-gray-100 dark:hover:bg-gray-700":
                  connector.id !== activeConnector?.id
              },
              "flex w-full items-center justify-between space-x-2.5 overflow-hidden rounded-xl border border-gray-200 px-4 py-3 outline-hidden dark:border-gray-700"
            )}
            disabled={connector.id === activeConnector?.id || isPending}
            key={connector.id}
            onClick={() => handleConnect(connector)}
            type="button"
          >
            <div className="flex flex-col items-start">
              <span>{walletDetails.name}</span>
              {isMetaMask && (
                <span className="text-gray-500 text-xs">
                  Make sure MetaMask is installed
                </span>
              )}
            </div>
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
