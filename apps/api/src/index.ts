import { serve } from "@hono/node-server";
import "dotenv/config";
import { Status } from "@hey/data/enums";
import logger from "@hey/helpers/logger";
import { Hono } from "hono";
import authContext from "./context/authContext";
import cors from "./middlewares/cors";
import infoLogger from "./middlewares/infoLogger";
import authRouter from "./routes/auth";
import cronRouter from "./routes/cron";
import diagnostic from "./routes/diagnostic";
import lensRouter from "./routes/lens";
import liveRouter from "./routes/live";
import metadataRouter from "./routes/metadata";
import oembedRouter from "./routes/oembed";
import ogRouter from "./routes/og";
import ping from "./routes/ping";
import preferencesRouter from "./routes/preferences";
import premiumRouter from "./routes/premium";
import debugRouter from "./routes/premium/debug";
import debugProfileRouter from "./routes/premium/debug-profile";
import testLensRouter from "./routes/premium/test-lens";
import referralRouter from "./routes/referral/tree";
import sitemapRouter from "./routes/sitemap";
import generateTestJwt from "./routes/test-jwt";

const app = new Hono();

// Context
app.use(cors);
app.use(authContext);
app.use(infoLogger);

// Root endpoint
app.get("/", (c) => {
  return c.json({
    name: "Hey API",
    version: "1.0.0",
    status: "operational",
    endpoints: {
      health: "/ping",
      preferences: "/preferences/get",
      auth: "/auth/*",
      lens: "/lens/*",
      diagnostic: "/diagnostic"
    },
    timestamp: new Date().toISOString()
  });
});

// Routes
app.get("/ping", ping);
app.get("/diagnostic", diagnostic);
app.route("/auth", authRouter);
app.route("/lens", lensRouter);
app.route("/cron", cronRouter);
app.route("/live", liveRouter);
app.route("/metadata", metadataRouter);
app.route("/oembed", oembedRouter);
app.route("/preferences", preferencesRouter);
app.route("/premium", premiumRouter);
app.route("/premium/debug", debugRouter);
app.route("/premium/debug-profile", debugProfileRouter);
app.route("/premium/test-lens", testLensRouter);
app.route("/referral", referralRouter);
app.route("/sitemap", sitemapRouter);
app.route("/og", ogRouter);

// Test endpoint for generating JWT tokens
app.post("/test-jwt", generateTestJwt);

app.notFound((ctx) =>
  ctx.json({ error: "Not Found", status: Status.Error }, 404)
);

const port = Number.parseInt(process.env.PORT || "3010", 10);

serve({ fetch: app.fetch, hostname: "0.0.0.0", port }, (info) => {
  logger.info(`Server running on port ${info.port}`);
});
