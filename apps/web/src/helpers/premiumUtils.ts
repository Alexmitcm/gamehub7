import { useSimplePremium } from "@/hooks/useSimplePremium";
import { useAccountStore } from "@/store/persisted/useAccountStore";
import { usePremiumStore } from "@/store/premiumStore";

/**
 * Check if a user has premium access through either:
 * 1. Lens Pro subscription (hasSubscribed)
 * 2. Our new premium system (isPremium from store)
 * 3. Simple premium status check (ProLinked)
 */
export const useHasPremiumAccess = () => {
  const { currentAccount } = useAccountStore();
  const { isPremium } = usePremiumStore();
  const { premiumStatus } = useSimplePremium();

  // User has premium if they have Lens Pro OR our premium system OR simple premium check
  return (
    currentAccount?.hasSubscribed ||
    isPremium ||
    premiumStatus?.userStatus === "ProLinked"
  );
};

/**
 * Check if a specific account has premium access
 */
export const hasPremiumAccess = (
  account: { hasSubscribed?: boolean } | null
) => {
  if (!account) return false;
  return account.hasSubscribed || false;
};

/**
 * Get premium status for display purposes
 */
export const getPremiumStatus = (
  account: { hasSubscribed?: boolean } | null
) => {
  if (!account) return null;
  return account.hasSubscribed ? "Lens Pro" : null;
};
