import type { Context } from "hono";

const getPreferences = async (ctx: Context) => {
  try {
    const account = ctx.get("account");

    // For now, return default preferences without database
    // Account can be null for unauthenticated users, which is fine
    const data = {
      appIcon: 0,
      includeLowScore: false
    };

    return ctx.json({ 
      data, 
      status: "Success",
      message: "Using default preferences (database not connected)"
    });
  } catch (error) {
    console.error("Preferences error:", error);
    
    return ctx.json({ 
      error: "Failed to get preferences",
      status: "Error",
      message: error instanceof Error ? error.message : "Unknown error"
    }, 500);
  }
};

export default getPreferences;
