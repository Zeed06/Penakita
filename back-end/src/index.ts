import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { bodyLimit } from 'hono/body-limit';
import * as dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import articleRoutes from './routes/article.routes';
import bookmarkRoutes from './routes/bookmark.routes';
import userRoutes from './routes/user.routes';
import commentRoutes from './routes/comment.routes';
import followRoutes from './routes/follow.routes';

dotenv.config();

const app = new Hono();

app.use('*', cors());
app.use(
  '*',
  bodyLimit({
    maxSize: 10 * 1024 * 1024, // 10MB
    onError: (c) => {
      return c.text('Payload Too Large', 413);
    },
  })
);

app.get('/', (c) => {
  return c.text('Medium Clone API is running!');
});

app.route('/auth', authRoutes);
app.route('/articles', articleRoutes);
app.route('/comments', commentRoutes);
app.route('/bookmarks', bookmarkRoutes);

// Users and Related (Follow)
app.route('/users', userRoutes);

app.onError((err, c) => {
  console.error('SERVER_ERROR:', err);
  return c.json({ error: 'Internal Server Error', message: err.message }, 500);
});



const portEnv = process.env.PORT;
const port = portEnv ? parseInt(portEnv) : 3000;
console.log(`[DEBUG] process.env.PORT: ${portEnv}`);
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
  hostname: '0.0.0.0'
});
