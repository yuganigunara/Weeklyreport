import { Router } from 'express';
import { chat } from '../controllers/assistantController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { chatSchema } from '../validation/schemas.js';

const router = Router();

router.post('/chat', requireAuth, validate(chatSchema), chat);

export default router;
