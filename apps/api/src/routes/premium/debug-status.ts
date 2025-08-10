import { Hono } from "hono";
import { z } from "zod";
import { Status } from "@hey/data/enums";
import PremiumService from "@/services/PremiumService";
import ProfileService from "@/services/ProfileService";

const app = new Hono();

const debugSchema = z.object({
  walletAddress: z.string().min(1, "Wallet address is required")
});

app.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const { walletAddress } = debugSchema.parse(body);

    // Step 1: Check if wallet is premium
    const isPremium = await PremiumService.verifyPremiumByNodeset(walletAddress);
    
    // Step 2: Get available profiles
    const profiles = await ProfileService.getProfilesByWallet(walletAddress);
    
    // Step 3: Get premium status
    const premiumStatus = await PremiumService.getUserPremiumStatus(walletAddress);
    
    // Step 4: Get available profiles for linking
    const availableProfiles = await PremiumService.getAvailableProfiles(walletAddress);

    return c.json({
      data: {
        walletAddress,
        isPremium,
        profiles,
        premiumStatus,
        availableProfiles,
        environment: {
          referralContractAddress: process.env.REFERRAL_CONTRACT_ADDRESS ? "Set" : "Not set",
          infuraUrl: process.env.INFURA_URL ? "Set" : "Not set"
        }
      },
      status: Status.Success
    });
  } catch (error) {
    console.error("Debug error:", error);
    return c.json({
      error: "Debug failed",
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    }, 500);
  }
});

export default app; 