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
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Referral Tree Test
        </h2>
        
        <div className="mb-4 space-y-4">
          <div>
            <label className="block font-medium text-gray-700 text-sm" htmlFor="wallet-address">
              Wallet Address
            </label>
            <input
              id="wallet-address"
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              className="mt-1 block border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-blue-500 px-3 py-2 rounded-md shadow-sm w-full"
              placeholder="Enter wallet address"
            />
          </div>
          
          <div>
            <label className="block font-medium text-gray-700 text-sm" htmlFor="max-depth">
              Max Depth
            </label>
            <select
              id="max-depth"
              value={maxDepth}
              onChange={(e) => setMaxDepth(Number(e.target.value))}
              className="mt-1 block border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-blue-500 px-3 py-2 rounded-md shadow-sm w-full"
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
        walletAddress={walletAddress}
        maxDepth={maxDepth}
        className="min-h-96"
      />
    </div>
  );
} 