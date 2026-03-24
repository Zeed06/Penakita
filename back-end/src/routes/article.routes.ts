import { Hono } from 'hono';
import { 
  getArticles, 
  getArticleById, 
  createArticle, 
  updateArticle, 
  deleteArticle,
  searchArticles,
  getRandomArticles,
  getFollowingFeed
} from '../controllers/article.controller';
import { authMiddleware, UserContext } from '../middleware/authMiddleware';
import commentRoutes from './comment.routes';
import likeRoutes from './like.routes';

const articleRoutes = new Hono<UserContext>();

articleRoutes.route('/:id/comments', commentRoutes);
articleRoutes.route('/:id/like', likeRoutes);

articleRoutes.get('/', getArticles);
articleRoutes.get('/search', searchArticles);
articleRoutes.get('/feed/home', getRandomArticles);
articleRoutes.get('/feed/following', authMiddleware, getFollowingFeed);
articleRoutes.get('/:id', getArticleById);
articleRoutes.post('/', authMiddleware, createArticle);
articleRoutes.put('/:id', authMiddleware, updateArticle);
articleRoutes.delete('/:id', authMiddleware, deleteArticle);

export default articleRoutes;
