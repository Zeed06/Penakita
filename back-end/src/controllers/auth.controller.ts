import { Context } from 'hono';
import { db } from '../db/client';
import { users } from '../db/schema';
import { eq, or } from 'drizzle-orm';
import { hashPassword, comparePassword } from '../utils/hash';
import { signToken } from '../utils/jwt';
import { z } from 'zod';
import { UserContext } from '../middleware/authMiddleware';

const registerSchema = z.object({
  name: z.string().min(2),
  username: z.string().min(3).regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const register = async (c: Context) => {
  try {
    const body = await c.req.json();
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      const issues = result.error.issues.map(i => i.message).join(', ');
      return c.json({ error: `Validation failed: ${issues}` }, 400);
    }

    const { name, username, email, password } = result.data;
    const lowerEmail = email.toLowerCase().trim();
    const cleanPassword = password.trim();

    // Check if user or username exists
    const existing = await db.select().from(users).where(
      or(
        eq(users.email, lowerEmail),
        eq(users.username, username.trim())
      )
    );
    
    if (existing.length > 0) {
      const isEmail = existing.some(u => u.email.toLowerCase() === lowerEmail);
      return c.json({ error: isEmail ? 'Email already exists' : 'Username already taken' }, 400);
    }

    const hashedPassword = await hashPassword(cleanPassword);
    const newUser = await db.insert(users).values({
      name,
      username: username.trim(),
      email: lowerEmail,
      password: hashedPassword,
      updatedAt: new Date(),
    }).returning();

    const u = newUser[0];
    if (!u) return c.json({ error: 'Failed to create user' }, 500);
    const token = signToken({ id: u.id, email: u.email });

    return c.json({ 
      user: { id: u.id, name: u.name, username: u.username, email: u.email }, 
      token 
    });
  } catch (err) {
    console.error(err);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
};

export const login = async (c: Context) => {
  try {
    const body = await c.req.json();
    console.log('[DEBUG] Login attempt:', { email: body.email });
    
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      console.log('[DEBUG] Login validation failed:', result.error.format());
      return c.json({ error: 'Validation failed: Please check your Email and Password.' }, 400);
    }

    const { email, password } = result.data;
    const lowerEmail = email.toLowerCase().trim();
    const cleanPassword = password.trim();

    const userRecord = await db.select().from(users).where(eq(users.email, lowerEmail));
    const u = userRecord[0];
    
    if (!u) {
      console.log('[DEBUG] Login failed: User not found for email:', email);
      return c.json({ error: 'Invalid credentials' }, 401);
    }
    
    const valid = await comparePassword(cleanPassword, u.password);
    if (!valid) {
      console.log('[DEBUG] Login failed: Invalid password for user:', lowerEmail);
      console.log('[DEBUG] Provided password length:', cleanPassword.length);
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    console.log('[DEBUG] Login successful for user:', email);
    const token = signToken({ id: u.id, email: u.email });

    return c.json({ 
      user: { id: u.id, name: u.name, username: u.username, email: u.email, avatarUrl: u.avatarUrl }, 
      token 
    });
  } catch (err) {
    console.error(err);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
};

export const getMe = async (c: Context<UserContext>) => {
  try {
    const userPayload = c.get('user');
    const userRecord = await db.select().from(users).where(eq(users.id, userPayload.id));
    
    const u = userRecord[0];
    if (!u) return c.json({ error: 'User not found' }, 404);
    
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
    console.error(err);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
};
