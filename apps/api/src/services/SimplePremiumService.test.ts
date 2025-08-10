import { beforeEach, describe, expect, it, vi } from "vitest";
import prisma from "@/prisma/client";
import SimplePremiumService from "./SimplePremiumService";

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

describe("SimplePremiumService", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock environment variables
    process.env.REFERRAL_CONTRACT_ADDRESS =
      "0x1234567890123456789012345678901234567890";
    process.env.INFURA_URL = "https://arbitrum-mainnet.infura.io/v3/test";
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

      const mockPublicClient = {
        readContract: vi.fn().mockResolvedValue(mockNodeData)
      };

      vi.spyOn(SimplePremiumService, "constructor" as any).mockImplementation(
        () => {
          (SimplePremiumService as any).publicClient = mockPublicClient;
        }
      );

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

      const mockPublicClient = {
        readContract: vi.fn().mockResolvedValue(mockNodeData)
      };

      vi.spyOn(SimplePremiumService, "constructor" as any).mockImplementation(
        () => {
          (SimplePremiumService as any).publicClient = mockPublicClient;
        }
      );

      const result = await SimplePremiumService.isPremiumWallet(
        "0x1234567890123456789012345678901234567890"
      );

      expect(result).toBe(false);
    });
  });

  describe("getPremiumStatus", () => {
    it("should return Standard for non-premium wallet", async () => {
      vi.spyOn(SimplePremiumService, "isPremiumWallet").mockResolvedValue(
        false
      );

      const result = await SimplePremiumService.getPremiumStatus(
        "0x1234567890123456789012345678901234567890"
      );

      expect(result).toEqual({
        userStatus: "Standard"
      });
    });

    it("should return ProLinked for premium wallet with existing link", async () => {
      vi.spyOn(SimplePremiumService, "isPremiumWallet").mockResolvedValue(true);

      (prisma.premiumProfile.findUnique as any).mockResolvedValue({
        linkedAt: new Date("2024-01-01"),
        profileId: "profile123"
      });

      const result = await SimplePremiumService.getPremiumStatus(
        "0x1234567890123456789012345678901234567890"
      );

      expect(result).toEqual({
        linkedProfile: {
          linkedAt: expect.any(String),
          profileId: "profile123"
        },
        userStatus: "ProLinked"
      });
    });

    it("should auto-link profile for premium wallet without link", async () => {
      vi.spyOn(SimplePremiumService, "isPremiumWallet").mockResolvedValue(true);
      vi.spyOn(SimplePremiumService, "linkProfile").mockResolvedValue();

      (prisma.premiumProfile.findUnique as any).mockResolvedValue(null);

      const result = await SimplePremiumService.getPremiumStatus(
        "0x1234567890123456789012345678901234567890",
        "profile123"
      );

      expect(result).toEqual({
        linkedProfile: {
          linkedAt: expect.any(String),
          profileId: "profile123"
        },
        userStatus: "ProLinked"
      });

      expect(SimplePremiumService.linkProfile).toHaveBeenCalledWith(
        "0x1234567890123456789012345678901234567890",
        "profile123"
      );
    });
  });

  describe("linkProfile", () => {
    it("should link profile for premium wallet", async () => {
      vi.spyOn(SimplePremiumService, "isPremiumWallet").mockResolvedValue(true);
      (prisma.premiumProfile.findUnique as any).mockResolvedValue(null);
      (prisma.premiumProfile.create as any).mockResolvedValue({
        linkedAt: new Date("2024-01-01"),
        profileId: "profile123"
      });

      await expect(
        SimplePremiumService.linkProfile(
          "0x1234567890123456789012345678901234567890",
          "profile123"
        )
      ).resolves.toBeUndefined();

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
      vi.spyOn(SimplePremiumService, "isPremiumWallet").mockResolvedValue(
        false
      );

      await expect(
        SimplePremiumService.linkProfile(
          "0x1234567890123456789012345678901234567890",
          "profile123"
        )
      ).rejects.toThrow("Wallet is not premium");
    });

    it("should throw error if wallet already has linked profile", async () => {
      vi.spyOn(SimplePremiumService, "isPremiumWallet").mockResolvedValue(true);
      (prisma.premiumProfile.findUnique as any).mockResolvedValue({
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
      const rootWallet = "0x1234567890123456789012345678901234567890";
      const leftChild = "0x1111111111111111111111111111111111111111";
      const rightChild = "0x2222222222222222222222222222222222222222";

      // Mock root node data
      const rootNodeData = [
        1234567890n, // startTime > 0
        1000000n, // balance
        100n, // point
        1n, // depthLeftBranch
        1n, // depthRightBranch
        0n, // depth
        rootWallet, // player
        "0x0000000000000000000000000000000000000000", // parent
        leftChild, // leftChild
        rightChild, // rightChild
        false, // isPointChanged
        false // unbalancedAllowance
      ];

      // Mock left child data
      const leftChildData = [
        1234567891n, // startTime > 0
        500000n, // balance
        50n, // point
        0n, // depthLeftBranch
        0n, // depthRightBranch
        1n, // depth
        leftChild, // player
        rootWallet, // parent
        "0x0000000000000000000000000000000000000000", // leftChild
        "0x0000000000000000000000000000000000000000", // rightChild
        false, // isPointChanged
        false // unbalancedAllowance
      ];

      // Mock right child data
      const rightChildData = [
        1234567892n, // startTime > 0
        500000n, // balance
        50n, // point
        0n, // depthLeftBranch
        0n, // depthRightBranch
        1n, // depth
        rightChild, // player
        rootWallet, // parent
        "0x0000000000000000000000000000000000000000", // leftChild
        "0x0000000000000000000000000000000000000000", // rightChild
        false, // isPointChanged
        false // unbalancedAllowance
      ];

      vi.spyOn(SimplePremiumService, "constructor" as any).mockImplementation(
        () => {
          (SimplePremiumService as any).publicClient = mockPublicClient;
        }
      );

      // Mock the readContract calls
      mockPublicClient.readContract
        .mockResolvedValueOnce(rootNodeData) // Root node
        .mockResolvedValueOnce(leftChildData) // Left child
        .mockResolvedValueOnce(rightChildData); // Right child

      const result = await SimplePremiumService.buildReferralTree(
        rootWallet,
        0,
        2
      );

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        address: rootWallet.toLowerCase(),
        balance: "1000000",
        depth: 0,
        leftChild: leftChild,
        parent: null,
        point: 100,
        rightChild: rightChild,
        startTime: "1234567890"
      });
      expect(result[1]).toEqual({
        address: leftChild.toLowerCase(),
        balance: "500000",
        depth: 1,
        leftChild: undefined,
        parent: rootWallet.toLowerCase(),
        point: 50,
        rightChild: undefined,
        startTime: "1234567891"
      });
      expect(result[2]).toEqual({
        address: rightChild.toLowerCase(),
        balance: "500000",
        depth: 1,
        leftChild: undefined,
        parent: rootWallet.toLowerCase(),
        point: 50,
        rightChild: undefined,
        startTime: "1234567892"
      });
    });

    it("should return empty array for non-existent wallet", async () => {
      const nonExistentWallet = "0x1234567890123456789012345678901234567890";

      vi.spyOn(SimplePremiumService, "constructor" as any).mockImplementation(
        () => {
          (SimplePremiumService as any).publicClient = mockPublicClient;
        }
      );

      // Mock node data with startTime = 0 (not registered)
      const mockNodeData = [
        0n, // startTime = 0
        0n, // balance
        0n, // point
        0n, // depthLeftBranch
        0n, // depthRightBranch
        0n, // depth
        "0x0000000000000000000000000000000000000000", // player
        "0x0000000000000000000000000000000000000000", // parent
        "0x0000000000000000000000000000000000000000", // leftChild
        "0x0000000000000000000000000000000000000000", // rightChild
        false, // isPointChanged
        false // unbalancedAllowance
      ];

      mockPublicClient.readContract.mockResolvedValue(mockNodeData);

      const result = await SimplePremiumService.buildReferralTree(
        nonExistentWallet,
        0,
        5
      );

      expect(result).toEqual([]);
    });

    it("should respect max depth limit", async () => {
      const rootWallet = "0x1234567890123456789012345678901234567890";
      const childWallet = "0x1111111111111111111111111111111111111111";

      vi.spyOn(SimplePremiumService, "constructor" as any).mockImplementation(
        () => {
          (SimplePremiumService as any).publicClient = mockPublicClient;
        }
      );

      // Mock root node with child
      const rootNodeData = [
        1234567890n, // startTime > 0
        1000000n, // balance
        100n, // point
        1n, // depthLeftBranch
        0n, // depthRightBranch
        0n, // depth
        rootWallet, // player
        "0x0000000000000000000000000000000000000000", // parent
        childWallet, // leftChild
        "0x0000000000000000000000000000000000000000", // rightChild
        false, // isPointChanged
        false // unbalancedAllowance
      ];

      // Mock child node
      const childNodeData = [
        1234567891n, // startTime > 0
        500000n, // balance
        50n, // point
        0n, // depthLeftBranch
        0n, // depthRightBranch
        1n, // depth
        childWallet, // player
        rootWallet, // parent
        "0x0000000000000000000000000000000000000000", // leftChild
        "0x0000000000000000000000000000000000000000", // rightChild
        false, // isPointChanged
        false // unbalancedAllowance
      ];

      mockPublicClient.readContract
        .mockResolvedValueOnce(rootNodeData)
        .mockResolvedValueOnce(childNodeData);

      const result = await SimplePremiumService.buildReferralTree(
        rootWallet,
        0,
        1
      );

      expect(result).toHaveLength(2);
      expect(result[0].depth).toBe(0);
      expect(result[1].depth).toBe(1);
    });
  });
});
