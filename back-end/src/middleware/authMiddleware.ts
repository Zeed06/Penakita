import { Context, Next } from 'hono';
import { verifyToken } from '../utils/jwt';
import { db } from '../db/client';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

export type UserContext = {
  Variables: {
    user: {
      id: string;
      email: string;
      name: string;
      username: string;
    };
  };
};

export const authMiddleware = async (c: Context<UserContext>, next: Next) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Unauthorized: Missing or invalid token' }, 401);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return c.json({ error: 'Unauthorized: Token is missing' }, 401);
    }

    const payload = verifyToken(token);
    if (!payload || !payload.id) {
      return c.json({ error: 'Unauthorized: Invalid token' }, 401);
    }

    const userRecord = await db.select().from(users).where(eq(users.id, payload.id));
    const u = userRecord[0];
    
    if (!u) {
      return c.json({ error: 'Unauthorized: User not found' }, 401);
    }

    c.set('user', {
      id: u.id,
      email: u.email,
      name: u.name,
      username: u.username,
    });

    await next();
  } catch (err) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
};
