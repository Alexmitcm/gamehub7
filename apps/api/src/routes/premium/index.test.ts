import { Hono } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PremiumController from "../../controllers/PremiumController";
import premiumRouter from "./index";

// Mock the controller
vi.mock("../../controllers/PremiumController", () => ({
  default: {
    checkWalletStatus: vi.fn(),
    getPremiumStatus: vi.fn(),
    getUserProfiles: vi.fn(),
    linkProfile: vi.fn(),
    unlinkProfile: vi.fn()
  }
}));

describe("Premium Routes", () => {
  let app: Hono;

  beforeEach(() => {
    app = new Hono();
    app.route("/premium", premiumRouter);
    vi.clearAllMocks();
  });

  describe("POST /premium/link-profile", () => {
    it("should call linkProfile controller with valid data", async () => {
      const mockResponse = {
        data: {
          premiumProfile: {
            id: "1",
            isActive: true,
            profileId: "0x01",
            walletAddress: "0x123"
          },
          token: "jwt-token"
        },
        status: "SUCCESS",
        success: true
      };

      (PremiumController.linkProfile as any).mockResolvedValue(
        new Response(JSON.stringify(mockResponse), { status: 201 })
      );

      const response = await app.request("/premium/link-profile", {
        body: JSON.stringify({ profileId: "0x01" }),
        headers: {
          "Content-Type": "application/json"
        },
        method: "POST"
      });

      expect(response.status).toBe(201);
      expect(PremiumController.linkProfile).toHaveBeenCalled();
    });

    it("should return 400 for invalid input", async () => {
      const response = await app.request("/premium/link-profile", {
        body: JSON.stringify({ profileId: "" }), // Invalid empty profileId
        headers: {
          "Content-Type": "application/json"
        },
        method: "POST"
      });

      expect(response.status).toBe(400);
    });
  });

  describe("GET /premium/status", () => {
    it("should call getPremiumStatus controller", async () => {
      const mockResponse = {
        data: {
          isPremium: true,
          profileId: "0x01",
          walletAddress: "0x123"
        },
        status: "SUCCESS",
        success: true
      };

      (PremiumController.getPremiumStatus as any).mockResolvedValue(
        new Response(JSON.stringify(mockResponse), { status: 200 })
      );

      const response = await app.request("/premium/status", {
        method: "GET"
      });

      expect(response.status).toBe(200);
      expect(PremiumController.getPremiumStatus).toHaveBeenCalled();
    });
  });

  describe("DELETE /premium/unlink-profile", () => {
    it("should call unlinkProfile controller", async () => {
      const mockResponse = {
        data: {
          message: "Profile unlinked successfully",
          profileId: "0x01",
          walletAddress: "0x123"
        },
        status: "SUCCESS",
        success: true
      };

      (PremiumController.unlinkProfile as any).mockResolvedValue(
        new Response(JSON.stringify(mockResponse), { status: 200 })
      );

      const response = await app.request("/premium/unlink-profile", {
        method: "DELETE"
      });

      expect(response.status).toBe(200);
      expect(PremiumController.unlinkProfile).toHaveBeenCalled();
    });
  });

  describe("GET /premium/profiles", () => {
    it("should call getUserProfiles controller", async () => {
      const mockResponse = {
        data: {
          profiles: [
            {
              handle: "test.lens",
              id: "0x01",
              ownedBy: "0x123"
            }
          ],
          walletAddress: "0x123"
        },
        status: "SUCCESS",
        success: true
      };

      (PremiumController.getUserProfiles as any).mockResolvedValue(
        new Response(JSON.stringify(mockResponse), { status: 200 })
      );

      const response = await app.request("/premium/profiles", {
        method: "GET"
      });

      expect(response.status).toBe(200);
      expect(PremiumController.getUserProfiles).toHaveBeenCalled();
    });
  });

  describe("GET /premium/wallet-status", () => {
    it("should call checkWalletStatus controller", async () => {
      const mockResponse = {
        data: {
          isRegistered: true,
          walletAddress: "0x123"
        },
        status: "SUCCESS",
        success: true
      };

      (PremiumController.checkWalletStatus as any).mockResolvedValue(
        new Response(JSON.stringify(mockResponse), { status: 200 })
      );

      const response = await app.request("/premium/wallet-status", {
        method: "GET"
      });

      expect(response.status).toBe(200);
      expect(PremiumController.checkWalletStatus).toHaveBeenCalled();
    });
  });
});
