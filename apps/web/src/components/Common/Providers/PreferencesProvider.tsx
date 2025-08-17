import type { Preferences } from "@hey/types/api";
import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useEffect } from "react";
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

  const { data: preferences, error } = useQuery<Preferences>({
    enabled: Boolean(currentAccount?.address && accessToken),
    queryFn: () => hono.preferences.get(),
    queryKey: ["preferences", currentAccount?.address],
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Don't retry 401 errors (authentication issues)
      if (error instanceof Error && error.message.includes("401")) {
        return false;
      }
      
      // Don't retry HTML response errors (server/endpoint issues)
      if (error instanceof Error && error.message.includes("HTML instead of JSON")) {
        return false;
      }
      
      // Don't retry non-JSON response errors
      if (error instanceof Error && error.message.includes("non-JSON response")) {
        return false;
      }
      
      // Retry other errors up to 3 times
      return failureCount < 3;
    },
    throwOnError: false // Prevent React Query from logging errors to console
  });

  // Handle errors gracefully
  useEffect(() => {
    if (error) {
      // Completely silent for 401 errors - this is expected when not authenticated
      if (error instanceof Error && error.message.includes("401")) {
        return;
      }
      
      // Log HTML/endpoint errors for debugging but don't spam the console
      if (error instanceof Error && (
        error.message.includes("HTML instead of JSON") ||
        error.message.includes("non-JSON response")
      )) {
        console.warn("🔍 Preferences API endpoint issue:", error.message);
        return;
      }
      
      // Only log other errors that might indicate real issues
      console.error("Preferences fetch error:", error);
    }
  }, [error]);

  useEffect(() => {
    if (preferences) {
      setIncludeLowScore(preferences.includeLowScore);
      setAppIcon(preferences.appIcon);
    }
  }, [preferences, setIncludeLowScore, setAppIcon]);

  return <>{children}</>;
};

export default PreferencesProvider;
