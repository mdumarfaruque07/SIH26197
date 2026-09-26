import { Router } from 'express';
import {
  getAllApplications,
  submitApplication,
  updateApplicationStatus,
  updateApplicationPlan,
} from '../controllers/artisanController.js';

const router = Router();

router.get('/applications', getAllApplications);
router.post('/applications', submitApplication);
router.patch('/applications/:id/status', updateApplicationStatus);
router.patch('/applications/:id/plan', updateApplicationPlan);

export default router;
