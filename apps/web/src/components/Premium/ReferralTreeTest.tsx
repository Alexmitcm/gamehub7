import { useState } from "react";
import ReferralTreeGraph from "../ReferralTreeGraph";

export default function ReferralTreeTest() {
  const [walletAddress, setWalletAddress] = useState(
    "0x960fceed1a0ac2cc22e6e7bd6876ca527d31d268"
  );
  const [maxDepth, setMaxDepth] = useState(3);

  return (
    <div className="space-y-6 p-6">
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-semibold text-gray-900 text-xl">
          Referral Tree Test
        </h2>

        <div className="mb-4 space-y-4">
          <div>
            <label
              className="block font-medium text-gray-700 text-sm"
              htmlFor="wallet-address"
            >
              Wallet Address
            </label>
            <input
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              id="wallet-address"
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="Enter wallet address"
              type="text"
              value={walletAddress}
            />
          </div>

          <div>
            <label
              className="block font-medium text-gray-700 text-sm"
              htmlFor="max-depth"
            >
              Max Depth
            </label>
            <select
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              id="max-depth"
              onChange={(e) => setMaxDepth(Number(e.target.value))}
              value={maxDepth}
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
              <option value={5}>5</option>
            </select>
          </div>
        </div>
      </div>

      <ReferralTreeGraph
        className="min-h-96"
        maxDepth={maxDepth}
        walletAddress={walletAddress}
      />
    </div>
  );
}
