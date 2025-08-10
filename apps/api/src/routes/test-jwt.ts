import { Context } from 'hono';
import { Status } from '@hey/data/enums';
import JwtService from '../services/JwtService';

const generateTestJwt = async (c: Context) => {
  try {
    const { walletAddress, profileId } = await c.req.json();
    
    if (!walletAddress || !profileId) {
      return c.json({
        success: false,
        error: 'walletAddress and profileId are required',
        status: Status.Error
      }, 400);
    }

    // Generate a test JWT with the provided data
    const token = JwtService.generateToken({
      isPremium: false, // Default to false for testing
      profileId,
      walletAddress
    });

    return c.json({
      success: true,
      data: {
        token,
        walletAddress,
        profileId,
        isPremium: false
      },
      status: Status.Success
    }, 200);

  } catch (error) {
    console.error('Error generating test JWT:', error);
    
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate test JWT',
      status: Status.Error
    }, 500);
  }
};

export default generateTestJwt; 