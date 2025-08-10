const { serve } = require("@hono/node-server");
const { Hono } = require("hono");

const app = new Hono();

app.get("/ping", (c) => c.json({ ping: "pong" }));
app.get("/referral/simple", (c) => c.json({ 
  message: "Simple referral route working!",
  data: [],
  meta: {
    maxDepth: 3,
    rootWallet: "test",
    totalNodes: 0
  }
}));

const port = 3007;

serve({ fetch: app.fetch, port, hostname: "127.0.0.1" }, (info) => {
  console.log(`Simple test server running on port ${info.port}`);
}); 