import express from 'express';
import { authenticate, authorize } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize('admin'));

// TODO: Implementar rutas de admin

export default router;
