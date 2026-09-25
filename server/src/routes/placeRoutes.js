import { Router } from 'express';
import {
  getAllPlaces,
  getNearbyPlaces,
  getPlaceBySlug,
  toggleBookmark,
  getUserBookmarks,
  toggleVisitedStatus,
} from '../controllers/placeController.js';
import { authenticate, optionalAuth } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', getAllPlaces);
router.get('/nearby', getNearbyPlaces);
router.get('/user/bookmarks', authenticate, getUserBookmarks);
router.patch('/user/bookmarks/:placeId/toggle-visited', authenticate, toggleVisitedStatus);
router.get('/:slug', optionalAuth, getPlaceBySlug);
router.post('/bookmark', authenticate, toggleBookmark);

export default router;
