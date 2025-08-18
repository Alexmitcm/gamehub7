import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import authMiddleware from "@/middlewares/authMiddleware";
import rateLimiter from "@/middlewares/rateLimiter";
import createLive from "./createLive";

const app = new Hono();

// GET endpoint for live service info
app.get("/", (c) => {
  return c.json({
    service: "Live Streaming Service",
    version: "1.0.0",
    description: "Handles live streaming functionality",
    endpoints: {
      "/create": {
        method: "POST",
        description: "Create a new live stream",
        auth: "Required",
        rateLimit: "10 requests per minute",
        body: {
          record: "boolean"
        }
      }
    }
  });
});

app.post(
  "/create",
  rateLimiter({ requests: 10 }),
  authMiddleware,
  zValidator("json", z.object({ record: z.boolean() })),
  createLive
);

export default app;
