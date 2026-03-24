import { Context } from 'hono';
import { db } from '../db/client';
import { likes } from '../db/schema';
import { and, eq, sql } from 'drizzle-orm';
import { UserContext } from '../middleware/authMiddleware';

export const toggleLike = async (c: Context<UserContext>) => {
  try {
    const articleId = c.req.param('id');
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (!articleId || !uuidRegex.test(articleId)) {
      return c.json({ error: 'Invalid Article ID format' }, 400);
    }
    const user = c.get('user');

    const existing = await db.select().from(likes)
      .where(and(eq(likes.userId, user.id), eq(likes.articleId, articleId)));

    let liked = false;
    if (existing.length > 0) {
      await db.delete(likes).where(eq(likes.id, existing[0].id));
      liked = false;
    } else {
      await db.insert(likes).values({ userId: user.id, articleId });
      liked = true;
    }

    const likeCountResult = await db.select({ 
      count: sql<number>`count(*)`.mapWith(Number) 
    }).from(likes).where(eq(likes.articleId, articleId));
    
    return c.json({ liked, likeCount: likeCountResult[0]?.count || 0 });
  } catch (err) {
    console.error("TOGGLE_LIKE_ERROR:", err);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
};

export const checkLikeStatus = async (c: Context<UserContext>) => {
  try {
    const articleId = c.req.param('id');
    if (!articleId) return c.json({ error: 'Bad Request' }, 400);
    const user = c.get('user');
    
    const existing = await db.select().from(likes)
      .where(and(eq(likes.userId, user.id), eq(likes.articleId, articleId)));
    
    return c.json({ liked: existing.length > 0 });
  } catch (err) {
    console.error("CHECK_LIKE_ERROR:", err);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
};
