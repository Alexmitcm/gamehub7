import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types
export interface UserStatus {
  status: "Standard" | "Premium" | "OnChainUnlinked";
  walletAddress: string;
  lensProfileId?: string;
  linkedProfile?: {
    profileId: string;
    handle: string;
    linkedAt: Date;
  };
  isPremiumOnChain: boolean;
  hasLinkedProfile: boolean;
  registrationTxHash?: string;
  premiumUpgradedAt?: Date;
  referrerAddress?: string;
  canLinkProfile: boolean;
  rejectionReason?: string;
}

export interface ProfileLinkingResult {
  success: boolean;
  message: string;
  userStatus: UserStatus;
  rejectionReason?: string;
}

export interface AutoLinkResult {
  success: boolean;
  message: string;
  userStatus: UserStatus;
  linkedProfileId?: string;
}

export interface LensProfile {
  id: string;
  handle: string;
  ownedBy: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileDiscoveryResult {
  success: boolean;
  profiles: LensProfile[];
  message: string;
  totalCount: number;
}

export interface NetworkInfo {
  chainId: string;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
  isArbitrumOne: boolean;
}

export interface NetworkValidationResult {
  validation: {
    isValid: boolean;
    message: string;
    requiredNetwork: NetworkInfo;
    currentNetwork?: NetworkInfo;
  };
  instructions: {
    needsSwitch: boolean;
    instructions: string[];
    switchRequest: any;
    addRequest: any;
  };
  supportedNetworks: NetworkInfo[];
}

export interface PremiumRegistrationRequest {
  userAddress: string;
  referrerAddress: string;
  lensProfileId?: string;
  lensWalletAddress?: string;
}

export interface PremiumRegistrationResult {
  success: boolean;
  message: string;
  transactionHash?: string;
  userStatus: UserStatus;
}

// API endpoints
const API_BASE = '/new-premium-registration';

// API functions
const api = {
  // User Status
  getUserStatus: async (walletAddress: string): Promise<UserStatus> => {
    const response = await fetch(`${API_BASE}/user-status?walletAddress=${walletAddress}`);
    if (!response.ok) throw new Error('Failed to get user status');
    const data = await response.json();
    return data.data;
  },

  // Check Wallet Premium
  checkWalletPremium: async (walletAddress: string): Promise<{ isPremium: boolean; walletAddress: string }> => {
    const response = await fetch(`${API_BASE}/check-wallet-premium?walletAddress=${walletAddress}`);
    if (!response.ok) throw new Error('Failed to check wallet premium status');
    const data = await response.json();
    return data.data;
  },

  // Can Link Profile
  canLinkProfile: async (walletAddress: string, profileId: string): Promise<{ canLink: boolean; walletAddress: string; profileId: string }> => {
    const response = await fetch(`${API_BASE}/can-link-profile?walletAddress=${walletAddress}&profileId=${profileId}`);
    if (!response.ok) throw new Error('Failed to check profile linkability');
    const data = await response.json();
    return data.data;
  },

  // Discover Profiles
  discoverProfiles: async (walletAddress: string): Promise<ProfileDiscoveryResult> => {
    const response = await fetch(`${API_BASE}/discover-profiles?walletAddress=${walletAddress}`);
    if (!response.ok) throw new Error('Failed to discover profiles');
    const data = await response.json();
    return data.data;
  },

  // Auto Link Profile
  autoLinkProfile: async (walletAddress: string): Promise<AutoLinkResult> => {
    const response = await fetch(`${API_BASE}/auto-link-profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ walletAddress })
    });
    if (!response.ok) throw new Error('Failed to auto-link profile');
    const data = await response.json();
    return data.data;
  },

  // Link Profile
  linkProfile: async (walletAddress: string, profileId: string): Promise<ProfileLinkingResult> => {
    const response = await fetch(`${API_BASE}/link-profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ walletAddress, profileId })
    });
    if (!response.ok) throw new Error('Failed to link profile');
    const data = await response.json();
    return data.data;
  },

  // Premium Registration
  registerPremium: async (request: PremiumRegistrationRequest): Promise<PremiumRegistrationResult> => {
    const response = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
    if (!response.ok) throw new Error('Failed to register premium');
    const data = await response.json();
    return data.data;
  },

  // Get Profile by ID
  getProfileById: async (profileId: string): Promise<LensProfile> => {
    const response = await fetch(`${API_BASE}/profile/${profileId}`);
    if (!response.ok) throw new Error('Failed to get profile');
    const data = await response.json();
    return data.data;
  },

  // Validate Network
  validateNetwork: async (chainId: string): Promise<NetworkValidationResult> => {
    const response = await fetch(`${API_BASE}/validate-network?chainId=${chainId}`);
    if (!response.ok) throw new Error('Failed to validate network');
    const data = await response.json();
    return data.data;
  },

  // Get Supported Networks
  getSupportedNetworks: async (): Promise<NetworkInfo[]> => {
    const response = await fetch(`${API_BASE}/supported-networks`);
    if (!response.ok) throw new Error('Failed to get supported networks');
    const data = await response.json();
    return data.data;
  },

  // Get Arbitrum One Network
  getArbitrumOneNetwork: async (): Promise<NetworkInfo> => {
    const response = await fetch(`${API_BASE}/arbitrum-one-network`);
    if (!response.ok) throw new Error('Failed to get Arbitrum One network');
    const data = await response.json();
    return data.data;
  }
};

// Main hook
export function usePremiumRegistration() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  // User Status Query
  const useUserStatus = (walletAddress: string) => {
    return useQuery({
      queryKey: ['premium-user-status', walletAddress],
      queryFn: () => api.getUserStatus(walletAddress),
      enabled: !!walletAddress,
      staleTime: 30000, // 30 seconds
      gcTime: 300000, // 5 minutes
    });
  };

  // Check Wallet Premium Query
  const useCheckWalletPremium = (walletAddress: string) => {
    return useQuery({
      queryKey: ['premium-wallet-status', walletAddress],
      queryFn: () => api.checkWalletPremium(walletAddress),
      enabled: !!walletAddress,
      staleTime: 30000,
      gcTime: 300000,
    });
  };

  // Can Link Profile Query
  const useCanLinkProfile = (walletAddress: string, profileId: string) => {
    return useQuery({
      queryKey: ['premium-can-link-profile', walletAddress, profileId],
      queryFn: () => api.canLinkProfile(walletAddress, profileId),
      enabled: !!walletAddress && !!profileId,
      staleTime: 30000,
      gcTime: 300000,
    });
  };

  // Discover Profiles Query
  const useDiscoverProfiles = (walletAddress: string) => {
    return useQuery({
      queryKey: ['premium-discover-profiles', walletAddress],
      queryFn: () => api.discoverProfiles(walletAddress),
      enabled: !!walletAddress,
      staleTime: 60000, // 1 minute
      gcTime: 300000,
    });
  };

  // Get Profile by ID Query
  const useGetProfileById = (profileId: string) => {
    return useQuery({
      queryKey: ['premium-profile', profileId],
      queryFn: () => api.getProfileById(profileId),
      enabled: !!profileId,
      staleTime: 300000, // 5 minutes
      gcTime: 600000, // 10 minutes
    });
  };

  // Validate Network Query
  const useValidateNetwork = (chainId: string) => {
    return useQuery({
      queryKey: ['premium-validate-network', chainId],
      queryFn: () => api.validateNetwork(chainId),
      enabled: !!chainId,
      staleTime: 60000,
      gcTime: 300000,
    });
  };

  // Get Supported Networks Query
  const useSupportedNetworks = () => {
    return useQuery({
      queryKey: ['premium-supported-networks'],
      queryFn: api.getSupportedNetworks,
      staleTime: 300000, // 5 minutes
      gcTime: 600000, // 10 minutes
    });
  };

  // Get Arbitrum One Network Query
  const useArbitrumOneNetwork = () => {
    return useQuery({
      queryKey: ['premium-arbitrum-one-network'],
      queryFn: api.getArbitrumOneNetwork,
      staleTime: 300000, // 5 minutes
      gcTime: 600000, // 10 minutes
    });
  };

  // Auto Link Profile Mutation
  const useAutoLinkProfile = () => {
    return useMutation({
      mutationFn: api.autoLinkProfile,
      onSuccess: (data, variables) => {
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: ['premium-user-status', variables] });
        queryClient.invalidateQueries({ queryKey: ['premium-discover-profiles', variables] });
        setError(null);
      },
      onError: (error: Error) => {
        setError(error.message);
      }
    });
  };

  // Link Profile Mutation
  const useLinkProfile = () => {
    return useMutation({
      mutationFn: ({ walletAddress, profileId }: { walletAddress: string; profileId: string }) =>
        api.linkProfile(walletAddress, profileId),
      onSuccess: (data, variables) => {
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: ['premium-user-status', variables.walletAddress] });
        queryClient.invalidateQueries({ queryKey: ['premium-can-link-profile', variables.walletAddress, variables.profileId] });
        setError(null);
      },
      onError: (error: Error) => {
        setError(error.message);
      }
    });
  };

  // Premium Registration Mutation
  const useRegisterPremium = () => {
    return useMutation({
      mutationFn: api.registerPremium,
      onSuccess: (data, variables) => {
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: ['premium-user-status', variables.userAddress] });
        queryClient.invalidateQueries({ queryKey: ['premium-wallet-status', variables.userAddress] });
        setError(null);
      },
      onError: (error: Error) => {
        setError(error.message);
      }
    });
  };

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Queries
    useUserStatus,
    useCheckWalletPremium,
    useCanLinkProfile,
    useDiscoverProfiles,
    useGetProfileById,
    useValidateNetwork,
    useSupportedNetworks,
    useArbitrumOneNetwork,
    
    // Mutations
    useAutoLinkProfile,
    useLinkProfile,
    useRegisterPremium,
    
    // State
    error,
    clearError,
    
    // API functions (for direct use if needed)
    api
  };
}

export default usePremiumRegistration;
