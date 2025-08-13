import { Context } from "hono";
import { z } from "zod";
import prisma from "../../prisma/client";

const rateGameSchema = z.object({
  rating: z.number().min(1).max(5),
});

export const rateGame = async (c: Context) => {
  try {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const gameId = c.req.param("id");
    const body = await c.req.json();
    const validatedData = rateGameSchema.parse(body);

    // Check if game exists
    const game = await prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game || game.status !== "Active") {
      return c.json({ error: "Game not found or not available" }, 404);
    }

    // Check if user already rated the game
    const existingRating = await prisma.gameRating.findUnique({
      where: {
        gameId_userAddress: {
          gameId,
          userAddress: user.walletAddress,
        },
      },
    });

    if (existingRating) {
      // Update existing rating
      await prisma.gameRating.update({
        where: { id: existingRating.id },
        data: { rating: validatedData.rating },
      });
    } else {
      // Create new rating
      await prisma.gameRating.create({
        data: {
          gameId,
          userAddress: user.walletAddress,
          rating: validatedData.rating,
        },
      });
    }

    // Recalculate game average rating
    const ratings = await prisma.gameRating.findMany({
      where: { gameId },
      select: { rating: true },
    });

    const totalRating = ratings.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = ratings.length > 0 ? totalRating / ratings.length : 0;

    await prisma.game.update({
      where: { id: gameId },
      data: {
        rating: averageRating,
        ratingCount: ratings.length,
      },
    });

    return c.json({ success: true, rating: validatedData.rating });
  } catch (error) {
    console.error("Rate game error:", error);
    if (error instanceof z.ZodError) {
      return c.json({ error: "Validation error", details: error.errors }, 400);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
}; 