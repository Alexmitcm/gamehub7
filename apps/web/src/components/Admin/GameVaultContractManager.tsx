import { useState } from "react";
import { useWriteContract } from "wagmi";
import { toast } from "sonner";
import { 
  BanknotesIcon,
  UserGroupIcon,
  PlusIcon,
  TrashIcon,
  PlayIcon
} from "@heroicons/react/24/outline";
import { Card, CardHeader, Button, Modal } from "@/components/Shared/UI";
import gameVaultAbi from "@/abi/gameVault.json";
import { CONTRACT_ADDRESSES } from "@/lib/contracts";

// Contract addresses
const GAME_VAULT_CONTRACT_ADDRESS = CONTRACT_ADDRESSES.GAME_VAULT;

interface PlayerReward {
  player: string;
  balance: string;
}

const GameVaultContractManager = () => {
  const [showBatchRewardModal, setShowBatchRewardModal] = useState(false);
  const [showBatchClaimModal, setShowBatchClaimModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<string>("");
  const [playerRewards, setPlayerRewards] = useState<PlayerReward[]>([]);
  const [batchClaimAddresses, setBatchClaimAddresses] = useState<string[]>([]);
  const [newPlayerAddress, setNewPlayerAddress] = useState("");
  const [newPlayerBalance, setNewPlayerBalance] = useState("");

  const { writeContract, isPending } = useWriteContract();

  const addPlayerReward = () => {
    if (!newPlayerAddress || !newPlayerBalance) {
      toast.error("Please enter both player address and balance");
      return;
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(newPlayerAddress)) {
      toast.error("Please enter a valid Ethereum address");
      return;
    }

    setPlayerRewards(prev => [...prev, {
      player: newPlayerAddress,
      balance: newPlayerBalance
    }]);
    setNewPlayerAddress("");
    setNewPlayerBalance("");
  };

  const removePlayerReward = (index: number) => {
    setPlayerRewards(prev => prev.filter((_, i) => i !== index));
  };

  const handleBatchRewardSubmit = () => {
    if (playerRewards.length === 0) {
      toast.error("Please add at least one player reward");
      return;
    }

    const playerInfoArray = playerRewards.map(reward => ({
      player: reward.player as `0x${string}`,
      balance: BigInt(reward.balance)
    }));

    writeContract({
      address: GAME_VAULT_CONTRACT_ADDRESS as `0x${string}`,
      abi: gameVaultAbi,
      functionName: "playersReward",
      args: [playerInfoArray]
    });
    
    toast.success("Batch reward distribution submitted successfully");
    setShowBatchRewardModal(false);
    setPlayerRewards([]);
  };

  const handleBatchClaimSubmit = () => {
    if (batchClaimAddresses.length === 0) {
      toast.error("Please add at least one address to claim for");
      return;
    }

    const addressArray = batchClaimAddresses.map(addr => addr as `0x${string}`);

    writeContract({
      address: GAME_VAULT_CONTRACT_ADDRESS as `0x${string}`,
      abi: gameVaultAbi,
      functionName: "claimRewardAdminList",
      args: [addressArray]
    });
    
    toast.success("Batch claim submitted successfully");
    setShowBatchClaimModal(false);
    setBatchClaimAddresses([]);
  };

  const addClaimAddress = () => {
    if (!newPlayerAddress) {
      toast.error("Please enter a player address");
      return;
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(newPlayerAddress)) {
      toast.error("Please enter a valid Ethereum address");
      return;
    }

    setBatchClaimAddresses(prev => [...prev, newPlayerAddress]);
    setNewPlayerAddress("");
  };

  const removeClaimAddress = (index: number) => {
    setBatchClaimAddresses(prev => prev.filter((_, i) => i !== index));
  };

  const sections = [
    {
      title: "Batch Reward Distribution",
      icon: BanknotesIcon,
      description: "Distribute rewards to multiple players at once",
      action: () => setShowBatchRewardModal(true),
      actionText: "Distribute Rewards",
      color: "blue"
    },
    {
      title: "Batch Claim Rewards",
      icon: PlayIcon,
      description: "Claim rewards on behalf of multiple players",
      action: () => setShowBatchClaimModal(true),
      actionText: "Batch Claim",
      color: "green"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <BanknotesIcon className="h-6 w-6 text-green-600" />
        <h2 className="text-2xl font-bold text-gray-900">Game Vault Contract Management</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section) => {
          const Icon = section.icon;
          const colorClasses = {
            blue: "border-blue-200 bg-blue-50",
            green: "border-green-200 bg-green-50"
          };

          return (
            <Card key={section.title} className={`border-2 ${colorClasses[section.color as keyof typeof colorClasses]}`}>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Icon className="h-6 w-6 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                </div>
              </CardHeader>
              <div className="p-6">
                <p className="text-gray-600 mb-4">{section.description}</p>
                <Button
                  onClick={section.action}
                  disabled={isPending}
                  className="w-full"
                >
                  {isPending ? "Processing..." : section.actionText}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Batch Reward Distribution Modal */}
      <Modal
        show={showBatchRewardModal}
        onClose={() => setShowBatchRewardModal(false)}
        title="Batch Reward Distribution"
      >
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> This will distribute rewards to all listed players. 
              Make sure all addresses and amounts are correct before proceeding.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="player-address" className="block text-sm font-medium text-gray-700 mb-1">
                Player Address
              </label>
              <input
                id="player-address"
                type="text"
                value={newPlayerAddress}
                onChange={(e) => setNewPlayerAddress(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                placeholder="0x..."
              />
            </div>
            <div>
              <label htmlFor="player-balance" className="block text-sm font-medium text-gray-700 mb-1">
                Balance (wei)
              </label>
              <input
                id="player-balance"
                type="number"
                value={newPlayerBalance}
                onChange={(e) => setNewPlayerBalance(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                placeholder="Enter amount in wei"
              />
            </div>
          </div>

          <Button
            onClick={addPlayerReward}
            disabled={!newPlayerAddress || !newPlayerBalance}
            className="w-full"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Player Reward
          </Button>

          {playerRewards.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Players to Reward:</h4>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {playerRewards.map((reward, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                    <div className="flex-1">
                      <p className="text-sm font-mono text-gray-900">{reward.player}</p>
                      <p className="text-xs text-gray-500">{reward.balance} wei</p>
                    </div>
                    <Button
                      onClick={() => removePlayerReward(index)}
                      variant="outline"
                      size="sm"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowBatchRewardModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBatchRewardSubmit}
              disabled={isPending || playerRewards.length === 0}
            >
              {isPending ? "Distributing..." : "Distribute Rewards"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Batch Claim Modal */}
      <Modal
        show={showBatchClaimModal}
        onClose={() => setShowBatchClaimModal(false)}
        title="Batch Claim Rewards"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This will claim rewards on behalf of all listed players. 
              Make sure all addresses are correct before proceeding.
            </p>
          </div>

          <div>
            <label htmlFor="claim-address" className="block text-sm font-medium text-gray-700 mb-1">
              Player Address
            </label>
            <div className="flex space-x-2">
              <input
                id="claim-address"
                type="text"
                value={newPlayerAddress}
                onChange={(e) => setNewPlayerAddress(e.target.value)}
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                placeholder="0x..."
              />
              <Button
                onClick={addClaimAddress}
                disabled={!newPlayerAddress}
              >
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {batchClaimAddresses.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Addresses to Claim For:</h4>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {batchClaimAddresses.map((address, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                    <p className="text-sm font-mono text-gray-900">{address}</p>
                    <Button
                      onClick={() => removeClaimAddress(index)}
                      variant="outline"
                      size="sm"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowBatchClaimModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBatchClaimSubmit}
              disabled={isPending || batchClaimAddresses.length === 0}
            >
              {isPending ? "Claiming..." : "Claim Rewards"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default GameVaultContractManager; 