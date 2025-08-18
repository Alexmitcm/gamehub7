import { useQuery } from "@tanstack/react-query";
import { hono } from "@/helpers/fetcher";

interface AccountVerificationStatus {
  isVerified: boolean;
  isExclusivePremium: boolean;
  linkedAt?: string;
}

export const useAccountVerificationStatus = (profileId: string) => {
  return useQuery({
    enabled: !!profileId,
    queryFn: async (): Promise<AccountVerificationStatus> => {
      if (!profileId) {
        throw new Error("No profile ID provided");
      }

      try {
        const response = await hono.auth.accountVerificationStatus({
          profileId,
          walletAddress: "" // Will be determined by the backend
        });
        
        return {
          isVerified: response.isVerified,
          isExclusivePremium: response.isExclusivePremium,
          linkedAt: response.linkedAt
        };
      } catch (error) {
        // If the endpoint doesn't exist or fails, default to not verified
        console.warn("Account verification status check failed:", error);
        return {
          isVerified: false,
          isExclusivePremium: false
        };
      }
    },
    queryKey: ["account-verification-status", profileId],
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    throwOnError: false
  });
};
