import { Hono } from "hono";
import { PrismaClient } from "../../prisma/client";

const dbTest = new Hono();
const prisma = new PrismaClient();

dbTest.get("/", async (c) => {
  try {
    // Test basic database connection
    await prisma.$connect();
    
    // Test a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    
    return c.json({
      success: true,
      message: "Database connection successful",
      result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Database test error:", error);
    
    return c.json({
      success: false,
      message: "Database connection failed",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, 500);
  } finally {
    await prisma.$disconnect();
  }
});

export default dbTest;
