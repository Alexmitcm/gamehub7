import { Hono } from "hono";

const dbTest = new Hono();

dbTest.get("/", async (c) => {
  try {
    // Simple test without database connection
    return c.json({
      success: true,
      message: "API endpoint working - no database test",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "unknown",
      databaseUrl: process.env.DATABASE_URL ? "Set" : "Not set"
    });
  } catch (error) {
    console.error("Test endpoint error:", error);
    
    return c.json({
      success: false,
      message: "Test endpoint failed",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, 500);
  }
});

export default dbTest;
