import { beforeEach, describe, expect, it, vi } from "vitest";
import prisma from "@/prisma/client";
import PremiumService from "./PremiumService";
import ProfileService from "./ProfileService";

// Mock dependencies
vi.mock("@/prisma/client", () => ({
  default: {
    $transaction: vi.fn(),
    premiumProfile: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn()
    }
  }
}));

vi.mock("./ProfileService", () => ({
  default: {
    getProfileById: vi.fn(),
    getProfilesByWallet: vi.fn(),
    validateProfileOwnership: vi.fn()
  }
}));

vi.mock("@hey/helpers/logger", () => ({
  default: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn()
  }
}));

describe("PremiumService", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock environment variables
    process.env.REFERRAL_CONTRACT_ADDRESS =
      "0x1234567890123456789012345678901234567890";
    process.env.BALANCED_GAME_VAULT_ADDRESS =
      "0x1234567890123456789012345678901234567890";
    process.env.UNBALANCED_GAME_VAULT_ADDRESS =
      "0x1234567890123456789012345678901234567890";
    process.env.INFURA_URL = "https://arbitrum-mainnet.infura.io/v3/test";
  });

  describe("verifyPremiumByNodeset", () => {
    it("should return true for premium wallet", async () => {
      const mockNodeData = [
        1000n,
        0n,
        0n,
        0n,
        0n,
        0n,
        "0x123",
        "0x456",
        "0x789",
        "0xabc",
        false,
        false
      ];

      // Mock the public client
      const mockPublicClient = {
        readContract: vi.fn().mockResolvedValue(mockNodeData)
      };

      // Mock the constructor to inject our mock client
      vi.spyOn(PremiumService, "constructor" as any).mockImplementation(() => {
        (PremiumService as any).publicClient = mockPublicClient;
      });

      const result = await PremiumService.verifyPremiumByNodeset(
        "0x1234567890123456789012345678901234567890"
      );

      expect(result).toBe(true);
      expect(mockPublicClient.readContract).toHaveBeenCalledWith({
        abi: expect.any(Array),
        address: "0x1234567890123456789012345678901234567890",
        args: ["0x1234567890123456789012345678901234567890"],
        functionName: "NodeSet"
      });
    });

    it("should return false for non-premium wallet", async () => {
      const mockNodeData = [
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        "0x123",
        "0x456",
        "0x789",
        "0xabc",
        false,
        false
      ];

      const mockPublicClient = {
        readContract: vi.fn().mockResolvedValue(mockNodeData)
      };

      vi.spyOn(PremiumService, "constructor" as any).mockImplementation(() => {
        (PremiumService as any).publicClient = mockPublicClient;
      });

      const result = await PremiumService.verifyPremiumByNodeset(
        "0x1234567890123456789012345678901234567890"
      );

      expect(result).toBe(false);
    });

    it("should handle errors gracefully", async () => {
      const mockPublicClient = {
        readContract: vi.fn().mockRejectedValue(new Error("Contract error"))
      };

      vi.spyOn(PremiumService, "constructor" as any).mockImplementation(() => {
        (PremiumService as any).publicClient = mockPublicClient;
      });

      await expect(
        PremiumService.verifyPremiumByNodeset(
          "0x1234567890123456789012345678901234567890"
        )
      ).rejects.toThrow("Failed to verify premium status on-chain");
    });
  });

  describe("getUserPremiumStatus", () => {
    it("should return Standard for non-premium wallet", async () => {
      vi.spyOn(PremiumService, "verifyPremiumByNodeset").mockResolvedValue(
        false
      );

      const result = await PremiumService.getUserPremiumStatus(
        "0x1234567890123456789012345678901234567890"
      );

      expect(result).toEqual({
        userStatus: "Standard"
      });
    });

    it("should return ProLinked for premium wallet with linked profile", async () => {
      vi.spyOn(PremiumService, "verifyPremiumByNodeset").mockResolvedValue(
        true
      );

      (prisma.premiumProfile.findUnique as any).mockResolvedValue({
        linkedAt: new Date("2024-01-01"),
        profileId: "profile123"
      });

      (ProfileService.getProfileById as any).mockResolvedValue({
        handle: "testuser",
        id: "profile123",
        isDefault: true,
        ownedBy: "0x1234567890123456789012345678901234567890"
      });

      const result = await PremiumService.getUserPremiumStatus(
        "0x1234567890123456789012345678901234567890"
      );

      expect(result).toEqual({
        linkedProfile: {
          handle: "testuser",
          linkedAt: expect.any(Date),
          profileId: "profile123"
        },
        userStatus: "ProLinked"
      });
    });

    it("should return OnChainUnlinked for premium wallet without linked profile", async () => {
      vi.spyOn(PremiumService, "verifyPremiumByNodeset").mockResolvedValue(
        true
      );
      (prisma.premiumProfile.findUnique as any).mockResolvedValue(null);

      const result = await PremiumService.getUserPremiumStatus(
        "0x1234567890123456789012345678901234567890"
      );

      expect(result).toEqual({
        userStatus: "OnChainUnlinked"
      });
    });
  });

  describe("autoLinkFirstProfile", () => {
    it("should auto-link first profile for premium wallet", async () => {
      vi.spyOn(PremiumService, "verifyPremiumByNodeset").mockResolvedValue(
        true
      );
      (prisma.premiumProfile.findUnique as any).mockResolvedValue(null);

      (ProfileService.getProfilesByWallet as any).mockResolvedValue([
        {
          handle: "testuser",
          id: "profile123",
          isDefault: true,
          ownedBy: "0x1234567890123456789012345678901234567890"
        }
      ]);

      (prisma.$transaction as any).mockImplementation(async (callback: any) => {
        return await callback({
          premiumProfile: {
            create: vi.fn().mockResolvedValue({
              linkedAt: new Date("2024-01-01"),
              profileId: "profile123"
            }),
            findUnique: vi.fn().mockResolvedValue(null)
          }
        });
      });

      const result = await PremiumService.autoLinkFirstProfile(
        "0x1234567890123456789012345678901234567890"
      );

      expect(result).toEqual({
        handle: "testuser",
        linkedAt: expect.any(Date),
        profileId: "profile123"
      });
    });

    it("should throw error for non-premium wallet", async () => {
      vi.spyOn(PremiumService, "verifyPremiumByNodeset").mockResolvedValue(
        false
      );

      await expect(
        PremiumService.autoLinkFirstProfile(
          "0x1234567890123456789012345678901234567890"
        )
      ).rejects.toThrow("Wallet is not premium (not in NodeSet)");
    });

    it("should throw error if wallet already has linked profile", async () => {
      vi.spyOn(PremiumService, "verifyPremiumByNodeset").mockResolvedValue(
        true
      );
      (prisma.premiumProfile.findUnique as any).mockResolvedValue({
        profileId: "existingProfile"
      });

      await expect(
        PremiumService.autoLinkFirstProfile(
          "0x1234567890123456789012345678901234567890"
        )
      ).rejects.toThrow("Wallet already has a linked premium profile");
    });
  });

  describe("linkProfile", () => {
    it("should link profile for premium wallet", async () => {
      vi.spyOn(PremiumService, "verifyPremiumByNodeset").mockResolvedValue(
        true
      );
      (ProfileService.validateProfileOwnership as any).mockResolvedValue(true);

      (prisma.$transaction as any).mockImplementation(async (callback: any) => {
        return await callback({
          premiumProfile: {
            create: vi.fn().mockResolvedValue({
              linkedAt: new Date("2024-01-01"),
              profileId: "profile123"
            }),
            findUnique: vi
              .fn()
              .mockResolvedValueOnce(null) // No existing link
              .mockResolvedValueOnce(null) // Profile not linked to another wallet
          }
        });
      });

      await expect(
        PremiumService.linkProfile(
          "0x1234567890123456789012345678901234567890",
          "profile123"
        )
      ).resolves.toBeUndefined();
    });

    it("should throw error if wallet already has linked profile", async () => {
      vi.spyOn(PremiumService, "verifyPremiumByNodeset").mockResolvedValue(
        true
      );

      (prisma.$transaction as any).mockImplementation(async (callback: any) => {
        return await callback({
          premiumProfile: {
            findUnique: vi.fn().mockResolvedValue({
              profileId: "existingProfile"
            })
          }
        });
      });

      await expect(
        PremiumService.linkProfile(
          "0x1234567890123456789012345678901234567890",
          "profile123"
        )
      ).rejects.toThrow(
        "Wallet already has a linked premium profile. Profile linking is permanent and cannot be changed."
      );
    });
  });

  describe("getAvailableProfiles", () => {
    it("should return empty profiles for non-premium wallet", async () => {
      vi.spyOn(PremiumService, "verifyPremiumByNodeset").mockResolvedValue(
        false
      );

      const result = await PremiumService.getAvailableProfiles(
        "0x1234567890123456789012345678901234567890"
      );

      expect(result).toEqual({
        canLink: false,
        profiles: []
      });
    });

    it("should return profiles for premium wallet without linked profile", async () => {
      vi.spyOn(PremiumService, "verifyPremiumByNodeset").mockResolvedValue(
        true
      );
      (prisma.premiumProfile.findUnique as any).mockResolvedValue(null);

      (ProfileService.getProfilesByWallet as any).mockResolvedValue([
        {
          handle: "testuser",
          id: "profile123",
          isDefault: true,
          ownedBy: "0x1234567890123456789012345678901234567890"
        }
      ]);

      const result = await PremiumService.getAvailableProfiles(
        "0x1234567890123456789012345678901234567890"
      );

      expect(result).toEqual({
        canLink: true,
        profiles: [
          {
            handle: "testuser",
            id: "profile123",
            isDefault: true,
            ownedBy: "0x1234567890123456789012345678901234567890"
          }
        ]
      });
    });

    it("should return linked profile for premium wallet with linked profile", async () => {
      vi.spyOn(PremiumService, "verifyPremiumByNodeset").mockResolvedValue(
        true
      );

      (prisma.premiumProfile.findUnique as any).mockResolvedValue({
        linkedAt: new Date("2024-01-01"),
        profileId: "profile123"
      });

      (ProfileService.getProfileById as any).mockResolvedValue({
        handle: "testuser",
        id: "profile123",
        isDefault: true,
        ownedBy: "0x1234567890123456789012345678901234567890"
      });

      const result = await PremiumService.getAvailableProfiles(
        "0x1234567890123456789012345678901234567890"
      );

      expect(result).toEqual({
        canLink: false,
        linkedProfile: {
          handle: "testuser",
          linkedAt: expect.any(Date),
          profileId: "profile123"
        },
        profiles: []
      });
    });
  });
});
