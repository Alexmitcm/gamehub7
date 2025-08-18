import { Regex } from "@hey/data/regex";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import authorization from "./authorization";

const app = new Hono();

// GET endpoint for lens service info
app.get("/", (c) => {
  return c.json({
    description: "Handles Lens Protocol authorization and integration",
    endpoints: {
      "/authorization": {
        body: {
          account: "EVM address",
          signedBy: "EVM address"
        },
        description: "Authorize Lens Protocol operations",
        method: "POST"
      }
    },
    service: "Lens Protocol Integration",
    version: "1.0.0"
  });
});

app.post(
  "/authorization",
  zValidator(
    "json",
    z.object({
      account: z.string().regex(Regex.evmAddress),
      signedBy: z.string().regex(Regex.evmAddress)
    })
  ),
  authorization
);

export default app;
