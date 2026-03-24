import { db } from './src/db/client';
import { articles, users } from './src/db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword } from './src/utils/hash';

async function test() {
  try {
    const dummyEmail = 'test@example.com';
    let existing = await db.select().from(users).where(eq(users.email, dummyEmail));
    
    if (existing.length === 0) {
      const hashed = await hashPassword('password');
      const newUser = await db.insert(users).values({
        name: 'Test Dummy User',
        username: 'testuser',
        email: dummyEmail,
        password: hashed,
        updatedAt: new Date(),
      }).returning();
      existing = newUser;
    }

    console.log("User:", existing[0]);

    const newArt = await db.insert(articles).values({
      title: "Test Title",
      content: "Content is > 10 chars",
      authorId: existing[0].id,
      updatedAt: new Date(),
    }).returning();

    console.log("Article:", newArt[0]);
    process.exit(0);
  } catch (err) {
    console.error("DB ERROR OCCURRED:", err);
    process.exit(1);
  }
}
test();
