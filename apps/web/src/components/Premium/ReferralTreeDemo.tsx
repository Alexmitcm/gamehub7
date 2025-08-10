import { useState } from "react";
import ReferralTreeGraph from "@/components/ReferralTreeGraph";
import cn from "../../helpers/cn";

interface ReferralTreeDemoProps {
  className?: string;
}

export default function ReferralTreeDemo({ className }: ReferralTreeDemoProps) {
  const [walletAddress, setWalletAddress] = useState("");
  const [maxDepth, setMaxDepth] = useState(5);
  const [isDemoMode, setIsDemoMode] = useState(true);

  // Demo wallet address for testing
  const demoWallet = "0x1234567890123456789012345678901234567890";

  const handleWalletChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWalletAddress(e.target.value);
    setIsDemoMode(false);
  };

  const handleDepthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMaxDepth(Number.parseInt(e.target.value, 10));
  };

  const handleDemoMode = () => {
    setIsDemoMode(true);
    setWalletAddress("");
  };

  const currentWallet = isDemoMode ? demoWallet : walletAddress;

  return (
    <div className={cn("space-y-6", className)}>
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-bold text-2xl text-gray-900">
          Referral Tree System
        </h2>
        <p className="mb-6 text-gray-600">
          Visualize your referral network structure from the on-chain referral
          contract. The tree shows the binary hierarchy of referrals with
          real-time balance and point data.
        </p>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                checked={isDemoMode}
                className="h-4 w-4 text-blue-600"
                id="demo-mode"
                onChange={handleDemoMode}
                type="radio"
              />
              <label
                className="font-medium text-gray-700 text-sm"
                htmlFor="demo-mode"
              >
                Demo Mode
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                checked={!isDemoMode}
                className="h-4 w-4 text-blue-600"
                id="custom-mode"
                onChange={() => setIsDemoMode(false)}
                type="radio"
              />
              <label
                className="font-medium text-gray-700 text-sm"
                htmlFor="custom-mode"
              >
                Custom Wallet
              </label>
            </div>
          </div>

          {!isDemoMode && (
            <div>
              <label
                className="mb-2 block font-medium text-gray-700 text-sm"
                htmlFor="wallet-input"
              >
                Wallet Address
              </label>
              <input
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                id="wallet-input"
                onChange={handleWalletChange}
                placeholder="Enter wallet address (0x...)"
                type="text"
                value={walletAddress}
              />
            </div>
          )}

          <div>
            <label
              className="mb-2 block font-medium text-gray-700 text-sm"
              htmlFor="depth-select"
            >
              Max Tree Depth
            </label>
            <select
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              id="depth-select"
              onChange={handleDepthChange}
              value={maxDepth}
            >
              <option value={3}>3 levels</option>
              <option value={4}>4 levels</option>
              <option value={5}>5 levels</option>
              <option value={6}>6 levels</option>
              <option value={7}>7 levels</option>
            </select>
          </div>
        </div>

        {isDemoMode && (
          <div className="mt-4 rounded-lg bg-blue-50 p-4">
            <p className="text-blue-800 text-sm">
              <strong>Demo Mode:</strong> Using sample wallet address for
              demonstration. In a real scenario, this would show the actual
              referral tree for the connected wallet.
            </p>
          </div>
        )}
      </div>

      {currentWallet && (
        <ReferralTreeGraph maxDepth={maxDepth} walletAddress={currentWallet} />
      )}

      <div className="rounded-xl border bg-gray-50 p-6">
        <h3 className="mb-3 font-semibold text-gray-900 text-lg">Features</h3>
        <ul className="space-y-2 text-gray-600 text-sm">
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500" />
            <span>Real-time data from Arbitrum referral contract</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500" />
            <span>
              Binary tree visualization with parent-child relationships
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500" />
            <span>Display balance and points for each node</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500" />
            <span>Configurable depth limit (up to 10 levels)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500" />
            <span>Click nodes to copy wallet addresses</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500" />
            <span>Ready for reward calculation integration</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
