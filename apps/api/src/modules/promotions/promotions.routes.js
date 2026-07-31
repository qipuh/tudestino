import express from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { isAdmin } from '../../middleware/roles.js';
import {
  getAllPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
} from './promotions.controller.js';

const router = express.Router();

router.use(authenticate, isAdmin);

router.get('/', getAllPromotions);
router.post('/', createPromotion);
router.put('/:id', updatePromotion);
router.delete('/:id', deletePromotion);

export default router;
