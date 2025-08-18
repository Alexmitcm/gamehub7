import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import BlockchainService from '../BlockchainService';
import EventService from '../EventService';
import PremiumService from '../PremiumService';
import UserService from '../UserService';

// Mock dependencies
vi.mock('../UserService');
vi.mock('../BlockchainService');
vi.mock('../EventService');

const mockUserService = vi.mocked(UserService);
const mockBlockchainService = vi.mocked(BlockchainService);
const mockEventService = vi.mocked(EventService);

describe('Enhanced PremiumService - New Functionality Testing', () => {
  let premiumService: typeof PremiumService;
  
  const testWalletAddress = '0x1234567890123456789012345678901234567890';
  const testProfileId = '0x01';
  const testHandle = 'testuser.lens';
  const testTransactionHash = '0x1234567890123456789012345678901234567890123456789012345678901234';

  beforeEach(() => {
    vi.clearAllMocks();
    premiumService = PremiumService;
    
    // Reset all mocks
    mockBlockchainService.isWalletPremium.mockResolvedValue(true);
    mockUserService.getUserPremiumStatus.mockResolvedValue({ userStatus: 'Standard' });
    mockUserService.linkProfileToWallet.mockResolvedValue({
      profileId: testProfileId,
      handle: testHandle,
      linkedAt: new Date()
    });
    mockUserService.getAvailableProfiles.mockResolvedValue({
      canLink: true,
      profiles: [
        { id: testProfileId, handle: testHandle, ownedBy: testWalletAddress, isDefault: true }
      ]
    });
    mockEventService.emitProfileLinked.mockResolvedValue();
    mockEventService.emitRegistrationVerified.mockResolvedValue();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Wallet Validation and Detection', () => {
    it('should validate MetaMask wallet on Arbitrum One network', async () => {
      // Arrange
      const chainId = 42161; // Arbitrum One
      const provider = 'MetaMask';

      mockUserService.validateWalletRequirements.mockResolvedValue({
        isValid: true,
        errors: [],
        walletInfo: {
          address: testWalletAddress,
          type: 'MetaMask',
          network: 'Arbitrum One',
          isArbitrumOne: true,
          chainId: 42161
        }
      });

      // Act
      const result = await premiumService.validateWalletRequirements(testWalletAddress, chainId, provider);

      // Assert
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.walletInfo.type).toBe('MetaMask');
      expect(result.walletInfo.isArbitrumOne).toBe(true);
      expect(mockUserService.validateWalletRequirements).toHaveBeenCalledWith(testWalletAddress, chainId, provider);
    });

    it('should reject non-MetaMask wallet', async () => {
      // Arrange
      const chainId = 42161; // Arbitrum One
      const provider = 'WalletConnect';

      mockUserService.validateWalletRequirements.mockResolvedValue({
        isValid: false,
        errors: ['Premium registration requires MetaMask wallet. Please connect with MetaMask.'],
        walletInfo: {
          address: testWalletAddress,
          type: 'Other',
          network: 'Arbitrum One',
          isArbitrumOne: true,
          chainId: 42161
        }
      });

      // Act
      const result = await premiumService.validateWalletRequirements(testWalletAddress, chainId, provider);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Premium registration requires MetaMask wallet. Please connect with MetaMask.');
      expect(result.walletInfo.type).toBe('Other');
    });

    it('should reject non-Arbitrum One network', async () => {
      // Arrange
      const chainId = 1; // Ethereum mainnet
      const provider = 'MetaMask';

      mockUserService.validateWalletRequirements.mockResolvedValue({
        isValid: false,
        errors: ['Premium registration requires Arbitrum One network. Please switch to Arbitrum One network.'],
        walletInfo: {
          address: testWalletAddress,
          type: 'MetaMask',
          network: 'Ethereum',
          isArbitrumOne: false,
          chainId: 1
        }
      });

      // Act
      const result = await premiumService.validateWalletRequirements(testWalletAddress, chainId, provider);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Premium registration requires Arbitrum One network. Please switch to Arbitrum One network.');
      expect(result.walletInfo.isArbitrumOne).toBe(false);
    });
  });

  describe('Transaction Verification and Status Update', () => {
    it('should verify transaction and update premium status successfully', async () => {
      // Arrange
      mockBlockchainService.verifyRegistrationTransaction.mockResolvedValue(true);
      mockBlockchainService.isWalletPremium.mockResolvedValue(true);
      mockUserService.getUserPremiumStatus.mockResolvedValue({
        userStatus: 'ProLinked',
        linkedProfile: {
          profileId: testProfileId,
          handle: testHandle,
          linkedAt: new Date()
        }
      });

      // Act
      const result = await premiumService.verifyAndUpdatePremiumStatus(
        testWalletAddress
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe('Premium status verified successfully!');
      expect(result.userStatus?.userStatus).toBe('ProLinked');
      // No transaction verification anymore; using NodeSet only
      expect(mockBlockchainService.verifyRegistrationTransaction).not.toHaveBeenCalled();
      expect(mockEventService.emitRegistrationVerified).not.toHaveBeenCalled();
    });

    it('should fail when transaction verification fails', async () => {
      // Arrange - in new logic, failure comes from NodeSet check error
      mockBlockchainService.isWalletPremium.mockRejectedValue(
        new Error('Blockchain error')
      );

      // Act
      const result = await premiumService.verifyAndUpdatePremiumStatus(
        testWalletAddress
      );

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe(
        'Failed to verify premium status. Please try again or contact support.'
      );
      expect(
        mockBlockchainService.verifyRegistrationTransaction
      ).not.toHaveBeenCalled();
    });

    it('should fail when wallet is not premium after transaction', async () => {
      // Arrange
      mockBlockchainService.verifyRegistrationTransaction.mockResolvedValue(true);
      mockBlockchainService.isWalletPremium.mockResolvedValue(false);

      // Act
      const result = await premiumService.verifyAndUpdatePremiumStatus(
        testWalletAddress
      );

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('Wallet is not premium on-chain. Please register on-chain first.');
    });

    it('should handle errors gracefully', async () => {
      // Arrange - trigger error path via NodeSet check
      mockBlockchainService.isWalletPremium.mockRejectedValue(
        new Error('Blockchain error')
      );

      // Act
      const result = await premiumService.verifyAndUpdatePremiumStatus(
        testWalletAddress
      );

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe(
        'Failed to verify premium status. Please try again or contact support.'
      );
    });
  });

  describe('Rejection Message Handling', () => {
    it('should return rejection message for already linked premium wallet', async () => {
      // Arrange
      const rejectionMessage = `Your premium wallet is already connected to another one of your Lens profiles (${testHandle}) and is premium. You are not allowed to make this profile premium.`;
      mockUserService.getPremiumRejectionMessage.mockResolvedValue(rejectionMessage);

      // Act
      const result = await premiumService.getPremiumRejectionMessage(testWalletAddress);

      // Assert
      expect(result).toBe(rejectionMessage);
      expect(mockUserService.getPremiumRejectionMessage).toHaveBeenCalledWith(testWalletAddress);
    });

    it('should return null when no rejection message exists', async () => {
      // Arrange
      mockUserService.getPremiumRejectionMessage.mockResolvedValue(null);

      // Act
      const result = await premiumService.getPremiumRejectionMessage(testWalletAddress);

      // Assert
      expect(result).toBeNull();
    });

    it('should handle errors in rejection message retrieval', async () => {
      // Arrange
      mockUserService.getPremiumRejectionMessage.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(premiumService.getPremiumRejectionMessage(testWalletAddress))
        .rejects.toThrow('Database error');
    });
  });

  describe('Enhanced Profile Linking without Transaction Hash', () => {
    it('should link profile successfully (no transaction hash)', async () => {
      // Arrange
      mockBlockchainService.isWalletPremium.mockResolvedValue(true);
      mockUserService.linkProfileToWallet.mockResolvedValue({
        profileId: testProfileId,
        handle: testHandle,
        linkedAt: new Date()
      });

      // Act
      await premiumService.linkProfile(testWalletAddress, testProfileId);

      // Assert
      expect(mockUserService.linkProfileToWallet).toHaveBeenCalledWith(
        testWalletAddress,
        testProfileId
      );
      expect(mockEventService.emitProfileLinked).toHaveBeenCalledWith(
        testWalletAddress,
        testProfileId
      );
    });

    it('should link profile (explicit no transaction hash)', async () => {
      // Arrange
      mockBlockchainService.isWalletPremium.mockResolvedValue(true);
      mockUserService.linkProfileToWallet.mockResolvedValue({
        profileId: testProfileId,
        handle: testHandle,
        linkedAt: new Date()
      });

      // Act
      await premiumService.linkProfile(testWalletAddress, testProfileId);

      // Assert
      expect(mockUserService.linkProfileToWallet).toHaveBeenCalledWith(
        testWalletAddress,
        testProfileId
      );
    });

    it('should throw error if wallet is not premium', async () => {
      // Arrange
      mockBlockchainService.isWalletPremium.mockResolvedValue(false);

      // Act & Assert
      await expect(premiumService.linkProfile(testWalletAddress, testProfileId))
        .rejects.toThrow('Wallet is not premium (not in NodeSet)');
    });
  });

  describe('Integration Test - Complete Enhanced Flow', () => {
    it('should handle complete enhanced premium registration flow', async () => {
      // Step 1: Validate wallet requirements
      mockUserService.validateWalletRequirements.mockResolvedValue({
        isValid: true,
        errors: [],
        walletInfo: {
          address: testWalletAddress,
          type: 'MetaMask',
          network: 'Arbitrum One',
          isArbitrumOne: true,
          chainId: 42161
        }
      });

      const validation = await premiumService.validateWalletRequirements(testWalletAddress, 42161, 'MetaMask');
      expect(validation.isValid).toBe(true);

      // Step 2: Verify transaction
      mockBlockchainService.verifyRegistrationTransaction.mockResolvedValue(true);
      mockBlockchainService.isWalletPremium.mockResolvedValue(true);
      mockUserService.getUserPremiumStatus.mockResolvedValue({
        userStatus: 'Standard'
      });

      const verification = await premiumService.verifyAndUpdatePremiumStatus(
        testWalletAddress,
        testTransactionHash
      );
      expect(verification.success).toBe(true);

      // Step 3: Check rejection message (should be null for new wallet)
      mockUserService.getPremiumRejectionMessage.mockResolvedValue(null);
      const rejectionMessage = await premiumService.getPremiumRejectionMessage(testWalletAddress);
      expect(rejectionMessage).toBeNull();

      // Step 4: Link profile with transaction hash
      mockUserService.linkProfileToWallet.mockResolvedValue({
        profileId: testProfileId,
        handle: testHandle,
        linkedAt: new Date()
      });

      await premiumService.linkProfile(testWalletAddress, testProfileId, testTransactionHash);

      // Step 5: Verify final status
      mockUserService.getUserPremiumStatus.mockResolvedValue({
        userStatus: 'ProLinked',
        linkedProfile: {
          profileId: testProfileId,
          handle: testHandle,
          linkedAt: new Date()
        }
      });

      const finalStatus = await premiumService.getUserPremiumStatus(testWalletAddress);
      expect(finalStatus.userStatus).toBe('ProLinked');
      expect(finalStatus.linkedProfile?.profileId).toBe(testProfileId);
    });

    it('should handle rejection flow for already linked wallet', async () => {
      // Step 1: Check rejection message for already linked wallet
      const rejectionMessage = `Your premium wallet is already connected to another one of your Lens profiles (${testHandle}) and is premium. You are not allowed to make this profile premium.`;
      mockUserService.getPremiumRejectionMessage.mockResolvedValue(rejectionMessage);

      const message = await premiumService.getPremiumRejectionMessage(testWalletAddress);
      expect(message).toBe(rejectionMessage);

      // Step 2: Attempt to link profile should fail
      mockUserService.linkProfileToWallet.mockRejectedValue(
        new Error('Wallet already has a linked premium profile. Profile linking is permanent and cannot be changed.')
      );

      await expect(premiumService.linkProfile(testWalletAddress, testProfileId, testTransactionHash))
        .rejects.toThrow('Wallet already has a linked premium profile. Profile linking is permanent and cannot be changed.');
    });
  });
});
