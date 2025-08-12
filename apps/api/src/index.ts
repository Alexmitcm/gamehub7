import { serve } from "@hono/node-server";
import "dotenv/config";
import logger from "@hey/helpers/logger";
import { Hono } from "hono";
import ping from "./routes/ping";

// Create a minimal app for health check
const app = new Hono();

// Simple ping endpoint that doesn't depend on any external services
app.get("/ping", ping);

// Root endpoint
app.get("/", (c) => {
  return c.json({
    endpoints: {
      health: "/ping"
    },
    name: "Hey API",
    status: "operational",
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  });
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

const port = Number.parseInt(process.env.PORT || "3000", 10);

// Add error handling for server startup
try {
  logger.info(`Starting minimal server on port ${port}...`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  serve({ 
    fetch: app.fetch, 
    hostname: "0.0.0.0", 
    port 
  }, (info) => {
    logger.info(`✅ Server running on port ${info.port}`);
    logger.info(`🌐 Health check: http://0.0.0.0:${info.port}/ping`);
    logger.info(`📊 Root endpoint: http://0.0.0.0:${info.port}/`);
  });
} catch (error) {
  logger.error("❌ Failed to start server:", error);
  process.exit(1);
}
