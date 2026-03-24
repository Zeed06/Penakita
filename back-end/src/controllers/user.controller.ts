import { Context } from 'hono';
import { db } from '../db/client';
import { users, follows } from '../db/schema';
import { eq, or, ilike, and, sql } from 'drizzle-orm';
import { UserContext } from '../middleware/authMiddleware';
import { z } from 'zod';

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  bio: z.string().max(200).optional(),
  avatarUrl: z.string().optional(),
});

export const getUserById = async (c: Context) => {
  try {
    const id = c.req.param('id');
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (!id || !uuidRegex.test(id)) {
      return c.json({ error: 'Invalid User ID format' }, 400);
    }

    const result = await db.select({
      id: users.id,
      name: users.name,
      username: users.username,
      bio: users.bio,
      avatarUrl: users.avatarUrl,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, id));

    const u = result[0];
    if (!u) return c.json({ error: 'User not found' }, 404);

    return c.json({ user: u });
  } catch (err) {
    console.error("GET_USER_ERROR:", err);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
};

export const updateProfile = async (c: Context<UserContext>) => {
  try {
    const user = c.get('user');
    const body = await c.req.json();
    const result = updateProfileSchema.safeParse(body);
    
    if (!result.success) {
      return c.json({ error: result.error }, 400);
    }

    const updated = await db.update(users)
      .set({
        ...result.data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))
      .returning();

    const u = updated[0];
    if (!u) return c.json({ error: 'Failed to update profile' }, 500);

    return c.json({ 
      user: { 
        id: u.id, 
        name: u.name, 
        username: u.username, 
        email: u.email, 
        bio: u.bio, 
        avatarUrl: u.avatarUrl 
      } 
    });
  } catch (err) {
    return c.json({ error: 'Internal Server Error' }, 500);
  }
};
export const searchUsers = async (c: Context) => {
  console.log(`[DEBUG] searchUsers hit with q=${c.req.query('q')}`);
  try {
    const q = c.req.query('q') || '';
    const result = await db.select({
      id: users.id,
      name: users.name,
      username: users.username,
      avatarUrl: users.avatarUrl,
      bio: users.bio,
    })
    .from(users)
    .where(
      or(
        ilike(users.name, `%${q}%`),
        ilike(users.username, `%${q}%`)
      )
    )
    .limit(10);

    return c.json({ users: result });
  } catch (err) {
    console.error("SEARCH_USERS_ERROR:", err);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
};

export const getFollowStatus = async (c: Context<UserContext>) => {
  try {
    const userId = c.req.param('id');
    if (!userId) return c.json({ error: 'User ID is required' }, 400);
    const currentUser = c.get('user');
    
    const result = await db.select().from(follows)
      .where(and(eq(follows.followerId, currentUser.id), eq(follows.followingId, userId)));
    
    return c.json({ following: result.length > 0 });
  } catch (err) {
    return c.json({ error: 'Internal Server Error' }, 500);
  }
};

export const getFollowers = async (c: Context) => {
  try {
    const userId = c.req.param('id');
    if (!userId) return c.json({ error: 'User ID is required' }, 400);

    const result = await db.select({
      id: users.id,
      name: users.name,
      username: users.username,
      avatarUrl: users.avatarUrl,
      bio: users.bio,
    })
    .from(follows)
    .innerJoin(users, eq(follows.followerId, users.id))
    .where(eq(follows.followingId, userId));

    return c.json({ users: result });
  } catch (err) {
    return c.json({ error: 'Internal Server Error' }, 500);
  }
};

export const getFollowing = async (c: Context) => {
  try {
    const userId = c.req.param('id');
    if (!userId) return c.json({ error: 'User ID is required' }, 400);

    const result = await db.select({
      id: users.id,
      name: users.name,
      username: users.username,
      avatarUrl: users.avatarUrl,
      bio: users.bio,
    })
    .from(follows)
    .innerJoin(users, eq(follows.followingId, users.id))
    .where(eq(follows.followerId, userId));

    return c.json({ users: result });
  } catch (err) {
    return c.json({ error: 'Internal Server Error' }, 500);
  }
};
