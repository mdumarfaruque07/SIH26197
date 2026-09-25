import { Router } from 'express';
import {
  getDashboardStats,
  createPlace,
  updatePlace,
  deletePlace,
  aiDiscoverCulturalLinks,
} from '../controllers/adminController.js';
import { authenticate, requireAdmin } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/uploadMiddleware.js';

const router = Router();

// Protect all admin routes
router.use(authenticate, requireAdmin);

router.get('/stats', getDashboardStats);
router.post('/ai-discover', aiDiscoverCulturalLinks);
router.post('/places', upload.single('coverImage'), createPlace);
router.put('/places/:id', upload.single('coverImage'), updatePlace);
router.delete('/places/:id', deletePlace);

export default router;
