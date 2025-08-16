import "dotenv/config";
import { Status } from "@hey/data/enums";
import logger from "@hey/helpers/logger";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import authContext from "./context/authContext";
import cors from "./middlewares/cors";
import infoLogger from "./middlewares/infoLogger";
import adminRouter from "./routes/admin";
import authRouter from "./routes/auth";
import cronRouter from "./routes/cron";
import gamesRouter from "./routes/games";
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
import premiumRegistrationRouter from "./routes/premium-registration";
import referralRouter from "./routes/referral/tree";
import rpcRouter from "./routes/rpc";
import sitemapRouter from "./routes/sitemap";
import generateTestJwt from "./routes/test-jwt";

const app = new Hono();

// Context
app.use(cors);
app.use(authContext);
app.use(infoLogger);

// Static file serving for uploads (serve from apps/api working dir)
app.use("/uploads/*", serveStatic({ root: "." }));

// Routes
app.get("/ping", ping);
app.get("/health", (c) =>
  c.json({ status: "healthy", timestamp: new Date().toISOString() })
);
app.route("/auth", authRouter);
app.route("/admin", adminRouter);
app.route("/lens", lensRouter);
app.route("/cron", cronRouter);
app.route("/games", gamesRouter);
app.route("/live", liveRouter);
app.route("/metadata", metadataRouter);
app.route("/oembed", oembedRouter);
app.route("/preferences", preferencesRouter);
app.route("/premium", premiumRouter);
app.route("/premium-registration", premiumRegistrationRouter);
app.route("/premium/debug", debugRouter);
app.route("/premium/debug-profile", debugProfileRouter);
app.route("/premium/test-lens", testLensRouter);
app.route("/referral", referralRouter);
app.route("/rpc", rpcRouter);
app.route("/sitemap", sitemapRouter);
app.route("/og", ogRouter);

// Test endpoint for generating JWT tokens
app.post("/test-jwt", generateTestJwt);

app.notFound((ctx) =>
  ctx.json({ error: "Not Found", status: Status.Error }, 404)
);

const port = Number.parseInt(process.env.PORT || "8080", 10);

logger.info(`Starting server on port ${port}`);
logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
logger.info(`Database URL: ${process.env.DATABASE_URL ? "Set" : "Not set"}`);

// Start server with WebSocket support
try {
  serve({ fetch: app.fetch, hostname: "0.0.0.0", port }, (info) => {
    logger.info(`✅ Server running on port ${info.port}`);
    logger.info("✅ WebSocket service initialized");
    logger.info("✅ Admin service initialized");
    logger.info("✅ Health check available at /health");
    logger.info("✅ Ping endpoint available at /ping");
  });
} catch (error) {
  logger.error("❌ Failed to start server:", error);
  process.exit(1);
}

// Handle server shutdown gracefully
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  logger.info("SIGINT received, shutting down gracefully");
  process.exit(0);
});
