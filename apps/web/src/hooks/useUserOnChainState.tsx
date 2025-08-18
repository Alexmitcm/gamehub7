import { useAccount, useReadContract } from "wagmi";
import { MAINNET_CONTRACTS, REFERRAL_ABI } from "@/lib/constants";

interface UserOnChainState {
  referralRewardBalance: bigint;
  leftNodeCount: number;
  rightNodeCount: number;
  accountAgeInDays: number;
  directReferrals: {
    leftChild: string;
    rightChild: string;
  };
}

const useUserOnChainState = () => {
  const { address } = useAccount();

  const { data: nodeData, isLoading, error, refetch } = useReadContract({
    address: MAINNET_CONTRACTS.REFERRAL as `0x${string}`,
    abi: REFERRAL_ABI,
    functionName: "NodeSet",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      staleTime: 30000, // 30 seconds
      refetchInterval: 30000 // Refetch every 30 seconds
    }
  });

  if (!nodeData || !Array.isArray(nodeData) || nodeData.length < 10) {
    return {
      data: undefined,
      isLoading,
      error,
      refetch
    };
  }

  const [
    startTime,
    balance,
    ,
    depthLeftBranch,
    depthRightBranch,
    ,
    ,
    ,
    leftChild,
    rightChild
  ] = nodeData;

  const currentTime = BigInt(Math.floor(Date.now() / 1000));
  const accountAgeInSeconds = currentTime - startTime;
  const accountAgeInDays = Number(accountAgeInSeconds) / (24 * 60 * 60);

  const data: UserOnChainState = {
    referralRewardBalance: balance,
    leftNodeCount: Number(depthLeftBranch),
    rightNodeCount: Number(depthRightBranch),
    accountAgeInDays: Math.floor(accountAgeInDays),
    directReferrals: {
      leftChild: leftChild as string,
      rightChild: rightChild as string
    }
  };

  return {
    data,
    isLoading,
    error,
    refetch
  };
};

export default useUserOnChainState; 