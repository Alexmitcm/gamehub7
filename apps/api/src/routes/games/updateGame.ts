import { Context } from "hono";
import { z } from "zod";
import prisma from "../../prisma/client";

const updateGameSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  instructions: z.string().optional(),
  width: z.number().min(320).max(1920).optional(),
  height: z.number().min(240).max(1080).optional(),
  categories: z.array(z.string()).optional(),
  status: z.enum(["Active", "Inactive", "Pending", "Rejected"]).optional(),
  isFeatured: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
});

export const updateGame = async (c: Context) => {
  try {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const gameId = c.req.param("id");
    const body = await c.req.json();
    const validatedData = updateGameSchema.parse(body);

    // Check if game exists
    const game = await prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      return c.json({ error: "Game not found" }, 404);
    }

    // Check if user is the uploader or admin
    if (game.uploadedBy !== user.walletAddress) {
      return c.json({ error: "Unauthorized to update this game" }, 403);
    }

    // Prepare update data
    const updateData: any = { ...validatedData };
    delete updateData.categories;

    // Handle categories if provided
    if (validatedData.categories) {
      const categoryIds = await Promise.all(
        validatedData.categories.map(async (categoryName) => {
          let category = await prisma.gameCategory.findUnique({
            where: { name: categoryName },
          });

          if (!category) {
            category = await prisma.gameCategory.create({
              data: {
                name: categoryName,
                slug: categoryName.toLowerCase().replace(/\s+/g, "-"),
              },
            });
          }

          return category.id;
        })
      );

      updateData.categories = {
        set: categoryIds.map((id) => ({ id })),
      };
    }

    // Update the game
    const updatedGame = await prisma.game.update({
      where: { id: gameId },
      data: updateData,
      include: {
        categories: true,
        user: {
          select: {
            walletAddress: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    return c.json({ success: true, game: updatedGame });
  } catch (error) {
    console.error("Update game error:", error);
    if (error instanceof z.ZodError) {
      return c.json({ error: "Validation error", details: error.errors }, 400);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
}; 