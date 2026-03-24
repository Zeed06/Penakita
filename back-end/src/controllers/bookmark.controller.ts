import { Context } from 'hono';
import { db } from '../db/client';
import { bookmarks, articles, users } from '../db/schema';
import { and, eq } from 'drizzle-orm';
import { UserContext } from '../middleware/authMiddleware';

export const getBookmarks = async (c: Context<UserContext>) => {
  try {
    const user = c.get('user');
    const list = await db.select({
      id: articles.id,
      title: articles.title,
      content: articles.content,
      coverImage: articles.coverImage,
      createdAt: articles.createdAt,
      author: {
        id: users.id,
        name: users.name,
        username: users.username,
        avatarUrl: users.avatarUrl,
      }
    })
    .from(bookmarks)
    .innerJoin(articles, eq(bookmarks.articleId, articles.id))
    .innerJoin(users, eq(articles.authorId, users.id))
    .where(eq(bookmarks.userId, user.id));
    
    return c.json({ bookmarks: list });
  } catch (err) {
    console.error(err);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
};

export const toggleBookmark = async (c: Context<UserContext>) => {
  try {
    const articleId = c.req.param('id');
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (!articleId || !uuidRegex.test(articleId)) {
      return c.json({ error: 'Invalid Article ID format' }, 400);
    }

    const user = c.get('user');

    const existing = await db.select().from(bookmarks)
      .where(and(eq(bookmarks.userId, user.id), eq(bookmarks.articleId, articleId)));

    if (existing.length > 0) {
      await db.delete(bookmarks).where(eq(bookmarks.id, existing[0].id));
      return c.json({ bookmarked: false });
    } else {
      await db.insert(bookmarks).values({ userId: user.id, articleId });
      return c.json({ bookmarked: true });
    }
  } catch (err) {
    console.error("TOGGLE_BOOKMARK_ERROR:", err);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
};

export const checkBookmarkStatus = async (c: Context<UserContext>) => {
  try {
    const articleId = c.req.param('id');
    if (!articleId) return c.json({ error: 'Bad Request' }, 400);
    const user = c.get('user');
    
    const existing = await db.select().from(bookmarks)
      .where(and(eq(bookmarks.userId, user.id), eq(bookmarks.articleId, articleId)));
    
    return c.json({ bookmarked: existing.length > 0 });
  } catch (err) {
    console.error("CHECK_BOOKMARK_ERROR:", err);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
};
