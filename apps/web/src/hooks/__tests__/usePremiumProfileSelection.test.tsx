import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePremiumProfileSelection } from '../usePremiumProfileSelection';

// Mock fetch globally
global.fetch = vi.fn();

const mockFetch = vi.mocked(fetch);

describe('usePremiumProfileSelection - Permanent Premium Link Testing', () => {
  const testWalletAddress = '0x1234567890123456789012345678901234567890';
  const testProfileId1 = '0x01';
  const testProfileId2 = '0x02';
  const testHandle1 = 'testuser1.lens';
  const testHandle2 = 'testuser2.lens';

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.location for fetch calls
    Object.defineProperty(window, 'location', {
      value: { origin: 'http://localhost:3000' },
      writable: true
    });
  });

  describe('Requirement 1: Exclusive and Permanent Premium Link', () => {
    describe('Test Case 1: Premium Status Detection', () => {
      it('should detect Standard status for non-premium wallets', async () => {
        // Arrange
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: { userStatus: 'Standard' }
          })
        } as Response);

        // Act
        const { result } = renderHook(() => usePremiumProfileSelection());

        // Wait for the effect to run
        await waitFor(() => {
          expect(result.current.premiumStatus).toBeTruthy();
        });

        // Assert
        expect(result.current.premiumStatus?.userStatus).toBe('Standard');
        expect(result.current.isRegistered).toBe(false);
        expect(result.current.isLinked).toBe(false);
      });

      it('should detect OnChainUnlinked status for premium wallets without linked profiles', async () => {
        // Arrange
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: { userStatus: 'OnChainUnlinked' }
          })
        } as Response);

        // Act
        const { result } = renderHook(() => usePremiumProfileSelection());

        // Wait for the effect to run
        await waitFor(() => {
          expect(result.current.premiumStatus).toBeTruthy();
        });

        // Assert
        expect(result.current.premiumStatus?.userStatus).toBe('OnChainUnlinked');
        expect(result.current.isRegistered).toBe(true);
        expect(result.current.isLinked).toBe(false);
      });

      it('should detect ProLinked status for premium wallets with linked profiles', async () => {
        // Arrange
        const linkedProfile = {
          profileId: testProfileId1,
          handle: testHandle1,
          linkedAt: new Date()
        };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: {
              userStatus: 'ProLinked',
              linkedProfile
            }
          })
        } as Response);

        // Act
        const { result } = renderHook(() => usePremiumProfileSelection());

        // Wait for the effect to run
        await waitFor(() => {
          expect(result.current.premiumStatus).toBeTruthy();
        });

        // Assert
        expect(result.current.premiumStatus?.userStatus).toBe('ProLinked');
        expect(result.current.premiumStatus?.linkedProfile).toEqual(linkedProfile);
        expect(result.current.isRegistered).toBe(true);
        expect(result.current.isLinked).toBe(true);
      });
    });

    describe('Test Case 2: Available Profiles for Linking', () => {
      it('should fetch available profiles for unlinked premium wallets', async () => {
        // Arrange
        const profiles = [
          { id: testProfileId1, handle: testHandle1, ownedBy: testWalletAddress, isDefault: true },
          { id: testProfileId2, handle: testHandle2, ownedBy: testWalletAddress, isDefault: false }
        ];

        mockFetch
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({
              data: { userStatus: 'OnChainUnlinked' }
            })
          } as Response)
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({
              profiles,
              canLink: true
            })
          } as Response);

        // Act
        const { result } = renderHook(() => usePremiumProfileSelection());

        // Wait for initial status
        await waitFor(() => {
          expect(result.current.premiumStatus?.userStatus).toBe('OnChainUnlinked');
        });

        // Fetch available profiles
        await result.current.fetchAvailableProfiles(testWalletAddress);

        // Assert
        expect(result.current.availableProfiles?.canLink).toBe(true);
        expect(result.current.availableProfiles?.profiles).toHaveLength(2);
        expect(result.current.hasMultipleProfiles).toBe(true);
      });

      it('should return empty profiles for already linked wallets', async () => {
        // Arrange
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            profiles: [],
            canLink: false,
            linkedProfile: {
              profileId: testProfileId1,
              handle: testHandle1,
              linkedAt: new Date()
            }
          })
        } as Response);

        // Act
        const { result } = renderHook(() => usePremiumProfileSelection());

        // Fetch available profiles
        await result.current.fetchAvailableProfiles(testWalletAddress);

        // Assert
        expect(result.current.availableProfiles?.canLink).toBe(false);
        expect(result.current.availableProfiles?.profiles).toHaveLength(0);
        expect(result.current.availableProfiles?.linkedProfile).toBeTruthy();
      });
    });

    describe('Test Case 3: Auto-Link First Profile', () => {
      it('should auto-link first profile successfully', async () => {
        // Arrange
        const linkedProfile = {
          profileId: testProfileId1,
          handle: testHandle1,
          linkedAt: new Date()
        };

        mockFetch
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({
              data: { userStatus: 'OnChainUnlinked' }
            })
          } as Response)
          .mockResolvedValueOnce({
            ok: true,
            json: async () => linkedProfile
          } as Response);

        // Act
        const { result } = renderHook(() => usePremiumProfileSelection());

        // Wait for initial status
        await waitFor(() => {
          expect(result.current.premiumStatus?.userStatus).toBe('OnChainUnlinked');
        });

        // Auto-link first profile
        const result2 = await result.current.autoLinkFirstProfile(testWalletAddress);

        // Assert
        expect(result2).toEqual(linkedProfile);
        expect(result.current.premiumStatus?.userStatus).toBe('ProLinked');
        expect(result.current.premiumStatus?.linkedProfile).toEqual(linkedProfile);
        expect(result.current.isLinked).toBe(true);
      });

      it('should handle auto-link errors gracefully', async () => {
        // Arrange
        mockFetch
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({
              data: { userStatus: 'OnChainUnlinked' }
            })
          } as Response)
          .mockResolvedValueOnce({
            ok: false,
            json: async () => ({
              message: 'Wallet already has a linked premium profile'
            })
          } as Response);

        // Act
        const { result } = renderHook(() => usePremiumProfileSelection());

        // Wait for initial status
        await waitFor(() => {
          expect(result.current.premiumStatus?.userStatus).toBe('OnChainUnlinked');
        });

        // Auto-link first profile
        await expect(result.current.autoLinkFirstProfile(testWalletAddress))
          .rejects.toThrow('Wallet already has a linked premium profile');

        // Assert
        expect(result.current.error).toBe('Wallet already has a linked premium profile');
      });
    });

    describe('Test Case 4: Manual Profile Linking', () => {
      it('should manually link profile successfully', async () => {
        // Arrange
        const linkedProfile = {
          profileId: testProfileId1,
          handle: testHandle1,
          linkedAt: new Date()
        };

        mockFetch
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({
              data: { userStatus: 'OnChainUnlinked' }
            })
          } as Response)
          .mockResolvedValueOnce({
            ok: true,
            json: async () => linkedProfile
          } as Response);

        // Act
        const { result } = renderHook(() => usePremiumProfileSelection());

        // Wait for initial status
        await waitFor(() => {
          expect(result.current.premiumStatus?.userStatus).toBe('OnChainUnlinked');
        });

        // Manually link profile
        const result2 = await result.current.linkProfile(testWalletAddress, testProfileId1);

        // Assert
        expect(result2).toEqual(linkedProfile);
        expect(result.current.premiumStatus?.userStatus).toBe('ProLinked');
        expect(result.current.premiumStatus?.linkedProfile).toEqual(linkedProfile);
        expect(result.current.isLinked).toBe(true);
      });

      it('should handle manual link errors gracefully', async () => {
        // Arrange
        mockFetch
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({
              data: { userStatus: 'OnChainUnlinked' }
            })
          } as Response)
          .mockResolvedValueOnce({
            ok: false,
            json: async () => ({
              message: 'Profile is not owned by the provided wallet address'
            })
          } as Response);

        // Act
        const { result } = renderHook(() => usePremiumProfileSelection());

        // Wait for initial status
        await waitFor(() => {
          expect(result.current.premiumStatus?.userStatus).toBe('OnChainUnlinked');
        });

        // Manually link profile
        await expect(result.current.linkProfile(testWalletAddress, testProfileId1))
          .rejects.toThrow('Profile is not owned by the provided wallet address');

        // Assert
        expect(result.current.error).toBe('Profile is not owned by the provided wallet address');
      });
    });
  });

  describe('Requirement 2: UI Integration and State Management', () => {
    describe('Test Case 5: Profile Selection Modal Logic', () => {
      it('should show profile modal when multiple profiles are available', async () => {
        // Arrange
        const profiles = [
          { id: testProfileId1, handle: testHandle1, ownedBy: testWalletAddress, isDefault: true },
          { id: testProfileId2, handle: testHandle2, ownedBy: testWalletAddress, isDefault: false }
        ];

        mockFetch
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({
              data: { userStatus: 'OnChainUnlinked' }
            })
          } as Response)
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({
              profiles,
              canLink: true
            })
          } as Response);

        // Act
        const { result } = renderHook(() => usePremiumProfileSelection());

        // Wait for initial status
        await waitFor(() => {
          expect(result.current.premiumStatus?.userStatus).toBe('OnChainUnlinked');
        });

        // Check if should show profile modal
        const shouldShow = await result.current.shouldShowProfileModal();

        // Assert
        expect(shouldShow).toBe(true);
        expect(result.current.hasMultipleProfiles).toBe(true);
      });

      it('should not show profile modal when only one profile is available', async () => {
        // Arrange
        const profiles = [
          { id: testProfileId1, handle: testHandle1, ownedBy: testWalletAddress, isDefault: true }
        ];

        mockFetch
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({
              data: { userStatus: 'OnChainUnlinked' }
            })
          } as Response)
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({
              profiles,
              canLink: true
            })
          } as Response);

        // Act
        const { result } = renderHook(() => usePremiumProfileSelection());

        // Wait for initial status
        await waitFor(() => {
          expect(result.current.premiumStatus?.userStatus).toBe('OnChainUnlinked');
        });

        // Check if should show profile modal
        const shouldShow = await result.current.shouldShowProfileModal();

        // Assert
        expect(shouldShow).toBe(false);
        expect(result.current.hasMultipleProfiles).toBe(false);
      });
    });

    describe('Test Case 6: Case Detection Logic', () => {
      it('should detect not-registered case for Standard status', async () => {
        // Arrange
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: { userStatus: 'Standard' }
          })
        } as Response);

        // Act
        const { result } = renderHook(() => usePremiumProfileSelection());

        // Wait for the effect to run
        await waitFor(() => {
          expect(result.current.premiumStatus).toBeTruthy();
        });

        // Assert
        expect(result.current.getCurrentCase()).toBe('not-registered');
      });

      it('should detect registered-no-profile case for OnChainUnlinked status', async () => {
        // Arrange
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: { userStatus: 'OnChainUnlinked' }
          })
        } as Response);

        // Act
        const { result } = renderHook(() => usePremiumProfileSelection());

        // Wait for the effect to run
        await waitFor(() => {
          expect(result.current.premiumStatus).toBeTruthy();
        });

        // Assert
        expect(result.current.getCurrentCase()).toBe('registered-no-profile');
      });

      it('should detect already-linked case for ProLinked status', async () => {
        // Arrange
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: {
              userStatus: 'ProLinked',
              linkedProfile: {
                profileId: testProfileId1,
                handle: testHandle1,
                linkedAt: new Date()
              }
            }
          })
        } as Response);

        // Act
        const { result } = renderHook(() => usePremiumProfileSelection());

        // Wait for the effect to run
        await waitFor(() => {
          expect(result.current.premiumStatus).toBeTruthy();
        });

        // Assert
        expect(result.current.getCurrentCase()).toBe('already-linked');
      });
    });

    describe('Test Case 7: Loading and Error States', () => {
      it('should handle loading states correctly', async () => {
        // Arrange
        let resolveFetch: (value: any) => void;
        const fetchPromise = new Promise((resolve) => {
          resolveFetch = resolve;
        });

        mockFetch.mockReturnValueOnce(fetchPromise as any);

        // Act
        const { result } = renderHook(() => usePremiumProfileSelection());

        // Assert - should be loading initially
        expect(result.current.isLoading).toBe(false); // Initial state

        // Resolve the fetch
        resolveFetch!({
          ok: true,
          json: async () => ({
            data: { userStatus: 'Standard' }
          })
        });

        // Wait for completion
        await waitFor(() => {
          expect(result.current.premiumStatus).toBeTruthy();
        });
      });

      it('should handle network errors gracefully', async () => {
        // Arrange
        mockFetch.mockRejectedValueOnce(new Error('Network error'));

        // Act
        const { result } = renderHook(() => usePremiumProfileSelection());

        // Wait for the effect to run
        await waitFor(() => {
          expect(result.current.error).toBeTruthy();
        });

        // Assert
        expect(result.current.error).toBe('Network error');
      });
    });
  });

  describe('Test Case 8: Integration Test - Complete Premium Flow', () => {
    it('should handle complete premium registration flow', async () => {
      // Step 1: Initial status - OnChainUnlinked
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { userStatus: 'OnChainUnlinked' }
        })
      } as Response);

      const { result } = renderHook(() => usePremiumProfileSelection());

      await waitFor(() => {
        expect(result.current.premiumStatus?.userStatus).toBe('OnChainUnlinked');
      });

      expect(result.current.isRegistered).toBe(true);
      expect(result.current.isLinked).toBe(false);

      // Step 2: Fetch available profiles
      const profiles = [
        { id: testProfileId1, handle: testHandle1, ownedBy: testWalletAddress, isDefault: true },
        { id: testProfileId2, handle: testHandle2, ownedBy: testWalletAddress, isDefault: false }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          profiles,
          canLink: true
        })
      } as Response);

      await result.current.fetchAvailableProfiles(testWalletAddress);

      expect(result.current.availableProfiles?.canLink).toBe(true);
      expect(result.current.availableProfiles?.profiles).toHaveLength(2);
      expect(result.current.hasMultipleProfiles).toBe(true);

      // Step 3: Link first profile
      const linkedProfile = {
        profileId: testProfileId1,
        handle: testHandle1,
        linkedAt: new Date()
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => linkedProfile
      } as Response);

      await result.current.linkProfile(testWalletAddress, testProfileId1);

      expect(result.current.premiumStatus?.userStatus).toBe('ProLinked');
      expect(result.current.premiumStatus?.linkedProfile).toEqual(linkedProfile);
      expect(result.current.isLinked).toBe(true);

      // Step 4: Verify profile modal should not show anymore
      const shouldShow = await result.current.shouldShowProfileModal();
      expect(shouldShow).toBe(false);
    });
  });
});
