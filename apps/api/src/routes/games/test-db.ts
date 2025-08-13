import { Context } from "hono";
import prisma from "../../prisma/client";

export const testDb = async (c: Context) => {
  try {
    // Simple query to test database connection
    const gameCount = await prisma.game.count();
    
    // Try to get all games with minimal includes
    const games = await prisma.game.findMany({
      take: 5,
      include: {
        categories: true
      }
    });

    return c.json({
      success: true,
      gameCount,
      games: games.map(game => ({
        id: game.id,
        title: game.title,
        slug: game.slug,
        status: game.status,
        createdAt: game.createdAt,
        categories: game.categories.map(cat => cat.name)
      }))
    });
  } catch (error) {
    console.error("Database test error:", error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      details: JSON.stringify(error, null, 2)
    }, 500);
  }
}; 