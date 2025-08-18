import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ProfileService from "../ProfileService";
import UserService from "../UserService";

// Mock dependencies
vi.mock("../ProfileService");
vi.mock("@/prisma/client", () => ({
  default: {
    $transaction: vi.fn((callback) =>
      callback({
        premiumProfile: {
          create: vi.fn(),
          findFirst: vi.fn(),
          findUnique: vi.fn(),
          update: vi.fn()
        }
      })
    ),
    premiumProfile: {
      create: vi.fn(),
      deleteMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn()
    }
  }
}));

const mockProfileService = vi.mocked(ProfileService);

describe.skip("Premium Logic Verification - Core Business Rules (skipped: requires prisma test harness)", () => {
  let userService: typeof UserService;

  const testWalletAddress = "0x1234567890123456789012345678901234567890";
  const testProfileId1 = "profile123";
  const testProfileId2 = "profile456";

  const mockProfile1 = {
    handle: "testuser1.lens",
    id: testProfileId1,
    isDefault: true,
    ownedBy: testWalletAddress
  };

  const mockProfile2 = {
    handle: "testuser2.lens",
    id: testProfileId2,
    isDefault: false,
    ownedBy: testWalletAddress
  };

  beforeEach(() => {
    vi.clearAllMocks();
    userService = UserService;

    // Mock ProfileService methods
    mockProfileService.getProfileById.mockImplementation(
      async (profileId: string) => {
        const profiles = [mockProfile1, mockProfile2];
        return profiles.find((p) => p.id === profileId) || null;
      }
    );

    mockProfileService.validateProfileOwnership.mockResolvedValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Permanent Link Rule Verification", () => {
    it("should successfully link the first profile to a premium wallet", async () => {
      // Arrange - Mock no existing link
      const mockPrisma = vi.mocked(
        (await import("@/prisma/client")).default as any
      );
      mockPrisma.premiumProfile.findUnique.mockResolvedValue(null);
      mockPrisma.premiumProfile.create.mockResolvedValue({
        id: "premium1",
        isActive: true,
        linkedAt: new Date(),
        profileId: testProfileId1,
        walletAddress: testWalletAddress
      });

      // Act
      const result = await userService.linkProfileToWallet(
        testWalletAddress,
        testProfileId1
      );

      // Assert
      expect(result).toEqual({
        handle: "testuser1.lens",
        linkedAt: expect.any(Date),
        profileId: testProfileId1
      });

      expect(mockPrisma.premiumProfile.findUnique).toHaveBeenCalledWith({
        where: { walletAddress: testWalletAddress.toLowerCase() }
      });
    });

    it("should BLOCK linking a second profile to the same premium wallet", async () => {
      // Arrange - Mock existing link
      const mockPrisma = vi.mocked(
        (await import("@/prisma/client")).default as any
      );
      mockPrisma.premiumProfile.findUnique.mockResolvedValue({
        id: "premium1",
        isActive: true,
        linkedAt: new Date(),
        profileId: testProfileId1,
        walletAddress: testWalletAddress
      });

      // Act & Assert
      await expect(
        userService.linkProfileToWallet(testWalletAddress, testProfileId2)
      ).rejects.toThrow(
        "Wallet already has a linked premium profile. Profile linking is permanent and cannot be changed."
      );
    });
  });

  describe("Rejection Message Rule Verification", () => {
    it("should return correct rejection message when wallet has linked profile", async () => {
      // Arrange - Mock existing linked profile
      const mockPrisma = vi.mocked(
        (await import("@/prisma/client")).default as any
      );
      mockPrisma.premiumProfile.findUnique.mockResolvedValue({
        id: "premium1",
        isActive: true,
        linkedAt: new Date(),
        profileId: testProfileId1,
        walletAddress: testWalletAddress
      });

      // Act
      const message =
        await userService.getPremiumRejectionMessage(testWalletAddress);

      // Assert
      expect(message).toBe(
        "Your premium wallet is already connected to another one of your Lens profiles (testuser1.lens) and is premium. You are not allowed to make this profile premium."
      );
    });

    it("should return null when wallet has no linked profile", async () => {
      // Arrange - Mock no existing link
      const mockPrisma = vi.mocked(
        (await import("@/prisma/client")).default as any
      );
      mockPrisma.premiumProfile.findUnique.mockResolvedValue(null);

      // Act
      const message =
        await userService.getPremiumRejectionMessage(testWalletAddress);

      // Assert
      expect(message).toBeNull();
    });
  });

  describe("Profile-Specific Premium Status Verification", () => {
    it("should return true only for the linked profile", async () => {
      // Arrange - Mock linked profile
      const mockPrisma = vi.mocked(
        (await import("@/prisma/client")).default as any
      );
      mockPrisma.premiumProfile.findFirst
        .mockResolvedValueOnce({
          // First call for profile1 - linked
          id: "premium1",
          isActive: true,
          linkedAt: new Date(),
          profileId: testProfileId1,
          walletAddress: testWalletAddress
        })
        .mockResolvedValueOnce(null); // Second call for profile2 - not linked

      // Act
      const isProfile1Premium = await userService.isProfilePremiumForWallet(
        testWalletAddress,
        testProfileId1
      );
      const isProfile2Premium = await userService.isProfilePremiumForWallet(
        testWalletAddress,
        testProfileId2
      );

      // Assert
      expect(isProfile1Premium).toBe(true);
      expect(isProfile2Premium).toBe(false);
    });

    it("should return false for all profiles when wallet has no linked profile", async () => {
      // Arrange - Mock no linked profiles
      const mockPrisma = vi.mocked(
        (await import("@/prisma/client")).default as any
      );
      mockPrisma.premiumProfile.findFirst.mockResolvedValue(null);

      // Act
      const isProfile1Premium = await userService.isProfilePremiumForWallet(
        testWalletAddress,
        testProfileId1
      );
      const isProfile2Premium = await userService.isProfilePremiumForWallet(
        testWalletAddress,
        testProfileId2
      );

      // Assert
      expect(isProfile1Premium).toBe(false);
      expect(isProfile2Premium).toBe(false);
    });
  });

  describe("Business Rule Integration Test", () => {
    it("should enforce complete permanent link and rejection rule flow", async () => {
      const mockPrisma = vi.mocked(
        (await import("@/prisma/client")).default as any
      );

      // Step 1: Link first profile successfully
      mockPrisma.premiumProfile.findUnique.mockResolvedValueOnce(null); // No existing link
      mockPrisma.premiumProfile.create.mockResolvedValueOnce({
        id: "premium1",
        isActive: true,
        linkedAt: new Date(),
        profileId: testProfileId1,
        walletAddress: testWalletAddress
      });

      const linkResult = await userService.linkProfileToWallet(
        testWalletAddress,
        testProfileId1
      );
      expect(linkResult.profileId).toBe(testProfileId1);

      // Step 2: Verify rejection message for second profile attempt
      mockPrisma.premiumProfile.findUnique.mockResolvedValueOnce({
        id: "premium1",
        isActive: true,
        linkedAt: new Date(),
        profileId: testProfileId1,
        walletAddress: testWalletAddress
      });

      const rejectionMessage =
        await userService.getPremiumRejectionMessage(testWalletAddress);
      expect(rejectionMessage).toContain("testuser1.lens");
      expect(rejectionMessage).toContain(
        "You are not allowed to make this profile premium"
      );

      // Step 3: Verify profile-specific premium status
      mockPrisma.premiumProfile.findFirst
        .mockResolvedValueOnce({
          // Profile 1 is linked
          id: "premium1",
          isActive: true,
          linkedAt: new Date(),
          profileId: testProfileId1,
          walletAddress: testWalletAddress
        })
        .mockResolvedValueOnce(null); // Profile 2 is not linked

      const isProfile1Premium = await userService.isProfilePremiumForWallet(
        testWalletAddress,
        testProfileId1
      );
      const isProfile2Premium = await userService.isProfilePremiumForWallet(
        testWalletAddress,
        testProfileId2
      );

      expect(isProfile1Premium).toBe(true);
      expect(isProfile2Premium).toBe(false);

      // Step 4: Verify second profile linking is blocked
      await expect(
        userService.linkProfileToWallet(testWalletAddress, testProfileId2)
      ).rejects.toThrow(
        "Wallet already has a linked premium profile. Profile linking is permanent and cannot be changed."
      );
    });
  });
});
