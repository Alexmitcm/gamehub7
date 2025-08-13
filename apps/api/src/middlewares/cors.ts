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
  "http://localhost:4789",
  "http://localhost:4790",
  "http://localhost:4791",
  "https://developer.lens.xyz"
];

const cors = corsMiddleware({
  allowHeaders: ["Content-Type", "X-Access-Token", "Authorization", "Access-Control-Request-Method", "Access-Control-Request-Headers"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  credentials: true,
  origin: allowedOrigins,
  maxAge: 86400
});

export default cors;
