import { Status } from "@hey/data/enums";
import type { Context } from "hono";
import JwtService from "../services/JwtService";

const generateTestJwt = async (c: Context) => {
  try {
    const { walletAddress, profileId } = await c.req.json();

    if (!walletAddress || !profileId) {
      return c.json(
        {
          error: "walletAddress and profileId are required",
          status: Status.Error,
          success: false
        },
        400
      );
    }

    // Generate a test JWT with the provided data
    const token = JwtService.generateToken({
      isPremium: false, // Default to false for testing
      profileId,
      walletAddress
    });

    return c.json(
      {
        data: {
          isPremium: false,
          profileId,
          token,
          walletAddress
        },
        status: Status.Success,
        success: true
      },
      200
    );
  } catch (error) {
    console.error("Error generating test JWT:", error);

    return c.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate test JWT",
        status: Status.Error,
        success: false
      },
      500
    );
  }
};

export default generateTestJwt;
