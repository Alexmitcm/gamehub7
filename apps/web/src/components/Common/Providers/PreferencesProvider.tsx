import type { Preferences } from "@hey/types/api";
import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { toast } from "sonner";
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

  const { data: preferences, error, refetch } = useQuery<Preferences>({
    // Enable the query even without authentication since preferences endpoint is public
    enabled: true,
    queryFn: () => hono.preferences.get(),
    queryKey: ["preferences", currentAccount?.address || "anonymous"],
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
      
      // Don't retry server errors (5xx) after 2 attempts - these are usually persistent
      if (error instanceof Error && (
        error.message.includes("502") ||
        error.message.includes("503") ||
        error.message.includes("504") ||
        error.message.includes("Server Error")
      )) {
        return failureCount < 2;
      }
      
      // Retry other errors up to 3 times
      return failureCount < 3;
    },
    throwOnError: false // Prevent React Query from logging errors to console
  });

  // Background retry mechanism for server issues
  useEffect(() => {
    if (error && error instanceof Error && (
      error.message.includes("502") ||
      error.message.includes("503") ||
      error.message.includes("504") ||
      error.message.includes("Server Error")
    )) {
      // Retry every 30 seconds when server is down
      const retryInterval = setInterval(() => {
        console.log("🔍 Retrying preferences fetch after server error...");
        refetch();
      }, 30000);

      return () => clearInterval(retryInterval);
    }
  }, [error, refetch]);

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
      
      // Handle server errors gracefully - set default preferences
      if (error instanceof Error && (
        error.message.includes("502") ||
        error.message.includes("503") ||
        error.message.includes("504") ||
        error.message.includes("Server Error")
      )) {
        console.warn("🔍 Server unavailable, using default preferences:", error.message);
        
        // Show user-friendly notification
        toast.warning("Server temporarily unavailable. Using default preferences.", {
          description: "Your preferences will be restored when the server is back online.",
          duration: 5000
        });
        
        // Set default preferences when server is down
        setIncludeLowScore(false);
        setAppIcon(0);
        return;
      }
      
      // Only log other errors that might indicate real issues
      console.error("Preferences fetch error:", error);
    }
  }, [error, setIncludeLowScore, setAppIcon]);

  useEffect(() => {
    if (preferences) {
      setIncludeLowScore(preferences.includeLowScore);
      setAppIcon(preferences.appIcon);
    }
  }, [preferences, setIncludeLowScore, setAppIcon]);

  return <>{children}</>;
};

export default PreferencesProvider;
