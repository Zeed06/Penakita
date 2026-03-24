import { Context } from 'hono';
import { db } from '../db/client';
import { follows } from '../db/schema';
import { and, eq } from 'drizzle-orm';
import { UserContext } from '../middleware/authMiddleware';

export const toggleFollow = async (c: Context<UserContext>) => {
  try {
    const followingId = c.req.param('id');
    if (!followingId) return c.json({ error: 'Bad Request' }, 400);
    const user = c.get('user');

    if (followingId === user.id) return c.json({ error: 'Cannot follow yourself' }, 400);

    const existing = await db.select().from(follows)
      .where(and(eq(follows.followerId, user.id), eq(follows.followingId, followingId)));

    if (existing.length > 0) {
      await db.delete(follows).where(eq(follows.id, existing[0].id));
      return c.json({ followed: false });
    } else {
      await db.insert(follows).values({ followerId: user.id, followingId });
      return c.json({ followed: true });
    }
  } catch (err) {
    return c.json({ error: 'Internal Server Error' }, 500);
  }
};
