import {
  ChartBarIcon,
  DocumentTextIcon,
  EyeIcon,
  MagnifyingGlassIcon
} from "@heroicons/react/24/outline";
import { useState } from "react";
import { toast } from "sonner";
import { useReadContract } from "wagmi";
import gameVaultAbi from "@/abi/gameVault.json";
import referralAbi from "@/abi/referral.json";
import { Button, Card, CardHeader } from "@/components/Shared/UI";
import { CONTRACT_ADDRESSES } from "@/lib/contracts";

// Contract addresses
const REFERRAL_CONTRACT_ADDRESS = CONTRACT_ADDRESSES.REFERRAL;
const GAME_VAULT_CONTRACT_ADDRESS = CONTRACT_ADDRESSES.GAME_VAULT;

interface NodeData {
  startTime: bigint;
  balance: bigint;
  point: number;
  depthLeftBranch: number;
  depthRightBranch: number;
  depth: number;
  player: string;
  parent: string;
  leftChild: string;
  rightChild: string;
  isPointChanged: boolean;
  unbalancedAllowance: boolean;
}

interface UnbalancedNodeData {
  startTime: bigint;
  payment: bigint;
  point: number;
  isPointChanged: boolean;
}

const DataMonitor = () => {
  const [selectedContract, setSelectedContract] = useState<
    "referral" | "gameVault"
  >("referral");
  const [playerAddress, setPlayerAddress] = useState("");
  const [nodeData, setNodeData] = useState<NodeData | null>(null);
  const [unbalancedNodeData, setUnbalancedNodeData] =
    useState<UnbalancedNodeData | null>(null);
  const [playerBalance, setPlayerBalance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { readContract } = useReadContract();

  const fetchPlayerNodeData = async () => {
    if (!playerAddress) {
      toast.error("Please enter a player address");
      return;
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(playerAddress)) {
      toast.error("Please enter a valid Ethereum address");
      return;
    }

    setIsLoading(true);
    try {
      const data = await readContract({
        abi: referralAbi,
        address: REFERRAL_CONTRACT_ADDRESS as `0x${string}`,
        args: [playerAddress as `0x${string}`],
        functionName: "getPlayerNodeAdmin"
      });

      setNodeData(data as NodeData);
      setUnbalancedNodeData(null);
      toast.success("Player node data retrieved successfully");
    } catch (error) {
      toast.error("Failed to fetch player node data");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUnbalancedPlayerNodeData = async () => {
    if (!playerAddress) {
      toast.error("Please enter a player address");
      return;
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(playerAddress)) {
      toast.error("Please enter a valid Ethereum address");
      return;
    }

    setIsLoading(true);
    try {
      const data = await readContract({
        abi: referralAbi,
        address: REFERRAL_CONTRACT_ADDRESS as `0x${string}`,
        args: [playerAddress as `0x${string}`],
        functionName: "getUnbalancedPlayerNode"
      });

      setUnbalancedNodeData(data as UnbalancedNodeData);
      setNodeData(null);
      toast.success("Unbalanced player node data retrieved successfully");
    } catch (error) {
      toast.error("Failed to fetch unbalanced player node data");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPlayerBalance = async () => {
    if (!playerAddress) {
      toast.error("Please enter a player address");
      return;
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(playerAddress)) {
      toast.error("Please enter a valid Ethereum address");
      return;
    }

    setIsLoading(true);
    try {
      const balance = await readContract({
        abi: gameVaultAbi,
        address: GAME_VAULT_CONTRACT_ADDRESS as `0x${string}`,
        args: [playerAddress as `0x${string}`],
        functionName: "playerBalanceAdmin2"
      });

      setPlayerBalance(balance.toString());
      setNodeData(null);
      setUnbalancedNodeData(null);
      toast.success("Player balance retrieved successfully");
    } catch (error) {
      toast.error("Failed to fetch player balance");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearData = () => {
    setNodeData(null);
    setUnbalancedNodeData(null);
    setPlayerBalance(null);
    setPlayerAddress("");
  };

  const formatTimestamp = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleString();
  };

  const formatWei = (wei: bigint) => {
    return wei.toString();
  };

  const contracts = [
    {
      color: "blue",
      description: "View player node information and referral data",
      icon: ChartBarIcon,
      id: "referral",
      name: "Referral Contract Data"
    },
    {
      color: "green",
      description: "View player balances and reward information",
      icon: DocumentTextIcon,
      id: "gameVault",
      name: "Game Vault Contract Data"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="mb-6 flex items-center space-x-3">
        <ChartBarIcon className="h-6 w-6 text-indigo-600" />
        <h2 className="font-bold text-2xl text-gray-900">
          On-Chain Data Monitor
        </h2>
      </div>

      {/* Contract Selection */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {contracts.map((contract) => {
          const Icon = contract.icon;
          const colorClasses = {
            blue: "border-blue-200 bg-blue-50",
            green: "border-green-200 bg-green-50"
          };

          return (
            <Card
              className={`cursor-pointer border-2 transition-all duration-200 ${
                selectedContract === contract.id
                  ? colorClasses[contract.color as keyof typeof colorClasses] +
                    " ring-2 ring-blue-500"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              key={contract.id}
              onClick={() =>
                setSelectedContract(contract.id as "referral" | "gameVault")
              }
            >
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Icon className="h-6 w-6 text-gray-600" />
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {contract.name}
                  </h3>
                </div>
              </CardHeader>
              <div className="p-6">
                <p className="text-gray-600">{contract.description}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Data Query Section */}
      <Card className="border-2 border-indigo-200 bg-indigo-50">
        <CardHeader>
          <h3 className="font-semibold text-gray-900 text-lg">
            Query Player Data
          </h3>
        </CardHeader>
        <div className="space-y-4 p-6">
          <div>
            <label
              className="mb-1 block font-medium text-gray-700 text-sm"
              htmlFor="player-address-input"
            >
              Player Address
            </label>
            <div className="flex space-x-2">
              <input
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                id="player-address-input"
                onChange={(e) => setPlayerAddress(e.target.value)}
                placeholder="0x..."
                type="text"
                value={playerAddress}
              />
              <Button
                disabled={isLoading}
                onClick={clearData}
                variant="outline"
              >
                Clear
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {selectedContract === "referral" ? (
              <>
                <Button
                  className="flex items-center space-x-2"
                  disabled={isLoading || !playerAddress}
                  onClick={fetchPlayerNodeData}
                >
                  <EyeIcon className="h-4 w-4" />
                  <span>Get Player Node</span>
                </Button>
                <Button
                  className="flex items-center space-x-2"
                  disabled={isLoading || !playerAddress}
                  onClick={fetchUnbalancedPlayerNodeData}
                  variant="outline"
                >
                  <MagnifyingGlassIcon className="h-4 w-4" />
                  <span>Get Unbalanced Node</span>
                </Button>
              </>
            ) : (
              <Button
                className="flex items-center space-x-2"
                disabled={isLoading || !playerAddress}
                onClick={fetchPlayerBalance}
              >
                <DocumentTextIcon className="h-4 w-4" />
                <span>Get Player Balance</span>
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Results Display */}
      {isLoading && (
        <Card className="border-2 border-yellow-200 bg-yellow-50">
          <div className="p-6 text-center">
            <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-blue-600 border-b-2" />
            <p className="text-gray-600">Fetching data from blockchain...</p>
          </div>
        </Card>
      )}

      {/* Player Node Data */}
      {nodeData && (
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <h3 className="font-semibold text-gray-900 text-lg">
              Player Node Data
            </h3>
          </CardHeader>
          <div className="p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <h4 className="mb-2 font-medium text-gray-900">
                  Basic Information
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Player:</span>
                    <code className="rounded bg-gray-100 px-2 py-1">
                      {nodeData.player}
                    </code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Parent:</span>
                    <code className="rounded bg-gray-100 px-2 py-1">
                      {nodeData.parent}
                    </code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Left Child:</span>
                    <code className="rounded bg-gray-100 px-2 py-1">
                      {nodeData.leftChild}
                    </code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Right Child:</span>
                    <code className="rounded bg-gray-100 px-2 py-1">
                      {nodeData.rightChild}
                    </code>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="mb-2 font-medium text-gray-900">
                  Node Properties
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Start Time:</span>
                    <span>{formatTimestamp(nodeData.startTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Balance:</span>
                    <span>{formatWei(nodeData.balance)} wei</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Point:</span>
                    <span>{nodeData.point}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Depth:</span>
                    <span>{nodeData.depth}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Left Branch Depth:</span>
                    <span>{nodeData.depthLeftBranch}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Right Branch Depth:</span>
                    <span>{nodeData.depthRightBranch}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 border-gray-200 border-t pt-4">
              <h4 className="mb-2 font-medium text-gray-900">Flags</h4>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">Point Changed:</span>
                  <span
                    className={`rounded px-2 py-1 text-xs ${
                      nodeData.isPointChanged
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {nodeData.isPointChanged ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">Unbalanced Allowance:</span>
                  <span
                    className={`rounded px-2 py-1 text-xs ${
                      nodeData.unbalancedAllowance
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {nodeData.unbalancedAllowance ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Unbalanced Node Data */}
      {unbalancedNodeData && (
        <Card className="border-2 border-orange-200 bg-orange-50">
          <CardHeader>
            <h3 className="font-semibold text-gray-900 text-lg">
              Unbalanced Player Node Data
            </h3>
          </CardHeader>
          <div className="p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <h4 className="mb-2 font-medium text-gray-900">
                  Node Information
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Start Time:</span>
                    <span>{formatTimestamp(unbalancedNodeData.startTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment:</span>
                    <span>{formatWei(unbalancedNodeData.payment)} wei</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Point:</span>
                    <span>{unbalancedNodeData.point}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="mb-2 font-medium text-gray-900">Status</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">Point Changed:</span>
                    <span
                      className={`rounded px-2 py-1 text-xs ${
                        unbalancedNodeData.isPointChanged
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {unbalancedNodeData.isPointChanged ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Player Balance */}
      {playerBalance !== null && (
        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader>
            <h3 className="font-semibold text-gray-900 text-lg">
              Player Balance
            </h3>
          </CardHeader>
          <div className="p-6">
            <div className="text-center">
              <p className="mb-2 text-gray-600 text-sm">
                Balance for {playerAddress}
              </p>
              <p className="font-bold text-3xl text-green-600">
                {playerBalance} wei
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default DataMonitor;
