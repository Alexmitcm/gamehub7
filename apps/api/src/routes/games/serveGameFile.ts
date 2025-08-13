import type { Context } from "hono";
import { serveStatic } from "hono/serve-static";
import { join } from "path";
import prisma from "../../prisma/client";

export const serveGameFile = async (c: Context) => {
  try {
    const slug = c.req.param("slug");
    const filePath = c.req.param("*") || "index.html";

    // Get the game from database
    const game = await prisma.game.findUnique({
      where: { slug }
    });

    if (!game) {
      return c.json({ error: "Game not found" }, 404);
    }

    if (game.status !== "Published") {
      return c.json({ error: "Game is not available" }, 404);
    }

    // Serve files from the games directory
    const gamesDir = join(process.cwd(), "uploads", "games", slug);
    
    // Set CORS headers for game files
    c.header("Access-Control-Allow-Origin", "*");
    c.header("Access-Control-Allow-Methods", "GET, OPTIONS");
    c.header("Access-Control-Allow-Headers", "Content-Type");

    // Use Hono's serveStatic to serve the file
    return serveStatic({
      root: gamesDir,
      path: filePath
    })(c);

  } catch (error) {
    console.error("Serve game file error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
}; 