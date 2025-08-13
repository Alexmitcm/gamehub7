import { LENS_API_URL } from "@hey/data/constants";
import type { Context, Next } from "hono";
import { createRemoteJWKSet, jwtVerify } from "jose";
import JwtService from "../services/JwtService";

const jwksUri = `${LENS_API_URL.replace("/graphql", "")}/.well-known/jwks.json`;
// Cache the JWKS for 12 hours
const JWKS = createRemoteJWKSet(new URL(jwksUri), {
  cacheMaxAge: 60 * 60 * 12
});

const authMiddleware = async (c: Context, next: Next) => {
  // Try to get token from multiple sources
  let token = c.get("token"); // From authContext

  if (!token) {
    // Try Authorization header
    const authHeader = c.req.header("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7); // Remove "Bearer " prefix
    }
  }

  if (!token) {
    // Try X-Access-Token header as fallback
    token = c.req.header("X-Access-Token");
  }

  if (!token) {
    return c.json({ error: "Unauthorized - No token provided" }, 401);
  }

  try {
    // First try to verify with our own JWT service (more reliable)
    const decodedToken = JwtService.verifyToken(token);
    if (decodedToken) {
      c.set("jwtPayload", decodedToken);
      c.set("verifiedToken", token);
      c.set("walletAddress", decodedToken.walletAddress);
      c.set("account", decodedToken.walletAddress);
      return next();
    }

    // If our JWT service fails, try Lens JWT as fallback
    try {
      const { payload } = await jwtVerify(token, JWKS);

      // Set the verified payload in context for use in route handlers
      c.set("jwtPayload", payload);
      c.set("verifiedToken", token);

      // Extract wallet address from Lens JWT
      const walletAddress = payload.act?.sub;
      if (walletAddress) {
        c.set("walletAddress", walletAddress);
        c.set("account", walletAddress);
      }

      return next();
    } catch (lensError) {
      // Both verifications failed
      throw lensError;
    }
  } catch (error) {
    console.error("JWT verification failed:", error);
    return c.json({ error: "Unauthorized - Invalid token" }, 401);
  }
};

export default authMiddleware;
