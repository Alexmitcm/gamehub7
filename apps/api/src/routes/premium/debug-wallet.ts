import { Status } from "@hey/data/enums";
import { Hono } from "hono";
import { z } from "zod";
import SimplePremiumService from "@/services/SimplePremiumService";

const app = new Hono();

const walletSchema = z.object({
  walletAddress: z.string().min(1, "Wallet address is required")
});

app.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const { walletAddress } = walletSchema.parse(body);

    console.log(`🔍 Debugging wallet: ${walletAddress}`);

    // Check if wallet is premium
    const isPremium = await SimplePremiumService.isPremiumWallet(walletAddress);

    // Get premium status
    const premiumStatus =
      await SimplePremiumService.getPremiumStatus(walletAddress);

    const result = {
      contractAddress: process.env.REFERRAL_CONTRACT_ADDRESS,
      infuraUrl: process.env.INFURA_URL ? "Set" : "Not Set",
      isPremium,
      premiumStatus,
      walletAddress
    };

    console.log("✅ Debug result:", result);

    return c.json({
      data: result,
      status: Status.Success
    });
  } catch (error) {
    console.error("❌ Debug error:", error);
    return c.json(
      {
        error: "Failed to debug wallet",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      500
    );
  }
});

export default app;
