import type { Context } from "hono";

const ping = (ctx: Context) => {
  return ctx.json({ 
    ping: "pong",
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
};

export default ping;
