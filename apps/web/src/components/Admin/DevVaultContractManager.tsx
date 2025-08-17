import { useState } from "react";
import { useWriteContract } from "wagmi";
import { toast } from "sonner";
import { CONTRACT_ADDRESSES, ROLES } from "@/lib/contracts";
import devAbi from "@/abi/dev.json";

const DevVaultContractManager = () => {
  const { writeContract } = useWriteContract();

  // State for withdraw funds
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [isWithdrawLoading, setIsWithdrawLoading] = useState(false);
  const [showWithdrawConfirmation, setShowWithdrawConfirmation] = useState(false);

  // State for access control
  const [selectedRole, setSelectedRole] = useState<string>(ROLES.DEFAULT_ADMIN_ROLE);
  const [targetAddress, setTargetAddress] = useState("");
  const [isRoleActionLoading, setIsRoleActionLoading] = useState(false);

  // Withdraw Funds Function
  const handleWithdraw = () => {
    if (!writeContract) {
      toast.error("Wallet not connected");
      return;
    }

    if (!withdrawAddress || !/^0x[a-fA-F0-9]{40}$/.test(withdrawAddress)) {
      toast.error("Please enter a valid destination address");
      return;
    }

    setIsWithdrawLoading(true);
    writeContract({
      address: CONTRACT_ADDRESSES.DEV_VAULT,
      abi: devAbi,
      functionName: "withdraw",
      args: [withdrawAddress]
    });
    toast.success("Withdraw transaction submitted");
    setWithdrawAddress("");
    setShowWithdrawConfirmation(false);
    setIsWithdrawLoading(false);
  };

  // Access Control Functions
  const handleGrantRole = () => {
    if (!writeContract) {
      toast.error("Wallet not connected");
      return;
    }

    if (!targetAddress || !/^0x[a-fA-F0-9]{40}$/.test(targetAddress)) {
      toast.error("Please enter a valid target address");
      return;
    }

    setIsRoleActionLoading(true);
    writeContract({
      address: CONTRACT_ADDRESSES.DEV_VAULT,
      abi: devAbi,
      functionName: "grantRole",
      args: [selectedRole, targetAddress]
    });
    toast.success("Role granted successfully");
    setTargetAddress("");
    setIsRoleActionLoading(false);
  };

  const handleRevokeRole = () => {
    if (!writeContract) {
      toast.error("Wallet not connected");
      return;
    }

    if (!targetAddress || !/^0x[a-fA-F0-9]{40}$/.test(targetAddress)) {
      toast.error("Please enter a valid target address");
      return;
    }

    setIsRoleActionLoading(true);
    writeContract({
      address: CONTRACT_ADDRESSES.DEV_VAULT,
      abi: devAbi,
      functionName: "revokeRole",
      args: [selectedRole, targetAddress]
    });
    toast.success("Role revoked successfully");
    setTargetAddress("");
    setIsRoleActionLoading(false);
  };

  return (
    <div className="space-y-8">
      {/* Withdraw Funds Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Withdraw Funds (Critical Action)
        </h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="withdraw-address" className="block text-sm font-medium text-gray-700 mb-2">
              Destination Address
            </label>
            <div className="flex gap-2">
              <input
                id="withdraw-address"
                type="text"
                value={withdrawAddress}
                onChange={(e) => setWithdrawAddress(e.target.value)}
                placeholder="0x..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <button
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                onClick={() => setShowWithdrawConfirmation(true)}
                disabled={isWithdrawLoading}
              >
                {isWithdrawLoading ? "Processing..." : "Withdraw All Funds"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Access Control Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Access Control
        </h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="role-select" className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              id="role-select"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={ROLES.DEFAULT_ADMIN_ROLE}>Default Admin Role</option>
              <option value={ROLES.KEEPER_ROLE}>Keeper Role</option>
            </select>
          </div>
          <div>
            <label htmlFor="target-address" className="block text-sm font-medium text-gray-700 mb-2">
              Target Address
            </label>
            <input
              id="target-address"
              type="text"
              value={targetAddress}
              onChange={(e) => setTargetAddress(e.target.value)}
              placeholder="0x..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <button
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              onClick={handleGrantRole}
              disabled={isRoleActionLoading}
            >
              {isRoleActionLoading ? "Processing..." : "Grant Role"}
            </button>
            <button
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              onClick={handleRevokeRole}
              disabled={isRoleActionLoading}
            >
              {isRoleActionLoading ? "Processing..." : "Revoke Role"}
            </button>
          </div>
        </div>
      </div>

      {/* Withdraw Confirmation Modal */}
      {showWithdrawConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirm Withdraw
            </h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to withdraw all funds to{" "}
              <code className="bg-gray-100 px-2 py-1 rounded">
                {withdrawAddress.slice(0, 6)}...{withdrawAddress.slice(-4)}
              </code>
              ? This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                onClick={handleWithdraw}
                disabled={isWithdrawLoading}
              >
                {isWithdrawLoading ? "Processing..." : "Confirm Withdraw"}
              </button>
              <button
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
                onClick={() => setShowWithdrawConfirmation(false)}
                disabled={isWithdrawLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DevVaultContractManager; 