import type { Context } from "hono";

const ping = (ctx: Context) => {
  try {
    return ctx.json({ 
      ping: "pong",
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      port: process.env.PORT || "3000",
      environment: process.env.NODE_ENV || "development"
    });
  } catch (error) {
    return ctx.json({ 
      ping: "error",
      status: "unhealthy",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, 500);
  }
};

export default ping;
