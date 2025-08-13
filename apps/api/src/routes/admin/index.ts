import { Status } from "@hey/data/enums";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import {
  getAdminUserView,
  getAdminUserViewPost,
  getAllAdminUsers,
  getAllAdminUsersPost,
  forceUnlinkProfile,
  forceLinkProfile,
  grantPremiumAccess,
  addAdminNote,
  getAdminStats,
  getAdminActionHistory,
  getAdminActionHistoryPost,
  getFeatureList,
  updateFeatureAccess,
  getAdminUserInfo,
  getAdminUserInfoPost
} from "@/controllers/AdminController";
import rateLimiter from "@/middlewares/rateLimiter";

const app = new Hono();

// Validation schemas
const walletAddressSchema = z.object({
  walletAddress: z.string().min(1, "Wallet address is required")
});

const paginationSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional()
});

// Routes

/**
 * GET /admin/user
 * Get comprehensive admin view of a user
 */
app.get(
  "/user",
  rateLimiter({ requests: 100 }),
  zValidator("query", walletAddressSchema),
  getAdminUserView
);

/**
 * POST /admin/user
 * Get comprehensive admin view of a user (alternative to GET)
 */
app.post(
  "/user",
  rateLimiter({ requests: 100 }),
  zValidator("json", walletAddressSchema),
  getAdminUserViewPost
);

/**
 * GET /admin/users
 * Get all users with admin view
 */
app.get(
  "/users",
  rateLimiter({ requests: 50 }),
  zValidator("query", paginationSchema),
  getAllAdminUsers
);

/**
 * POST /admin/users
 * Get all users with admin view (alternative to GET)
 */
app.post(
  "/users",
  rateLimiter({ requests: 50 }),
  getAllAdminUsersPost
);

/**
 * POST /admin/force-unlink-profile
 * Force unlink a profile (admin override)
 */
app.post(
  "/force-unlink-profile",
  rateLimiter({ requests: 10 }),
  forceUnlinkProfile
);

/**
 * POST /admin/force-link-profile
 * Force link a profile (admin override)
 */
app.post(
  "/force-link-profile",
  rateLimiter({ requests: 10 }),
  forceLinkProfile
);

/**
 * POST /admin/grant-premium
 * Grant premium access (admin override)
 */
app.post(
  "/grant-premium",
  rateLimiter({ requests: 10 }),
  grantPremiumAccess
);

/**
 * POST /admin/add-note
 * Add admin note to user
 */
app.post(
  "/add-note",
  rateLimiter({ requests: 20 }),
  addAdminNote
);

/**
 * GET /admin/stats
 * Get enhanced admin statistics
 */
app.get(
  "/stats",
  rateLimiter({ requests: 30 }),
  getAdminStats
);

/**
 * GET /admin/actions
 * Get admin action history
 */
app.get(
  "/actions",
  rateLimiter({ requests: 50 }),
  zValidator("query", paginationSchema),
  getAdminActionHistory
);

/**
 * POST /admin/actions
 * Get admin action history (alternative to GET)
 */
app.post(
  "/actions",
  rateLimiter({ requests: 50 }),
  getAdminActionHistoryPost
);

/**
 * GET /admin/features
 * Get feature list
 */
app.get(
  "/features",
  rateLimiter({ requests: 20 }),
  getFeatureList
);

/**
 * POST /admin/features/access
 * Update feature access for a user
 */
app.post(
  "/features/access",
  rateLimiter({ requests: 15 }),
  updateFeatureAccess
);

/**
 * GET /admin/admin-user
 * Get admin user information
 */
app.get(
  "/admin-user",
  rateLimiter({ requests: 50 }),
  zValidator("query", walletAddressSchema),
  getAdminUserInfo
);

/**
 * POST /admin/admin-user
 * Get admin user information (alternative to GET)
 */
app.post(
  "/admin-user",
  rateLimiter({ requests: 50 }),
  zValidator("json", walletAddressSchema),
  getAdminUserInfoPost
);

/**
 * GET /admin/health
 * Health check endpoint
 */
app.get("/health", async (c) => {
  return c.json({
    status: "healthy",
    service: "admin",
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /
 * Root endpoint with service information
 */
app.get("/", async (c) => {
  return c.json({
    service: "Admin Service",
    version: "2.0.0",
    description: "Comprehensive admin functionality with RBAC and feature management",
    endpoints: {
      "GET /user": "Get comprehensive admin view of a user",
      "POST /user": "Get comprehensive admin view of a user (POST)",
      "GET /users": "Get all users with admin view",
      "POST /users": "Get all users with admin view (POST)",
      "POST /force-unlink-profile": "Force unlink a profile (admin override)",
      "POST /force-link-profile": "Force link a profile (admin override)",
      "POST /grant-premium": "Grant premium access (admin override)",
      "POST /add-note": "Add admin note to user",
      "GET /stats": "Get enhanced admin statistics",
      "GET /actions": "Get admin action history",
      "POST /actions": "Get admin action history (POST)",
      "GET /features": "Get feature list",
      "POST /features/access": "Update feature access for a user",
      "GET /admin-user": "Get admin user information",
      "POST /admin-user": "Get admin user information (POST)",
      "GET /health": "Health check"
    },
    features: {
      "User Management": "View and manage all users with detailed status information",
      "Profile Linking": "Force link/unlink profiles with admin override",
      "Premium Access": "Grant or revoke premium access manually",
      "Admin Notes": "Add notes to user records for customer support",
      "Statistics": "Comprehensive platform statistics and analytics",
      "Action History": "Track all admin actions with audit trail",
      "Feature Management": "View and manage feature access controls",
      "RBAC": "Role-based access control for admin users",
      "System Health": "Monitor system health and connectivity"
    },
    status: Status.Success
  });
});

export default app;
