import { beforeEach, describe, expect, it, vi } from "vitest";
import prisma from "@/prisma/client";
import SimplePremiumService from "./SimplePremiumService";

// Mock viem
vi.mock("viem", () => ({
  createPublicClient: vi.fn(),
  http: vi.fn(),
  parseAbiItem: vi.fn()
}));

vi.mock("viem/chains", () => ({
  arbitrum: { id: 42161 }
}));

// Mock dependencies
vi.mock("@/prisma/client", () => ({
  default: {
    premiumProfile: {
      create: vi.fn(),
      findUnique: vi.fn()
    }
  }
}));

vi.mock("@hey/helpers/logger", () => ({
  default: {
    error: vi.fn(),
    info: vi.fn()
  }
}));

// Mock the public client
const mockPublicClient = {
  readContract: vi.fn()
};

describe("SimplePremiumService", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock environment variables
    process.env.REFERRAL_CONTRACT_ADDRESS =
      "0x1234567890123456789012345678901234567890";
    process.env.INFURA_URL = "https://arbitrum-mainnet.infura.io/v3/test";

    // Mock the public client
    (SimplePremiumService as any).publicClient = mockPublicClient;
  });

  describe("isPremiumWallet", () => {
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

      mockPublicClient.readContract.mockResolvedValue(mockNodeData);

      const result = await SimplePremiumService.isPremiumWallet(
        "0x1234567890123456789012345678901234567890"
      );

      expect(result).toBe(true);
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

      mockPublicClient.readContract.mockResolvedValue(mockNodeData);

      const result = await SimplePremiumService.isPremiumWallet(
        "0x1234567890123456789012345678901234567890"
      );

      expect(result).toBe(false);
    });
  });

  describe("getPremiumStatus", () => {
    it("should return Standard for non-premium wallet", async () => {
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
      mockPublicClient.readContract.mockResolvedValue(mockNodeData);

      const result = await SimplePremiumService.getPremiumStatus(
        "0x1234567890123456789012345678901234567890"
      );

      expect(result.userStatus).toBe("Standard");
    });

    it("should return ProLinked for premium wallet with existing link", async () => {
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
      mockPublicClient.readContract.mockResolvedValue(mockNodeData);

      (prisma.premiumProfile.findUnique as any).mockResolvedValue({
        linkedAt: new Date(),
        profileId: "profile123"
      });

      const result = await SimplePremiumService.getPremiumStatus(
        "0x1234567890123456789012345678901234567890"
      );

      expect(result.userStatus).toBe("ProLinked");
      expect(result.linkedProfile?.profileId).toBe("profile123");
    });

    it("should auto-link profile for premium wallet without link", async () => {
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
      mockPublicClient.readContract.mockResolvedValue(mockNodeData);

      (prisma.premiumProfile.findUnique as any).mockResolvedValue(null);
      (prisma.premiumProfile.create as any).mockResolvedValue({
        linkedAt: new Date(),
        profileId: "profile123"
      });

      const result = await SimplePremiumService.getPremiumStatus(
        "0x1234567890123456789012345678901234567890",
        "profile123"
      );

      expect(result.userStatus).toBe("ProLinked");
      expect(result.linkedProfile?.profileId).toBe("profile123");
    });
  });

  describe("linkProfile", () => {
    it("should link profile for premium wallet", async () => {
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
      mockPublicClient.readContract.mockResolvedValue(mockNodeData);

      (prisma.premiumProfile.findUnique as any).mockResolvedValue(null);
      (prisma.premiumProfile.create as any).mockResolvedValue({
        linkedAt: new Date(),
        profileId: "profile123"
      });

      await SimplePremiumService.linkProfile(
        "0x1234567890123456789012345678901234567890",
        "profile123"
      );

      expect(prisma.premiumProfile.create).toHaveBeenCalledWith({
        data: {
          isActive: true,
          linkedAt: expect.any(Date),
          profileId: "profile123",
          walletAddress: "0x1234567890123456789012345678901234567890"
        }
      });
    });

    it("should throw error for non-premium wallet", async () => {
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
      mockPublicClient.readContract.mockResolvedValue(mockNodeData);

      await expect(
        SimplePremiumService.linkProfile(
          "0x1234567890123456789012345678901234567890",
          "profile123"
        )
      ).rejects.toThrow("Wallet is not premium");
    });

    it("should throw error if wallet already has linked profile", async () => {
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
      mockPublicClient.readContract.mockResolvedValue(mockNodeData);

      (prisma.premiumProfile.findUnique as any).mockResolvedValue({
        linkedAt: new Date(),
        profileId: "existingProfile"
      });

      await expect(
        SimplePremiumService.linkProfile(
          "0x1234567890123456789012345678901234567890",
          "profile123"
        )
      ).rejects.toThrow("Wallet already has a linked premium profile");
    });
  });

  describe("buildReferralTree", () => {
    it("should build referral tree correctly", async () => {
      const rootNodeData = [
        1000n,
        100n,
        5n,
        2n,
        1n,
        3n,
        "0x123",
        "0x0000000000000000000000000000000000000000",
        "0x456",
        "0x789",
        false,
        false
      ];

      const leftChildData = [
        500n,
        50n,
        2n,
        1n,
        0n,
        2n,
        "0x456",
        "0x123",
        "0x0000000000000000000000000000000000000000",
        "0x0000000000000000000000000000000000000000",
        false,
        false
      ];

      const rightChildData = [
        300n,
        30n,
        1n,
        0n,
        1n,
        2n,
        "0x789",
        "0x123",
        "0x0000000000000000000000000000000000000000",
        "0x0000000000000000000000000000000000000000",
        false,
        false
      ];

      // Mock the readContract calls
      mockPublicClient.readContract
        .mockResolvedValueOnce(rootNodeData) // Root node
        .mockResolvedValueOnce(leftChildData) // Left child
        .mockResolvedValueOnce(rightChildData); // Right child

      const result = await SimplePremiumService.buildReferralTree(
        "0x1234567890123456789012345678901234567890"
      );

      expect(result).toHaveLength(3);
      expect(result[0].address).toBe(
        "0x1234567890123456789012345678901234567890"
      );
      expect(result[0].leftChild).toBe("0x456");
      expect(result[0].rightChild).toBe("0x789");
    });

    it("should return empty array for non-existent wallet", async () => {
      const mockNodeData = [
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        "0x0000000000000000000000000000000000000000",
        "0x0000000000000000000000000000000000000000",
        "0x0000000000000000000000000000000000000000",
        "0x0000000000000000000000000000000000000000",
        false,
        false
      ];

      mockPublicClient.readContract.mockResolvedValue(mockNodeData);

      const result = await SimplePremiumService.buildReferralTree(
        "0x1234567890123456789012345678901234567890"
      );

      expect(result).toHaveLength(0);
    });

    it("should respect max depth limit", async () => {
      const rootNodeData = [
        1000n,
        100n,
        5n,
        2n,
        1n,
        3n,
        "0x123",
        "0x0000000000000000000000000000000000000000",
        "0x456",
        "0x0000000000000000000000000000000000000000",
        false,
        false
      ];

      const childNodeData = [
        500n,
        50n,
        2n,
        1n,
        0n,
        2n,
        "0x456",
        "0x123",
        "0x0000000000000000000000000000000000000000",
        "0x0000000000000000000000000000000000000000",
        false,
        false
      ];

      mockPublicClient.readContract
        .mockResolvedValueOnce(rootNodeData)
        .mockResolvedValueOnce(childNodeData);

      const result = await SimplePremiumService.buildReferralTree(
        "0x1234567890123456789012345678901234567890",
        0,
        1
      );

      expect(result).toHaveLength(2);
      expect(result[0].depth).toBe(0);
      expect(result[1].depth).toBe(1);
    });
  });
});
