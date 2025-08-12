import { serve } from "@hono/node-server";
import "dotenv/config";
import { Hono } from "hono";

const app = new Hono();

// Simple ping endpoint that always works
app.get("/ping", (c) => {
  return c.json({
    status: "ok",
    message: "API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development"
  });
});

// Root endpoint
app.get("/", (c) => {
  return c.json({
    name: "Hey API",
    status: "operational",
    message: "API is running in minimal mode",
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  });
});

// Simple health check
app.get("/health", (c) => {
  return c.json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

const port = Number.parseInt(process.env.PORT || "3010", 10);

console.log("Starting minimal API server...");
console.log(`Port: ${port}`);
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

serve({ fetch: app.fetch, hostname: "0.0.0.0", port }, (info) => {
  console.log(`Server running on port ${info.port}`);
  console.log(`Health check available at: http://0.0.0.0:${info.port}/ping`);
});
