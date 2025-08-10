import { LENS_API_URL } from "@hey/data/constants";
import type { JwtPayload } from "@hey/types/jwt";
import type { Context, Next } from "hono";
import { createRemoteJWKSet, jwtVerify } from "jose";
import PremiumService from "../services/PremiumService";

const jwksUri = `${LENS_API_URL.replace("/graphql", "")}/.well-known/jwks.json`;
// Cache the JWKS for 12 hours
const JWKS = createRemoteJWKSet(new URL(jwksUri), {
  cacheMaxAge: 60 * 60 * 12
});

const authContext = async (ctx: Context, next: Next) => {
  const token = ctx.req.raw.headers.get("X-Access-Token");

  if (!token) {
    ctx.set("account", null);
    ctx.set("token", null);
    ctx.set("walletAddress", null);
    ctx.set("profileId", null);
    ctx.set("isPremium", false);
    return next();
  }

  try {
    // Verify the JWT token using Lens JWKS
    const { payload } = await jwtVerify(token as string, JWKS);

    // Extract the verified payload
    const verifiedPayload = payload as JwtPayload;

    if (!verifiedPayload.act?.sub) {
      ctx.set("account", null);
      ctx.set("token", null);
      ctx.set("walletAddress", null);
      ctx.set("profileId", null);
      ctx.set("isPremium", false);
      return next();
    }

    // Extract wallet address and profile ID from the verified JWT
    const walletAddress = verifiedPayload.act.sub;
    const profileId = verifiedPayload.sub; // Assuming profileId is in the sub claim

    // Check premium status using our PremiumService
    let isPremium = false;
    try {
      isPremium = await PremiumService.getPremiumStatus(
        walletAddress,
        profileId
      );
    } catch (error) {
      console.error("Error checking premium status:", error);
      // Continue with isPremium = false if there's an error
    }

    // Set context variables
    ctx.set("account", verifiedPayload.act.sub);
    ctx.set("token", token);
    ctx.set("walletAddress", walletAddress);
    ctx.set("profileId", profileId);
    ctx.set("isPremium", isPremium);
  } catch (error) {
    // Don't log JWT verification failures as they're expected when users aren't authenticated
    // Only log unexpected errors
    if (
      error instanceof Error &&
      error.code !== "ERR_JWS_SIGNATURE_VERIFICATION_FAILED"
    ) {
      console.error("Unexpected JWT verification error:", error);
    }

    ctx.set("account", null);
    ctx.set("token", null);
    ctx.set("walletAddress", null);
    ctx.set("profileId", null);
    ctx.set("isPremium", false);
  }

  return next();
};

export default authContext;
