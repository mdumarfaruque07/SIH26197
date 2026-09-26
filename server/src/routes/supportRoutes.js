import { Router } from 'express';
import { createSupportTicket, getSupportTickets } from '../controllers/supportController.js';
import { upload } from '../middlewares/uploadMiddleware.js';

const router = Router();

// Public / Tourist can submit a report or bug with optional screenshot
router.post('/report', upload.single('attachment'), createSupportTicket);

// List tickets
router.get('/tickets', getSupportTickets);

export default router;
