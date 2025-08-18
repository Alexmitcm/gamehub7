import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { STATIC_IMAGES_URL } from "@hey/data/constants";
import type { AccountFragment } from "@hey/indexer";
import { useState } from "react";
import PremiumRegistration from "@/components/Premium/PremiumRegistration";
import ProfileSelectionModal from "@/components/Premium/ProfileSelectionModal";
import SingleAccount from "@/components/Shared/Account/SingleAccount";
import { Button, Image, Spinner } from "@/components/Shared/UI";
import { usePremiumProfileSelection } from "@/hooks/usePremiumProfileSelection";
import { useSimplePremium } from "@/hooks/useSimplePremium";
import { useAccountStore } from "@/store/persisted/useAccountStore";
import { hydrateBackendTokens } from "@/store/persisted/useAuthStore";

const Subscribe = () => {
  const { currentAccount } = useAccountStore();
  const { premiumStatus, isLoading } = useSimplePremium();
  const { user: backendUser } = hydrateBackendTokens();
  const [showProfileModal, setShowProfileModal] = useState(false);

  const {
    availableProfiles,
    isLoading: profileLoading,
    linkProfile
  } = usePremiumProfileSelection();

  if (!currentAccount) {
    return (
      <div className="mx-5 my-10 flex flex-col items-center gap-y-8">
        <div className="flex items-center justify-center space-x-2">
          <Spinner className="size-5" />
          <span className="text-gray-500">Checking premium status...</span>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-5 my-10 flex flex-col items-center gap-y-8">
        <div className="flex items-center justify-center space-x-2">
          <Spinner className="size-5" />
          <span className="text-gray-500">Checking premium status...</span>
        </div>
      </div>
    );
  }

  // Check if user is Premium (from backend or legacy)
  const isPremium =
    backendUser?.status === "Premium" ||
    premiumStatus?.userStatus === "ProLinked";

  // Premium users - show success message
  if (isPremium) {
    return (
      <div className="mx-5 my-10 flex flex-col items-center gap-y-8">
        <Image
          alt="Pro"
          className="w-32"
          src={`${STATIC_IMAGES_URL}/pro.png`}
          width={128}
        />
        <div className="max-w-md text-center text-gray-500">
          <div className="text-gray-500">
            Thanks for being a valuable <b>Hey Pro</b> member!
          </div>
        </div>
        <SingleAccount
          account={currentAccount as AccountFragment}
          isVerified
          linkToAccount={false}
          showUserPreview={false}
        />
        <div className="flex flex-col items-center gap-y-2 text-gray-500">
          <div className="flex items-center gap-x-1">
            <CheckCircleIcon className="size-4.5" />
            <span className="text-sm">Premium Badge</span>
          </div>
          <div className="flex items-center gap-x-1">
            <CheckCircleIcon className="size-4.5" />
            <span className="text-sm">Exclusive Hey features</span>
          </div>
          <div className="flex items-center gap-x-1">
            <CheckCircleIcon className="size-4.5" />
            <span className="text-sm">Referral rewards</span>
          </div>
          <div className="flex items-center gap-x-1">
            <CheckCircleIcon className="size-4.5" />
            <span className="text-sm">Game rewards</span>
          </div>
        </div>
      </div>
    );
  }

  // OnChainUnlinked users - show profile linking form
  if (premiumStatus?.userStatus === "OnChainUnlinked") {
    const handleLinkProfile = async (profileId: string) => {
      try {
        await linkProfile(currentAccount!.address, profileId);
        // The hook will handle the state update
      } catch (error) {
        console.error("Failed to link profile:", error);
      }
    };

    const handleAutoLink = async () => {
      try {
        if (availableProfiles?.profiles.length === 1) {
          await linkProfile(currentAccount!.address, availableProfiles.profiles[0].id);
        } else {
          setShowProfileModal(true);
        }
      } catch (error) {
        console.error("Failed to auto-link profile:", error);
      }
    };

    return (
      <div className="mx-5 my-10 flex flex-col items-center gap-y-8">
        <Image
          alt="Pro"
          className="w-32"
          src={`${STATIC_IMAGES_URL}/pro.png`}
          width={128}
        />
        <div className="max-w-md text-center text-gray-500">
          <div className="mb-4 text-gray-500">
            Welcome back! Your wallet is already <b>Hey Pro</b>!
          </div>
          <div className="text-gray-400 text-sm">
            Link your Lens profile to unlock premium features.
          </div>
        </div>
        <div className="mb-6 flex flex-col items-center gap-y-2 text-gray-500">
          <div className="flex items-center gap-x-1">
            <CheckCircleIcon className="size-4.5" />
            <span className="text-sm">Premium Badge</span>
          </div>
          <div className="flex items-center gap-x-1">
            <CheckCircleIcon className="size-4.5" />
            <span className="text-sm">Exclusive Hey features</span>
          </div>
          <div className="flex items-center gap-x-1">
            <CheckCircleIcon className="size-4.5" />
            <span className="text-sm">Referral rewards</span>
          </div>
          <div className="flex items-center gap-x-1">
            <CheckCircleIcon className="size-4.5" />
            <span className="text-sm">Game rewards</span>
          </div>
        </div>

        {/* Profile Linking Button */}
        <div className="w-full">
          <Button
            className="w-full"
            disabled={profileLoading}
            loading={profileLoading}
            onClick={handleAutoLink}
          >
            {profileLoading ? (
              <div className="flex items-center gap-2">
                <Spinner className="size-4" />
                <span>Loading profiles...</span>
              </div>
            ) : (
              "Link Your Profile"
            )}
          </Button>
        </div>

        {/* Profile Selection Modal */}
        {showProfileModal && availableProfiles && (
          <ProfileSelectionModal
            isLoading={profileLoading}
            isOpen={showProfileModal}
            onClose={() => setShowProfileModal(false)}
            onProfileSelect={handleLinkProfile}
            profiles={availableProfiles.profiles}
          />
        )}
      </div>
    );
  }

  // Standard users - show premium registration form
  if (
    premiumStatus?.userStatus === "Standard" ||
    backendUser?.status === "Standard"
  ) {
    return (
      <div className="mx-5 my-10 flex flex-col items-center gap-y-8">
        <Image
          alt="Pro"
          className="w-32"
          src={`${STATIC_IMAGES_URL}/pro.png`}
          width={128}
        />
        <div className="max-w-md text-center text-gray-500">
          <div className="mb-4 text-gray-500">
            Upgrade to <b>Hey Pro</b> to unlock exclusive features!
          </div>
          <div className="text-gray-400 text-sm">
            Connect your MetaMask wallet to get started.
          </div>
        </div>
        <div className="mb-6 flex flex-col items-center gap-y-2 text-gray-500">
          <div className="flex items-center gap-x-1">
            <CheckCircleIcon className="size-4.5" />
            <span className="text-sm">Premium Badge</span>
          </div>
          <div className="flex items-center gap-x-1">
            <CheckCircleIcon className="size-4.5" />
            <span className="text-sm">Exclusive Hey features</span>
          </div>
          <div className="flex items-center gap-x-1">
            <CheckCircleIcon className="size-4.5" />
            <span className="text-sm">Referral rewards</span>
          </div>
          <div className="flex items-center gap-x-1">
            <CheckCircleIcon className="size-4.5" />
            <span className="text-sm">Game rewards</span>
          </div>
        </div>

        {/* Premium Registration Form */}
        <div className="w-full">
          <PremiumRegistration />
        </div>
      </div>
    );
  }

  return null;
};

export default Subscribe;
