import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAccount } from "wagmi";
import { hono } from "@/helpers/fetcher";
import { usePremiumStore } from "@/store/premiumStore";

interface PremiumStatus {
  userStatus: "Standard" | "ProLinked";
  linkedProfile?: {
    profileId: string;
    linkedAt: string;
  };
}

export const useSimplePremium = () => {
  const account = useAccount();
  const { setUserStatus, setLinkedProfile } = usePremiumStore();

  // Safely extract wallet address with null checks
  const connectedWalletAddress = account?.address;

  // Query to get premium status using the connected wallet address
  const {
    data: premiumStatus,
    isLoading,
    error
  } = useQuery<PremiumStatus>({
    enabled: Boolean(connectedWalletAddress),
    queryFn: () => {
      if (!connectedWalletAddress) {
        throw new Error("No wallet address available");
      }
      return hono.premium.getSimpleStatus(connectedWalletAddress);
    },
    queryKey: [
      "simple-premium-status",
      connectedWalletAddress
    ],
    retry: 2,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // Update global state when premium status changes
  useEffect(() => {
    if (!connectedWalletAddress || isLoading) {
      return;
    }

    if (error) {
      // Default to Standard on error
      setUserStatus("Standard");
      setLinkedProfile(null);
      return;
    }

    if (!premiumStatus) {
      return;
    }

    // Update global state based on premium status
    setUserStatus(
      premiumStatus.userStatus === "ProLinked" ? "ProLinked" : "Standard"
    );

    if (premiumStatus.linkedProfile) {
      setLinkedProfile({
        handle: "", // Not provided in simple version
        linkedAt: new Date(premiumStatus.linkedProfile.linkedAt),
        profileId: premiumStatus.linkedProfile.profileId
      });
    } else {
      setLinkedProfile(null);
    }
  }, [
    connectedWalletAddress,
    premiumStatus,
    isLoading,
    error,
    setUserStatus,
    setLinkedProfile
  ]);

  return {
    error,
    isLoading,
    isPremium: premiumStatus?.userStatus === "ProLinked",
    linkedProfile: premiumStatus?.linkedProfile,
    premiumStatus,
    isConnected: Boolean(connectedWalletAddress)
  };
};
