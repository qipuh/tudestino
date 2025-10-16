import express from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticate);

// TODO: Implementar rutas de payments

export default router;
