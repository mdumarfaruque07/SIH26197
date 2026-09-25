import express from 'express';
import { getAllProducts, getProductsByPlace, getProductById, createProduct } from '../controllers/productController.js';

const router = express.Router();

router.get('/', getAllProducts);
router.post('/', createProduct);
router.get('/place/:placeId', getProductsByPlace);
router.get('/:id', getProductById);

export default router;
