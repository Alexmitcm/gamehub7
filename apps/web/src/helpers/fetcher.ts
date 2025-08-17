import { HEY_API_URL } from "@hey/data/constants";
import { Status } from "@hey/data/enums";
import type { Live, Oembed, Preferences, STS } from "@hey/types/api";
import { hydrateAuthTokens } from "@/store/persisted/useAuthStore";
import { isTokenExpiringSoon, refreshTokens } from "./tokenManager";

interface ApiConfig {
  baseUrl?: string;
  headers?: HeadersInit;
}

// Circuit breaker state
let circuitBreakerState = {
  isOpen: false,
  failureCount: 0,
  lastFailureTime: 0,
  threshold: 3,
  timeout: 30000 // 30 seconds
};

const config: ApiConfig = {
  baseUrl: HEY_API_URL,
  headers: {
    "Content-Type": "application/json"
  }
};

// Circuit breaker logic
const shouldAllowRequest = () => {
  if (!circuitBreakerState.isOpen) return true;
  
  const now = Date.now();
  if (now - circuitBreakerState.lastFailureTime > circuitBreakerState.timeout) {
    circuitBreakerState.isOpen = false;
    circuitBreakerState.failureCount = 0;
    return true;
  }
  
  return false;
};

const recordFailure = () => {
  circuitBreakerState.failureCount++;
  circuitBreakerState.lastFailureTime = Date.now();
  
  if (circuitBreakerState.failureCount >= circuitBreakerState.threshold) {
    circuitBreakerState.isOpen = true;
    console.warn("🔍 Circuit breaker opened due to repeated failures");
  }
};

const recordSuccess = () => {
  circuitBreakerState.failureCount = 0;
  if (circuitBreakerState.isOpen) {
    circuitBreakerState.isOpen = false;
    console.log("🔍 Circuit breaker closed after successful request");
  }
};

const fetchApi = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  // Check circuit breaker first
  if (!shouldAllowRequest()) {
    throw new Error("Service temporarily unavailable due to repeated failures. Please try again later.");
  }

  const { accessToken, refreshToken } = hydrateAuthTokens();
  let token = accessToken;

  if (token && refreshToken && isTokenExpiringSoon(token)) {
    try {
      token = await refreshTokens(token);
    } catch {}
  }

  const url = `${config.baseUrl}${endpoint}`;
  console.log("🔍 Making API request to:", url);
  console.log("🔍 Request options:", {
    headers: options.headers,
    method: options.method
  });

  try {
    const response = await fetch(url, {
      ...options,
      credentials: "include",
      headers: {
        ...config.headers,
        ...(token ? { "X-Access-Token": token } : {}),
        ...options.headers
      }
    });

    console.log("🔍 Response status:", response.status);
    console.log(
      "🔍 Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      // For 401 errors, provide a more specific error message
      if (response.status === 401) {
        throw new Error("401 (Unauthorized)");
      }
      
      // Handle server errors specifically
      if (response.status >= 500) {
        if (response.status === 502) {
          throw new Error("502 (Bad Gateway) - Server is experiencing issues. Please try again later.");
        } else if (response.status === 503) {
          throw new Error("503 (Service Unavailable) - Server is temporarily unavailable. Please try again later.");
        } else if (response.status === 504) {
          throw new Error("504 (Gateway Timeout) - Server is taking too long to respond. Please try again later.");
        } else {
          throw new Error(`Server Error (${response.status}) - Server is experiencing issues. Please try again later.`);
        }
      }
      
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Check content type to ensure we're getting JSON
    const contentType = response.headers.get("content-type");
    if (contentType && !contentType.includes("application/json")) {
      console.warn("🔍 Warning: Response is not JSON, content-type:", contentType);
      
      // Try to get the response text to see what we actually received
      const responseText = await response.text();
      if (responseText.trim().startsWith("<!DOCTYPE") || responseText.trim().startsWith("<html")) {
        // Record this as a failure for circuit breaker
        recordFailure();
        throw new Error("API returned HTML instead of JSON. The endpoint may be incorrect or the server may be down.");
      }
      
      // If it's not HTML but also not JSON, log the response for debugging
      console.warn("🔍 Non-JSON response content:", responseText.substring(0, 200));
      recordFailure();
      throw new Error("API returned non-JSON response. Please check the endpoint configuration.");
    }

    const result = await response.json();
    console.log("🔍 Response data:", result);

    // Record success for circuit breaker
    recordSuccess();

    // Handle API responses with success/error format
    if (result.success === true) {
      return result;
    }

    // Handle legacy responses with status/data format
    if (result.status === Status.Success) {
      return result.data;
    }

    // Handle new API format with data/status/message structure
    if (result.data && result.status) {
      return result.data;
    }

    throw new Error(result.error || "Unknown error");
  } catch (error) {
    console.error(`🔍 API request failed for ${url}:`, error);
    
    // Record failure for circuit breaker (except for expected errors like 401)
    if (error instanceof Error && !error.message.includes("401")) {
      recordFailure();
    }
    
    throw error;
  }
};

export const hono = {
  auth: {
    debugToken: (
      lensAccessToken: string
    ): Promise<{
      success: boolean;
      tokenInfo?: {
        hasValidFormat: boolean;
        payload: any;
        walletAddress: string;
        profileId?: string;
        issuedAt?: string;
        expiresAt?: string;
        isExpired?: boolean;
      };
      error?: string;
    }> => {
      return fetchApi("/auth/debug-token", {
        body: JSON.stringify({ lensAccessToken }),
        method: "POST"
      });
    },
    syncLens: (
      lensAccessToken: string
    ): Promise<{
      success: boolean;
      user: {
        walletAddress: string;
        status: "Standard" | "Premium";
        linkedProfileId?: string;
        email?: string;
        username?: string;
        displayName?: string;
        avatarUrl?: string;
        registrationDate: string;
        lastActiveAt: string;
        totalLogins: number;
      };
      token: string;
      isNewUser: boolean;
      message: string;
    }> => {
      return fetchApi("/auth/sync-lens", {
        body: JSON.stringify({ lensAccessToken }),
        method: "POST"
      });
    }
  },
  live: {
    create: ({ record }: { record: boolean }): Promise<Live> => {
      return fetchApi<Live>("/live/create", {
        body: JSON.stringify({ record }),
        method: "POST"
      });
    }
  },
  metadata: {
    sts: (): Promise<STS> => {
      return fetchApi<STS>("/metadata/sts", { method: "GET" });
    }
  },
  oembed: {
    get: (url: string): Promise<Oembed> => {
      return fetchApi<Oembed>(`/oembed/get?url=${url}`, { method: "GET" });
    }
  },
  preferences: {
    get: (): Promise<Preferences> => {
      return fetchApi<Preferences>("/preferences/get", { method: "GET" });
    },
    update: (preferences: Partial<Preferences>): Promise<Preferences> => {
      return fetchApi<Preferences>("/preferences/update", {
        body: JSON.stringify(preferences),
        method: "POST"
      });
    }
  },
  premium: {
    autoLinkProfile: (
      walletAddress: string
    ): Promise<{
      profileId: string;
      handle: string;
      linkedAt: string;
    }> => {
      return fetchApi("/premium/auto-link", {
        body: JSON.stringify({ walletAddress }),
        method: "POST"
      });
    },
    debug: (walletAddress: string): Promise<any> => {
      return fetchApi("/premium/debug", {
        body: JSON.stringify({ walletAddress }),
        method: "POST"
      });
    },
    getAvailableProfiles: (
      walletAddress: string
    ): Promise<{
      profiles: Array<{
        id: string;
        handle: string;
        ownedBy: string;
        isDefault: boolean;
      }>;
      canLink: boolean;
      linkedProfile?: {
        profileId: string;
        handle: string;
        linkedAt: string;
      } | null;
    }> => {
      return fetchApi("/premium/available-profiles", {
        body: JSON.stringify({ walletAddress }),
        method: "POST"
      });
    },
    getSimpleStatus: (
      walletAddress: string,
      profileId?: string
    ): Promise<{
      userStatus: "Standard" | "ProLinked";
      linkedProfile?: {
        profileId: string;
        linkedAt: string;
      };
    }> => {
      return fetchApi("/premium/simple-status", {
        body: JSON.stringify({ profileId, walletAddress }),
        method: "POST"
      });
    },
    getUserStatus: (
      walletAddress: string
    ): Promise<{
      userStatus: "Standard" | "OnChainUnlinked" | "ProLinked";
      linkedProfile?: {
        profileId: string;
        handle: string;
        linkedAt: string;
      } | null;
    }> => {
      return fetchApi("/premium/user-status", {
        body: JSON.stringify({ walletAddress }),
        method: "POST"
      });
    },
    linkedProfile: (): Promise<any> => {
      return fetchApi("/premium/linked-profile", { method: "GET" });
    },
    linkProfile: (
      walletAddress: string,
      profileId: string
    ): Promise<{
      profileId: string;
      handle: string;
      linkedAt: string;
    }> => {
      return fetchApi("/premium/link", {
        body: JSON.stringify({ profileId, walletAddress }),
        method: "POST"
      });
    },
    profiles: ({
      query
    }: {
      query: { walletAddress: string };
    }): Promise<{ profiles: any[] }> => {
      return fetchApi(
        `/premium/profiles?walletAddress=${query.walletAddress}`,
        { method: "GET" }
      );
    },
    stats: (): Promise<any> => {
      return fetchApi("/premium/stats", { method: "GET" });
    },
    status: (): Promise<{
      userStatus: string;
      isPremium: boolean;
      linkedProfile?: any;
    }> => {
      return fetchApi("/premium/status", { method: "GET" });
    },
    verifyRegistration: ({
      json
    }: {
      json: {
        userAddress: string;
        referrerAddress: string;
        transactionHash: string;
        blockNumber: number;
      };
    }): Promise<any> => {
      return fetchApi("/premium/verify-registration", {
        body: JSON.stringify(json),
        method: "POST"
      });
    }
  }
};
