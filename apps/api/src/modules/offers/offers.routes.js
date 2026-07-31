import express from 'express';
import * as offersController from './offers.controller.js';

const router = express.Router();

router.get('/business/:businessId', offersController.getByBusiness);
router.post('/business/:businessId', offersController.create);
router.patch('/:id', offersController.update);
router.delete('/:id', offersController.delete_);
router.get('/code/:code', offersController.getByCode);

export default router;
