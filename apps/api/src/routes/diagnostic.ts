import { Status } from "@hey/data/enums";
import type { Context } from "hono";
import prisma from "../prisma/client";

interface DatabaseDiagnostics {
  connection: string;
  error?: {
    code?: string;
    message: string;
    stack?: string;
  };
  preferenceTable?: string;
  userTable?: string;
}

interface Diagnostics {
  database: DatabaseDiagnostics;
  environment: {
    DATABASE_URL: string;
    DIRECT_URL: string;
    JWT_SECRET: string;
    LENS_API_URL: string;
    NODE_ENV: string;
    PORT: string;
    REDIS_URL: string;
  };
  timestamp: string;
}

const diagnostic = async (ctx: Context) => {
  try {
    const diagnostics: Diagnostics = {
      database: {
        connection: "testing..."
      },
      environment: {
        DATABASE_URL: process.env.DATABASE_URL ? "set" : "not set",
        DIRECT_URL: process.env.DIRECT_URL ? "set" : "not set",
        JWT_SECRET: process.env.JWT_SECRET ? "set" : "not set",
        LENS_API_URL: process.env.LENS_API_URL || "not set",
        NODE_ENV: process.env.NODE_ENV || "not set",
        PORT: process.env.PORT || "not set",
        REDIS_URL: process.env.REDIS_URL ? "set" : "not set"
      },
      timestamp: new Date().toISOString()
    };

    // Test database connection
    try {
      await prisma.$queryRaw`SELECT 1 as test`;
      diagnostics.database.connection = "connected";

      // Test basic table access
      try {
        const userCount = await prisma.user.count();
        diagnostics.database.userTable = `accessible (${userCount} users)`;
      } catch (tableError: unknown) {
        const error = tableError as Error;
        diagnostics.database.userTable = `error: ${error.message}`;
      }

      try {
        const preferenceCount = await prisma.preference.count();
        diagnostics.database.preferenceTable = `accessible (${preferenceCount} preferences)`;
      } catch (tableError: unknown) {
        const error = tableError as Error;
        diagnostics.database.preferenceTable = `error: ${error.message}`;
      }
    } catch (dbError: unknown) {
      const error = dbError as Error;
      diagnostics.database.connection = `failed: ${error.message}`;
      diagnostics.database.error = {
        code: (error as any).code,
        message: error.message,
        stack: error.stack
      };
    }

    return ctx.json({
      diagnostics,
      status: Status.Success
    });
  } catch (error: unknown) {
    const err = error as Error;
    return ctx.json(
      {
        details: err.message,
        error: "Diagnostic failed",
        status: Status.Error
      },
      500
    );
  }
};

export default diagnostic;
