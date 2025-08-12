import { cors as corsMiddleware } from "hono/cors";

// Base allowed origins
const baseAllowedOrigins = [
  "https://hey.xyz",
  "https://testnet.hey.xyz",
  "https://staging.hey.xyz",
  "https://developer.lens.xyz"
];

// Development origins
const devOrigins = [
  "http://localhost:4783",
  "http://localhost:4784",
  "http://localhost:4785",
  "http://localhost:4786",
  "http://localhost:4787",
  "http://localhost:4788"
];

// Production origins (can be extended via environment variables)
const productionOrigins = ["https://fantastic-bombolone-a79536.netlify.app"];

// Combine all origins
const allowedOrigins = [
  ...baseAllowedOrigins,
  ...(process.env.NODE_ENV === "production" ? productionOrigins : devOrigins)
];

// Add any additional origins from environment variables
if (process.env.ADDITIONAL_CORS_ORIGINS) {
  const additionalOrigins = process.env.ADDITIONAL_CORS_ORIGINS.split(",").map(
    (origin) => origin.trim()
  );
  allowedOrigins.push(...additionalOrigins);
}

const cors = corsMiddleware({
  allowHeaders: ["Content-Type", "X-Access-Token", "Authorization"],
  allowMethods: ["GET", "POST", "OPTIONS"],
  credentials: true,
  origin: (origin) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return true;

    // Check if origin is in our allowed list
    if (allowedOrigins.includes(origin)) return true;

    // Allow Netlify preview deployments (they have random subdomains)
    if (origin.includes(".netlify.app")) return true;

    // Allow localhost for development
    if (origin.includes("localhost")) return true;

    return false;
  }
});

export default cors;
