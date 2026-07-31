import express from 'express';
import * as paymentsController from './payments.controller.js';

const router = express.Router();

router.post('/', paymentsController.create);
router.get('/reservation/:reservationId', paymentsController.getByReservation);
router.get('/business/:businessId', paymentsController.getByBusiness);
router.post('/webhook/:provider', paymentsController.webhookHandler);

export default router;
