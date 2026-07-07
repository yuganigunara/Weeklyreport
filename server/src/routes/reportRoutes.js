import { Router } from 'express';
import { createReport, listReports, submitReport, updateReport } from '../controllers/reportController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { idParamSchema, reportQuerySchema, reportSchema, updateReportSchema } from '../validation/schemas.js';

const router = Router();

router.get('/', requireAuth, validate(reportQuerySchema), listReports);
router.post('/', requireAuth, validate(reportSchema), createReport);
router.patch('/:id', requireAuth, validate(updateReportSchema), updateReport);
router.post('/:id/submit', requireAuth, validate(idParamSchema), submitReport);

export default router;
