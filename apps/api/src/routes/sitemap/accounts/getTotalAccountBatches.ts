import { SITEMAP_BATCH_SIZE, SITEMAP_CACHE_DAYS } from "@/utils/constants";
import lensPg from "@/utils/lensPg";
import { getRedis, hoursToSeconds, setRedis } from "@/utils/redis";

const getTotalAccountBatches = async (): Promise<number> => {
  const cacheKey = "sitemap:accounts:total";
  
  try {
    const cachedData = await getRedis(cacheKey);

    if (cachedData) {
      return Number(cachedData);
    }

    // Check if database connection is available
    if (!lensPg) {
      console.warn('Lens database connection not available, returning 0 batches');
      return 0;
    }

    const usernames = (await lensPg.query(
      `
        SELECT CEIL(COUNT(*) / $1) AS count
        FROM account.username_assigned;
      `,
      [SITEMAP_BATCH_SIZE]
    )) as Array<{ count: number }>;

    const totalBatches = Number(usernames[0]?.count) || 0;
    
    // Only cache if we got a valid result
    if (totalBatches > 0) {
      await setRedis(
        cacheKey,
        totalBatches,
        hoursToSeconds(SITEMAP_CACHE_DAYS * 24)
      );
    }
    
    return totalBatches;
  } catch (error) {
    console.error('Error getting total account batches:', error);
    
    // Return cached data if available, otherwise return 0
    try {
      const cachedData = await getRedis(cacheKey);
      if (cachedData) {
        return Number(cachedData);
      }
    } catch (cacheError) {
      console.error('Error reading from cache:', cacheError);
    }
    
    return 0;
  }
};

export default getTotalAccountBatches;
