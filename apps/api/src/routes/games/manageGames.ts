import { Context } from "hono";
import { z } from "zod";
import prisma from "../../prisma/client";
import logger from "@hey/helpers/logger";

// Validation schemas
const createGameSchema = z.object({
  title: z.string().min(1).max(100),
  slug: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/),
  description: z.string().min(10).max(1000),
  instructions: z.string().optional(),
  packageUrl: z.string().url(),
  entryFilePath: z.string().default("index.html"),
  iconUrl: z.string().url(),
  coverImageUrl: z.string().url(),
  width: z.number().min(320).max(1920).default(1280),
  height: z.number().min(240).max(1080).default(720),
  orientation: z.enum(["Landscape", "Portrait", "Both"]).default("Landscape"),
  developerName: z.string().optional(),
  version: z.string().optional(),
  status: z.enum(["Draft", "Published"]).default("Draft"),
  categoryIds: z.array(z.string()).optional(),
  tagNames: z.array(z.string()).optional(),
  screenshotUrls: z.array(z.string().url()).optional()
});

const updateGameSchema = createGameSchema.partial().extend({
  id: z.string()
});

const gameListSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.enum(["Draft", "Published", "All"]).optional(),
  category: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(["createdAt", "title", "status"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional()
});

// Get all games with filtering and pagination
export const getManagedGames = async (c: Context) => {
  try {
    const query = c.req.query();
    const { page, limit, status, category, search, sortBy, sortOrder } = gameListSchema.parse(query);

    const pageNum = page ? Number.parseInt(page, 10) : 1;
    const limitNum = limit ? Number.parseInt(limit, 10) : 20;
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};
    
    if (status && status !== "All") {
      where.status = status;
    }

    if (category) {
      where.categories = {
        some: {
          name: category
        }
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { developerName: { contains: search, mode: "insensitive" } }
      ];
    }

    // Build order by clause
    const orderBy: any = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder || "desc";
    } else {
      orderBy.createdAt = "desc";
    }

    // Get games with related data
    const [games, total] = await Promise.all([
      prisma.game.findMany({
        where,
        include: {
          categories: true,
          GameScreenshot: {
            orderBy: { order: "asc" }
          },
          GameTag: true
        },
        orderBy,
        skip,
        take: limitNum
      }),
      prisma.game.count({ where })
    ]);

    return c.json({
      games,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    logger.error("Error fetching managed games:", error);
    return c.json({ 
      error: "Failed to fetch games", 
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    }, 500);
  }
};

// Create a new game
export const createGame = async (c: Context) => {
  try {
    const body = await c.req.json();
    const validatedData = createGameSchema.parse(body);

    // Check if game with slug already exists
    const existingGame = await prisma.game.findUnique({
      where: { slug: validatedData.slug }
    });

    if (existingGame) {
      return c.json({ error: "Game with this slug already exists" }, 400);
    }

    // Create game with categories and tags
    const game = await prisma.game.create({
      data: {
        title: validatedData.title,
        slug: validatedData.slug,
        description: validatedData.description,
        instructions: validatedData.instructions,
        packageUrl: validatedData.packageUrl,
        entryFilePath: validatedData.entryFilePath,
        iconUrl: validatedData.iconUrl,
        coverImageUrl: validatedData.coverImageUrl,
        width: validatedData.width,
        height: validatedData.height,
        orientation: validatedData.orientation,
        developerName: validatedData.developerName,
        version: validatedData.version,
        status: validatedData.status,
        categories: validatedData.categoryIds ? {
          connect: validatedData.categoryIds.map(id => ({ id }))
        } : undefined,
        GameTag: validatedData.tagNames ? {
          connectOrCreate: validatedData.tagNames.map(name => ({
            where: { name },
            create: { name }
          }))
        } : undefined,
        GameScreenshot: validatedData.screenshotUrls ? {
          create: validatedData.screenshotUrls.map((url, index) => ({
            imageUrl: url,
            order: index
          }))
        } : undefined
      },
      include: {
        categories: true,
        GameScreenshot: true,
        GameTag: true
      }
    });

    logger.info(`Game created: ${game.id} - ${game.title}`);
    return c.json({ game, message: "Game created successfully" }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: "Validation error", details: error.errors }, 400);
    }
    logger.error("Error creating game:", error);
    return c.json({ error: "Failed to create game" }, 500);
  }
};

// Update an existing game
export const updateGame = async (c: Context) => {
  try {
    const gameId = c.req.param("id");
    const body = await c.req.json();
    const validatedData = updateGameSchema.parse({ ...body, id: gameId });

    // Check if game exists
    const existingGame = await prisma.game.findUnique({
      where: { id: gameId }
    });

    if (!existingGame) {
      return c.json({ error: "Game not found" }, 404);
    }

    // Check if slug is being changed and if it conflicts
    if (validatedData.slug && validatedData.slug !== existingGame.slug) {
      const slugConflict = await prisma.game.findUnique({
        where: { slug: validatedData.slug }
      });

      if (slugConflict) {
        return c.json({ error: "Game with this slug already exists" }, 400);
      }
    }

    // Update game
    const updatedGame = await prisma.game.update({
      where: { id: gameId },
      data: {
        title: validatedData.title,
        slug: validatedData.slug,
        description: validatedData.description,
        instructions: validatedData.instructions,
        packageUrl: validatedData.packageUrl,
        entryFilePath: validatedData.entryFilePath,
        iconUrl: validatedData.iconUrl,
        coverImageUrl: validatedData.coverImageUrl,
        width: validatedData.width,
        height: validatedData.height,
        orientation: validatedData.orientation,
        developerName: validatedData.developerName,
        version: validatedData.version,
        status: validatedData.status,
        categories: validatedData.categoryIds
          ? {
              set: validatedData.categoryIds.map((id) => ({ id }))
            }
          : undefined,
        GameTag: validatedData.tagNames ? {
          set: validatedData.tagNames.map(name => ({ name }))
        } : undefined
      },
      include: {
        categories: true,
        GameScreenshot: true,
        GameTag: true
      }
    });

    logger.info(`Game updated: ${updatedGame.id} - ${updatedGame.title}`);
    return c.json({ game: updatedGame, message: "Game updated successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: "Validation error", details: error.errors }, 400);
    }
    logger.error("Error updating game:", error);
    return c.json({ error: "Failed to update game" }, 500);
  }
};

// Delete a game
export const deleteGame = async (c: Context) => {
  try {
    const gameId = c.req.param("id");

    // Check if game exists
    const existingGame = await prisma.game.findUnique({
      where: { id: gameId }
    });

    if (!existingGame) {
      return c.json({ error: "Game not found" }, 404);
    }

    // Delete game (cascade will handle related records)
    await prisma.game.delete({
      where: { id: gameId }
    });

    logger.info(`Game deleted: ${gameId} - ${existingGame.title}`);
    return c.json({ message: "Game deleted successfully" });
  } catch (error) {
    logger.error("Error deleting game:", error);
    return c.json({ error: "Failed to delete game" }, 500);
  }
};

// Get game statistics
export const getGameStats = async (c: Context) => {
  try {
    const [totalGames, publishedGames, draftGames, totalCategories, totalTags] = await Promise.all([
      prisma.game.count(),
      prisma.game.count({ where: { status: "Published" } }),
      prisma.game.count({ where: { status: "Draft" } }),
      prisma.gameCategory.count(),
      prisma.gameTag.count()
    ]);

    return c.json({
      stats: {
        totalGames,
        publishedGames,
        draftGames,
        totalCategories,
        totalTags
      }
    });
  } catch (error) {
    logger.error("Error fetching game stats:", error);
    return c.json({ error: "Failed to fetch game statistics" }, 500);
  }
}; 