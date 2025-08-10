import { Hono } from "hono";
import prisma from "../../prisma/client";
import { PremiumService } from "../../services/PremiumService";
import { ProfileService } from "../../services/ProfileService";

const debugRouter = new Hono();
const premiumService = new PremiumService();
const profileService = new ProfileService();

debugRouter.get("/debug-profile/:walletAddress", async (c) => {
  try {
    const walletAddress = c.req.param("walletAddress");

    if (!walletAddress) {
      return c.json({ error: "Wallet address is required" }, 400);
    }

    const normalizedAddress = walletAddress.toLowerCase();

    // Step 1: Check on-chain status
    const isNodeSet = await premiumService.checkWalletStatus(normalizedAddress);

    // Step 2: Check database for existing link
    const existingLink = await prisma.premiumProfile.findUnique({
      where: { walletAddress: normalizedAddress }
    });

    // Step 3: Get profiles from Lens
    const profiles =
      await profileService.getProfilesByWallet(normalizedAddress);

    // Step 4: Get premium status
    const premiumStatus =
      await premiumService.getUserPremiumStatus(normalizedAddress);

    // Step 5: Get available profiles
    const availableProfiles =
      await premiumService.getAvailableProfiles(normalizedAddress);

    return c.json({
      debug: {
        availableProfiles,
        existingLink,
        isNodeSet,
        premiumStatus,
        profiles,
        profilesFound: profiles.length
      },
      walletAddress: normalizedAddress
    });
  } catch (error) {
    console.error("Debug profile error:", error);
    return c.json(
      {
        error: "Debug failed",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      500
    );
  }
});

export default debugRouter;
