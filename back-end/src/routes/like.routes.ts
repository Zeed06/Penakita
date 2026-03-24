import { Hono } from 'hono';
import { toggleLike, checkLikeStatus } from '../controllers/like.controller';
import { authMiddleware, UserContext } from '../middleware/authMiddleware';

const likeRoutes = new Hono<UserContext>();

likeRoutes.get('/status', authMiddleware, checkLikeStatus);
likeRoutes.post('/', authMiddleware, toggleLike);

export default likeRoutes;
