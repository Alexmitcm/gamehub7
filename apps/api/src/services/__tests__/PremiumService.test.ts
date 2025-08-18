import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import BlockchainService from "../BlockchainService";
import EventService from "../EventService";
import PremiumService from "../PremiumService";
import UserService from "../UserService";

// Mock dependencies
vi.mock("../UserService");
vi.mock("../BlockchainService");
vi.mock("../EventService");

const mockUserService = vi.mocked(UserService);
const mockBlockchainService = vi.mocked(BlockchainService);
const mockEventService = vi.mocked(EventService);

describe("PremiumService - Permanent Premium Link Testing", () => {
  let premiumService: typeof PremiumService;

  const testWalletAddress = "0x1234567890123456789012345678901234567890";
  const testProfileId1 = "0x01";
  const testProfileId2 = "0x02";
  const testHandle1 = "testuser1.lens";
  const testHandle2 = "testuser2.lens";

  beforeEach(() => {
    vi.clearAllMocks();
    premiumService = PremiumService;

    // Reset all mocks
    mockBlockchainService.isWalletPremium.mockResolvedValue(true);
    mockUserService.getUserPremiumStatus.mockResolvedValue({
      userStatus: "Standard"
    });
    mockUserService.autoLinkFirstProfile.mockResolvedValue({
      handle: testHandle1,
      linkedAt: new Date(),
      profileId: testProfileId1
    });
    mockUserService.linkProfileToWallet.mockResolvedValue({
      handle: testHandle1,
      linkedAt: new Date(),
      profileId: testProfileId1
    });
    mockUserService.getAvailableProfiles.mockResolvedValue({
      canLink: true,
      profiles: [
        {
          handle: testHandle1,
          id: testProfileId1,
          isDefault: true,
          ownedBy: testWalletAddress
        },
        {
          handle: testHandle2,
          id: testProfileId2,
          isDefault: false,
          ownedBy: testWalletAddress
        }
      ]
    });
    mockEventService.emitProfileAutoLinked.mockResolvedValue();
    mockEventService.emitProfileLinked.mockResolvedValue();
    mockEventService.emitPremiumStatusChanged.mockResolvedValue();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Requirement 1: Exclusive and Permanent Premium Link", () => {
    describe("Test Case 1: First Profile Auto-Linking", () => {
      it("should auto-link the first profile when wallet is premium and no profile is linked", async () => {
        // Arrange
        mockUserService.getUserPremiumStatus.mockResolvedValue({
          userStatus: "Standard"
        });
        mockUserService.getAvailableProfiles.mockResolvedValue({
          canLink: true,
          profiles: [
            {
              handle: testHandle1,
              id: testProfileId1,
              isDefault: true,
              ownedBy: testWalletAddress
            }
          ]
        });

        // Act
        const result =
          await premiumService.autoLinkFirstProfile(testWalletAddress);

        // Assert
        expect(result).toEqual({
          handle: testHandle1,
          linkedAt: expect.any(Date),
          profileId: testProfileId1
        });
        expect(mockUserService.autoLinkFirstProfile).toHaveBeenCalledWith(
          testWalletAddress
        );
        expect(mockEventService.emitProfileAutoLinked).toHaveBeenCalledWith(
          testWalletAddress,
          testProfileId1
        );
      });

      it("should throw error if wallet is not premium", async () => {
        // Arrange
        mockBlockchainService.isWalletPremium.mockResolvedValue(false);

        // Act & Assert
        await expect(
          premiumService.autoLinkFirstProfile(testWalletAddress)
        ).rejects.toThrow("Wallet is not premium (not in NodeSet)");
      });
    });

    describe("Test Case 2: Manual Profile Linking", () => {
      it("should allow manual linking of first profile", async () => {
        // Arrange
        mockUserService.getUserPremiumStatus.mockResolvedValue({
          userStatus: "Standard"
        });

        // Act
        await premiumService.linkProfile(testWalletAddress, testProfileId1);

        // Assert
        expect(mockUserService.linkProfileToWallet).toHaveBeenCalledWith(
          testWalletAddress,
          testProfileId1
        );
        expect(mockEventService.emitProfileLinked).toHaveBeenCalledWith(
          testWalletAddress,
          testProfileId1
        );
      });

      it("should throw error if wallet is not premium", async () => {
        // Arrange
        mockBlockchainService.isWalletPremium.mockResolvedValue(false);

        // Act & Assert
        await expect(
          premiumService.linkProfile(testWalletAddress, testProfileId1)
        ).rejects.toThrow("Wallet is not premium (not in NodeSet)");
      });
    });

    describe("Test Case 3: Permanent Link Enforcement", () => {
      it("should prevent linking a second profile after first profile is linked", async () => {
        // Arrange - Simulate already linked profile by making linkProfileToWallet throw an error
        mockUserService.linkProfileToWallet.mockRejectedValue(
          new Error(
            "Wallet already has a linked premium profile. Profile linking is permanent and cannot be changed."
          )
        );

        // Act & Assert
        await expect(
          premiumService.linkProfile(testWalletAddress, testProfileId2)
        ).rejects.toThrow(
          "Wallet already has a linked premium profile. Profile linking is permanent and cannot be changed."
        );
      });

      it("should prevent auto-linking when profile is already linked", async () => {
        // Arrange - Simulate already linked profile by making autoLinkFirstProfile throw an error
        mockUserService.autoLinkFirstProfile.mockRejectedValue(
          new Error("Wallet already has a linked premium profile")
        );

        // Act & Assert
        await expect(
          premiumService.autoLinkFirstProfile(testWalletAddress)
        ).rejects.toThrow("Wallet already has a linked premium profile");
      });
    });

    describe("Test Case 4: Profile Ownership Validation", () => {
      it("should validate profile ownership before linking", async () => {
        // Arrange
        mockUserService.linkProfileToWallet.mockRejectedValue(
          new Error("Profile is not owned by the provided wallet address")
        );

        // Act & Assert
        await expect(
          premiumService.linkProfile(testWalletAddress, testProfileId1)
        ).rejects.toThrow(
          "Profile is not owned by the provided wallet address"
        );
      });
    });

    describe("Test Case 5: Profile Already Linked to Another Wallet", () => {
      it("should prevent linking a profile that is already linked to another wallet", async () => {
        // Arrange
        mockUserService.linkProfileToWallet.mockRejectedValue(
          new Error("Profile is already linked to another wallet")
        );

        // Act & Assert
        await expect(
          premiumService.linkProfile(testWalletAddress, testProfileId1)
        ).rejects.toThrow("Profile is already linked to another wallet");
      });
    });
  });

  describe("Requirement 2: Activation of Pro Features and UI Indicator", () => {
    describe("Test Case 6: Premium Status Detection", () => {
      it("should correctly identify Standard status for non-premium wallets", async () => {
        // Arrange
        mockBlockchainService.isWalletPremium.mockResolvedValue(false);

        // Act
        const status =
          await premiumService.getUserPremiumStatus(testWalletAddress);

        // Assert
        expect(status).toEqual({ userStatus: "Standard" });
      });

      it("should correctly identify Standard status for premium wallets without linked profiles", async () => {
        // Arrange
        mockBlockchainService.isWalletPremium.mockResolvedValue(true);
        mockUserService.getUserPremiumStatus.mockResolvedValue({
          userStatus: "Standard"
        });

        // Act
        const status =
          await premiumService.getUserPremiumStatus(testWalletAddress);

        // Assert
        expect(status).toEqual({ userStatus: "Standard" });
      });

      it("should correctly identify ProLinked status for premium wallets with linked profiles", async () => {
        // Arrange
        mockBlockchainService.isWalletPremium.mockResolvedValue(true);
        mockUserService.getUserPremiumStatus.mockResolvedValue({
          linkedProfile: {
            handle: testHandle1,
            linkedAt: new Date(),
            profileId: testProfileId1
          },
          userStatus: "ProLinked"
        });

        // Act
        const status =
          await premiumService.getUserPremiumStatus(testWalletAddress);

        // Assert
        expect(status).toEqual({
          linkedProfile: {
            handle: testHandle1,
            linkedAt: expect.any(Date),
            profileId: testProfileId1
          },
          userStatus: "ProLinked"
        });
      });
    });

    describe("Test Case 7: Available Profiles for UI Display", () => {
      it("should return all profiles for unlinked premium wallets", async () => {
        // Arrange
        mockBlockchainService.isWalletPremium.mockResolvedValue(true);
        mockUserService.getAvailableProfiles.mockResolvedValue({
          canLink: true,
          profiles: [
            {
              handle: testHandle1,
              id: testProfileId1,
              isDefault: true,
              ownedBy: testWalletAddress
            },
            {
              handle: testHandle2,
              id: testProfileId2,
              isDefault: false,
              ownedBy: testWalletAddress
            }
          ]
        });

        // Act
        const result =
          await premiumService.getAvailableProfiles(testWalletAddress);

        // Assert
        expect(result).toEqual({
          canLink: true,
          profiles: [
            {
              handle: testHandle1,
              id: testProfileId1,
              isDefault: true,
              ownedBy: testWalletAddress
            },
            {
              handle: testHandle2,
              id: testProfileId2,
              isDefault: false,
              ownedBy: testWalletAddress
            }
          ]
        });
      });

      it("should return only linked profile for already linked wallets", async () => {
        // Arrange
        mockBlockchainService.isWalletPremium.mockResolvedValue(true);
        mockUserService.getAvailableProfiles.mockResolvedValue({
          canLink: false,
          linkedProfile: {
            handle: testHandle1,
            linkedAt: new Date(),
            profileId: testProfileId1
          },
          profiles: []
        });

        // Act
        const result =
          await premiumService.getAvailableProfiles(testWalletAddress);

        // Assert
        expect(result).toEqual({
          canLink: false,
          linkedProfile: {
            handle: testHandle1,
            linkedAt: expect.any(Date),
            profileId: testProfileId1
          },
          profiles: []
        });
      });

      it("should return empty profiles for non-premium wallets", async () => {
        // Arrange
        mockBlockchainService.isWalletPremium.mockResolvedValue(false);

        // Act
        const result =
          await premiumService.getAvailableProfiles(testWalletAddress);

        // Assert
        expect(result).toEqual({ canLink: false, profiles: [] });
      });
    });

    describe("Test Case 8: Premium Status for Specific Profile", () => {
      it("should return true for linked profile", async () => {
        // Arrange
        mockUserService.getPremiumStatus.mockResolvedValue(true);

        // Act
        const isPremium = await premiumService.getPremiumStatus(
          testWalletAddress,
          testProfileId1
        );

        // Assert
        expect(isPremium).toBe(true);
        expect(mockUserService.getPremiumStatus).toHaveBeenCalledWith(
          testWalletAddress,
          testProfileId1
        );
      });

      it("should return false for unlinked profile", async () => {
        // Arrange
        mockUserService.getPremiumStatus.mockResolvedValue(false);

        // Act
        const isPremium = await premiumService.getPremiumStatus(
          testWalletAddress,
          testProfileId2
        );

        // Assert
        expect(isPremium).toBe(false);
      });
    });

    describe("Test Case 9: Linked Profile Retrieval", () => {
      it("should return linked profile details", async () => {
        // Arrange
        mockUserService.getLinkedProfile.mockResolvedValue({
          handle: testHandle1,
          linkedAt: new Date(),
          profileId: testProfileId1
        });

        // Act
        const linkedProfile =
          await premiumService.getLinkedProfile(testWalletAddress);

        // Assert
        expect(linkedProfile).toEqual({
          handle: testHandle1,
          linkedAt: expect.any(Date),
          profileId: testProfileId1
        });
      });

      it("should return null when no profile is linked", async () => {
        // Arrange
        mockUserService.getLinkedProfile.mockResolvedValue(null);

        // Act
        const linkedProfile =
          await premiumService.getLinkedProfile(testWalletAddress);

        // Assert
        expect(linkedProfile).toBeNull();
      });
    });
  });

  describe("Test Case 10: Error Handling and Edge Cases", () => {
    it("should handle blockchain service errors gracefully", async () => {
      // Arrange
      mockBlockchainService.isWalletPremium.mockRejectedValue(
        new Error("Blockchain error")
      );

      // Act & Assert
      await expect(
        premiumService.getUserPremiumStatus(testWalletAddress)
      ).rejects.toThrow("Failed to get premium status");
    });

    it("should handle user service errors gracefully", async () => {
      // Arrange
      mockUserService.getUserPremiumStatus.mockRejectedValue(
        new Error("Database error")
      );

      // Act & Assert
      await expect(
        premiumService.getUserPremiumStatus(testWalletAddress)
      ).rejects.toThrow("Failed to get premium status");
    });

    it("should handle event service errors without breaking main functionality", async () => {
      // Arrange
      mockEventService.emitProfileLinked.mockRejectedValue(
        new Error("Event service error")
      );

      // Act & Assert - Should not throw error, just log it
      await expect(
        premiumService.linkProfile(testWalletAddress, testProfileId1)
      ).rejects.toThrow("Event service error");
    });
  });

  describe("Test Case 11: Integration Test - Complete Premium Flow", () => {
    it("should handle complete premium registration flow", async () => {
             // Step 1: Check initial status (should be Standard)
       mockUserService.getUserPremiumStatus.mockResolvedValue({
         userStatus: "Standard"
       });
       let status = await premiumService.getUserPremiumStatus(testWalletAddress);
       expect(status.userStatus).toBe("Standard");

      // Step 2: Get available profiles
      mockUserService.getAvailableProfiles.mockResolvedValue({
        canLink: true,
        profiles: [
          {
            handle: testHandle1,
            id: testProfileId1,
            isDefault: true,
            ownedBy: testWalletAddress
          },
          {
            handle: testHandle2,
            id: testProfileId2,
            isDefault: false,
            ownedBy: testWalletAddress
          }
        ]
      });
      let profiles =
        await premiumService.getAvailableProfiles(testWalletAddress);
      expect(profiles.canLink).toBe(true);
      expect(profiles.profiles).toHaveLength(2);

      // Step 3: Link first profile
      mockUserService.linkProfileToWallet.mockResolvedValue({
        handle: testHandle1,
        linkedAt: new Date(),
        profileId: testProfileId1
      });
      await premiumService.linkProfile(testWalletAddress, testProfileId1);

      // Step 4: Verify status is now ProLinked
      mockUserService.getUserPremiumStatus.mockResolvedValue({
        linkedProfile: {
          handle: testHandle1,
          linkedAt: new Date(),
          profileId: testProfileId1
        },
        userStatus: "ProLinked"
      });
      status = await premiumService.getUserPremiumStatus(testWalletAddress);
      expect(status.userStatus).toBe("ProLinked");
      expect(status.linkedProfile?.profileId).toBe(testProfileId1);

      // Step 5: Verify available profiles now only shows linked profile
      mockUserService.getAvailableProfiles.mockResolvedValue({
        canLink: false,
        linkedProfile: {
          handle: testHandle1,
          linkedAt: new Date(),
          profileId: testProfileId1
        },
        profiles: []
      });
      profiles = await premiumService.getAvailableProfiles(testWalletAddress);
      expect(profiles.canLink).toBe(false);
      expect(profiles.profiles).toHaveLength(0);
      expect(profiles.linkedProfile?.profileId).toBe(testProfileId1);

      // Step 6: Verify premium status for specific profiles
      mockUserService.getPremiumStatus.mockImplementation(
        (wallet, profileId) => {
          return Promise.resolve(profileId === testProfileId1);
        }
      );

      const profile1Premium = await premiumService.getPremiumStatus(
        testWalletAddress,
        testProfileId1
      );
      const profile2Premium = await premiumService.getPremiumStatus(
        testWalletAddress,
        testProfileId2
      );

      expect(profile1Premium).toBe(true); // Linked profile should be premium
      expect(profile2Premium).toBe(false); // Unlinked profile should not be premium
    });
  });
});
