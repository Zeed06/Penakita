import { Hono } from 'hono';
import { getUserById, updateProfile, searchUsers, getFollowers, getFollowing, getFollowStatus } from '../controllers/user.controller';
import { toggleFollow } from '../controllers/follow.controller';
import { authMiddleware, UserContext } from '../middleware/authMiddleware';

const userRoutes = new Hono<UserContext>();

// Profile
userRoutes.get('/all/search', searchUsers);
userRoutes.get('/:id', getUserById);
userRoutes.put('/me', authMiddleware, updateProfile);

// Relationships (Follow)
userRoutes.get('/:id/followers', getFollowers);
userRoutes.get('/:id/following', getFollowing);
userRoutes.get('/:id/follow-status', authMiddleware, getFollowStatus);
userRoutes.post('/:id/follow', authMiddleware, toggleFollow);

export default userRoutes;
