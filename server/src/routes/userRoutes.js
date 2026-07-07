import { Router } from 'express';
import { listUsers, updateUserRole } from '../controllers/userController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { updateUserRoleSchema } from '../validation/schemas.js';

const router = Router();

router.get('/', requireAuth, requireRole('manager', 'admin'), listUsers);
router.patch('/:id/role', requireAuth, requireRole('admin'), validate(updateUserRoleSchema), updateUserRole);

export default router;
