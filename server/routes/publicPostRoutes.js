import { Router } from 'express';
import {
  getLatestPosts,
  getCategories,
  getPostBySlug,
  getPosts,
  getPublicStats,
  getSearchSuggestions,
  getTrendingPosts,
  likePost,
  reactToPost,
  sharePost,
  viewPost
} from '../controllers/publicPostController.js';
import { cachePublic } from '../middleware/cacheMiddleware.js';

const router = Router();

router.get('/', cachePublic(45), getPosts);
router.get('/home', cachePublic(90), getPublicStats);
router.get('/categories', cachePublic(90), getCategories);
router.get('/suggestions', cachePublic(30), getSearchSuggestions);
router.get('/trending', cachePublic(90), getTrendingPosts);
router.get('/latest', cachePublic(60), getLatestPosts);
router.get('/:slug', cachePublic(120), getPostBySlug);
router.post('/:id/like', likePost);
router.post('/:id/react', reactToPost);
router.post('/:id/view', viewPost);
router.post('/:id/share', sharePost);

export default router;
