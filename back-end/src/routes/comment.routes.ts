import { Hono } from 'hono';
import { getComments, createComment } from '../controllers/comment.controller';
import { authMiddleware, UserContext } from '../middleware/authMiddleware';

const commentRoutes = new Hono<UserContext>();

commentRoutes.get('/', getComments);
commentRoutes.post('/', authMiddleware, createComment);

export default commentRoutes;
