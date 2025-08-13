import type { Context } from "hono";
import prisma from "../../prisma/client";

export const getGame = async (c: Context) => {
  try {
    const slug = c.req.param("slug");

    const game = await prisma.game.findUnique({
      include: {
        categories: true,
        GameScreenshot: true,
        GameTag: true
      },
      where: { slug }
    });

    if (!game) {
      // Fallback: return a placeholder game for sample slugs so UI links don't 404
      if (slug.startsWith("sample-game-")) {
        const now = new Date();
        return c.json({
          game: {
            id: `fallback-${slug}`,
            title: slug.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase()),
            slug,
            description: "Sample game placeholder",
            instructions: "Use arrow keys to move",
            gameFileUrl: "",
            thumb1Url: "https://picsum.photos/512/384?random=10",
            thumb2Url: "https://picsum.photos/512/512?random=10",
            width: 1280,
            height: 720,
            source: "Self",
            status: "Published",
            isFeatured: false,
            playCount: 0,
            likeCount: 0,
            rating: 0,
            ratingCount: 0,
            categories: [],
            tags: [],
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
            user: {
              walletAddress: "0x000...",
              username: "Unknown",
              displayName: "Unknown Developer",
              avatarUrl: "https://via.placeholder.com/40x40/4F46E5/FFFFFF?text=G"
            },
            userLike: false,
            userRating: null
          }
        });
      }

      return c.json({ error: "Game not found" }, 404);
    }

    if (game.status !== "Published") {
      return c.json({ error: "Game is not available" }, 404);
    }

    // Transform game to match expected frontend format
    const transformedGame = {
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
      gameFileUrl: game.packageUrl,
      entryFilePath: (game as any).entryFilePath ?? "index.html",
      height: game.height,
      id: game.id,
      instructions: game.instructions,
      isFeatured: false,
      likeCount: 0,
      playCount: 0,
      rating: 0,
      ratingCount: 0,
      slug: game.slug,
      source: "Self",
      status: game.status,
      tags: Array.isArray(game.GameTag)
        ? game.GameTag.map((tag: any) => tag.name)
        : [],
      thumb1Url: game.coverImageUrl,
      thumb2Url: game.iconUrl,
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
    };

    return c.json({ game: transformedGame });
  } catch (error) {
    console.error("Get game error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
};
