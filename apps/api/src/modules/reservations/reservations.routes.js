import express from 'express';
import * as reservationsController from './reservations.controller.js';

const router = express.Router();

router.post('/', reservationsController.create);
router.get('/', reservationsController.getAll);
router.get('/:id', reservationsController.getById);
router.patch('/:id/status', reservationsController.updateStatus);
router.delete('/:id', reservationsController.cancel);

export default router;
