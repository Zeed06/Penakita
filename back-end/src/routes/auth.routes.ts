import { Hono } from 'hono';
import { register, login, getMe } from '../controllers/auth.controller';
import { authMiddleware, UserContext } from '../middleware/authMiddleware';

const authRoutes = new Hono<UserContext>();

authRoutes.post('/register', register);
authRoutes.post('/login', login);
authRoutes.get('/me', authMiddleware, getMe);

export default authRoutes;
