import { cors as corsMiddleware } from "hono/cors";

const allowedOrigins = [
  "https://hey.xyz",
  "https://testnet.hey.xyz",
  "https://staging.hey.xyz",
  "http://localhost:4783",
  "http://localhost:4784",
  "http://localhost:4785",
  "http://localhost:4786",
  "http://localhost:4787",
  "http://localhost:4788",
  "https://developer.lens.xyz"
];

const cors = corsMiddleware({
  allowHeaders: ["Content-Type", "X-Access-Token", "Authorization"],
  allowMethods: ["GET", "POST", "OPTIONS"],
  credentials: true,
  origin: allowedOrigins
});

export default cors;
