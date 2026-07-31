import express from 'express';
import * as businessesController from './businesses.controller.js';

const router = express.Router();

router.get('/', businessesController.getAll);
router.get('/:id', businessesController.getById);
router.post('/', businessesController.create);
router.patch('/:id', businessesController.update);
router.delete('/:id', businessesController.delete_);

export default router;
