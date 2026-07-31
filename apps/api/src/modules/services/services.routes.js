import express from 'express';
import * as servicesController from './services.controller.js';

const router = express.Router();

router.get('/business/:businessId', servicesController.getByBusiness);
router.post('/business/:businessId', servicesController.create);
router.patch('/:id', servicesController.update);
router.delete('/:id', servicesController.delete_);

export default router;
