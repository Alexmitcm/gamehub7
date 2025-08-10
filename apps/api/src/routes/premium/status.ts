import { Hono } from "hono";
import { z } from "zod";
import PremiumService from "@/services/PremiumService";

const app = new Hono();

const statusSchema = z.object({
  walletAddress: z.string().min(1, "Wallet address is required")
});

app.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const { walletAddress } = statusSchema.parse(body);

    const premiumStatus =
      await PremiumService.getUserPremiumStatus(walletAddress);

    return c.json(premiumStatus);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json(
        { details: error.errors, error: "Invalid request data" },
        400
      );
    }

    console.error("Error getting premium status:", error);
    return c.json({ error: "Failed to get premium status" }, 500);
  }
});

export default app;
