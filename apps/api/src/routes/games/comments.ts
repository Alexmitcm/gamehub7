import { Hono } from "hono";
import prisma from "../../prisma/client";
import { z } from "zod";

const comments = new Hono();

const UpdateSchema = z.object({ approved: z.boolean() });

comments.put("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const parsed = UpdateSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: "Invalid body" }, 400);

    const updated = await (prisma as any).comment.update({
      where: { id },
      data: { approved: parsed.data.approved }
    } as any);

    return c.json({ comment: updated });
  } catch (e) {
    return c.json({ error: "Failed to update comment" }, 500);
  }
});

comments.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await (prisma as any).comment.delete({ where: { id } } as any);
    return c.json({ ok: true });
  } catch (e) {
    return c.json({ error: "Failed to delete comment" }, 500);
  }
});

export default comments;

