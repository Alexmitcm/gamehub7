import React from 'react';
import { useNetworkManagement } from '../../hooks/useNetworkManagement';

interface NetworkStatusDisplayProps {
  className?: string;
  showActions?: boolean;
}

export default function NetworkStatusDisplay({ className = '', showActions = true }: NetworkStatusDisplayProps) {
  const {
    currentChainId,
    currentNetwork,
    isArbitrumOne,
    needsNetworkSwitch,
    isSwitching,
    switchError,
    networkInstructions,
    autoSwitchToArbitrumOne,
    clearSwitchError,
    getNetworkDisplayName,
    getNetworkStatusForPremium
  } = useNetworkManagement();

  const networkStatus = getNetworkStatusForPremium();

  if (!currentChainId) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-gray-400 rounded-full mr-3"></div>
          <span className="text-gray-600">Network not detected</span>
        </div>
      </div>
    );
  }

  // Determine status display
  const getStatusDisplay = () => {
    switch (networkStatus.status) {
      case 'success':
        return {
          icon: '🟢',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800'
        };
      case 'warning':
        return {
          icon: '🟡',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800'
        };
      case 'error':
        return {
          icon: '🔴',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800'
        };
      case 'loading':
      default:
        return {
          icon: '🔵',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800'
        };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div className={`${statusDisplay.bgColor} border ${statusDisplay.borderColor} rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <span className="text-2xl mr-3">{statusDisplay.icon}</span>
          <div>
            <h3 className={`font-medium ${statusDisplay.textColor}`}>
              Network Status
            </h3>
            <p className="text-sm text-gray-600">
              {networkStatus.message}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <div className={`text-xs px-2 py-1 rounded-full ${
            isArbitrumOne 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {isArbitrumOne ? 'Arbitrum One' : 'Other Network'}
          </div>
        </div>
      </div>

      {/* Network Information */}
      <div className="bg-white bg-opacity-50 rounded-lg p-3 mb-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Current Network:</span>
            <span className="ml-2 font-medium">
              {getNetworkDisplayName(currentChainId)}
            </span>
          </div>
          
          <div>
            <span className="text-gray-600">Chain ID:</span>
            <span className="ml-2 font-mono font-medium">
              {currentChainId}
            </span>
          </div>
          
          <div>
            <span className="text-gray-600">Currency:</span>
            <span className="ml-2 font-medium">
              {currentNetwork?.nativeCurrency?.symbol || 'Unknown'}
            </span>
          </div>
          
          <div>
            <span className="text-gray-600">Status:</span>
            <span className={`ml-2 font-medium ${
              isArbitrumOne ? 'text-green-600' : 'text-red-600'
            }`}>
              {isArbitrumOne ? 'Compatible' : 'Incompatible'}
            </span>
          </div>
        </div>
      </div>

      {/* Network Instructions */}
      {networkInstructions.length > 0 && (
        <div className="bg-white bg-opacity-50 rounded-lg p-3 mb-4">
          <h4 className="font-medium text-gray-900 mb-2">Instructions:</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            {networkInstructions.map((instruction, index) => (
              <li key={index} className="flex items-start">
                <span className="text-gray-500 mr-2">•</span>
                <span>{instruction}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      {showActions && needsNetworkSwitch && (
        <div className="space-y-3">
          <button
            onClick={autoSwitchToArbitrumOne}
            disabled={isSwitching}
            className="w-full bg-yellow-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSwitching ? 'Switching Network...' : 'Switch to Arbitrum One'}
          </button>
          
          <p className="text-xs text-gray-600 text-center">
            This will automatically switch your wallet to the Arbitrum One network
          </p>
        </div>
      )}

      {/* Error Display */}
      {switchError && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <p className="text-red-800 text-sm">{switchError}</p>
            <button
              onClick={clearSwitchError}
              className="text-red-600 text-sm hover:text-red-800 ml-2"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Success Message */}
      {isArbitrumOne && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-green-800 text-sm">
              Network is correct for premium registration
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
