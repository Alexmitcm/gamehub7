import { Hono } from "hono";
import secretMiddleware from "@/middlewares/secretMiddleware";
import syncSubscribersToGuild from "./guild/syncSubscribersToGuild";
import removeExpiredSubscribers from "./removeExpiredSubscribers";

const app = new Hono();

// GET endpoint for cron service info
app.get("/", (c) => {
  return c.json({
    service: "Cron Jobs Service",
    version: "1.0.0",
    description: "Handles scheduled background tasks and maintenance",
    endpoints: {
      "/syncSubscribersToGuild": {
        method: "GET",
        description: "Sync subscribers to Guild.xyz",
        auth: "Secret required"
      },
      "/removeExpiredSubscribers": {
        method: "GET",
        description: "Remove expired subscribers",
        auth: "Secret required"
      }
    }
  });
});

app.get("/syncSubscribersToGuild", secretMiddleware, syncSubscribersToGuild);
app.get(
  "/removeExpiredSubscribers",
  secretMiddleware,
  removeExpiredSubscribers
);

export default app;
