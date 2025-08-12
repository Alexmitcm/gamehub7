import type { Preferences } from "@hey/types/api";
import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { toast } from "react-hot-toast";
import { hono } from "@/helpers/fetcher";
import { useAccountStore } from "@/store/persisted/useAccountStore";
import { hydrateAuthTokens } from "@/store/persisted/useAuthStore";
import { usePreferencesStore } from "@/store/persisted/usePreferencesStore";

interface PreferencesProviderProps {
  children: ReactNode;
}

const PreferencesProvider = ({ children }: PreferencesProviderProps) => {
  const { currentAccount } = useAccountStore();
  const { setAppIcon, setIncludeLowScore } = usePreferencesStore();
  const { accessToken } = hydrateAuthTokens();

  const {
    data: preferences,
    error,
    isLoading
  } = useQuery<Preferences>({
    enabled: Boolean(currentAccount?.address && accessToken),
    gcTime: 10 * 60 * 1000, // 10 minutes
    queryFn: () => hono.preferences.get(),
    queryKey: ["preferences", currentAccount?.address],
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes("401")) {
        return false; // Don't retry 401 errors
      }
      if (
        error instanceof Error &&
        (error.message.includes("500") || error.message.includes("503"))
      ) {
        return failureCount < 1; // Retry 500/503 errors only once
      }
      return failureCount < 2; // Retry other errors up to 2 times
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Shorter exponential backoff
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  useEffect(() => {
    if (error) {
      console.error("Preferences fetch error:", error);

      // Set default preferences on error to prevent UI issues
      setAppIcon(0);
      setIncludeLowScore(false);

      // Show user-friendly error message
      if (error instanceof Error) {
        if (error.message.includes("500") || error.message.includes("503")) {
          toast.error(
            "Service temporarily unavailable. Using default settings."
          );
        } else if (error.message.includes("401")) {
          toast.error("Authentication required. Please log in again.");
        } else {
          toast.error("Failed to load preferences. Using default settings.");
        }
      }
    }
  }, [error, setAppIcon, setIncludeLowScore]);

  useEffect(() => {
    if (preferences) {
      setAppIcon(preferences.appIcon ?? 0);
      setIncludeLowScore(preferences.includeLowScore ?? false);
    }
  }, [preferences, setAppIcon, setIncludeLowScore]);

  // Show loading state for better UX
  useEffect(() => {
    if (isLoading && currentAccount?.address) {
      // Don't show toast for initial load, only for retries
    }
  }, [isLoading, currentAccount?.address]);

  return <>{children}</>;
};

export default PreferencesProvider;
