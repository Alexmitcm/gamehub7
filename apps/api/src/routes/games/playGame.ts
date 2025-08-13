import { Context } from "hono";
import { z } from "zod";
import prisma from "../../prisma/client";

const playGameSchema = z.object({
  playDuration: z.number().optional(),
  score: z.number().optional(),
  completed: z.boolean().default(false),
});

export const playGame = async (c: Context) => {
  try {
    const slug = c.req.param("slug");
    const body = await c.req.json();
    const validatedData = playGameSchema.parse(body);

    // Get the game
    const game = await prisma.game.findUnique({
      where: { slug },
    });

    if (!game || game.status !== "Active") {
      return c.json({ error: "Game not found or not available" }, 404);
    }

    // Get user (optional - anonymous plays are allowed)
    const user = c.get("user");
    const playerAddress = user?.walletAddress || "anonymous";

    // Record the play
    const gamePlay = await prisma.gamePlay.create({
      data: {
        gameId: game.id,
        playerAddress,
        playDuration: validatedData.playDuration,
        score: validatedData.score,
        completed: validatedData.completed,
      },
    });

    // Update game play count
    await prisma.game.update({
      where: { id: game.id },
      data: {
        playCount: {
          increment: 1,
        },
      },
    });

    return c.json({ success: true, gamePlay });
  } catch (error) {
    console.error("Play game error:", error);
    if (error instanceof z.ZodError) {
      return c.json({ error: "Validation error", details: error.errors }, 400);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
}; 