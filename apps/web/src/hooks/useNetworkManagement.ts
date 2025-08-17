import { useState, useCallback, useEffect } from 'react';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { usePremiumRegistration } from './usePremiumRegistration';

export function useNetworkManagement() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  
  const { useValidateNetwork, useArbitrumOneNetwork } = usePremiumRegistration();
  
  const [isSwitching, setIsSwitching] = useState(false);
  const [switchError, setSwitchError] = useState<string | null>(null);

  // Get current chain ID
  const currentChainId = chainId?.toString() || '';

  // Validate current network
  const { data: networkValidation, isLoading: isValidatingNetwork } = useValidateNetwork(currentChainId);
  
  // Get Arbitrum One network info
  const { data: arbitrumOneNetwork, isLoading: isLoadingArbitrumOne } = useArbitrumOneNetwork();

  // Check if current network is Arbitrum One
  const isArbitrumOne = networkValidation?.validation?.isValid || false;
  
  // Check if network switch is needed
  const needsNetworkSwitch = networkValidation?.instructions?.needsSwitch || false;

  // Get network switching instructions
  const networkInstructions = networkValidation?.instructions?.instructions || [];
  
  // Get network switch/add requests
  const switchRequest = networkValidation?.instructions?.switchRequest;
  const addRequest = networkValidation?.instructions?.addRequest;

  // Switch to Arbitrum One
  const switchToArbitrumOne = useCallback(async () => {
    if (!switchRequest?.chainId || !switchChain) {
      setSwitchError('Network switching not available');
      return false;
    }

    try {
      setIsSwitching(true);
      setSwitchError(null);
      
      // Convert hex chain ID to number for wagmi
      const targetChainId = parseInt(switchRequest.chainId, 16);
      
      await switchChain({ chainId: targetChainId });
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to switch network';
      setSwitchError(errorMessage);
      return false;
    } finally {
      setIsSwitching(false);
    }
  }, [switchRequest, switchChain]);

  // Add Arbitrum One to wallet (if not available)
  const addArbitrumOneToWallet = useCallback(async () => {
    if (!addRequest || !window.ethereum) {
      setSwitchError('Cannot add network to wallet');
      return false;
    }

    try {
      setIsSwitching(true);
      setSwitchError(null);
      
      // Request to add network
      await window.ethereum.request(addRequest);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add network';
      setSwitchError(errorMessage);
      return false;
    } finally {
      setIsSwitching(false);
    }
  }, [addRequest]);

  // Auto-switch to Arbitrum One (try switch first, then add if needed)
  const autoSwitchToArbitrumOne = useCallback(async () => {
    try {
      // First try to switch
      const switchSuccess = await switchToArbitrumOne();
      if (switchSuccess) return true;

      // If switch fails, try to add the network
      const addSuccess = await addArbitrumOneToWallet();
      if (addSuccess) {
        // After adding, try switching again
        return await switchToArbitrumOne();
      }

      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Auto-switch failed';
      setSwitchError(errorMessage);
      return false;
    }
  }, [switchToArbitrumOne, addArbitrumOneToWallet]);

  // Clear errors
  const clearSwitchError = useCallback(() => {
    setSwitchError(null);
  }, []);

  // Get formatted chain ID for display
  const getFormattedChainId = useCallback((chainId: string | number) => {
    if (typeof chainId === 'string') {
      if (chainId.startsWith('0x')) {
        return parseInt(chainId, 16).toString();
      }
      return chainId;
    }
    return chainId.toString();
  }, []);

  // Get network display name
  const getNetworkDisplayName = useCallback((chainId: string | number) => {
    const formattedId = getFormattedChainId(chainId);
    
    // Known networks
    const knownNetworks: Record<string, string> = {
      '1': 'Ethereum Mainnet',
      '137': 'Polygon',
      '42161': 'Arbitrum One',
      '10': 'Optimism',
      '56': 'BNB Smart Chain',
      '43114': 'Avalanche C-Chain',
      '250': 'Fantom Opera',
      '8453': 'Base',
      '7777777': 'Zora',
      '1101': 'Polygon zkEVM',
      '59144': 'Linea',
      '534352': 'Scroll',
      '5001': 'Mantle Testnet',
      '5000': 'Mantle',
      '59140': 'Linea Testnet',
      '534351': 'Scroll Sepolia',
      '11155111': 'Sepolia',
      '80001': 'Mumbai',
      '421613': 'Arbitrum Goerli',
      '11155420': 'Optimism Sepolia',
      '97': 'BNB Testnet',
      '43113': 'Fuji',
      '4002': 'Fantom Testnet',
      '84531': 'Base Goerli',
      '999': 'Zora Testnet',
      '1442': 'Polygon zkEVM Testnet'
    };

    return knownNetworks[formattedId] || `Chain ID: ${formattedId}`;
  }, [getFormattedChainId]);

  // Check if network is supported for premium features
  const isNetworkSupported = useCallback((chainId: string | number) => {
    return networkValidation?.supportedNetworks?.some(
      network => network.chainId.toLowerCase() === chainId.toString().toLowerCase()
    ) || false;
  }, [networkValidation]);

  // Get network status for premium registration
  const getNetworkStatusForPremium = useCallback(() => {
    if (isValidatingNetwork) {
      return {
        status: 'loading',
        message: 'Checking network...',
        canProceed: false
      };
    }

    if (isArbitrumOne) {
      return {
        status: 'success',
        message: 'Network is correct for premium registration',
        canProceed: true
      };
    }

    if (needsNetworkSwitch) {
      return {
        status: 'warning',
        message: 'Please switch to Arbitrum One network',
        canProceed: false
      };
    }

    return {
      status: 'error',
      message: 'Network not supported for premium registration',
      canProceed: false
    };
  }, [isValidatingNetwork, isArbitrumOne, needsNetworkSwitch]);

  // Effect to auto-clear errors after some time
  useEffect(() => {
    if (switchError) {
      const timer = setTimeout(() => {
        setSwitchError(null);
      }, 10000); // Clear after 10 seconds
      
      return () => clearTimeout(timer);
    }
  }, [switchError]);

  return {
    // Current state
    currentChainId,
    currentNetwork: chain,
    isArbitrumOne,
    needsNetworkSwitch,
    isSwitching,
    switchError,
    
    // Network validation
    networkValidation,
    isValidatingNetwork,
    networkInstructions,
    switchRequest,
    addRequest,
    
    // Network info
    arbitrumOneNetwork,
    isLoadingArbitrumOne,
    
    // Actions
    switchToArbitrumOne,
    addArbitrumOneToWallet,
    autoSwitchToArbitrumOne,
    clearSwitchError,
    
    // Utilities
    getFormattedChainId,
    getNetworkDisplayName,
    isNetworkSupported,
    getNetworkStatusForPremium
  };
}

export default useNetworkManagement;
