import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SingleAccount from '../SingleAccount';
import { useAccountStore } from '@/store/persisted/useAccountStore';
import { useHasPremiumAccess } from '@/helpers/premiumUtils';

// Mock the stores and hooks
vi.mock('@/store/persisted/useAccountStore');
vi.mock('@/helpers/premiumUtils');

const mockUseAccountStore = vi.mocked(useAccountStore);
const mockUseHasPremiumAccess = vi.mocked(useHasPremiumAccess);

describe('SingleAccount - Premium Badge Display', () => {
  const mockAccount = {
    address: '0x1234567890123456789012345678901234567890',
    handle: 'testuser.lens',
    name: 'Test User',
    bio: 'Test bio',
    metadata: {
      bio: 'Test bio'
    },
    hasSubscribed: false,
    operations: {
      isFollowingMe: false,
      hasBlockedMe: false,
      isBlockedByMe: false
    }
  };

  const mockCurrentAccount = {
    address: '0x1234567890123456789012345678901234567890',
    handle: 'currentuser.lens',
    name: 'Current User',
    hasSubscribed: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAccountStore.mockReturnValue({
      currentAccount: mockCurrentAccount,
      setCurrentAccount: vi.fn()
    });
    mockUseHasPremiumAccess.mockReturnValue(false);
  });

  describe('Requirement 2: Premium Badge Display', () => {
    it('should display premium badge for accounts with Lens Pro subscription', () => {
      // Arrange
      const premiumAccount = {
        ...mockAccount,
        hasSubscribed: true
      };

      // Act
      render(
        <SingleAccount
          account={premiumAccount}
          isVerified={false}
          linkToAccount={false}
          showUserPreview={false}
        />
      );

      // Assert
      const badge = screen.getByRole('img', { name: /check badge/i });
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('text-brand-500');
    });

    it('should display premium badge for current account with premium access', () => {
      // Arrange
      mockUseHasPremiumAccess.mockReturnValue(true);
      const currentAccountWithPremium = {
        ...mockCurrentAccount,
        address: mockAccount.address // Same address as displayed account
      };
      mockUseAccountStore.mockReturnValue({
        currentAccount: currentAccountWithPremium,
        setCurrentAccount: vi.fn()
      });

      // Act
      render(
        <SingleAccount
          account={mockAccount}
          isVerified={false}
          linkToAccount={false}
          showUserPreview={false}
        />
      );

      // Assert
      const badge = screen.getByRole('img', { name: /check badge/i });
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('text-brand-500');
    });

    it('should display premium badge when isVerified prop is true', () => {
      // Act
      render(
        <SingleAccount
          account={mockAccount}
          isVerified={true}
          linkToAccount={false}
          showUserPreview={false}
        />
      );

      // Assert
      const badge = screen.getByRole('img', { name: /check badge/i });
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('text-brand-500');
    });

    it('should not display premium badge for non-premium accounts', () => {
      // Act
      render(
        <SingleAccount
          account={mockAccount}
          isVerified={false}
          linkToAccount={false}
          showUserPreview={false}
        />
      );

      // Assert
      const badge = screen.queryByRole('img', { name: /check badge/i });
      expect(badge).not.toBeInTheDocument();
    });

    it('should not display premium badge for current account without premium access', () => {
      // Arrange
      mockUseHasPremiumAccess.mockReturnValue(false);
      const currentAccountWithoutPremium = {
        ...mockCurrentAccount,
        address: mockAccount.address // Same address as displayed account
      };
      mockUseAccountStore.mockReturnValue({
        currentAccount: currentAccountWithoutPremium,
        setCurrentAccount: vi.fn()
      });

      // Act
      render(
        <SingleAccount
          account={mockAccount}
          isVerified={false}
          linkToAccount={false}
          showUserPreview={false}
        />
      );

      // Assert
      const badge = screen.queryByRole('img', { name: /check badge/i });
      expect(badge).not.toBeInTheDocument();
    });

    it('should prioritize isVerified prop over other premium indicators', () => {
      // Arrange
      const premiumAccount = {
        ...mockAccount,
        hasSubscribed: true
      };
      mockUseHasPremiumAccess.mockReturnValue(true);

      // Act - isVerified=false should override other indicators
      render(
        <SingleAccount
          account={premiumAccount}
          isVerified={false}
          linkToAccount={false}
          showUserPreview={false}
        />
      );

      // Assert
      const badge = screen.queryByRole('img', { name: /check badge/i });
      expect(badge).not.toBeInTheDocument();
    });

    it('should display premium badge when any premium condition is met', () => {
      // Arrange
      const premiumAccount = {
        ...mockAccount,
        hasSubscribed: true
      };

      // Act
      render(
        <SingleAccount
          account={premiumAccount}
          isVerified={true}
          linkToAccount={false}
          showUserPreview={false}
        />
      );

      // Assert
      const badge = screen.getByRole('img', { name: /check badge/i });
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Account Selection Screen Integration', () => {
    it('should display account name and handle correctly', () => {
      // Act
      render(
        <SingleAccount
          account={mockAccount}
          isVerified={false}
          linkToAccount={false}
          showUserPreview={false}
        />
      );

      // Assert
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('@testuser.lens')).toBeInTheDocument();
    });

    it('should display premium badge next to account name', () => {
      // Arrange
      const premiumAccount = {
        ...mockAccount,
        hasSubscribed: true
      };

      // Act
      render(
        <SingleAccount
          account={premiumAccount}
          isVerified={false}
          linkToAccount={false}
          showUserPreview={false}
        />
      );

      // Assert
      const nameElement = screen.getByText('Test User');
      const badge = screen.getByRole('img', { name: /check badge/i });
      
      // Check that badge is in the same container as the name
      expect(nameElement.parentElement).toContainElement(badge);
    });

    it('should maintain proper spacing and styling with premium badge', () => {
      // Arrange
      const premiumAccount = {
        ...mockAccount,
        hasSubscribed: true
      };

      // Act
      render(
        <SingleAccount
          account={premiumAccount}
          isVerified={false}
          linkToAccount={false}
          showUserPreview={false}
        />
      );

      // Assert
      const badge = screen.getByRole('img', { name: /check badge/i });
      expect(badge).toHaveClass('size-4', 'text-brand-500');
    });
  });
});
