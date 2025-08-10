import { Hono } from "hono";

const app = new Hono();

app.get("/", async (c) => {
  // Log all headers for debugging
  const headers = Object.fromEntries(c.req.raw.headers.entries());
  console.log("Debug - All headers:", headers);

  // Check for different token sources
  const xAccessToken = c.req.header("X-Access-Token");
  const authorization = c.req.header("Authorization");
  const tokenFromContext = c.get("token");

  return c.json({
    fullHeaders: headers,
    headers: {
      authorization: authorization ? "Present" : "Missing",
      tokenFromContext: tokenFromContext ? "Present" : "Missing",
      xAccessToken: xAccessToken ? "Present" : "Missing"
    },
    message: "Debug endpoint - Authentication headers",
    timestamp: new Date().toISOString()
  });
});

export default app;
