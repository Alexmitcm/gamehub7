import prisma from "../../prisma/client";
import { Context } from "hono";

export const getCategories = async (c: Context) => {
  try {
    const categories = await prisma.gameCategory.findMany({
      include: {
        _count: {
          select: {
            games: true
          }
        }
      }
    });

    const transformedCategories = categories.map((category) => ({
      _count: {
        games: typeof category._count?.games === "number" ? category._count.games : 0
      },
      description: category.description || `${category.name} games`,
      icon: category.icon || "🎮",
      id: category.id,
      name: category.name,
      slug: category.slug || category.name.toLowerCase().replace(/\s+/g, "-")
    }));

    return c.json({ categories: transformedCategories });
  } catch (error) {
    console.log("Database error, using fallback categories:", error);
    
    // Fallback categories
    const fallbackCategories = [
      {
        _count: { games: 0 },
        description: "Action games",
        icon: "⚡",
        id: "fallback-1",
        name: "Action",
        slug: "action"
      },
      {
        _count: { games: 0 },
        description: "Puzzle games",
        icon: "🧩",
        id: "fallback-2",
        name: "Puzzle",
        slug: "puzzle"
      },
      {
        _count: { games: 0 },
        description: "Racing games",
        icon: "🏎️",
        id: "fallback-3",
        name: "Racing",
        slug: "racing"
      },
      {
        _count: { games: 0 },
        description: "Strategy games",
        icon: "🎯",
        id: "fallback-4",
        name: "Strategy",
        slug: "strategy"
      },
      {
        _count: { games: 0 },
        description: "Arcade games",
        icon: "🎮",
        id: "fallback-5",
        name: "Arcade",
        slug: "arcade"
      }
    ];

    return c.json({ categories: fallbackCategories });
  }
};
