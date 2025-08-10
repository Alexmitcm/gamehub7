import { HEY_API_URL } from "@hey/data/constants";
import { Status } from "@hey/data/enums";
import type { Oembed, Preferences, STS } from "@hey/types/api";
import { hydrateAuthTokens } from "@/store/persisted/useAuthStore";
import { isTokenExpiringSoon, refreshTokens } from "./tokenManager";

interface ApiConfig {
  baseUrl?: string;
  headers?: HeadersInit;
}

const config: ApiConfig = {
  baseUrl: HEY_API_URL,
  headers: {
    "Content-Type": "application/json"
  }
};

const fetchApi = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const { accessToken, refreshToken } = hydrateAuthTokens();
  let token = accessToken;

  if (token && refreshToken && isTokenExpiringSoon(token)) {
    try {
      token = await refreshTokens(refreshToken);
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
        ...{ "X-Access-Token": token || "" },
        ...config.headers
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
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    console.log("🔍 Response data:", result);

    // Handle API responses with success/error format
    if (result.success === true) {
      return result;
    }

    // Handle legacy responses with status/data format
    if (result.status === Status.Success) {
      return result.data;
    }

    throw new Error(result.error || "Unknown error");
  } catch (error) {
    console.error(`🔍 API request failed for ${url}:`, error);
    throw error;
  }
};

export const hono = ({
<<<<<<< Updated upstream
====== = auth);
:
{
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
    syncLens;
  : (
      lensAccessToken: string
    ): Promise<
  success: boolean;
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
  token: string;
  isNewUser: boolean;
  message: string;
  > =>
  return fetchApi("/auth/sync-lens", {
        body: JSON.stringify({ lensAccessToken }),
        method: "POST"
      });
}
,
  live:
{
  create: ({ record }: { record: boolean }): Promise<Live> => {
    return fetchApi<Live>("/live/create", {
      body: JSON.stringify({ record }),
      method: "POST"
    });
  };
}
,
>>>>>>> Stashed changes
  metadata:
{
  sts: (): Promise<STS> => {
    return fetchApi<STS>("/metadata/sts", { method: "GET" });
  };
}
,
  oembed:
{
  get: (url: string): Promise<Oembed> => {
    return fetchApi<Oembed>(`/oembed/get?url=${url}`, { method: "GET" });
  };
}
,
  preferences:
{
  get: (): Promise<Preferences> => {
    return fetchApi<Preferences>("/preferences/get", { method: "GET" });
  },
    update;
  : (preferences: Partial<Preferences>): Promise<Preferences> =>
  return fetchApi<Preferences>("/preferences/update", {
        body: JSON.stringify(preferences),
        method: "POST"
      });
}
,
  premium:
{
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
    debug;
  : (walletAddress: string): Promise<any> =>
  return fetchApi("/premium/debug", {
        body: JSON.stringify({ walletAddress }),
        method: "POST"
      });
  ,
    getAvailableProfiles: (
      walletAddress: string
    ): Promise<
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
  | null
}
> =>
{
  return fetchApi("/premium/available-profiles", {
        body: JSON.stringify({ walletAddress }),
        method: "POST"
      });
}
,
    getSimpleStatus: (
      walletAddress: string,
      profileId?: string
    ): Promise<
{
  userStatus: "Standard" | "ProLinked";
  linkedProfile?: {
        profileId: string;
  linkedAt: string;
}
}> =>
{
  return fetchApi("/premium/simple-status", {
        body: JSON.stringify({ profileId, walletAddress }),
        method: "POST"
      });
}
,
    getUserStatus: (
      walletAddress: string
    ): Promise<
{
  userStatus: "Standard" | "OnChainUnlinked" | "ProLinked";
  linkedProfile?: {
        profileId: string;
  handle: string;
  linkedAt: string;
}
| null
}> =>
{
  return fetchApi("/premium/user-status", {
        body: JSON.stringify({ walletAddress }),
        method: "POST"
      });
}
,
    linkedProfile: (): Promise<any> =>
{
  return fetchApi("/premium/linked-profile", { method: "GET" });
}
,
    linkProfile: (
      walletAddress: string,
      profileId: string
    ): Promise<
{
  profileId: string;
  handle: string;
  linkedAt: string;
}
> =>
{
  return fetchApi("/premium/link", {
        body: JSON.stringify({ profileId, walletAddress }),
        method: "POST"
      });
}
,
    profiles: (
{
  query;
}
:
{
  walletAddress: string;
}
): Promise<
{
  profiles: any[]
}
> =>
{
  return fetchApi(
        `/premium/profiles?walletAddress=${query.walletAddress}`,
        { method: "GET" }
      );
}
,
    stats: (): Promise<any> =>
{
  return fetchApi("/premium/stats", { method: "GET" });
}
,
    status: (): Promise<
{
  userStatus: string;
  isPremium: boolean;
  linkedProfile?: any;
}
> =>
{
  return fetchApi("/premium/status", { method: "GET" });
}
,
    verifyRegistration: (
{
  json;
}
:
{
  userAddress: string;
  referrerAddress: string;
  transactionHash: string;
  blockNumber: number;
}
): Promise<any> =>
{
  return fetchApi("/premium/verify-registration", {
        body: JSON.stringify(json),
        method: "POST"
      });
}
}
}
