import { Status } from "@hey/data/enums";
import type { Context } from "hono";
import handleApiError from "@/utils/handleApiError";
import { getRedis, setRedis } from "@/utils/redis";
import prisma from "../../prisma/client";

/**
 * Helper function to check database connection
 */
async function checkDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
}

const getPreferences = async (ctx: Context) => {
  try {
    const account = ctx.get("account");

    // If user is not authenticated, return default preferences
    if (!account) {
      const data = {
        appIcon: 0,
        includeLowScore: false
      };

      return ctx.json({ data, status: Status.Success });
    }

    // Check database connection first
    const dbConnected = await checkDatabaseConnection();
    if (!dbConnected) {
      console.error("Database connection failed in getPreferences");
      return ctx.json(
        { 
          error: "Database connection failed", 
          status: Status.Error 
        },
        500
      );
    }

    const cacheKey = `preferences:${account}`;
    let cachedValue = null;

    // Try to get from cache, but don't fail if Redis is unavailable
    try {
      cachedValue = await getRedis(cacheKey);
    } catch (redisError) {
      console.warn("Redis cache unavailable, proceeding without cache:", redisError);
    }

    if (cachedValue) {
      try {
        const parsedData = JSON.parse(cachedValue);
        return ctx.json({
          cached: true,
          data: parsedData,
          status: Status.Success
        });
      } catch (parseError) {
        console.warn("Failed to parse cached preferences, fetching from database:", parseError);
      }
    }

    // Fetch from database
    const preference = await prisma.preference.findUnique({
      where: { accountAddress: account as string }
    });

    const data = {
      appIcon: preference?.appIcon || 0,
      includeLowScore: Boolean(preference?.includeLowScore)
    };

    // Try to cache the result, but don't fail if Redis is unavailable
    try {
      await setRedis(cacheKey, data);
    } catch (redisError) {
      console.warn("Failed to cache preferences:", redisError);
    }

    return ctx.json({ data, status: Status.Success });
  } catch (error) {
    console.error("Error in getPreferences:", error);
    return handleApiError(ctx, error);
  }
};

export default getPreferences;
