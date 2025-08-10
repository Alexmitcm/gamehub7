import { serve } from "@hono/node-server";
import { Hono } from "hono";

const app = new Hono();

app.get("/ping", (c) => {
  return c.json({ ping: "pong" });
});

app.get("/", (c) => {
  return c.json({ message: "Test server is running" });
});

const port = 8080;

console.log(`Starting test server on port ${port}...`);

serve({ fetch: app.fetch, hostname: "0.0.0.0", port }, (info) => {
  console.log(`Test server running on port ${info.port}`);
  console.log(`Test with: curl http://localhost:${info.port}/ping`);
});
