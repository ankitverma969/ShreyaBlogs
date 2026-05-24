import { Router } from 'express';
import { createComment, getComments } from '../controllers/publicCommentController.js';

const router = Router();

router.post('/create', createComment);
router.get('/:postId', getComments);

export default router;
