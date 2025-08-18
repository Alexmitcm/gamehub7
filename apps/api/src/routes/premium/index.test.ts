import { describe, expect, it, beforeEach, vi } from 'vitest';
import { Hono } from 'hono';
import premiumRouter from './index';

// Mock the auth middleware
vi.mock('../../middlewares/authMiddleware', () => ({
  default: (c: any, next: any) => {
    // Set the wallet address in the context
    c.set('walletAddress', '0x1234567890123456789012345678901234567890');
    return next();
  }
}));

// Mock the rate limiter
vi.mock('../../middlewares/rateLimiter', () => ({
  default: () => (c: any, next: any) => next()
}));

// Mock the controller with named exports
vi.mock('../../controllers/PremiumController', () => ({
  linkProfile: vi.fn(),
  getPremiumStatus: vi.fn(),
  unlinkProfile: vi.fn(),
  getUserProfiles: vi.fn(),
  getAvailableProfiles: vi.fn(),
  checkWalletStatus: vi.fn(),
  getProfiles: vi.fn(),
  getLinkedProfile: vi.fn(),
  getProfileStats: vi.fn(),
  registerUser: vi.fn(),
  verifyRegistration: vi.fn(),
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

      const { linkProfile } = await import('../../controllers/PremiumController');
      (linkProfile as any).mockResolvedValue(
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
      expect(linkProfile).toHaveBeenCalled();
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

      const { getPremiumStatus } = await import('../../controllers/PremiumController');
      (getPremiumStatus as any).mockResolvedValue(
        new Response(JSON.stringify(mockResponse), { status: 200 })
      );

      const response = await app.request('/premium/status', {
        method: 'GET',
      });

      expect(response.status).toBe(200);
      expect(getPremiumStatus).toHaveBeenCalled();
    });
  });

  describe('GET /premium/linked-profile', () => {
    it('should call getLinkedProfile controller', async () => {
      const mockResponse = {
        success: true,
        data: {
          profileId: '0x01',
          handle: 'test.handle',
          linkedAt: new Date().toISOString(),
        },
        status: 'SUCCESS',
      };

      const { getLinkedProfile } = await import('../../controllers/PremiumController');
      (getLinkedProfile as any).mockResolvedValue(
        new Response(JSON.stringify(mockResponse), { status: 200 })
      );

      const response = await app.request('/premium/linked-profile', {
        method: 'GET',
      });

      expect(response.status).toBe(200);
      expect(getLinkedProfile).toHaveBeenCalled();
    });
  });

  describe('GET /premium/profiles', () => {
    it('should call getProfiles controller with wallet address', async () => {
      const mockResponse = {
        success: true,
        data: {
          profiles: [
            {
              id: '0x01',
              handle: 'test.handle',
              ownedBy: '0x123',
              isDefault: true,
            },
          ],
        },
        status: 'SUCCESS',
      };

      const { getProfiles } = await import('../../controllers/PremiumController');
      (getProfiles as any).mockResolvedValue(
        new Response(JSON.stringify(mockResponse), { status: 200 })
      );

      const response = await app.request('/premium/profiles?walletAddress=0x1234567890123456789012345678901234567890', {
        method: 'GET',
      });

      expect(response.status).toBe(200);
      expect(getProfiles).toHaveBeenCalled();
    });
  });

  describe('GET /premium/available-profiles', () => {
    it('should call getAvailableProfiles controller', async () => {
      const mockResponse = {
        success: true,
        data: {
          canLink: true,
          profiles: [
            {
              id: '0x01',
              handle: 'test.handle',
              ownedBy: '0x123',
              isDefault: true,
            },
          ],
        },
        status: 'SUCCESS',
      };

      const { getAvailableProfiles } = await import('../../controllers/PremiumController');
      (getAvailableProfiles as any).mockResolvedValue(
        new Response(JSON.stringify(mockResponse), { status: 200 })
      );

      const response = await app.request('/premium/available-profiles', {
        method: 'GET',
      });

      expect(response.status).toBe(200);
      expect(getAvailableProfiles).toHaveBeenCalled();
    });
  });
}); 