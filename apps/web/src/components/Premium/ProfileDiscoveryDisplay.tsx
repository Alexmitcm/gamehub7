import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { usePremiumRegistration } from '../../hooks/usePremiumRegistration';
import { LensProfile } from '../../hooks/usePremiumRegistration';

interface ProfileDiscoveryDisplayProps {
  className?: string;
  onProfileSelect?: (profile: LensProfile) => void;
  showActions?: boolean;
}

export default function ProfileDiscoveryDisplay({ 
  className = '', 
  onProfileSelect,
  showActions = true 
}: ProfileDiscoveryDisplayProps) {
  const { address, isConnected } = useAccount();
  const { useDiscoverProfiles, useAutoLinkProfile, useLinkProfile } = usePremiumRegistration();
  
  const [selectedProfile, setSelectedProfile] = useState<LensProfile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: profileDiscovery, isLoading: isLoadingProfiles, refetch: refetchProfiles } = useDiscoverProfiles(address || '');
  const autoLinkProfileMutation = useAutoLinkProfile();
  const linkProfileMutation = useLinkProfile();

  if (!isConnected || !address) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-gray-400 rounded-full mr-3"></div>
          <span className="text-gray-600">Wallet not connected</span>
        </div>
      </div>
    );
  }

  const handleProfileSelect = (profile: LensProfile) => {
    setSelectedProfile(profile);
    onProfileSelect?.(profile);
  };

  const handleAutoLinkProfile = async () => {
    if (!address) return;

    try {
      setIsProcessing(true);
      const result = await autoLinkProfileMutation.mutateAsync(address);
      
      if (result.success) {
        // Refresh profiles after auto-linking
        refetchProfiles();
        // Clear selection
        setSelectedProfile(null);
        onProfileSelect?.(null);
      }
    } catch (error) {
      console.error('Auto-link failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualLinkProfile = async () => {
    if (!address || !selectedProfile) return;

    try {
      setIsProcessing(true);
      const result = await linkProfileMutation.mutateAsync({
        walletAddress: address,
        profileId: selectedProfile.id
      });
      
      if (result.success) {
        // Refresh profiles after linking
        refetchProfiles();
        // Clear selection
        setSelectedProfile(null);
        onProfileSelect?.(null);
      }
    } catch (error) {
      console.error('Manual link failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRefreshProfiles = () => {
    refetchProfiles();
    setSelectedProfile(null);
    onProfileSelect?.(null);
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Lens Profile Discovery
          </h3>
          <p className="text-sm text-gray-600">
            Discover and manage your Lens profiles
          </p>
        </div>
        
        <button
          onClick={handleRefreshProfiles}
          disabled={isLoadingProfiles}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoadingProfiles ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Loading State */}
      {isLoadingProfiles && (
        <div className="text-center py-8">
          <svg className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600">Discovering profiles...</p>
        </div>
      )}

      {/* Profiles Found */}
      {!isLoadingProfiles && profileDiscovery?.profiles && profileDiscovery.profiles.length > 0 && (
        <>
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Found {profileDiscovery.profiles.length} profile{profileDiscovery.profiles.length !== 1 ? 's' : ''}
              </span>
              {profileDiscovery.totalCount > profileDiscovery.profiles.length && (
                <span className="text-xs text-gray-500">
                  Showing {profileDiscovery.profiles.length} of {profileDiscovery.totalCount}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-3 mb-6">
            {profileDiscovery.profiles.map((profile) => (
              <div
                key={profile.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedProfile?.id === profile.id
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
                onClick={() => handleProfileSelect(profile)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {profile.handle.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">@{profile.handle}</h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            profile.isDefault 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {profile.isDefault ? 'Default' : 'Profile'}
                          </span>
                          <span className="text-gray-400">•</span>
                          <span>Created {new Date(profile.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {selectedProfile?.id === profile.id && (
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    
                    <div className="text-right">
                      <div className="text-xs text-gray-500 font-mono">
                        {profile.id.slice(0, 8)}...{profile.id.slice(-6)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {profile.ownedBy.slice(0, 6)}...{profile.ownedBy.slice(-4)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          {showActions && (
            <div className="space-y-3">
              <button
                onClick={handleAutoLinkProfile}
                disabled={isProcessing || autoLinkProfileMutation.isPending}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing || autoLinkProfileMutation.isPending ? 'Processing...' : 'Auto-Link Best Profile'}
              </button>
              
              <button
                onClick={handleManualLinkProfile}
                disabled={!selectedProfile || isProcessing || linkProfileMutation.isPending}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing || linkProfileMutation.isPending ? 'Processing...' : 'Link Selected Profile'}
              </button>
              
              <p className="text-xs text-gray-500 text-center">
                Auto-link will choose the best profile automatically. Manual link allows you to select a specific profile.
              </p>
            </div>
          )}
        </>
      )}

      {/* No Profiles Found */}
      {!isLoadingProfiles && (!profileDiscovery?.profiles || profileDiscovery.profiles.length === 0) && (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Profiles Found</h4>
          <p className="text-gray-600 mb-4">
            We couldn't find any Lens profiles associated with your wallet address.
          </p>
          <button
            onClick={handleRefreshProfiles}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Error State */}
      {profileDiscovery && !profileDiscovery.success && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{profileDiscovery.message}</p>
          <button
            onClick={handleRefreshProfiles}
            className="text-red-600 text-sm hover:text-red-800 mt-2"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
