import { Router } from 'express';
import {
  createPost,
  getFeedPosts,
  getMyPosts,
  updatePost,
  toggleLikePost,
  addPostComment,
  toggleBookmarkPost,
  getBookmarkedPosts,
  deletePost,
} from '../controllers/postController.js';
import { authenticate, optionalAuth } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/uploadMiddleware.js';

const router = Router();

const safeUpload = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.warn('Multer upload warning (proceeding if imageUrl is provided):', err.message);
    }
    next();
  });
};

router.get('/feed', optionalAuth, getFeedPosts);
router.get('/my-posts', optionalAuth, getMyPosts);
router.post('/', optionalAuth, safeUpload, createPost);
router.patch('/:id', optionalAuth, updatePost);
router.put('/:id', optionalAuth, updatePost);
router.post('/:id/like', optionalAuth, toggleLikePost);
router.post('/:id/comments', optionalAuth, addPostComment);
router.post('/:id/bookmark', optionalAuth, toggleBookmarkPost);
router.get('/bookmarks', optionalAuth, getBookmarkedPosts);
router.delete('/:id', optionalAuth, deletePost);

export default router;
