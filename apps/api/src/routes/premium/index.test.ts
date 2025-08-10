import { describe, expect, it, beforeEach, vi } from 'vitest';
import { Hono } from 'hono';
import premiumRouter from './index';
import PremiumController from '../../controllers/PremiumController';

// Mock the controller
vi.mock('../../controllers/PremiumController', () => ({
  default: {
    linkProfile: vi.fn(),
    getPremiumStatus: vi.fn(),
    unlinkProfile: vi.fn(),
    getUserProfiles: vi.fn(),
    checkWalletStatus: vi.fn(),
  },
}));

describe('Premium Routes', () => {
  let app: Hono;

  beforeEach(() => {
    app = new Hono();
    app.route('/premium', premiumRouter);
    vi.clearAllMocks();
  });

  describe('POST /premium/link-profile', () => {
    it('should call linkProfile controller with valid data', async () => {
      const mockResponse = {
        success: true,
        data: {
          premiumProfile: {
            id: '1',
            walletAddress: '0x123',
            profileId: '0x01',
            isActive: true,
          },
          token: 'jwt-token',
        },
        status: 'SUCCESS',
      };

      (PremiumController.linkProfile as any).mockResolvedValue(
        new Response(JSON.stringify(mockResponse), { status: 201 })
      );

      const response = await app.request('/premium/link-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profileId: '0x01' }),
      });

      expect(response.status).toBe(201);
      expect(PremiumController.linkProfile).toHaveBeenCalled();
    });

    it('should return 400 for invalid input', async () => {
      const response = await app.request('/premium/link-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profileId: '' }), // Invalid empty profileId
      });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /premium/status', () => {
    it('should call getPremiumStatus controller', async () => {
      const mockResponse = {
        success: true,
        data: {
          isPremium: true,
          walletAddress: '0x123',
          profileId: '0x01',
        },
        status: 'SUCCESS',
      };

      (PremiumController.getPremiumStatus as any).mockResolvedValue(
        new Response(JSON.stringify(mockResponse), { status: 200 })
      );

      const response = await app.request('/premium/status', {
        method: 'GET',
      });

      expect(response.status).toBe(200);
      expect(PremiumController.getPremiumStatus).toHaveBeenCalled();
    });
  });

  describe('DELETE /premium/unlink-profile', () => {
    it('should call unlinkProfile controller', async () => {
      const mockResponse = {
        success: true,
        data: {
          message: 'Profile unlinked successfully',
          walletAddress: '0x123',
          profileId: '0x01',
        },
        status: 'SUCCESS',
      };

      (PremiumController.unlinkProfile as any).mockResolvedValue(
        new Response(JSON.stringify(mockResponse), { status: 200 })
      );

      const response = await app.request('/premium/unlink-profile', {
        method: 'DELETE',
      });

      expect(response.status).toBe(200);
      expect(PremiumController.unlinkProfile).toHaveBeenCalled();
    });
  });

  describe('GET /premium/profiles', () => {
    it('should call getUserProfiles controller', async () => {
      const mockResponse = {
        success: true,
        data: {
          profiles: [
            {
              id: '0x01',
              handle: 'test.lens',
              ownedBy: '0x123',
            },
          ],
          walletAddress: '0x123',
        },
        status: 'SUCCESS',
      };

      (PremiumController.getUserProfiles as any).mockResolvedValue(
        new Response(JSON.stringify(mockResponse), { status: 200 })
      );

      const response = await app.request('/premium/profiles', {
        method: 'GET',
      });

      expect(response.status).toBe(200);
      expect(PremiumController.getUserProfiles).toHaveBeenCalled();
    });
  });

  describe('GET /premium/wallet-status', () => {
    it('should call checkWalletStatus controller', async () => {
      const mockResponse = {
        success: true,
        data: {
          isRegistered: true,
          walletAddress: '0x123',
        },
        status: 'SUCCESS',
      };

      (PremiumController.checkWalletStatus as any).mockResolvedValue(
        new Response(JSON.stringify(mockResponse), { status: 200 })
      );

      const response = await app.request('/premium/wallet-status', {
        method: 'GET',
      });

      expect(response.status).toBe(200);
      expect(PremiumController.checkWalletStatus).toHaveBeenCalled();
    });
  });
}); 