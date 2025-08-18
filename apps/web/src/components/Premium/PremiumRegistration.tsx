import { ArrowsRightLeftIcon } from "@heroicons/react/24/outline";
import type { AccountFragment } from "@hey/indexer";
import { useState } from "react";
import { useAccount, useConnect } from "wagmi";
import SingleAccount from "@/components/Shared/Account/SingleAccount";
import { Button, Spinner } from "@/components/Shared/UI";
import useHandleWrongNetwork from "@/hooks/useHandleWrongNetwork";
import { usePremiumRegistration } from "@/hooks/usePremiumRegistration";
import { useAccountStore } from "@/store/persisted/useAccountStore";

const PremiumRegistration = () => {
  const [referrerAddress, setReferrerAddress] = useState("");
  const { address, isConnected, connector } = useAccount();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const { currentAccount } = useAccountStore();

  const {
    // State
    error,
    isLoading,
    isWrongNetwork,
    referrerStatus,
    usdtBalance,

    // Functions
    validateReferrer,
    initiateRegistration
  } = usePremiumRegistration();

  const handleWrongNetwork = useHandleWrongNetwork();

  // Check if MetaMask is available
  const isMetaMaskAvailable = () => {
    if (typeof window === "undefined") return false;

    // Check multiple ways MetaMask might be available
    const hasEthereum = !!(window as any).ethereum;
    const isMetaMask = !!(window as any).ethereum?.isMetaMask;
    const hasMetaMaskProvider = !!(window as any).ethereum?.providers?.find(
      (p: any) => p.isMetaMask
    );

    console.log("MetaMask detection:", {
      ethereum: (window as any).ethereum,
      hasEthereum,
      hasMetaMaskProvider,
      isMetaMask
    });

    return hasEthereum && (isMetaMask || hasMetaMaskProvider);
  };

  // Check if connected wallet is MetaMask
  const isMetaMaskWallet =
    connector?.name === "MetaMask" ||
    connector?.name === "Injected" ||
    isMetaMaskAvailable();

  // Check if we need to switch to Arbitrum (only for MetaMask)
  const needsArbitrumSwitch = isMetaMaskWallet && isWrongNetwork && isConnected;

  const handleReferrerChange = (value: string) => {
    setReferrerAddress(value);
    if (value.trim()) {
      validateReferrer(value.trim());
    }
  };

  const handleRegistration = () => {
    if (referrerAddress.trim()) {
      initiateRegistration(referrerAddress.trim());
    }
  };

  const handleConnectMetaMask = async () => {
    try {
      // Check if MetaMask is available first
      if (!isMetaMaskAvailable()) {
        throw new Error("MetaMask extension not found");
      }

      // Find MetaMask connector
      const metaMaskConnector = connectors.find(
        (c) => c.name === "MetaMask" || c.name === "Injected"
      );

      if (metaMaskConnector) {
        await connect({ connector: metaMaskConnector });
      } else {
        // Fallback: try to connect to any available connector
        const availableConnector = connectors.find((c) => c.ready);
        if (availableConnector) {
          await connect({ connector: availableConnector });
        } else {
          throw new Error("No wallet connectors available");
        }
      }
    } catch (error) {
      console.error("Failed to connect MetaMask:", error);
      // Don't show alert, let the UI handle the error state
    }
  };

  const handleInstallMetaMask = () => {
    window.open("https://metamask.io/download/", "_blank");
  };

  // Check if registration button should be disabled
  const isButtonDisabled =
    isLoading ||
    (isMetaMaskWallet && isWrongNetwork) ||
    !referrerStatus?.isValid ||
    Number.parseFloat(usdtBalance) < 200 ||
    !isConnected ||
    !referrerAddress.trim();

  // Get border color based on validation status
  const getBorderColor = () => {
    if (!referrerStatus) return "border-gray-300";
    if (referrerStatus.isLoading) return "border-gray-300";
    if (referrerStatus.isValid) return "border-green-500";
    if (referrerStatus.message && !referrerStatus.isValid)
      return "border-red-500";
    return "border-gray-300";
  };

  // Not connected state - show MetaMask connection
  if (!isConnected) {
    return (
      <div className="mx-auto w-full max-w-md space-y-4">
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="h-5 w-5 rounded-full bg-yellow-100 p-0.5">
              <svg
                aria-hidden="true"
                className="h-4 w-4 text-yellow-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  clipRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  fillRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-yellow-900">
                MetaMask Wallet Required
              </h3>
              <p className="text-sm text-yellow-700">
                Please connect your MetaMask wallet to register for Hey Pro.
              </p>
            </div>
          </div>

          {/* MetaMask not available - show install option */}
          {isMetaMaskAvailable() ? null : (
            <div className="mb-4 rounded-lg border border-orange-200 bg-orange-50 p-3">
              <div className="mb-2 flex items-center gap-2">
                <svg
                  aria-hidden="true"
                  className="h-4 w-4 text-orange-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    clipRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    fillRule="evenodd"
                  />
                </svg>
                <span className="font-medium text-orange-800 text-sm">
                  MetaMask Not Found
                </span>
              </div>
              <p className="mb-3 text-orange-700 text-xs">
                MetaMask extension is required for premium registration. Please
                install it first.
              </p>
              <Button
                className="w-full"
                onClick={handleInstallMetaMask}
                outline
              >
                Install MetaMask
              </Button>
            </div>
          )}

          {/* Connect MetaMask button */}
          <Button
            className="w-full"
            disabled={isConnecting || !isMetaMaskAvailable()}
            loading={isConnecting}
            onClick={handleConnectMetaMask}
          >
            {isConnecting ? (
              <div className="flex items-center gap-2">
                <Spinner className="size-4" />
                <span>Connecting...</span>
              </div>
            ) : isMetaMaskAvailable() ? (
              "Connect MetaMask Wallet"
            ) : (
              "MetaMask Not Available"
            )}
          </Button>

          {/* Help text */}
          <div className="mt-3 text-xs text-yellow-600">
            <p>• Make sure MetaMask is installed and unlocked</p>
            <p>• Refresh the page after installing MetaMask</p>
            <p>• Premium registration requires MetaMask wallet</p>
          </div>

          {/* Debug section - only show in development */}
          {process.env.NODE_ENV === "development" && (
            <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
              <h4 className="mb-2 font-medium text-gray-700 text-sm">
                Debug Info
              </h4>
              <div className="space-y-1 text-gray-600 text-xs">
                <p>
                  MetaMask Available: {isMetaMaskAvailable() ? "Yes" : "No"}
                </p>
                <p>
                  Available Connectors:{" "}
                  {connectors.filter((c) => c.ready).length}
                </p>
                <p>
                  Connector Names:{" "}
                  {connectors
                    .filter((c) => c.ready)
                    .map((c) => c.name)
                    .join(", ")}
                </p>
                <button
                  className="mt-2 rounded bg-blue-500 px-2 py-1 text-white text-xs hover:bg-blue-600"
                  onClick={() => {
                    console.log("Available connectors:", connectors);
                    console.log("Window ethereum:", (window as any).ethereum);
                  }}
                  type="button"
                >
                  Log Debug Info
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // MetaMask wallet on wrong network state
  if (needsArbitrumSwitch) {
    return (
      <div className="mx-auto w-full max-w-md space-y-4">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="h-5 w-5 rounded-full bg-red-100 p-0.5">
              <svg
                aria-hidden="true"
                className="h-4 w-4 text-red-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  clipRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  fillRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-red-900">
                Switch to Arbitrum One
              </h3>
              <p className="text-red-700 text-sm">
                Your MetaMask wallet needs to be on Arbitrum One network to
                register for Hey Pro.
              </p>
            </div>
          </div>
          <Button
            className="w-full"
            disabled={isLoading}
            onClick={handleWrongNetwork}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Spinner className="size-4" />
                <span>Switching Network...</span>
              </div>
            ) : (
              "Switch to Arbitrum One"
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-4">
      {/* Profile Display */}
      {currentAccount && (
        <SingleAccount
          account={currentAccount as AccountFragment}
          isVerified
          linkToAccount={false}
          showUserPreview={false}
        />
      )}

      {/* Registration Form */}
      <div className="space-y-4">
        {/* Referrer Input */}
        <div>
          <label
            className="mb-2 block font-medium text-gray-700 text-sm"
            htmlFor="referrer-address"
          >
            Referrer Address
          </label>
          <input
            className={`w-full rounded-lg border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-purple-500 ${getBorderColor()}`}
            disabled={isLoading}
            id="referrer-address"
            onChange={(e) => handleReferrerChange(e.target.value)}
            placeholder="0x..."
            type="text"
            value={referrerAddress}
          />

          {/* Validation Status */}
          {referrerStatus?.message && (
            <div className="mt-2 flex items-center gap-2">
              {referrerStatus.isLoading && <Spinner className="size-4" />}
              <span
                className={`text-sm ${
                  referrerStatus.isValid ? "text-green-600" : "text-red-600"
                }`}
              >
                {referrerStatus.message}
              </span>
            </div>
          )}
        </div>

        {/* USDT Balance Display */}
        <div className="rounded-lg bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-700 text-sm">USDT Balance:</span>
            <span
              className={`font-medium ${
                Number.parseFloat(usdtBalance) >= 200
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {Number.parseFloat(usdtBalance).toFixed(2)} USDT
            </span>
          </div>
          {Number.parseFloat(usdtBalance) < 200 && (
            <p className="mt-1 text-red-600 text-xs">
              Minimum required: 200 USDT
            </p>
          )}
        </div>

        {/* Registration Cost */}
        <div className="rounded-lg bg-blue-50 p-4">
          <h4 className="mb-2 font-medium text-blue-900 text-sm">
            Registration Cost
          </h4>
          <div className="space-y-1 text-blue-700 text-sm">
            <div className="flex items-center justify-between">
              <span>Registration Fee:</span>
              <span className="font-medium">200 USDT</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Network Fee:</span>
              <span className="font-medium">~$0.50 - $2.00</span>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Registration Button */}
        <Button
          className="w-full"
          disabled={isButtonDisabled}
          loading={isLoading}
          onClick={handleRegistration}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Spinner className="size-4" />
              <span>Processing Registration...</span>
            </div>
          ) : (
            "Become Premium Member"
          )}
        </Button>
      </div>

      {/* Info Section */}
      <div className="rounded-lg bg-gray-50 p-4">
        <h4 className="mb-2 font-medium text-gray-900">What happens next?</h4>
        <ul className="space-y-1 text-gray-600 text-sm">
          <li>• Approve USDT spending for the referral contract</li>
          <li>• Register in the referral program on-chain</li>
          <li>• Automatically link your first profile as premium</li>
          <li>• Unlock premium features and rewards</li>
        </ul>
      </div>

      {/* Warning */}
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
        <p className="text-sm text-yellow-800">
          <strong>Important:</strong> The profile you register with will become
          your permanent premium profile and cannot be changed later. Make sure
          you have sufficient USDT balance before proceeding.
        </p>
      </div>

      {/* Connected Wallet Info */}
      <div className="rounded-lg bg-green-50 p-4">
        <div className="flex items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full ${needsArbitrumSwitch ? "bg-red-500" : "bg-green-500"}`}
          />
          <span
            className={`text-sm ${needsArbitrumSwitch ? "text-red-700" : "text-green-700"}`}
          >
            {needsArbitrumSwitch
              ? "Wrong Network"
              : "Connected to Arbitrum One"}
          </span>
        </div>
        <p className="mt-1 text-green-600 text-xs">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </p>
        {needsArbitrumSwitch && (
          <div className="mt-2">
            <Button className="w-full" onClick={handleWrongNetwork} outline>
              <ArrowsRightLeftIcon className="mr-2 h-4 w-4" />
              Switch to Arbitrum
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PremiumRegistration;
