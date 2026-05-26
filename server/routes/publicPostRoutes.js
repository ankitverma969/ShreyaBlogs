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

const router = Router();

router.get('/', getPosts);
router.get('/home', getPublicStats);
router.get('/categories', getCategories);
router.get('/suggestions', getSearchSuggestions);
router.get('/trending', getTrendingPosts);
router.get('/latest', getLatestPosts);
router.get('/:slug', getPostBySlug);
router.post('/:id/like', likePost);
router.post('/:id/react', reactToPost);
router.post('/:id/view', viewPost);
router.post('/:id/share', sharePost);

export default router;
