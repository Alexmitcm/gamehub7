import { beforeEach, describe, expect, it, vi } from "vitest";
import PremiumService from "./PremiumService";

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

vi.mock("./BlockchainService", () => ({
  default: {
    isWalletPremium: vi.fn(),
    getProfileStats: vi.fn(),
    verifyRegistrationTransaction: vi.fn()
  }
}));

vi.mock("./UserService", () => ({
  default: {
    getUserPremiumStatus: vi.fn(),
    autoLinkFirstProfile: vi.fn(),
    linkProfileToWallet: vi.fn(),
    getPremiumStatus: vi.fn(),
    unlinkProfile: vi.fn(),
    getAvailableProfiles: vi.fn(),
    getLinkedProfile: vi.fn()
  }
}));

vi.mock("./EventService", () => ({
  default: {
    emitPremiumStatusChanged: vi.fn(),
    emitProfileAutoLinked: vi.fn(),
    emitProfileLinked: vi.fn(),
    emitRegistrationVerified: vi.fn()
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
      const { default: BlockchainService } = await import("./BlockchainService");
      vi.mocked(BlockchainService.isWalletPremium).mockResolvedValue(true);

      const result = await PremiumService.verifyPremiumByNodeset(
        "0x1234567890123456789012345678901234567890"
      );

      expect(result).toBe(true);
    });

    it("should return false for non-premium wallet", async () => {
      const { default: BlockchainService } = await import("./BlockchainService");
      vi.mocked(BlockchainService.isWalletPremium).mockResolvedValue(false);

      const result = await PremiumService.verifyPremiumByNodeset(
        "0x1234567890123456789012345678901234567890"
      );

      expect(result).toBe(false);
    });

    it("should handle errors gracefully", async () => {
      const { default: BlockchainService } = await import("./BlockchainService");
      vi.mocked(BlockchainService.isWalletPremium).mockRejectedValue(
        new Error("Network error")
      );

      await expect(
        PremiumService.verifyPremiumByNodeset(
          "0x1234567890123456789012345678901234567890"
        )
      ).rejects.toThrow("Network error");
    });
  });

  describe("getUserPremiumStatus", () => {
    it("should return Standard for non-premium wallet", async () => {
      const { default: BlockchainService } = await import("./BlockchainService");
      vi.mocked(BlockchainService.isWalletPremium).mockResolvedValue(false);

      const result = await PremiumService.getUserPremiumStatus(
        "0x1234567890123456789012345678901234567890"
      );

      expect(result.userStatus).toBe("Standard");
    });

    it("should return ProLinked for premium wallet with linked profile", async () => {
      const { default: BlockchainService } = await import("./BlockchainService");
      const { default: UserService } = await import("./UserService");
      
      vi.mocked(BlockchainService.isWalletPremium).mockResolvedValue(true);
      vi.mocked(UserService.getUserPremiumStatus).mockResolvedValue({
        userStatus: "ProLinked"
      });

      const result = await PremiumService.getUserPremiumStatus(
        "0x1234567890123456789012345678901234567890"
      );

      expect(result.userStatus).toBe("ProLinked");
    });

    it("should return OnChainUnlinked for premium wallet without linked profile", async () => {
      const { default: BlockchainService } = await import("./BlockchainService");
      const { default: UserService } = await import("./UserService");
      
      vi.mocked(BlockchainService.isWalletPremium).mockResolvedValue(true);
      vi.mocked(UserService.getUserPremiumStatus).mockResolvedValue({
        userStatus: "OnChainUnlinked"
      });

      const result = await PremiumService.getUserPremiumStatus(
        "0x1234567890123456789012345678901234567890"
      );

      expect(result.userStatus).toBe("OnChainUnlinked");
    });
  });

  describe("autoLinkFirstProfile", () => {
    it("should auto-link first profile for premium wallet", async () => {
      const { default: BlockchainService } = await import("./BlockchainService");
      const { default: UserService } = await import("./UserService");
      const { default: EventService } = await import("./EventService");
      
      vi.mocked(BlockchainService.isWalletPremium).mockResolvedValue(true);
      vi.mocked(UserService.autoLinkFirstProfile).mockResolvedValue({
        profileId: "profile123",
        handle: "test.handle",
        linkedAt: new Date()
      });

      const result = await PremiumService.autoLinkFirstProfile(
        "0x1234567890123456789012345678901234567890"
      );

      expect(result?.profileId).toBe("profile123");
      expect(EventService.emitProfileAutoLinked).toHaveBeenCalledWith(
        "0x1234567890123456789012345678901234567890",
        "profile123"
      );
    });

    it("should throw error for non-premium wallet", async () => {
      const { default: BlockchainService } = await import("./BlockchainService");
      vi.mocked(BlockchainService.isWalletPremium).mockResolvedValue(false);

      await expect(
        PremiumService.autoLinkFirstProfile(
          "0x1234567890123456789012345678901234567890"
        )
      ).rejects.toThrow("Wallet is not premium (not in NodeSet)");
    });

    it("should throw error if wallet already has linked profile", async () => {
      const { default: BlockchainService } = await import("./BlockchainService");
      const { default: UserService } = await import("./UserService");
      
      vi.mocked(BlockchainService.isWalletPremium).mockResolvedValue(true);
      vi.mocked(UserService.autoLinkFirstProfile).mockRejectedValue(
        new Error("Wallet already has linked profile")
      );

      await expect(
        PremiumService.autoLinkFirstProfile(
          "0x1234567890123456789012345678901234567890"
        )
      ).rejects.toThrow("Wallet already has linked profile");
    });
  });

  describe("linkProfile", () => {
    it("should link profile for premium wallet", async () => {
      const { default: BlockchainService } = await import("./BlockchainService");
      const { default: UserService } = await import("./UserService");
      const { default: EventService } = await import("./EventService");
      
      vi.mocked(BlockchainService.isWalletPremium).mockResolvedValue(true);
      vi.mocked(UserService.linkProfileToWallet).mockResolvedValue({
        profileId: "profile123",
        handle: "test.handle",
        linkedAt: new Date()
      });

      await PremiumService.linkProfile(
        "0x1234567890123456789012345678901234567890",
        "profile123"
      );

      expect(UserService.linkProfileToWallet).toHaveBeenCalledWith(
        "0x1234567890123456789012345678901234567890",
        "profile123"
      );
      expect(EventService.emitProfileLinked).toHaveBeenCalledWith(
        "0x1234567890123456789012345678901234567890",
        "profile123"
      );
    });

    it("should throw error if wallet already has linked profile", async () => {
      const { default: BlockchainService } = await import("./BlockchainService");
      const { default: UserService } = await import("./UserService");
      
      vi.mocked(BlockchainService.isWalletPremium).mockResolvedValue(true);
      vi.mocked(UserService.linkProfileToWallet).mockRejectedValue(
        new Error("Wallet already has linked profile")
      );

      await expect(
        PremiumService.linkProfile(
          "0x1234567890123456789012345678901234567890",
          "profile123"
        )
      ).rejects.toThrow("Wallet already has linked profile");
    });
  });

  describe("getAvailableProfiles", () => {
    it("should return empty profiles for non-premium wallet", async () => {
      const { default: BlockchainService } = await import("./BlockchainService");
      vi.mocked(BlockchainService.isWalletPremium).mockResolvedValue(false);

      const result = await PremiumService.getAvailableProfiles(
        "0x1234567890123456789012345678901234567890"
      );

      expect(result.canLink).toBe(false);
      expect(result.profiles).toHaveLength(0);
    });

    it("should return profiles for premium wallet without linked profile", async () => {
      const { default: BlockchainService } = await import("./BlockchainService");
      const { default: UserService } = await import("./UserService");
      
      vi.mocked(BlockchainService.isWalletPremium).mockResolvedValue(true);
      vi.mocked(UserService.getAvailableProfiles).mockResolvedValue({
        canLink: true,
        profiles: [{ id: "profile123", handle: "test.handle", ownedBy: "0x123", isDefault: false }]
      });

      const result = await PremiumService.getAvailableProfiles(
        "0x1234567890123456789012345678901234567890"
      );

      expect(result.canLink).toBe(true);
      expect(result.profiles).toHaveLength(1);
    });

    it("should return linked profile for premium wallet with linked profile", async () => {
      const { default: BlockchainService } = await import("./BlockchainService");
      const { default: UserService } = await import("./UserService");
      
      vi.mocked(BlockchainService.isWalletPremium).mockResolvedValue(true);
      vi.mocked(UserService.getAvailableProfiles).mockResolvedValue({
        canLink: false,
        profiles: [{ id: "profile123", handle: "linked.handle", ownedBy: "0x123", isDefault: false }]
      });

      const result = await PremiumService.getAvailableProfiles(
        "0x1234567890123456789012345678901234567890"
      );

      expect(result.canLink).toBe(false);
      expect(result.profiles).toHaveLength(1);
    });
  });
});
