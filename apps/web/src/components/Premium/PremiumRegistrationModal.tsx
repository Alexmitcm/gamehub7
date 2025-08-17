import React, { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { usePremiumRegistration } from '../../hooks/usePremiumRegistration';
import { useNetworkManagement } from '../../hooks/useNetworkManagement';
import { formatAddress } from '@hey/helpers/formatAddress';
import { UserStatus, LensProfile, PremiumRegistrationRequest } from '../../hooks/usePremiumRegistration';

interface PremiumRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  referrerAddress?: string;
}

export default function PremiumRegistrationModal({ 
  isOpen, 
  onClose, 
  referrerAddress = '0x0000000000000000000000000000000000000000' 
}: PremiumRegistrationModalProps) {
  const { address, isConnected } = useAccount();
  const { connect, isConnecting } = useConnect({
    connector: new InjectedConnector()
  });
  const { disconnect } = useDisconnect();

  const {
    useUserStatus,
    useDiscoverProfiles,
    useAutoLinkProfile,
    useLinkProfile,
    useRegisterPremium,
    error: apiError,
    clearError
  } = usePremiumRegistration();

  const {
    isArbitrumOne,
    needsNetworkSwitch,
    isSwitching,
    switchError,
    autoSwitchToArbitrumOne,
    getNetworkStatusForPremium,
    getNetworkDisplayName
  } = useNetworkManagement();

  // Local state
  const [currentStep, setCurrentStep] = useState<'connect' | 'network' | 'profiles' | 'registration' | 'success'>('connect');
  const [selectedProfile, setSelectedProfile] = useState<LensProfile | null>(null);
  const [referrerInput, setReferrerInput] = useState(referrerAddress);
  const [isProcessing, setIsProcessing] = useState(false);

  // Queries
  const { data: userStatus, isLoading: isLoadingUserStatus } = useUserStatus(address || '');
  const { data: profileDiscovery, isLoading: isLoadingProfiles } = useDiscoverProfiles(address || '');

  // Mutations
  const autoLinkProfileMutation = useAutoLinkProfile();
  const linkProfileMutation = useLinkProfile();
  const registerPremiumMutation = useRegisterPremium();

  // Effects
  useEffect(() => {
    if (isOpen && address) {
      // Auto-advance to network check if wallet is connected
      setCurrentStep('network');
    }
  }, [isOpen, address]);

  useEffect(() => {
    if (isArbitrumOne && address) {
      // Auto-advance to profile discovery if network is correct
      setCurrentStep('profiles');
    }
  }, [isArbitrumOne, address]);

  // Handlers
  const handleConnectWallet = async () => {
    try {
      await connect();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const handleNetworkSwitch = async () => {
    try {
      await autoSwitchToArbitrumOne();
    } catch (error) {
      console.error('Failed to switch network:', error);
    }
  };

  const handleProfileSelect = (profile: LensProfile) => {
    setSelectedProfile(profile);
  };

  const handleAutoLinkProfile = async () => {
    if (!address) return;

    try {
      setIsProcessing(true);
      const result = await autoLinkProfileMutation.mutateAsync(address);
      
      if (result.success) {
        setCurrentStep('success');
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
        setCurrentStep('success');
      }
    } catch (error) {
      console.error('Manual link failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePremiumRegistration = async () => {
    if (!address || !selectedProfile) return;

    try {
      setIsProcessing(true);
      const request: PremiumRegistrationRequest = {
        userAddress: address,
        referrerAddress: referrerInput,
        lensProfileId: selectedProfile.id,
        lensWalletAddress: address
      };

      const result = await registerPremiumMutation.mutateAsync(request);
      
      if (result.success) {
        setCurrentStep('success');
      }
    } catch (error) {
      console.error('Premium registration failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setCurrentStep('connect');
    setSelectedProfile(null);
    setReferrerInput(referrerAddress);
    setIsProcessing(false);
    clearError();
    onClose();
  };

  // Network status
  const networkStatus = getNetworkStatusForPremium();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-2xl mx-4 bg-white rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            Premium Registration
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Connect Wallet */}
          {currentStep === 'connect' && (
            <div className="text-center">
              <div className="mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Connect Your Wallet
                </h3>
                <p className="text-gray-600">
                  To start your premium registration, please connect your MetaMask wallet
                </p>
              </div>
              
              <button
                onClick={handleConnectWallet}
                disabled={isConnecting}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
              </button>
            </div>
          )}

          {/* Step 2: Network Check */}
          {currentStep === 'network' && (
            <div className="text-center">
              <div className="mb-6">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                  networkStatus.status === 'success' ? 'bg-green-100' :
                  networkStatus.status === 'warning' ? 'bg-yellow-100' :
                  networkStatus.status === 'error' ? 'bg-red-100' : 'bg-gray-100'
                }`}>
                  {networkStatus.status === 'success' && (
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {networkStatus.status === 'warning' && (
                    <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  )}
                  {networkStatus.status === 'error' && (
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {networkStatus.status === 'loading' && (
                    <svg className="w-8 h-8 text-gray-600 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Network Check
                </h3>
                <p className="text-gray-600 mb-4">
                  {networkStatus.message}
                </p>
                
                {address && (
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <p className="text-sm text-gray-600">
                      Connected Wallet: <span className="font-mono font-medium">{formatAddress(address)}</span>
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Current Network: <span className="font-medium">{getNetworkDisplayName(chain?.id || '')}</span>
                    </p>
                  </div>
                )}
              </div>

              {needsNetworkSwitch && (
                <button
                  onClick={handleNetworkSwitch}
                  disabled={isSwitching}
                  className="w-full bg-yellow-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-3"
                >
                  {isSwitching ? 'Switching Network...' : 'Switch to Arbitrum One'}
                </button>
              )}

              {switchError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-800 text-sm">{switchError}</p>
                </div>
              )}

              {isArbitrumOne && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 text-sm">✅ Network is correct! Proceeding to profile discovery...</p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Profile Discovery */}
          {currentStep === 'profiles' && (
            <div>
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Discover Your Profiles
                </h3>
                <p className="text-gray-600">
                  We found the following Lens profiles associated with your wallet
                </p>
              </div>

              {isLoadingProfiles ? (
                <div className="text-center py-8">
                  <svg className="w-8 h-8 text-gray-600 animate-spin mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-gray-600">Discovering profiles...</p>
                </div>
              ) : profileDiscovery?.profiles && profileDiscovery.profiles.length > 0 ? (
                <div className="space-y-4">
                  {profileDiscovery.profiles.map((profile) => (
                    <div
                      key={profile.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedProfile?.id === profile.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleProfileSelect(profile)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">@{profile.handle}</h4>
                          <p className="text-sm text-gray-600">
                            {profile.isDefault ? 'Default Profile' : 'Profile'}
                          </p>
                          <p className="text-xs text-gray-500 font-mono">
                            {profile.id}
                          </p>
                        </div>
                        {selectedProfile?.id === profile.id && (
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No Profiles Found</h4>
                  <p className="text-gray-600">
                    We couldn't find any Lens profiles associated with your wallet address.
                  </p>
                </div>
              )}

              {profileDiscovery?.profiles && profileDiscovery.profiles.length > 0 && (
                <div className="mt-6 space-y-3">
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
                </div>
              )}
            </div>
          )}

          {/* Step 4: Premium Registration */}
          {currentStep === 'registration' && (
            <div>
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Complete Premium Registration
                </h3>
                <p className="text-gray-600">
                  Finalize your premium registration with the selected profile
                </p>
              </div>

              {selectedProfile && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-blue-900 mb-2">Selected Profile</h4>
                  <p className="text-blue-800">@{selectedProfile.handle}</p>
                  <p className="text-blue-600 text-sm font-mono">{selectedProfile.id}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Referrer Address (Optional)
                  </label>
                  <input
                    type="text"
                    value={referrerInput}
                    onChange={(e) => setReferrerInput(e.target.value)}
                    placeholder="0x0000000000000000000000000000000000000000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty if you don't have a referrer
                  </p>
                </div>

                <button
                  onClick={handlePremiumRegistration}
                  disabled={!selectedProfile || isProcessing || registerPremiumMutation.isPending}
                  className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isProcessing || registerPremiumMutation.isPending ? 'Processing Registration...' : 'Complete Premium Registration'}
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Success */}
          {currentStep === 'success' && (
            <div className="text-center">
              <div className="mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Registration Complete!
                </h3>
                <p className="text-gray-600">
                  Congratulations! You are now a premium user. You can now access all premium features.
                </p>
              </div>

              <button
                onClick={handleClose}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Close
              </button>
            </div>
          )}

          {/* Error Display */}
          {apiError && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{apiError}</p>
              <button
                onClick={clearError}
                className="text-red-600 text-sm hover:text-red-800 mt-2"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex space-x-2">
            {['connect', 'network', 'profiles', 'registration', 'success'].map((step, index) => (
              <div
                key={step}
                className={`w-3 h-3 rounded-full ${
                  currentStep === step ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          
          <div className="text-sm text-gray-500">
            Step {['connect', 'network', 'profiles', 'registration', 'success'].indexOf(currentStep) + 1} of 5
          </div>
        </div>
      </div>
    </div>
  );
}
