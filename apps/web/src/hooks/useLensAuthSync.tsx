import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { handleSilentError, shouldClearAuth } from "@/helpers/errorHandler";
import { hono } from "@/helpers/fetcher";
import {
  hydrateAuthTokens,
  hydrateBackendTokens,
  signInWithBackend,
  signOut
} from "@/store/persisted/useAuthStore";

/**
 * Hook to automatically sync Lens authentication with our backend
 * This should be called after successful Lens authentication
 */
export const useLensAuthSync = () => {
  const lastSyncAttempt = useRef<number>(0);
  const [isInitialized, setIsInitialized] = useState(false);

  const {
    mutate: syncLens,
    isPending,
    error
  } = useMutation({
    mutationFn: async (lensAccessToken: string) => {
      console.log(
        "🔍 Starting Lens auth sync with token length:",
        lensAccessToken?.length || 0
      );

      // Validate token format first
      if (!lensAccessToken || lensAccessToken.length < 50) {
        throw new Error("Invalid Lens token format");
      }

      const tokenParts = lensAccessToken.split(".");
      if (tokenParts.length !== 3) {
        throw new Error("Invalid JWT token format");
      }

      // First, debug the token to understand what's happening (optional)
      try {
        const debugResponse = await hono.auth.debugToken(lensAccessToken);
        console.log("🔍 Lens token debug info:", debugResponse);

        if (!debugResponse.success) {
          console.warn("🔍 Token debug failed:", debugResponse.error);
        } else if (debugResponse.tokenInfo?.isExpired) {
          throw new Error("Lens token is expired");
        } else if (!debugResponse.tokenInfo?.walletAddress) {
          throw new Error("Lens token missing wallet address");
        }
      } catch (debugError) {
        console.error("🔍 Token debug error:", debugError);
        // If debug fails due to network issues, continue with sync
        // If debug fails due to token issues, throw the error
        if (
          debugError instanceof Error &&
          (debugError.message.includes("expired") ||
            debugError.message.includes("missing wallet address") ||
            debugError.message.includes("Invalid"))
        ) {
          throw debugError;
        }
        // Otherwise, continue with sync attempt even if debug fails
      }

      console.log("🔍 Proceeding with sync-lens call");
      const response = await hono.auth.syncLens(lensAccessToken);
      console.log("🔍 Sync-lens response:", response);
      return response;
    },
    onError: (error) => {
      handleSilentError(error, "Lens Auth Sync");

      // If the error is due to an invalid token, we should clear the invalid token
      if (shouldClearAuth(error)) {
        console.log("🔍 Clearing invalid Lens token due to sync failure");
        signOut();
      }
    },
    onSuccess: (data) => {
      console.log("🔍 Lens auth sync successful:", data);
      // Store our backend JWT and user data
      signInWithBackend({
        token: data.token,
        user: data.user
      });
    }
  });

  // Auto-sync when Lens token is available but backend token is not
  useEffect(() => {
    // Always call these functions to maintain hook consistency
    const { accessToken } = hydrateAuthTokens();
    const { backendToken } = hydrateBackendTokens();

    // Early return if conditions are not met (but hooks are still called)
    if (!accessToken || backendToken || isPending || isInitialized) {
      return;
    }

    // Mark as initialized to prevent multiple calls
    setIsInitialized(true);

    // Prevent too frequent sync attempts (max once every 5 seconds)
    const now = Date.now();
    if (now - lastSyncAttempt.current < 5000) {
      console.log("🔍 Skipping auto-sync - too recent attempt");
      return;
    }
    lastSyncAttempt.current = now;

    console.log(
      "🔍 Auto-syncing Lens auth - token length:",
      accessToken.length
    );

    // Check if token looks valid (basic JWT format check)
    const tokenParts = accessToken.split(".");
    if (tokenParts.length !== 3) {
      console.error(
        "🔍 Invalid Lens token format, clearing token and skipping auto-sync"
      );
      signOut();
      return;
    }

    // Check if token is not just a placeholder or empty
    if (accessToken.length < 50) {
      console.error(
        "🔍 Token too short, likely invalid, clearing and skipping auto-sync"
      );
      signOut();
      return;
    }

    // Additional validation: check if token contains test data
    try {
      const payload = JSON.parse(atob(tokenParts[1]));
      if (payload.sub?.includes("1234567890abcdef")) {
        console.error(
          "🔍 Token contains test data, clearing and skipping auto-sync"
        );
        signOut();
        return;
      }
    } catch {
      console.error("🔍 Failed to decode token payload, skipping auto-sync");
      signOut();
      return;
    }

    // Only call syncLens if all validations pass
    syncLens(accessToken);
  }, [syncLens, isPending, isInitialized]);

  // Reset initialization when component unmounts
  useEffect(() => {
    return () => {
      setIsInitialized(false);
    };
  }, []);

  return {
    error,
    isPending,
    syncLens
  };
};
