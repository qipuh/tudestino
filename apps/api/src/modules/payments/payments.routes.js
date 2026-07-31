import express from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { chargeBooking } from './payments.controller.js';

const router = express.Router();

router.use(authenticate);

router.post('/culqi/charge-booking', chargeBooking);

export default router;
