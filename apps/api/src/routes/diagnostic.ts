import { Status } from "@hey/data/enums";
import type { Context } from "hono";
import prisma from "../prisma/client";

const diagnostic = async (ctx: Context) => {
  try {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV || "not set",
        PORT: process.env.PORT || "not set",
        DATABASE_URL: process.env.DATABASE_URL ? "set" : "not set",
        DIRECT_URL: process.env.DIRECT_URL ? "set" : "not set",
        JWT_SECRET: process.env.JWT_SECRET ? "set" : "not set",
        REDIS_URL: process.env.REDIS_URL ? "set" : "not set",
        LENS_API_URL: process.env.LENS_API_URL || "not set"
      },
      database: {
        connection: "testing..."
      }
    };

    // Test database connection
    try {
      await prisma.$queryRaw`SELECT 1 as test`;
      diagnostics.database.connection = "connected";
      
      // Test basic table access
      try {
        const userCount = await prisma.user.count();
        diagnostics.database.userTable = `accessible (${userCount} users)`;
      } catch (tableError) {
        diagnostics.database.userTable = `error: ${tableError.message}`;
      }
      
      try {
        const preferenceCount = await prisma.preference.count();
        diagnostics.database.preferenceTable = `accessible (${preferenceCount} preferences)`;
      } catch (tableError) {
        diagnostics.database.preferenceTable = `error: ${tableError.message}`;
      }
      
    } catch (dbError) {
      diagnostics.database.connection = `failed: ${dbError.message}`;
      diagnostics.database.error = {
        code: dbError.code,
        message: dbError.message,
        stack: dbError.stack
      };
    }

    return ctx.json({
      diagnostics,
      status: Status.Success
    });
  } catch (error) {
    return ctx.json(
      { 
        error: "Diagnostic failed", 
        details: error.message,
        status: Status.Error 
      },
      500
    );
  }
};

export default diagnostic;
