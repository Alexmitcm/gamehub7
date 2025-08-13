import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { MAINNET_CONTRACTS, REFERRAL_ABI } from "@/lib/constants";

const useClaimReferralReward = () => {
  const queryClient = useQueryClient();
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash
  });

  const claimReferralReward = () => {
    writeContract({
      address: MAINNET_CONTRACTS.REFERRAL as `0x${string}`,
      abi: REFERRAL_ABI,
      functionName: "withdraw"
    });
  };

  // Invalidate queries on successful transaction
  if (isSuccess) {
    queryClient.invalidateQueries({ queryKey: ["userOnChainState"] });
  }

  return {
    claimReferralReward,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash
  };
};

export default useClaimReferralReward; 