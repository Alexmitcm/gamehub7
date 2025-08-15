import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { hono } from "@/helpers/fetcher";
import { useAccountStore } from "@/store/persisted/useAccountStore";
import { hydrateAuthTokens } from "@/store/persisted/useAuthStore";
import { usePremiumStore } from "@/store/premiumStore";

// Hook to check wallet status on-chain
export const useWalletStatus = (walletAddress: string | null) => {
  return useQuery({
    enabled: Boolean(walletAddress),
    queryFn: () => hono.premium.getUserStatus(walletAddress!),
    queryKey: ["wallet-status", walletAddress],
    retry: 2
  });
};

// Hook to get user's Lens profiles
export const useUserProfiles = (walletAddress: string | null) => {
  return useQuery({
    enabled: Boolean(walletAddress),
    queryFn: () => hono.premium.profiles({ query: { walletAddress: walletAddress! } }),
    queryKey: ["user-profiles", walletAddress],
    retry: 2
  });
};

// Hook to get premium status
export const usePremiumStatus = () => {
  const { currentAccount } = useAccountStore();
  const { accessToken } = hydrateAuthTokens();

  return useQuery({
    enabled: Boolean(currentAccount?.address && accessToken),
    queryFn: () => hono.premium.status(),
    queryKey: ["premium-status", currentAccount?.address],
    retry: 2
  });
};

// Hook to get linked profile
export const useLinkedProfile = () => {
  const { currentAccount } = useAccountStore();
  const { accessToken } = hydrateAuthTokens();

  return useQuery({
    enabled: Boolean(currentAccount?.address && accessToken),
    queryFn: () => hono.premium.linkedProfile(),
    queryKey: ["linked-profile", currentAccount?.address],
    retry: 2
  });
};

// Hook to get profile stats (for Pro dashboard)
export const useProfileStats = () => {
  const { currentAccount } = useAccountStore();
  const { accessToken } = hydrateAuthTokens();

  return useQuery({
    enabled: Boolean(currentAccount?.address && accessToken),
    queryFn: () => hono.premium.stats(),
    queryKey: ["profile-stats", currentAccount?.address],
    retry: 2
  });
};

// Hook to link profile
export const useLinkProfile = () => {
  const queryClient = useQueryClient();
  const { setUserStatus, setError } = usePremiumStore();
  const { currentAccount } = useAccountStore();

  return useMutation({
    mutationFn: (profileId: string) => hono.premium.linkProfile(currentAccount!.address, profileId),
    onError: (error: Error) => {
      toast.error(error.message || "Failed to link profile");
      setError(error.message);
    },
    onSuccess: (data) => {
      toast.success("Profile linked successfully!");
      setUserStatus("ProLinked");
      setError(null);

      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ["premium-status"] });
      queryClient.invalidateQueries({ queryKey: ["linked-profile"] });
    }
  });
};

// Hook to determine user status
export const useUserStatus = () => {
  const { currentAccount } = useAccountStore();

  const walletStatus = useWalletStatus(currentAccount?.address || null);
  const premiumStatus = usePremiumStatus();
  const linkedProfile = useLinkedProfile();

  // Determine user status based on the data
  const determineStatus = () => {
    if (!currentAccount?.address) return "Standard";

    if (
      walletStatus.isLoading ||
      premiumStatus.isLoading ||
      linkedProfile.isLoading
    ) {
      return null; // Still loading
    }

    if (walletStatus.error || premiumStatus.error || linkedProfile.error) {
      return "Standard"; // Default to standard on error
    }

    const isRegistered = walletStatus.data?.data?.isRegistered;
    const isPremium = premiumStatus.data?.data?.isPremium;
    const hasLinkedProfile = linkedProfile.data?.data?.linkedProfile;

    if (isRegistered && hasLinkedProfile && isPremium) {
      return "ProLinked";
    }
    if (isRegistered && !hasLinkedProfile) {
      return "OnChainUnlinked";
    }
    return "Standard";
  };

  return {
    error: walletStatus.error || premiumStatus.error || linkedProfile.error,
    isLoading:
      walletStatus.isLoading ||
      premiumStatus.isLoading ||
      linkedProfile.isLoading,
    refetch: () => {
      walletStatus.refetch();
      premiumStatus.refetch();
      linkedProfile.refetch();
    },
    status: determineStatus()
  };
};
