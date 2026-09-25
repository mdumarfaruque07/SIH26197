import express from 'express';
import { getAllProducts, getProductsByPlace, getProductById } from '../controllers/productController.js';

const router = express.Router();

router.get('/', getAllProducts);
router.get('/place/:placeId', getProductsByPlace);
router.get('/:id', getProductById);

export default router;
