import { Hono } from "hono";
import authMiddleware from "@/middlewares/authMiddleware";
import rateLimiter from "@/middlewares/rateLimiter";
import getSTS from "./getSTS";

const app = new Hono();

// GET endpoint for metadata service info (no auth required)
app.get("/", (c) => {
  return c.json({
    service: "Metadata Service",
    version: "1.0.0",
    description: "Handles metadata operations including STS token generation",
    endpoints: {
      "/sts": {
        method: "GET",
        description: "Get AWS STS credentials for file uploads",
        auth: "Required",
        rateLimit: "50 requests per minute"
      }
    }
  });
});

app.get("/sts", rateLimiter({ requests: 50 }), authMiddleware, getSTS);

export default app;
