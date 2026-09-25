import { Router } from 'express';
import { createPost, getFeedPosts, deletePost } from '../controllers/postController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/uploadMiddleware.js';

const router = Router();

router.get('/feed', getFeedPosts);
router.post('/', authenticate, upload.single('image'), createPost);
router.delete('/:id', authenticate, deletePost);

export default router;
