import { cors as corsMiddleware } from "hono/cors";

const allowedOrigins = [
  "https://hey.xyz",
  "https://testnet.hey.xyz",
  "https://staging.hey.xyz",
  "https://gamehub7-production.up.railway.app",
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

// Enhanced CORS configuration for production
const cors = corsMiddleware({
  allowHeaders: [
    "Content-Type", 
    "X-Access-Token", 
    "Authorization", 
    "Access-Control-Request-Method", 
    "Access-Control-Request-Headers",
    "Origin",
    "Accept",
    "X-Requested-With"
  ],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  credentials: true,
  origin: (origin) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return origin;
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) return origin;
    
    // Allow localhost for development
    if (origin.startsWith('http://localhost:')) return origin;
    
    // Log blocked origins for debugging
    console.log(`CORS blocked origin: ${origin}`);
    return null;
  },
  maxAge: 86400,
  exposeHeaders: ["Content-Length", "Content-Type"]
});

export default cors;
