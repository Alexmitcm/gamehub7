import { Status } from "@hey/data/enums";
import { Hono } from "hono";
import { z } from "zod";
import SimplePremiumService from "@/services/SimplePremiumService";

const app = new Hono();

const statusSchema = z.object({
  profileId: z.string().optional(),
  walletAddress: z.string().min(1, "Wallet address is required")
});

app.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const { walletAddress, profileId } = statusSchema.parse(body);

    const result = await SimplePremiumService.getPremiumStatus(
      walletAddress,
      profileId
    );

    return c.json({
      data: result,
      status: Status.Success
    });
  } catch (error) {
    console.error("Error getting premium status:", error);
    return c.json(
      {
        error: "Failed to get premium status",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      500
    );
  }
});

export default app;
