import { Context } from "hono";
import { z } from "zod";
import { prisma } from "../../prisma/client";

const gameImportSchema = z.object({
  title: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  instructions: z.string().optional(),
  gameUrl: z.string().url(),
  thumb1Url: z.string().url(),
  thumb2Url: z.string().url(),
  width: z.number().default(1280),
  height: z.number().default(720),
  category: z.string(),
  source: z.string().default("JSON"),
});

const importGamesSchema = z.object({
  games: z.array(gameImportSchema),
});

export const importGames = async (c: Context) => {
  try {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const validatedData = importGamesSchema.parse(body);

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (const gameData of validatedData.games) {
      try {
        // Check if game with slug already exists
        const existingGame = await prisma.game.findUnique({
          where: { slug: gameData.slug },
        });

        if (existingGame) {
          results.push({
            title: gameData.title,
            slug: gameData.slug,
            status: "exists",
            error: "Game with this slug already exists",
          });
          errorCount++;
          continue;
        }

        // Get or create category
        let category = await prisma.gameCategory.findUnique({
          where: { name: gameData.category },
        });

        if (!category) {
          category = await prisma.gameCategory.create({
            data: {
              name: gameData.category,
              slug: gameData.category.toLowerCase().replace(/\s+/g, "-"),
            },
          });
        }

        // Create the game
        const game = await prisma.game.create({
          data: {
            title: gameData.title,
            slug: gameData.slug,
            description: gameData.description,
            instructions: gameData.instructions,
            gameFileUrl: gameData.gameUrl,
            thumb1Url: gameData.thumb1Url,
            thumb2Url: gameData.thumb2Url,
            width: gameData.width,
            height: gameData.height,
            source: "JSON",
            externalUrl: gameData.gameUrl,
            uploadedBy: user.walletAddress,
            categories: {
              connect: [{ id: category.id }],
            },
          },
        });

        results.push({
          title: gameData.title,
          slug: gameData.slug,
          status: "success",
          gameId: game.id,
        });
        successCount++;
      } catch (error) {
        results.push({
          title: gameData.title,
          slug: gameData.slug,
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        });
        errorCount++;
      }
    }

    return c.json({
      success: true,
      results,
      summary: {
        total: validatedData.games.length,
        success: successCount,
        errors: errorCount,
      },
    });
  } catch (error) {
    console.error("Import games error:", error);
    if (error instanceof z.ZodError) {
      return c.json({ error: "Validation error", details: error.errors }, 400);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
}; 