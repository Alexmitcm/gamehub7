import { Hono } from 'hono';
import { z } from 'zod';
import PremiumService from '@/services/PremiumService';

const app = new Hono();

const linkSchema = z.object({
  walletAddress: z.string().min(1, 'Wallet address is required'),
  profileId: z.string().min(1, 'Profile ID is required')
});

app.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const { walletAddress, profileId } = linkSchema.parse(body);

    await PremiumService.linkProfile(walletAddress, profileId);

    // Get the linked profile details
    const linkedProfile = await PremiumService.getLinkedProfile(walletAddress);

    if (!linkedProfile) {
      return c.json({ error: 'Failed to retrieve linked profile' }, 500);
    }

    return c.json(linkedProfile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Invalid request data', details: error.errors }, 400);
    }

    console.error('Error linking profile:', error);
    return c.json({ 
      error: 'Failed to link profile',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

export default app; 