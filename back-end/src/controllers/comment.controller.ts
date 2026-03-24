import { Context } from 'hono';
import { db } from '../db/client';
import { comments } from '../db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { UserContext } from '../middleware/authMiddleware';

const commentSchema = z.object({
  content: z.string().min(1),
});

export const getComments = async (c: Context) => {
  try {
    const articleId = c.req.param('id');
    if (!articleId) return c.json({ error: 'Bad Request' }, 400);
    const list = await db.select().from(comments).where(eq(comments.articleId, articleId));
    return c.json({ comments: list });
  } catch (err) {
    return c.json({ error: 'Internal Server Error' }, 500);
  }
};

export const createComment = async (c: Context<UserContext>) => {
  try {
    const articleId = c.req.param('id');
    if (!articleId) return c.json({ error: 'Bad Request' }, 400);
    const user = c.get('user');
    const body = await c.req.json();
    const result = commentSchema.safeParse(body);
    if (!result.success) return c.json({ error: result.error }, 400);

    const { content } = result.data;
    const newComment = await db.insert(comments).values({
      content,
      authorId: user.id,
      articleId
    }).returning();

    if (!newComment[0]) return c.json({ error: 'Failed' }, 500);
    return c.json({ comment: newComment[0] }, 201);
  } catch (err) {
    return c.json({ error: 'Internal Server Error' }, 500);
  }
};
