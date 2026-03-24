import { Context } from 'hono';
import { db } from '../db/client';
import { eq, desc, ilike, or, sql, count } from 'drizzle-orm';
import { articles, users, likes, follows } from '../db/schema';
import { UserContext } from '../middleware/authMiddleware';
import { z } from 'zod';

const articleSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(10),
  coverImage: z.string().optional(),
});

export const getArticles = async (c: Context) => {
  try {
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
      },
      likeCount: sql<number>`(SELECT cast(count(*) as int) FROM ${likes} WHERE ${likes.articleId} = ${articles.id})`,
    })
    .from(articles)
    .innerJoin(users, eq(articles.authorId, users.id))
    .orderBy(desc(articles.createdAt));

    return c.json({ articles: list });
  } catch (err) {
    return c.json({ error: 'Internal Server Error' }, 500);
  }
};

export const getArticleById = async (c: Context) => {
  try {
    const id = c.req.param('id');
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (!id || !uuidRegex.test(id)) {
      return c.json({ error: 'Invalid Article ID format' }, 400);
    }
    
    const result = await db.select({
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
      },
      likeCount: sql<number>`(SELECT cast(count(*) as int) FROM ${likes} WHERE ${likes.articleId} = ${articles.id})`,
    })
    .from(articles)
    .innerJoin(users, eq(articles.authorId, users.id))
    .where(eq(articles.id, id));

    if (result.length === 0 || !result[0]) return c.json({ error: 'Article not found' }, 404);
    
    return c.json({ article: result[0] });
  } catch (err) {
    console.error("GET_ARTICLE_ERROR:", err);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
};

export const createArticle = async (c: Context<UserContext>) => {
  try {
    const user = c.get('user');
    const body = await c.req.json();
    const result = articleSchema.safeParse(body);
    if (!result.success) return c.json({ error: 'Validation failed: Title and Content are too short.' }, 400);

    const newUserArticle = await db.insert(articles).values({
      title: result.data.title,
      content: result.data.content,
      coverImage: result.data.coverImage,
      authorId: user.id,
    }).returning();

    if (!newUserArticle[0]) return c.json({ error: 'Failed' }, 500);
    return c.json({ article: newUserArticle[0] }, 201);
  } catch (err) {
    console.error(err);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
};

export const updateArticle = async (c: Context<UserContext>) => {
  try {
    const id = c.req.param('id');
    if (!id) return c.json({ error: 'Bad Request' }, 400);
    const user = c.get('user');
    const body = await c.req.json();
    
    const result = articleSchema.safeParse(body);
    if (!result.success) return c.json({ error: result.error }, 400);

    const existing = await db.select().from(articles).where(eq(articles.id, id));
    if (existing.length === 0) return c.json({ error: 'Not found' }, 404);
    if (existing[0].authorId !== user.id) return c.json({ error: 'Forbidden' }, 403);

    const updated = await db.update(articles)
      .set({
        title: result.data.title,
        content: result.data.content,
        coverImage: result.data.coverImage,
        updatedAt: new Date(),
      })
      .where(eq(articles.id, id))
      .returning();

    if (!updated[0]) return c.json({ error: 'Failed' }, 500);
    return c.json({ article: updated[0] });
  } catch (err) {
    return c.json({ error: 'Internal Server Error' }, 500);
  }
};

export const deleteArticle = async (c: Context<UserContext>) => {
  try {
    const id = c.req.param('id');
    if (!id) return c.json({ error: 'Bad Request' }, 400);
    const user = c.get('user');

    const existing = await db.select().from(articles).where(eq(articles.id, id));
    if (existing.length === 0) return c.json({ error: 'Not found' }, 404);
    if (existing[0].authorId !== user.id) return c.json({ error: 'Forbidden' }, 403);

    await db.delete(articles).where(eq(articles.id, id));
    return c.json({ message: 'Deleted' });
  } catch (err) {
    return c.json({ error: 'Internal Server Error' }, 500);
  }
};

export const getRandomArticles = async (c: Context) => {
  try {
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
      },
      likeCount: sql<number>`(SELECT cast(count(*) as int) FROM ${likes} WHERE ${likes.articleId} = ${articles.id})`,
    })
    .from(articles)
    .innerJoin(users, eq(articles.authorId, users.id))
    .orderBy(sql`RANDOM()`)
    .limit(10);

    return c.json({ articles: list });
  } catch (err) {
    console.error(err);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
};

export const searchArticles = async (c: Context) => {
  try {
    const q = c.req.query('q') || '';
    const result = await db.select({
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
      },
      likeCount: sql<number>`(SELECT cast(count(*) as int) FROM ${likes} WHERE ${likes.articleId} = ${articles.id})`,
    })
    .from(articles)
    .innerJoin(users, eq(articles.authorId, users.id))
    .where(
      or(
        ilike(articles.title, `%${q}%`),
        ilike(articles.content, `%${q}%`)
      )
    )
    .orderBy(desc(articles.createdAt));

    return c.json({ articles: result });
  } catch (err) {
    return c.json({ error: 'Internal Server Error' }, 500);
  }
};

export const getFollowingFeed = async (c: Context<UserContext>) => {
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
      },
      likeCount: sql<number>`(SELECT cast(count(*) as int) FROM ${likes} WHERE ${likes.articleId} = ${articles.id})`,
    })
    .from(articles)
    .innerJoin(users, eq(articles.authorId, users.id))
    .innerJoin(follows, eq(follows.followingId, articles.authorId))
    .where(eq(follows.followerId, user.id))
    .orderBy(desc(articles.createdAt));

    return c.json({ articles: list });
  } catch (err) {
    console.error("GET_FOLLOWING_FEED_ERROR:", err);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
};
