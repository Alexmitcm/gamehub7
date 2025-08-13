import type { Context } from "hono";
import prisma from "../../prisma/client";

export const getManagedComments = async (c: Context) => {
  try {
    const limitParam = c.req.query("limit");
    const limit = limitParam ? Math.min(100, Math.max(1, Number.parseInt(limitParam, 10))) : 50;

    const comments = await prisma.comment.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        gameId: true,
        parentId: true,
        comment: true,
        senderId: true,
        senderUsername: true,
        createdAt: true,
        approved: true,
        game: { select: { id: true, title: true, slug: true } }
      }
    });

    return c.json({ comments });
  } catch (error) {
    return c.json({ error: "Failed to fetch comments" }, 500);
  }
};


