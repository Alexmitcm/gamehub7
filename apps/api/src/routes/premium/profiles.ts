import { Hono } from 'hono';
import { z } from 'zod';
import PremiumService from '@/services/PremiumService';

const app = new Hono();

const profilesSchema = z.object({
  walletAddress: z.string().min(1, 'Wallet address is required')
});

app.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const { walletAddress } = profilesSchema.parse(body);

    const availableProfiles = await PremiumService.getAvailableProfiles(walletAddress);

    return c.json(availableProfiles);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Invalid request data', details: error.errors }, 400);
    }

    console.error('Error getting available profiles:', error);
    return c.json({ error: 'Failed to get available profiles' }, 500);
  }
});

export default app; 