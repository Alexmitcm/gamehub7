import React from 'react';
import { useAccount } from 'wagmi';
import { usePremiumRegistration } from '../../hooks/usePremiumRegistration';
import formatAddress from '@hey/helpers/formatAddress';

interface UserStatusDisplayProps {
  className?: string;
  showDetails?: boolean;
}

export default function UserStatusDisplay({ className = '', showDetails = false }: UserStatusDisplayProps) {
  const { address, isConnected } = useAccount();
  
  const { useUserStatus, useCheckWalletPremium } = usePremiumRegistration();
  
  const { data: userStatus, isLoading: isLoadingUserStatus } = useUserStatus(address || '');
  const { data: walletPremiumStatus, isLoading: isLoadingWalletPremium } = useCheckWalletPremium(address || '');

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

  if (isLoadingUserStatus || isLoadingWalletPremium) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center">
          <svg className="w-4 h-4 text-gray-400 animate-spin mr-3" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-gray-600">Loading status...</span>
        </div>
      </div>
    );
  }

  if (!userStatus) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-400 rounded-full mr-3"></div>
          <span className="text-red-800">Failed to load user status</span>
        </div>
      </div>
    );
  }

  // Determine status display
  const getStatusDisplay = () => {
    switch (userStatus.status) {
      case 'Premium':
        return {
          icon: '🟢',
          color: 'green',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800',
          label: 'Premium User'
        };
      case 'OnChainUnlinked':
        return {
          icon: '🟡',
          color: 'yellow',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
          label: 'Premium (Unlinked)'
        };
      case 'Standard':
      default:
        return {
          icon: '🔵',
          color: 'blue',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
          label: 'Standard User'
        };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div className={`${statusDisplay.bgColor} border ${statusDisplay.borderColor} rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-2xl mr-3">{statusDisplay.icon}</span>
          <div>
            <h3 className={`font-medium ${statusDisplay.textColor}`}>
              {statusDisplay.label}
            </h3>
            {showDetails && (
              <div className="text-sm text-gray-600 mt-1">
                <p>Wallet: {formatAddress(address)}</p>
                {userStatus.linkedProfile && (
                  <p>Profile: @{userStatus.linkedProfile.handle}</p>
                )}
                {userStatus.referrerAddress && userStatus.referrerAddress !== '0x0000000000000000000000000000000000000000' && (
                  <p>Referred by: {formatAddress(userStatus.referrerAddress)}</p>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="text-right">
          <div className={`text-xs px-2 py-1 rounded-full ${
            userStatus.isPremiumOnChain 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {userStatus.isPremiumOnChain ? 'On-Chain Premium' : 'Not Premium'}
          </div>
          
          {userStatus.hasLinkedProfile && (
            <div className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 mt-1">
              Profile Linked
            </div>
          )}
        </div>
      </div>

      {/* Additional Status Information */}
      {showDetails && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Registration:</span>
              <span className="ml-2 font-medium">
                {userStatus.registrationTxHash ? 'Completed' : 'Not Registered'}
              </span>
            </div>
            
            <div>
              <span className="text-gray-600">Upgraded:</span>
              <span className="ml-2 font-medium">
                {userStatus.premiumUpgradedAt 
                  ? new Date(userStatus.premiumUpgradedAt).toLocaleDateString()
                  : 'N/A'
                }
              </span>
            </div>
            
            <div>
              <span className="text-gray-600">Can Link:</span>
              <span className={`ml-2 font-medium ${
                userStatus.canLinkProfile ? 'text-green-600' : 'text-red-600'
              }`}>
                {userStatus.canLinkProfile ? 'Yes' : 'No'}
              </span>
            </div>
            
            {userStatus.rejectionReason && (
              <div className="col-span-2">
                <span className="text-gray-600">Rejection Reason:</span>
                <span className="ml-2 text-red-600 font-medium">
                  {userStatus.rejectionReason}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
