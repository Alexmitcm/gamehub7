import { CheckBadgeIcon, XCircleIcon } from "@heroicons/react/24/solid";
import { BANNER_IDS } from "@hey/data/constants";
import { useAddPostNotInterestedMutation } from "@hey/indexer";
import type { ApolloClientError } from "@hey/types/errors";
import { toast } from "sonner";
import { Button, Card, H5 } from "@/components/Shared/UI";
import errorToast from "@/helpers/errorToast";
import { useHasPremiumAccess } from "@/helpers/premiumUtils";
import { useProModalStore } from "@/store/non-persisted/modal/useProModalStore";
import { useAccountStore } from "@/store/persisted/useAccountStore";
import { useProStore } from "@/store/persisted/useProStore";
import { useSimplePremium } from "@/hooks/useSimplePremium";

const ProBanner = () => {
  const { currentAccount } = useAccountStore();
  const { proBannerDismissed, setProBannerDismissed } = useProStore();
  const { setShow: setShowProModal } = useProModalStore();
  const hasPremiumAccess = useHasPremiumAccess();
  const { premiumStatus, isLoading } = useSimplePremium();

  const onError = (error: ApolloClientError) => {
    errorToast(error);
  };

  const [dismissProBanner, { loading }] = useAddPostNotInterestedMutation({
    onCompleted: () => {
      toast.success("Dismissed");
      setProBannerDismissed(true);
    },
    onError,
    variables: { request: { post: BANNER_IDS.PRO } }
  });

  // Don't show banner if:
  // 1. User has Lens Pro subscription
  // 2. User has premium access from our system
  // 3. User is premium from simple premium check
  // 4. Banner was dismissed
  // 5. Still loading premium status
  if (
    currentAccount?.hasSubscribed || 
    hasPremiumAccess || 
    premiumStatus?.userStatus === "ProLinked" ||
    proBannerDismissed ||
    isLoading
  ) {
    return null;
  }

  const handleDismissProBanner = async () => {
    return await dismissProBanner();
  };

  return (
    <Card className="relative space-y-2">
      <button
        className="absolute top-3 right-3 cursor-pointer text-gray-400 hover:text-gray-600"
        disabled={loading}
        onClick={handleDismissProBanner}
        type="button"
      >
        <XCircleIcon className="size-5" />
      </button>
      <div className="m-5">
        <div className="flex items-center gap-2">
          <CheckBadgeIcon className="size-5 text-brand-500" />
          <H5>Join Hey Pro</H5>
        </div>
        <div className="mb-5 text-sm">
          Get your badge and access exclusive features.
        </div>
        <Button
          className="w-full"
          onClick={() => setShowProModal(true)}
          outline
        >
          Subscribe now
        </Button>
      </div>
    </Card>
  );
};

export default ProBanner;
