import { Hono } from "hono";
import { ProfileService } from "../../services/ProfileService";

const testRouter = new Hono();
const profileService = new ProfileService();

testRouter.get("/test-lens/:walletAddress", async (c) => {
  try {
    const walletAddress = c.req.param("walletAddress");

    if (!walletAddress) {
      return c.json({ error: "Wallet address is required" }, 400);
    }

    const normalizedAddress = walletAddress.toLowerCase();

    console.log(`Testing Lens API for wallet: ${normalizedAddress}`);

    // Test the Lens API call directly
    const profiles =
      await profileService.getProfilesByWallet(normalizedAddress);

    console.log(`Found ${profiles.length} profiles:`, profiles);

    return c.json({
      profiles: profiles,
      profilesFound: profiles.length,
      rawProfiles: JSON.stringify(profiles, null, 2),
      walletAddress: normalizedAddress
    });
  } catch (error) {
    console.error("Lens API test error:", error);
    return c.json(
      {
        error: "Lens API test failed",
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined
      },
      500
    );
  }
});

export default testRouter;
