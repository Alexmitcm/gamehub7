import { Context } from "hono";
import { z } from "zod";

const fetchGamesSchema = z.object({
  distributor: z.enum(["GameDistribution", "GamePix"]),
  collection: z.string().optional(),
  category: z.string().optional(),
  limit: z.number().min(1).max(100).default(10),
  offset: z.number().min(1).default(1),
  sort: z.string().optional(),
});

export const fetchGames = async (c: Context) => {
  try {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const validatedData = fetchGamesSchema.parse(body);

    // This is a placeholder implementation
    // In a real implementation, you would integrate with the actual APIs
    const mockGames = [
      {
        title: "Sample Game 1",
        description: "A sample game from external distributor",
        thumb1Url: "https://example.com/thumb1.jpg",
        thumb2Url: "https://example.com/thumb2.jpg",
        gameUrl: "https://example.com/game.html",
        width: 1280,
        height: 720,
        category: "Action",
      },
      {
        title: "Sample Game 2",
        description: "Another sample game from external distributor",
        thumb1Url: "https://example.com/thumb2.jpg",
        thumb2Url: "https://example.com/thumb2_square.jpg",
        gameUrl: "https://example.com/game2.html",
        width: 1280,
        height: 720,
        category: "Puzzle",
      },
    ];

    return c.json({
      success: true,
      games: mockGames,
      distributor: validatedData.distributor,
      total: mockGames.length,
    });
  } catch (error) {
    console.error("Fetch games error:", error);
    if (error instanceof z.ZodError) {
      return c.json({ error: "Validation error", details: error.errors }, 400);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
}; 