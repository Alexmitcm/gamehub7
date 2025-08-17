import { useState } from "react";
import { useWriteContract } from "wagmi";
import { toast } from "sonner";
import { CONTRACT_ADDRESSES, ROLES } from "@/lib/contracts";
import mainnodeAbi from "@/abi/mainnode.json";

const MainNodeContractManager = () => {
  const { writeContract } = useWriteContract();

  // State for reward management
  const [isRewardReferralLoading, setIsRewardReferralLoading] = useState(false);
  const [isClaimRewardLoading, setIsClaimRewardLoading] = useState(false);

  // State for system configuration
  const [partnerAddress, setPartnerAddress] = useState("");
  const [referralAddress, setReferralAddress] = useState("");
  const [isSetPartnerLoading, setIsSetPartnerLoading] = useState(false);
  const [isSetReferralLoading, setIsSetReferralLoading] = useState(false);

  // State for access control
  const [selectedRole, setSelectedRole] = useState<string>(ROLES.DEFAULT_ADMIN_ROLE);
  const [targetAddress, setTargetAddress] = useState("");
  const [isRoleActionLoading, setIsRoleActionLoading] = useState(false);

  // Reward Management Functions
  const handleRewardReferral = () => {
    if (!writeContract) {
      toast.error("Wallet not connected");
      return;
    }

    setIsRewardReferralLoading(true);
    writeContract({
      address: CONTRACT_ADDRESSES.MAIN_NODE,
      abi: mainnodeAbi,
      functionName: "rewardReferral"
    });
    toast.success("Reward referral transaction submitted");
    setIsRewardReferralLoading(false);
  };

  const handleClaimReward = () => {
    if (!writeContract) {
      toast.error("Wallet not connected");
      return;
    }

    setIsClaimRewardLoading(true);
    writeContract({
      address: CONTRACT_ADDRESSES.MAIN_NODE,
      abi: mainnodeAbi,
      functionName: "claimReward"
    });
    toast.success("Claim reward transaction submitted");
    setIsClaimRewardLoading(false);
  };

  // System Configuration Functions
  const handleSetPartner = () => {
    if (!writeContract) {
      toast.error("Wallet not connected");
      return;
    }

    if (!partnerAddress || !/^0x[a-fA-F0-9]{40}$/.test(partnerAddress)) {
      toast.error("Please enter a valid partner address");
      return;
    }

    setIsSetPartnerLoading(true);
    writeContract({
      address: CONTRACT_ADDRESSES.MAIN_NODE,
      abi: mainnodeAbi,
      functionName: "setPartner",
      args: [partnerAddress]
    });
    toast.success("Partner address updated successfully");
    setPartnerAddress("");
    setIsSetPartnerLoading(false);
  };

  const handleSetReferral = () => {
    if (!writeContract) {
      toast.error("Wallet not connected");
      return;
    }

    if (!referralAddress || !/^0x[a-fA-F0-9]{40}$/.test(referralAddress)) {
      toast.error("Please enter a valid referral address");
      return;
    }

    setIsSetReferralLoading(true);
    writeContract({
      address: CONTRACT_ADDRESSES.MAIN_NODE,
      abi: mainnodeAbi,
      functionName: "setReferral",
      args: [referralAddress]
    });
    toast.success("Referral address updated successfully");
    setReferralAddress("");
    setIsSetReferralLoading(false);
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
      address: CONTRACT_ADDRESSES.MAIN_NODE,
      abi: mainnodeAbi,
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
      address: CONTRACT_ADDRESSES.MAIN_NODE,
      abi: mainnodeAbi,
      functionName: "revokeRole",
      args: [selectedRole, targetAddress]
    });
    toast.success("Role revoked successfully");
    setTargetAddress("");
    setIsRoleActionLoading(false);
  };

  const handleRenounceRole = () => {
    if (!writeContract) {
      toast.error("Wallet not connected");
      return;
    }

    setIsRoleActionLoading(true);
    writeContract({
      address: CONTRACT_ADDRESSES.MAIN_NODE,
      abi: mainnodeAbi,
      functionName: "renounceRole",
      args: [selectedRole]
    });
    toast.success("Role renounced successfully");
    setIsRoleActionLoading(false);
  };

  return (
    <div className="space-y-8">
      {/* Reward Management Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Reward Management
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
            onClick={handleRewardReferral}
            disabled={isRewardReferralLoading}
          >
            {isRewardReferralLoading ? "Processing..." : "Reward Referral"}
          </button>
          <button
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
            onClick={handleClaimReward}
            disabled={isClaimRewardLoading}
          >
            {isClaimRewardLoading ? "Processing..." : "Claim Reward"}
          </button>
        </div>
      </div>

      {/* System Configuration Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          System Configuration
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Partner Address
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={partnerAddress}
                onChange={(e) => setPartnerAddress(e.target.value)}
                placeholder="0x..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                onClick={handleSetPartner}
                disabled={isSetPartnerLoading}
              >
                {isSetPartnerLoading ? "Setting..." : "Set Partner"}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Referral Address
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={referralAddress}
                onChange={(e) => setReferralAddress(e.target.value)}
                placeholder="0x..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                onClick={handleSetReferral}
                disabled={isSetReferralLoading}
              >
                {isSetReferralLoading ? "Setting..." : "Set Referral"}
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={ROLES.DEFAULT_ADMIN_ROLE}>Default Admin Role</option>
              <option value={ROLES.KEEPER_ROLE}>Keeper Role</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Address
            </label>
            <input
              type="text"
              value={targetAddress}
              onChange={(e) => setTargetAddress(e.target.value)}
              placeholder="0x..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
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
            <button
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              onClick={handleRenounceRole}
              disabled={isRoleActionLoading}
            >
              {isRoleActionLoading ? "Processing..." : "Renounce Role"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainNodeContractManager; 