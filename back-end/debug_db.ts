import { db } from './src/db/client';
import { articles } from './src/db/schema';
import { desc } from 'drizzle-orm';

async function checkDB() {
  try {
    const list = await db.select().from(articles).orderBy(desc(articles.createdAt)).limit(5);
    console.log("LAST 5 ARTICLES:");
    list.forEach(art => {
      console.log(`ID: ${art.id}, Title: ${art.title}, HasImage: ${!!art.coverImage}, ImageLen: ${art.coverImage?.length || 0}`);
    });
    process.exit(0);
  } catch (err) {
    console.error("DEBUG ERROR:", err);
    process.exit(1);
  }
}
checkDB();
