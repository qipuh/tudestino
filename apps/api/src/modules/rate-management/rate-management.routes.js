import express from 'express';
import { authenticate, authorize } from '../../middleware/auth.middleware.js';
import {
  createRateRule,
  listRateRules,
  updateRateRule,
  deleteRateRule,
  quotePrice,
} from './rate-management.controller.js';

const router = express.Router();

// Pública: el buscador de disponibilidad la usa antes de que el usuario inicie sesión
router.get('/quote', quotePrice);

router.use(authenticate, authorize('host', 'business_owner', 'admin'));

router.get('/rooms/:roomId/rules', listRateRules);
router.post('/rooms/:roomId/rules', createRateRule);
router.put('/rules/:id', updateRateRule);
router.delete('/rules/:id', deleteRateRule);

export default router;
