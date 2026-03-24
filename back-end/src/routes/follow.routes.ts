import { Hono } from 'hono';
import { toggleFollow } from '../controllers/follow.controller';
import { authMiddleware, UserContext } from '../middleware/authMiddleware';

const followRoutes = new Hono<UserContext>();

followRoutes.post('/:id/follow', authMiddleware, toggleFollow);

export default followRoutes;
