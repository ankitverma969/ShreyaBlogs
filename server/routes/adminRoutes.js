import { Router } from 'express';
import { getDashboardAnalytics } from '../controllers/adminAnalyticsController.js';
import { getAdminMe, loginAdmin, logoutAdmin } from '../controllers/adminAuthController.js';
import { listComments, moderateComment } from '../controllers/adminCommentController.js';
import {
  approveComment,
  createIdentityAction,
  getModerationOverview,
  removeIdentityAction
} from '../controllers/adminModerationController.js';
import {
  deleteMessage,
  getMessages,
  markMessageRead
} from '../controllers/adminMessageController.js';
import {
  createPost,
  deletePost,
  listPosts,
  updatePost,
  uploadMedia
} from '../controllers/adminPostController.js';
import { optionalAdmin, protectAdmin } from '../middleware/authMiddleware.js';
import { loginLimiter } from '../middleware/rateLimiter.js';
import { upload } from '../middleware/uploadMiddleware.js';
import { optimizeUploadedImages } from '../middleware/uploadMiddleware.js';

const router = Router();

router.post('/login', loginLimiter, loginAdmin);
router.post('/logout', protectAdmin, logoutAdmin);
router.get('/me', optionalAdmin, getAdminMe);

router.get('/analytics', protectAdmin, getDashboardAnalytics);

router.route('/posts').get(protectAdmin, listPosts).post(protectAdmin, createPost);
router.route('/posts/:id').patch(protectAdmin, updatePost).delete(protectAdmin, deletePost);

router.post(
  '/uploads',
  protectAdmin,
  upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'images', maxCount: 8 },
    { name: 'video', maxCount: 1 }
  ]),
  optimizeUploadedImages,
  uploadMedia
);

router.get('/comments', protectAdmin, listComments);
router.patch('/comments/:id', protectAdmin, moderateComment);
router.patch('/comments/:id/approve', protectAdmin, approveComment);
router.get('/moderation', protectAdmin, getModerationOverview);
router.post('/moderation/identities', protectAdmin, createIdentityAction);
router.delete('/moderation/identities/:id', protectAdmin, removeIdentityAction);

router.get('/messages', protectAdmin, getMessages);
router.patch('/messages/:id/read', protectAdmin, markMessageRead);
router.delete('/messages/:id', protectAdmin, deleteMessage);

export default router;
