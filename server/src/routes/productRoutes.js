import express from 'express';
import { getAllProducts, getProductsByPlace, getProductById, createProduct } from '../controllers/productController.js';
import { upload } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.get('/', getAllProducts);
router.post('/', upload.single('image'), createProduct);
router.get('/place/:placeId', getProductsByPlace);
router.get('/:id', getProductById);

export default router;
