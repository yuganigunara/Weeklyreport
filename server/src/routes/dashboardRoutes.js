import { Router } from 'express';
import { getDashboard } from '../controllers/dashboardController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { reportQuerySchema } from '../validation/schemas.js';

const router = Router();

router.get('/', requireAuth, requireRole('manager', 'admin'), validate(reportQuerySchema), getDashboard);

export default router;
