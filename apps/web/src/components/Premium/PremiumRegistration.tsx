import { ArrowsRightLeftIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { Button, Spinner } from "@/components/Shared/UI";
import useHandleWrongNetwork from "@/hooks/useHandleWrongNetwork";
import { usePremiumRegistration } from "@/hooks/usePremiumRegistration";

const PremiumRegistration = () => {
  const [referrerAddress, setReferrerAddress] = useState("");

  const {
    // State
    error,
    isLoading,
    isWrongNetwork,
    referrerStatus,
    usdtBalance,
    isConnected,
    address,

    // Functions
    validateReferrer,
    initiateRegistration
  } = usePremiumRegistration();

  const handleWrongNetwork = useHandleWrongNetwork();

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

  // Check if registration button should be disabled
  const isButtonDisabled =
    isLoading ||
    isWrongNetwork ||
    !referrerStatus.isValid ||
    Number.parseFloat(usdtBalance) < 200 ||
    !isConnected ||
    !referrerAddress.trim();

  // Get border color based on validation status
  const getBorderColor = () => {
    if (referrerStatus.isLoading) return "border-gray-300";
    if (referrerStatus.isValid) return "border-green-500";
    if (referrerStatus.message && !referrerStatus.isValid)
      return "border-red-500";
    return "border-gray-300";
  };

  // Network error state
  if (isWrongNetwork) {
    return (
      <div className="w-full max-w-md space-y-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-3">
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
              <h3 className="font-medium text-red-900">Wrong Network</h3>
              <p className="text-red-700 text-sm">
                Please switch to Arbitrum One to register for Hey Pro.
              </p>
            </div>
          </div>
          <Button
            className="mt-3 w-full"
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

  // Not connected state
  if (!isConnected) {
    return (
      <div className="w-full max-w-md space-y-6">
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex items-center gap-3">
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
                Wallet Not Connected
              </h3>
              <p className="text-sm text-yellow-700">
                Please connect your wallet to register for Hey Pro.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-6">
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
          {referrerStatus.message && (
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
            className={`h-2 w-2 rounded-full ${isWrongNetwork ? "bg-red-500" : "bg-green-500"}`}
          />
          <span
            className={`text-sm ${isWrongNetwork ? "text-red-700" : "text-green-700"}`}
          >
            {isWrongNetwork ? "Wrong Network" : "Connected to Arbitrum One"}
          </span>
        </div>
        <p className="mt-1 text-green-600 text-xs">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </p>
        {isWrongNetwork && (
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
