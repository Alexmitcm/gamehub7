const { serve } = require("@hono/node-server");
const { Hono } = require("hono");

const app = new Hono();

app.get("/ping", (c) => c.json({ ping: "pong" }));
app.get("/test", (c) => c.json({ message: "Test server working!" }));

const port = 3006;

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Test server running on port ${info.port}`);
}); 