import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import ProfileSelectionModal from "@/components/Premium/ProfileSelectionModal";
import { hono } from "@/helpers/fetcher";
import { useAccountStore } from "@/store/persisted/useAccountStore";
import { usePremiumStore } from "@/store/premiumStore";

interface Profile {
  id: string;
  handle: string;
  ownedBy: string;
  isDefault: boolean;
}

interface PremiumStatus {
  userStatus: "Standard" | "OnChainUnlinked" | "ProLinked";
  linkedProfile?: {
    profileId: string;
    handle: string;
    linkedAt: string;
  } | null;
}

interface AvailableProfiles {
  profiles: Profile[];
  canLink: boolean;
  linkedProfile?: {
    profileId: string;
    handle: string;
    linkedAt: string;
  } | null;
}

export const useInitPremium = () => {
  const { currentAccount } = useAccountStore();
  const { setUserStatus, setLinkedProfile, setError } = usePremiumStore();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [availableProfiles, setAvailableProfiles] = useState<Profile[]>([]);
  const queryClient = useQueryClient();

  // Query to get premium status
  const { data: premiumStatus, isLoading: statusLoading } =
    useQuery<PremiumStatus>({
      enabled: Boolean(currentAccount?.address),
      queryFn: () => hono.premium.getUserStatus(currentAccount!.address),
      queryKey: ["premium-status", currentAccount?.address],
      retry: 2
    });

  // Query to get available profiles for linking
  const { data: profilesData, isLoading: profilesLoading } =
    useQuery<AvailableProfiles>({
      enabled: Boolean(
        currentAccount?.address &&
          premiumStatus?.userStatus === "OnChainUnlinked"
      ),
      queryFn: () => hono.premium.getAvailableProfiles(currentAccount!.address),
      queryKey: ["available-profiles", currentAccount?.address],
      retry: 2
    });

  // Mutation to auto-link first profile
  const autoLinkMutation = useMutation({
    mutationFn: () => hono.premium.autoLinkProfile(currentAccount!.address),
    onError: (error: Error) => {
      toast.error(error.message || "Failed to auto-link profile");
      setError(error.message);
    },
    onSuccess: (data) => {
      toast.success("Profile auto-linked successfully!");
      setUserStatus("ProLinked");
      setLinkedProfile({
        handle: data.handle,
        linkedAt: data.linkedAt,
        profileId: data.profileId
      });
      setError(null);
      queryClient.invalidateQueries({ queryKey: ["premium-status"] });
    }
  });

  // Mutation to manually link a profile
  const linkProfileMutation = useMutation({
    mutationFn: (profileId: string) =>
      hono.premium.linkProfile(currentAccount!.address, profileId),
    onError: (error: Error) => {
      toast.error(error.message || "Failed to link profile");
      setError(error.message);
    },
    onSuccess: (data) => {
      toast.success("Profile linked successfully!");
      setUserStatus("ProLinked");
      setLinkedProfile({
        handle: data.handle,
        linkedAt: data.linkedAt,
        profileId: data.profileId
      });
      setError(null);
      setShowProfileModal(false);
      queryClient.invalidateQueries({ queryKey: ["premium-status"] });
    }
  });

  // Handle profile selection from modal
  const handleProfileSelect = async (profileId: string) => {
    await linkProfileMutation.mutateAsync(profileId);
  };

  // Initialize premium status and handle automatic linking
  useEffect(() => {
    if (!currentAccount?.address || statusLoading) {
      return;
    }

    if (!premiumStatus) {
      return;
    }

    // Update global state based on premium status
    setUserStatus(premiumStatus.userStatus);

    if (premiumStatus.linkedProfile) {
      setLinkedProfile(premiumStatus.linkedProfile);
    } else {
      setLinkedProfile(null);
    }

    // Handle automatic linking logic
    if (premiumStatus.userStatus === "OnChainUnlinked") {
      // Check if we have profile data
      if (profilesData && !profilesLoading) {
        if (profilesData.profiles.length === 1) {
          // Auto-link the single profile
          autoLinkMutation.mutate();
        } else if (profilesData.profiles.length > 1) {
          // Show modal for multiple profiles
          setAvailableProfiles(profilesData.profiles);
          setShowProfileModal(true);
        }
      }
    }

    setError(null);
  }, [
    currentAccount?.address,
    premiumStatus,
    profilesData,
    statusLoading,
    profilesLoading,
    setUserStatus,
    setLinkedProfile,
    setError,
    autoLinkMutation
  ]);

  return {
    availableProfiles,
    handleProfileSelect,
    isLoading:
      statusLoading ||
      profilesLoading ||
      autoLinkMutation.isPending ||
      linkProfileMutation.isPending,
    ProfileSelectionModal: () => (
      <ProfileSelectionModal
        isLoading={linkProfileMutation.isPending}
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onProfileSelect={handleProfileSelect}
        profiles={availableProfiles}
      />
    ),
    premiumStatus,
    setShowProfileModal,
    showProfileModal
  };
};
