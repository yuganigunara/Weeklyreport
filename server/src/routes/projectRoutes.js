import { Router } from 'express';
import { createProject, deleteProject, listProjects, updateProject } from '../controllers/projectController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { idParamSchema, projectSchema, updateProjectSchema } from '../validation/schemas.js';

const router = Router();

router.get('/', requireAuth, listProjects);
router.post('/', requireAuth, requireRole('manager', 'admin'), validate(projectSchema), createProject);
router.patch('/:id', requireAuth, requireRole('manager', 'admin'), validate(updateProjectSchema), updateProject);
router.delete('/:id', requireAuth, requireRole('manager', 'admin'), validate(idParamSchema), deleteProject);

export default router;
