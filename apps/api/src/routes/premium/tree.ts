import { Hono } from "hono";
import SimplePremiumService from "@/services/SimplePremiumService";

const app = new Hono();

app.get("/:wallet", async (c) => {
  const wallet = c.req.param("wallet");
  if (!wallet) {
    return c.json({ error: "Missing wallet address" }, 400);
  }

  try {
    const maxDepth = c.req.query("maxDepth") ? Number.parseInt(c.req.query("maxDepth"), 10) : 5;
    
    if (maxDepth < 0 || maxDepth > 10) {
      return c.json({ error: "Max depth must be between 0 and 10" }, 400);
    }

    const nodes = await SimplePremiumService.buildReferralTree(wallet, 0, maxDepth);
    
    return c.json({ 
      data: nodes,
      meta: {
        rootWallet: wallet,
        maxDepth,
        totalNodes: nodes.length
      }
    });
  } catch (error) {
    console.error("Error fetching referral tree:", error);
    return c.json({ error: "Failed to fetch referral tree" }, 500);
  }
});

export default app; 