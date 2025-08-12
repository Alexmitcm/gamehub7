import { useQuery } from "@tanstack/react-query";
import { hono } from "@/helpers/fetcher";
import { useAccountStore } from "@/store/persisted/useAccountStore";
import { usePremiumStore } from "@/store/premiumStore";

export type UserStatus = "Standard" | "OnChainUnlinked" | "ProLinked";

interface PremiumStatusResponse {
  userStatus: UserStatus;
  linkedProfile?: {
    profileId: string;
    handle: string;
    linkedAt: string;
  } | null;
}

export const usePremiumStatus = () => {
  const { currentAccount } = useAccountStore();
  const { setUserStatus, setIsPremium, setLinkedProfile } = usePremiumStore();

  return useQuery({
    enabled: !!currentAccount?.address,
    gcTime: 300000, // 5 minutes
    onError: (error) => {
      // Completely silent for 401 errors - this is expected when not authenticated
      if (error.message.includes("401")) {
        // Reset to standard status silently
        setUserStatus("Standard");
        setIsPremium(false);
        setLinkedProfile(null);
        return;
      }
      // Only log non-401 errors that might indicate real issues
      console.error("Premium status fetch error:", error);
      // Reset to standard status on other errors
      setUserStatus("Standard");
      setIsPremium(false);
      setLinkedProfile(null);
    },
    onSuccess: (data) => {
      // Update global Zustand store
      setUserStatus(data.userStatus);
      setIsPremium(data.userStatus === "ProLinked");
      setLinkedProfile(data.linkedProfile || null);
    },
    queryFn: async (): Promise<PremiumStatusResponse> => {
      if (!currentAccount?.address) {
        throw new Error("No wallet connected");
      }

      const response = await hono.premium.userStatus(currentAccount.address);
      return response;
    },
    queryKey: ["premium-status", currentAccount?.address],
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Don't retry on 401 (unauthorized) errors
      if (error.message.includes("401")) {
        return false;
      }
      return failureCount < 3;
    },
    staleTime: 30000, // 30 seconds
    throwOnError: false // Prevent React Query from logging errors to console
  });
};
