import { Hono } from "hono";
import { z } from "zod";
import PremiumService from "@/services/PremiumService";

const app = new Hono();

const autoLinkSchema = z.object({
  walletAddress: z.string().min(1, "Wallet address is required")
});

app.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const { walletAddress } = autoLinkSchema.parse(body);

    const linkedProfile =
      await PremiumService.autoLinkFirstProfile(walletAddress);

    if (!linkedProfile) {
      return c.json({ error: "No profiles available for auto-linking" }, 400);
    }

    return c.json(linkedProfile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json(
        { details: error.errors, error: "Invalid request data" },
        400
      );
    }

    console.error("Error auto-linking profile:", error);
    return c.json(
      {
        error: "Failed to auto-link profile",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      500
    );
  }
});

export default app;
