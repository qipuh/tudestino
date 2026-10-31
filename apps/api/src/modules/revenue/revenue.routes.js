import express from 'express';
import { authenticate, authorize } from '../../middleware/auth.middleware.js';
import { getKPIs } from './revenue.controller.js';

const router = express.Router();

router.use(authenticate, authorize('host', 'business_owner', 'admin'));

router.get('/:propertyId/kpis', getKPIs);

export default router;
