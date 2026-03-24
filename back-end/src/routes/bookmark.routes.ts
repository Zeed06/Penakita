import { Hono } from 'hono';
import { getBookmarks, toggleBookmark, checkBookmarkStatus } from '../controllers/bookmark.controller';
import { authMiddleware, UserContext } from '../middleware/authMiddleware';

const bookmarkRoutes = new Hono<UserContext>();

bookmarkRoutes.get('/', authMiddleware, getBookmarks);
bookmarkRoutes.get('/:id/status', authMiddleware, checkBookmarkStatus);
bookmarkRoutes.post('/:id', authMiddleware, toggleBookmark);

export default bookmarkRoutes;
