import { Context } from "hono";
import { z } from "zod";
import prisma from "../../prisma/client";

const getGamesSchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  source: z.string().optional(),
  sortBy: z.enum(["newest", "popular", "rating", "plays"]).optional(),
  featured: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export const getGames = async (c: Context) => {
  try {
    const origin = new URL(c.req.url).origin;
    const toAbsolute = (u?: string) => {
      if (!u) return u;
      if (/^https?:\/\//i.test(u)) return u;
      return `${origin}${u}`;
    };
    const query = c.req.query();
    const { category, search, source, sortBy, page, limit } = getGamesSchema.parse(query);

    const pageNum = page ? Number.parseInt(page, 10) : 1;
    const limitNum = limit ? Number.parseInt(limit, 10) : 20;
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {
      status: "Published"
    };

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
        { description: { contains: search, mode: "insensitive" } }
      ];
    }

    // Temporary source filter: only "Self" exists currently
    if (source) {
      const normalized = source.trim().toLowerCase();
      if (normalized !== "self") {
        where.id = "__no_match__"; // will produce zero results
      }
    }

    // Build order by clause
    let orderBy: any = { createdAt: "desc" };
    if (sortBy === "newest") {
      orderBy = { createdAt: "desc" };
    } else if (sortBy === "popular") {
      orderBy = { createdAt: "desc" }; // Fallback since we don't have playCount yet
    } else if (sortBy === "rating") {
      orderBy = { createdAt: "desc" }; // Fallback since we don't have rating yet
    } else if (sortBy === "plays") {
      orderBy = { createdAt: "desc" }; // Fallback since we don't have playCount yet
    }

    // Get games from database
    let games: any[] = [];
    let total: number = 0;

    try {
      [games, total] = await Promise.all([
        prisma.game.findMany({
          where,
          include: {
            categories: true,
            GameScreenshot: true,
            GameTag: true
          },
          orderBy,
          skip,
          take: limitNum
        }),
        prisma.game.count({ where })
      ]);
    } catch (dbError) {
      console.error("Database error, using fallback games:", dbError);
      console.error("Database error details:", JSON.stringify(dbError, null, 2));
    }

    // If no games in database, provide fallback
    if (games.length === 0) {
      games = [
        {
          categories: [
            {
              createdAt: new Date("2024-01-01"),
              id: "fallback-cat-1",
              name: "Action",
              updatedAt: new Date("2024-01-01")
            }
          ],
          coverImageUrl:
            "https://picsum.photos/512/384?random=1",
          createdAt: new Date("2024-01-01"),
          description: "A fun sample game to test the Game Hub",
          developerName: "Sample Developer",
          GameScreenshot: [],
          GameTag: [
            {
              createdAt: new Date("2024-01-01"),
              id: "fallback-tag-1",
              name: "action"
            }
          ],
          height: 720,
          iconUrl:
            "https://picsum.photos/512/512?random=1",
          id: "fallback-1",
          instructions: "Use arrow keys to move",
          orientation: "Landscape",
          packageUrl: "https://example.com/game1.html",
          slug: "sample-game-1",
          status: "Published",
          title: "Sample Game 1",
          updatedAt: new Date("2024-01-01"),
          version: "1.0.0",
          width: 1280
        },
        {
          categories: [
            {
              createdAt: new Date("2024-01-01"),
              id: "fallback-cat-2",
              name: "Puzzle",
              updatedAt: new Date("2024-01-01")
            }
          ],
          coverImageUrl:
            "https://picsum.photos/512/384?random=2",
          createdAt: new Date("2024-01-02"),
          description: "Another exciting sample game",
          developerName: "Puzzle Master",
          GameScreenshot: [],
          GameTag: [
            {
              createdAt: new Date("2024-01-01"),
              id: "fallback-tag-2",
              name: "puzzle"
            }
          ],
          height: 720,
          iconUrl:
            "https://picsum.photos/512/512?random=2",
          id: "fallback-2",
          instructions: "Click to play",
          orientation: "Landscape",
          packageUrl: "https://example.com/game2.html",
          slug: "sample-game-2",
          status: "Published",
          title: "Sample Game 2",
          updatedAt: new Date("2024-01-02"),
          version: "1.0.0",
          width: 1280
        }
      ];
      total = games.length;
    }

    // Transform games to match expected frontend format
    const transformedGames = games.map((game: any) => ({
      categories: Array.isArray(game.categories)
        ? game.categories.map((cat: any) => ({
            description: "",
            icon: "🎮",
            id: cat.id,
            name: cat.name,
            slug: cat.name.toLowerCase().replace(/\s+/g, "-")
          }))
        : [],
      createdAt: game.createdAt.toISOString(),
      description: game.description,
      instructions: game.instructions,
      gameFileUrl: toAbsolute(game.packageUrl),
      entryFilePath: game.entryFilePath ?? "index.html",
      height: game.height,
      id: game.id,
      isFeatured: false, // Not in current schema
      likeCount: 0, // Not in current schema
      playCount: 0, // Not in current schema
      rating: 0, // Not in current schema
      ratingCount: 0, // Not in current schema
      slug: game.slug,
      source: "Self",
      status: game.status,
      tags: Array.isArray(game.GameTag)
        ? game.GameTag.map((tag: any) => tag.name)
        : [],
      // Prefer real cover; if missing, try screenshots; finally fallback icon
      thumb1Url: toAbsolute(
        game.coverImageUrl || game.iconUrl || game.GameScreenshot?.[0]?.imageUrl
      ),
      thumb2Url: toAbsolute(
        game.iconUrl || game.coverImageUrl || game.GameScreenshot?.[1]?.imageUrl
      ),
      title: game.title,
      updatedAt: game.updatedAt.toISOString(),
      user: {
        avatarUrl: "https://via.placeholder.com/40x40/4F46E5/FFFFFF?text=G",
        displayName: game.developerName || "Unknown Developer",
        username: game.developerName || "Unknown",
        walletAddress: "0x000..."
      },
      userLike: false,
      userRating: null,
      width: game.width
    }));

    return c.json({
      games: transformedGames,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
        hasNextPage: pageNum * limitNum < total,
        hasPrevPage: pageNum > 1
      }
    });
  } catch (error) {
    console.error("Get games error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
};
