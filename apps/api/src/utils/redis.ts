import logger from "@hey/helpers/logger";
import dotenv from "dotenv";
import type { RedisClientType } from "redis";
import { createClient } from "redis";

dotenv.config({ override: true });

const logNoRedis = () => logger.info("[Redis] No Redis client, using fallback");

let redisClient: null | RedisClientType = null;
let isConnecting = false;
let connectionRetries = 0;
const MAX_RETRIES = 3;

if (process.env.REDIS_URL) {
  try {
    redisClient = createClient({
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > MAX_RETRIES) {
            logger.error(
              "[Redis] Max reconnection attempts reached, giving up"
            );
            return false;
          }
          const delay = Math.min(retries * 1000, 5000);
          logger.info(
            `[Redis] Reconnecting in ${delay}ms (attempt ${retries})`
          );
          return delay;
        }
      },
      url: process.env.REDIS_URL
    });

    redisClient.on("connect", () => {
      logger.info("[Redis] Redis connect");
      isConnecting = false;
      connectionRetries = 0;
    });

    redisClient.on("ready", () => {
      logger.info("[Redis] Redis ready");
      isConnecting = false;
      connectionRetries = 0;
    });

    redisClient.on("reconnecting", (err) => {
      logger.warn("[Redis] Redis reconnecting", err);
      isConnecting = true;
    });

    redisClient.on("error", (err) => {
      logger.error("[Redis] Redis error", err);
      isConnecting = false;
    });

    redisClient.on("end", (err) => {
      logger.error("[Redis] Redis end", err);
      isConnecting = false;
    });

    const connectRedis = async () => {
      if (isConnecting) {
        logger.info("[Redis] Already attempting to connect");
        return;
      }

      isConnecting = true;
      logger.info("[Redis] Connecting to Redis");

      try {
        await redisClient?.connect();
      } catch (error) {
        connectionRetries++;
        logger.error("[Redis] Connection error", error);

        if (connectionRetries >= MAX_RETRIES) {
          logger.info(
            "[Redis] Max connection attempts reached, falling back to no-cache mode"
          );
          redisClient = null;
        }
      } finally {
        isConnecting = false;
      }
    };

    connectRedis().catch((error) => {
      logger.error("[Redis] Connection error", error);
      logger.info("[Redis] Falling back to no-cache mode");
      redisClient = null;
    });
  } catch (error) {
    logger.error("[Redis] Failed to create Redis client", error);
    logger.info("[Redis] Falling back to no-cache mode");
    redisClient = null;
  }
} else {
  logger.info("[Redis] REDIS_URL not set, using no-cache mode");
}

const randomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min) + min);
};

export const hoursToSeconds = (hours: number): number => {
  return hours * 60 * 60;
};

// Generates a random expiry time between 1 to 2 days
export const generateSmallExpiry = (): number => {
  return randomNumber(hoursToSeconds(1 * 24), hoursToSeconds(2 * 24));
};

// Generates a random expiry time between 8 and 10 days
export const generateExtraLongExpiry = (): number => {
  return randomNumber(hoursToSeconds(8 * 24), hoursToSeconds(10 * 24));
};

export const setRedis = async (
  key: string,
  value: boolean | number | Record<string, unknown> | string,
  expiry = generateSmallExpiry()
) => {
  if (!redisClient) {
    logNoRedis();
    return;
  }

  try {
    return await redisClient.set(
      key,
      typeof value !== "string" ? JSON.stringify(value) : value,
      { EX: expiry }
    );
  } catch (error) {
    logger.error("[Redis] Failed to set key:", key, error);
    return null;
  }
};

export const getRedis = async (key: string) => {
  if (!redisClient) {
    logNoRedis();
    return null;
  }

  try {
    return await redisClient.get(key);
  } catch (error) {
    logger.error("[Redis] Failed to get key:", key, error);
    return null;
  }
};

export const delRedis = async (key: string) => {
  if (!redisClient) {
    logNoRedis();
    return null;
  }

  try {
    return await redisClient.del(key);
  } catch (error) {
    logger.error("[Redis] Failed to delete key:", key, error);
    return null;
  }
};
