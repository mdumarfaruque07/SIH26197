import { Router } from 'express';
import {
  createSupportTicket,
  getSupportTickets,
  updateTicketStatus,
  deleteSupportTicket,
} from '../controllers/supportController.js';
import { upload } from '../middlewares/uploadMiddleware.js';

const router = Router();

// Public / Tourist can submit a report or bug with optional screenshot
router.post('/report', upload.single('attachment'), createSupportTicket);

// List tickets
router.get('/tickets', getSupportTickets);

// Update ticket status (Admin)
router.patch('/tickets/:id/status', updateTicketStatus);
router.put('/tickets/:id/status', updateTicketStatus);

// Delete ticket (Admin)
router.delete('/tickets/:id', deleteSupportTicket);

export default router;
