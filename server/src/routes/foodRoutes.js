import { Router } from 'express';
import {
  getAllFood,
  getFoodByPlace,
  createFoodItem,
  deleteFoodItem,
} from '../controllers/foodController.js';
import { authenticate, requireAdmin } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/uploadMiddleware.js';

const router = Router();

// Public routes for tourists/explorers
router.get('/', getAllFood);
router.get('/place/:placeId', getFoodByPlace);

// Admin-only management routes
router.post('/', authenticate, requireAdmin, upload.single('image'), createFoodItem);
router.delete('/:id', authenticate, requireAdmin, deleteFoodItem);

export default router;
