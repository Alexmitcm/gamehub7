import { CHAIN } from "@hey/data/constants";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { formatEther, getAddress, isAddress, parseEther } from "viem";
import { arbitrum } from "viem/chains";
import { useBalance, useChainId } from "wagmi";
import { useAccountStore } from "@/store/persisted/useAccountStore";
import { usePremiumStore } from "@/store/premiumStore";

// Contract addresses based on network
const getContractAddresses = () => {
  // Always use mainnet addresses for the referral program
  return {
    REFERRAL_ADDRESS: "0x3bC03e9793d2E67298fb30871a08050414757Ca7", // Arbitrum Mainnet Referral
    USDT_ADDRESS: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9" // Arbitrum Mainnet USDT
  };
};

const { USDT_ADDRESS, REFERRAL_ADDRESS } = getContractAddresses();

// USDT ABI for approval
const USDT_ABI = [
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  }
];

// Referral contract ABI - updated to match real contract
const REFERRAL_ABI = [
  {
    inputs: [{ name: "player", type: "address" }],
    name: "NodeSet",
    outputs: [
      { name: "startTime", type: "uint256" },
      { name: "balance", type: "uint256" },
      { name: "point", type: "uint24" },
      { name: "depthLeftBranch", type: "uint24" },
      { name: "depthRightBranch", type: "uint24" },
      { name: "depth", type: "uint24" },
      { name: "player", type: "address" },
      { name: "parent", type: "address" },
      { name: "leftChild", type: "address" },
      { name: "rightChild", type: "address" },
      { name: "isPointChanged", type: "bool" },
      { name: "unbalancedAllowance", type: "bool" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "player", type: "address" }],
    name: "getPlayerNodeAdmin",
    outputs: [
      { name: "startTime", type: "uint256" },
      { name: "balance", type: "uint256" },
      { name: "point", type: "uint24" },
      { name: "depthLeftBranch", type: "uint24" },
      { name: "depthRightBranch", type: "uint24" },
      { name: "depth", type: "uint24" },
      { name: "player", type: "address" },
      { name: "parent", type: "address" },
      { name: "leftChild", type: "address" },
      { name: "rightChild", type: "address" },
      { name: "isPointChanged", type: "bool" },
      { name: "unbalancedAllowance", type: "bool" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "referrer", type: "address" }],
    name: "register",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
];

interface ReferrerStatus {
  isLoading: boolean;
  isValid: boolean;
  message: string;
}

interface RegistrationState {
  isLoading: boolean;
  error: string | null;
  isWrongNetwork: boolean;
  referrerStatus: ReferrerStatus;
  usdtBalance: string;
}

export const usePremiumRegistration = () => {
  const { currentAccount } = useAccountStore();
  const chainId = useChainId();
  const { setUserStatus } = usePremiumStore();

  // Get wallet address from current account
  const address = currentAccount?.address as `0x${string}` | undefined;
  const isConnected = !!address;

  // State management
  const [state, setState] = useState<RegistrationState>({
    error: null,
    isLoading: false,
    isWrongNetwork: false,
    referrerStatus: {
      isLoading: false,
      isValid: false,
      message: ""
    },
    usdtBalance: "0"
  });

  // Check network status and auto-switch if needed
  useEffect(() => {
    if (isConnected && chainId !== CHAIN.id) {
      setState((prev) => ({
        ...prev,
        isWrongNetwork: true
      }));
    } else {
      setState((prev) => ({
        ...prev,
        isWrongNetwork: false
      }));
    }
  }, [isConnected, chainId]);

  // Get USDT balance
  const { data: balanceData } = useBalance({
    address,
    token: USDT_ADDRESS as `0x${string}`,
    watch: true
  });

  // Update USDT balance
  useEffect(() => {
    if (balanceData) {
      setState((prev) => ({
        ...prev,
        usdtBalance: formatEther(balanceData.value)
      }));
    }
  }, [balanceData]);

  // Debounced referrer validation
  const validateReferrer = useCallback(
    async (referrerAddress: string) => {
      if (!referrerAddress || !address) return;

      setState((prev) => ({
        ...prev,
        referrerStatus: {
          isLoading: true,
          isValid: false,
          message: "Validating referrer..."
        }
      }));

      try {
        // Format Check
        if (!isAddress(referrerAddress)) {
          setState((prev) => ({
            ...prev,
            referrerStatus: {
              isLoading: false,
              isValid: false,
              message: "❌ Invalid address format"
            }
          }));
          return;
        }

        const normalizedReferrer = getAddress(referrerAddress);
        const normalizedAddress = getAddress(address);

        if (normalizedReferrer === normalizedAddress) {
          setState((prev) => ({
            ...prev,
            referrerStatus: {
              isLoading: false,
              isValid: false,
              message: "❌ Cannot refer yourself"
            }
          }));
          return;
        }

        // On-Chain Call
        const { createPublicClient, http } = await import("viem");
        const publicClient = createPublicClient({
          chain: arbitrum,
          transport: http("https://arb1.arbitrum.io/rpc")
        });

        try {
          // Check if referrer exists in the system
          const nodeData = await publicClient.readContract({
            abi: REFERRAL_ABI,
            address: REFERRAL_ADDRESS as `0x${string}`,
            args: [normalizedReferrer],
            functionName: "NodeSet"
          });

          // Check if the node exists by checking if startTime is not 0
          const nodeArray = nodeData as [
            bigint,
            bigint,
            number,
            number,
            number,
            number,
            string,
            string,
            string,
            string,
            boolean,
            boolean
          ];
          const isNodeSet = nodeArray[0] > 0n; // startTime > 0 means the node exists

          if (!isNodeSet) {
            setState((prev) => ({
              ...prev,
              referrerStatus: {
                isLoading: false,
                isValid: false,
                message: "❌ Invalid referrer address"
              }
            }));
            return;
          }

          // Use the node data we already have from NodeSet
          const node = nodeArray;

          // Capacity Check - leftChild is at index 8, rightChild is at index 9
          const hasAvailableSlots =
            node[8] === "0x0000000000000000000000000000000000000000" ||
            node[9] === "0x0000000000000000000000000000000000000000";

          if (!hasAvailableSlots) {
            setState((prev) => ({
              ...prev,
              referrerStatus: {
                isLoading: false,
                isValid: false,
                message: "❌ Referrer has no available slots"
              }
            }));
            return;
          }

          setState((prev) => ({
            ...prev,
            referrerStatus: {
              isLoading: false,
              isValid: true,
              message: "✅ Valid referrer address"
            }
          }));
        } catch (contractError: any) {
          console.error("Contract validation error:", contractError);

          // Check if it's a network/contract issue
          if (
            contractError.message?.includes("ContractFunctionExecutionError") ||
            contractError.message?.includes("InvalidBytesBooleanError") ||
            contractError.message?.includes("ContractFunctionZeroDataError")
          ) {
            setState((prev) => ({
              ...prev,
              referrerStatus: {
                isLoading: false,
                isValid: false,
                message: "❌ Contract not available on current network"
              }
            }));
          } else {
            setState((prev) => ({
              ...prev,
              referrerStatus: {
                isLoading: false,
                isValid: false,
                message: "❌ Error validating referrer"
              }
            }));
          }
        }
      } catch (error) {
        console.error("Referrer validation error:", error);
        setState((prev) => ({
          ...prev,
          referrerStatus: {
            isLoading: false,
            isValid: false,
            message: "❌ Error connecting to blockchain"
          }
        }));
      }
    },
    [address]
  );

  // Debounced validation effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (state.referrerStatus.message && !state.referrerStatus.isLoading) {
        validateReferrer(state.referrerStatus.message.split(" ")[0]); // Extract address from message
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [validateReferrer]);

  // Registration function
  const initiateRegistration = useCallback(
    async (referrerAddress: string) => {
      if (!address || !referrerAddress) {
        toast.error("Missing required information");
        return;
      }

      setState((prev) => ({
        ...prev,
        error: null,
        isLoading: true
      }));

      try {
        const { createWalletClient, http } = await import("viem");

        // This would need to be replaced with actual wallet connection
        const walletClient = createWalletClient({
          chain: arbitrum,
          transport: http("https://arb1.arbitrum.io/rpc")
        });

        const registrationAmount = parseEther("200"); // 200 USDT

        // Step 1: Approve USDT spending
        toast.loading("Approving USDT spending...");

        const approveHash = await walletClient.writeContract({
          abi: USDT_ABI,
          address: USDT_ADDRESS as `0x${string}`,
          args: [REFERRAL_ADDRESS as `0x${string}`, registrationAmount],
          functionName: "approve"
        });

        await walletClient.waitForTransactionReceipt({ hash: approveHash });
        toast.success("USDT approval successful");

        // Step 2: Register in referral program
        toast.loading("Registering in referral program...");

        const registerHash = await walletClient.writeContract({
          abi: REFERRAL_ABI,
          address: REFERRAL_ADDRESS as `0x${string}`,
          args: [referrerAddress as `0x${string}`, registrationAmount],
          functionName: "register"
        });

        const receipt = await walletClient.waitForTransactionReceipt({
          hash: registerHash
        });
        toast.success("Registration successful!");

        // Step 3: Backend verification
        await verifyRegistrationWithBackend(address, referrerAddress, receipt);

        // Update user status
        setUserStatus("OnChainUnlinked");

        setState((prev) => ({
          ...prev,
          isLoading: false
        }));
      } catch (error) {
        console.error("Registration error:", error);
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : "Registration failed",
          isLoading: false
        }));
        toast.error("Registration failed. Please try again.");
      }
    },
    [address, setUserStatus]
  );

  // Backend verification function
  const verifyRegistrationWithBackend = async (
    userAddress: string,
    referrerAddress: string,
    receipt: any
  ) => {
    try {
      const response = await fetch("/api/verify-registration", {
        body: JSON.stringify({
          blockNumber: receipt.blockNumber,
          referrerAddress,
          transactionHash: receipt.transactionHash,
          userAddress
        }),
        headers: {
          "Content-Type": "application/json"
        },
        method: "POST"
      });

      if (!response.ok) {
        throw new Error("Backend verification failed");
      }

      const { jwt } = await response.json();
      localStorage.setItem("premium-jwt", jwt);
    } catch (error) {
      console.error("Backend verification error:", error);
      // Don't fail the registration if backend verification fails
      toast.warning("Registration successful but verification pending");
    }
  };

  return {
    address,
    error: state.error,
    initiateRegistration,
    isConnected,
    // State
    isLoading: state.isLoading,
    isWrongNetwork: state.isWrongNetwork,
    referrerStatus: state.referrerStatus,

    // Functions
    usdtBalance: state.usdtBalance,
    validateReferrer
  };
};
