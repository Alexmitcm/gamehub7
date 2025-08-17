import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import UserStatusDisplay from './UserStatusDisplay';
import NetworkStatusDisplay from './NetworkStatusDisplay';
import ProfileDiscoveryDisplay from './ProfileDiscoveryDisplay';
import PremiumRegistrationModal from './PremiumRegistrationModal';
import { LensProfile } from '../../hooks/usePremiumRegistration';

interface PremiumDashboardProps {
  className?: string;
  referrerAddress?: string;
}

export default function PremiumDashboard({ className = '', referrerAddress }: PremiumDashboardProps) {
  const { address, isConnected } = useAccount();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<LensProfile | null>(null);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProfile(null);
  };

  const handleProfileSelect = (profile: LensProfile | null) => {
    setSelectedProfile(profile);
  };

  if (!isConnected || !address) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-6 ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h4z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Connect Your Wallet
          </h3>
          <p className="text-gray-600 mb-4">
            Please connect your wallet to access the premium dashboard
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Premium Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your premium status and Lens profile connections
            </p>
          </div>
          
          <button
            onClick={handleOpenModal}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Premium Registration
          </button>
        </div>
      </div>

      {/* User Status */}
      <UserStatusDisplay showDetails={true} />

      {/* Network Status */}
      <NetworkStatusDisplay showActions={true} />

      {/* Profile Discovery */}
      <ProfileDiscoveryDisplay 
        onProfileSelect={handleProfileSelect}
        showActions={false}
      />

      {/* Quick Actions */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Quick Actions
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleOpenModal}
            className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h4 className="font-medium text-gray-900">Premium Registration</h4>
              <p className="text-sm text-gray-600">Complete your premium registration</p>
            </div>
          </button>

          <button
            onClick={() => window.open('https://arbiscan.io', '_blank')}
            className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
          >
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
              <h4 className="font-medium text-gray-900">View on Arbiscan</h4>
              <p className="text-sm text-gray-600">Check your on-chain status</p>
            </div>
          </button>
        </div>
      </div>

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Premium Benefits */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h4 className="font-medium text-green-900 mb-2">Premium Benefits</h4>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• Access to premium features</li>
            <li>• Referral rewards</li>
            <li>• Priority support</li>
            <li>• Exclusive content</li>
          </ul>
        </div>

        {/* Network Requirements */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h4 className="font-medium text-blue-900 mb-2">Network Requirements</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Arbitrum One network</li>
            <li>• MetaMask wallet</li>
            <li>• ETH for gas fees</li>
            <li>• Lens profile</li>
          </ul>
        </div>

        {/* Support */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h4 className="font-medium text-purple-900 mb-2">Need Help?</h4>
          <ul className="text-sm text-purple-800 space-y-1">
            <li>• Check network status</li>
            <li>• Verify wallet connection</li>
            <li>• Ensure Arbitrum One</li>
            <li>• Contact support</li>
          </ul>
        </div>
      </div>

      {/* Premium Registration Modal */}
      <PremiumRegistrationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        referrerAddress={referrerAddress}
      />
    </div>
  );
}
