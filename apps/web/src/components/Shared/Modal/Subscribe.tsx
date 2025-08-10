import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { STATIC_IMAGES_URL } from "@hey/data/constants";
import type { AccountFragment } from "@hey/indexer";
import SingleAccount from "@/components/Shared/Account/SingleAccount";
import { Image, Spinner } from "@/components/Shared/UI";
import { useSimplePremium } from "@/hooks/useSimplePremium";
import { useAccountStore } from "@/store/persisted/useAccountStore";
import { hydrateBackendTokens } from "@/store/persisted/useAuthStore";

const Subscribe = () => {
  const { currentAccount } = useAccountStore();
  const { premiumStatus, isLoading } = useSimplePremium();
  const { user: backendUser } = hydrateBackendTokens();

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

  // Standard users - show registration form
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
            Connect your premium wallet to get started.
          </div>
        </div>
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

  return null;
};

export default Subscribe;
