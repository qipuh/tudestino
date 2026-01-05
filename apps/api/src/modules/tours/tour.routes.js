import express from 'express';
import tourController from './tour.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = express.Router();

// Rutas públicas
router.get('/search', tourController.searchTours);
router.get('/slug/:slug', tourController.getTourBySlug);
router.get('/:id', tourController.getTourById);

// Rutas protegidas
router.put('/:id', authenticate, tourController.updateTour);
router.delete('/:id', authenticate, tourController.deleteTour);

export default router;
