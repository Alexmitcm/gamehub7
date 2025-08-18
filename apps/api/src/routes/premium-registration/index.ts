import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import PremiumRegistrationController from "@/controllers/PremiumRegistrationController";

const app = new Hono();
const controller = PremiumRegistrationController;

// Validation schemas
const registrationRequestSchema = z.object({
  userAddress: z.string().min(1, "User address is required"),
  referrerAddress: z.string().min(1, "Referrer address is required"),
  lensProfileId: z.string().optional(),
  lensWalletAddress: z.string().optional(),
  transactionHash: z.string().optional()
});

const verifyRegistrationSchema = z.object({
  walletAddress: z.string().min(1, "Wallet address is required"),
  lensProfileId: z.string().optional(),
  transactionHash: z.string().min(1, "Transaction hash is required")
});

const linkProfileSchema = z.object({
  walletAddress: z.string().min(1, "Wallet address is required"),
  profileId: z.string().min(1, "Profile ID is required")
});

const autoLinkSchema = z.object({
  walletAddress: z.string().min(1, "Wallet address is required"),
  lensProfileId: z.string().min(1, "Lens profile ID is required")
});

/**
 * GET /premium-registration/status
 * Get user's premium status
 */
app.get("/status", async (ctx) => {
  return controller.getPremiumStatus(ctx);
});

/**
 * POST /premium-registration/status
 * Get user's premium status (POST version)
 */
app.post("/status", async (ctx) => {
  return controller.getPremiumStatus(ctx);
});

/**
 * POST /premium-registration/register
 * Handle premium registration request
 */
app.post("/register", zValidator("json", registrationRequestSchema), async (ctx) => {
  return controller.handlePremiumRegistration(ctx);
});

/**
 * POST /premium-registration/verify
 * Verify registration and link profile
 */
app.post("/verify", zValidator("json", verifyRegistrationSchema), async (ctx) => {
  return controller.verifyRegistrationAndLinkProfile(ctx);
});

/**
 * POST /premium-registration/auto-link
 * Auto-link first available profile for a premium wallet
 */
app.post("/auto-link", zValidator("json", autoLinkSchema), async (ctx) => {
  return controller.autoLinkFirstProfile(ctx);
});

/**
 * POST /premium-registration/link
 * Manually link profile to wallet
 */
app.post("/link", zValidator("json", linkProfileSchema), async (ctx) => {
  return controller.linkProfileToWallet(ctx);
});

/**
 * GET /premium-registration/connection-status
 * Check wallet connection status for MetaMask validation
 */
app.get("/connection-status", async (ctx) => {
  return controller.checkWalletConnectionStatus(ctx);
});

/**
 * POST /premium-registration/connection-status
 * Check wallet connection status (POST version)
 */
app.post("/connection-status", async (ctx) => {
  return controller.checkWalletConnectionStatus(ctx);
});

/**
 * GET /premium-registration/validate-reward-claiming
 * Validate wallet for reward claiming
 */
app.get("/validate-reward-claiming", async (ctx) => {
  return controller.validateWalletForRewardClaiming(ctx);
});

/**
 * POST /premium-registration/validate-reward-claiming
 * Validate wallet for reward claiming (POST version)
 */
app.post("/validate-reward-claiming", async (ctx) => {
  return controller.validateWalletForRewardClaiming(ctx);
});

/**
 * GET /premium-registration/comprehensive-status
 * Get comprehensive user status
 */
app.get("/comprehensive-status", async (ctx) => {
  return controller.getComprehensiveUserStatus(ctx);
});

/**
 * POST /premium-registration/comprehensive-status
 * Get comprehensive user status (POST version)
 */
app.post("/comprehensive-status", async (ctx) => {
  return controller.getComprehensiveUserStatus(ctx);
});

/**
 * POST /premium-registration/validate-requirements
 * Validate MetaMask wallet and network requirements for premium registration
 */
app.post("/validate-requirements", async (ctx) => {
  return controller.validatePremiumRegistrationRequirements(ctx);
});

/**
 * POST /premium-registration/enhanced-register
 * Enhanced premium registration with MetaMask and network validation
 */
app.post("/enhanced-register", zValidator("json", registrationRequestSchema), async (ctx) => {
  return controller.handleEnhancedPremiumRegistration(ctx);
});

/**
 * POST /premium-registration/strict-register
 * Strict premium registration with one-wallet-one-premium-account rule enforcement
 */
app.post("/strict-register", zValidator("json", registrationRequestSchema), async (ctx) => {
  return controller.handleStrictPremiumRegistration(ctx);
});

/**
 * GET /premium-registration/wallet-requirements
 * Get wallet requirements for premium registration
 */
app.get("/wallet-requirements", async (ctx) => {
  return controller.getWalletRequirements(ctx);
});

export default app;
