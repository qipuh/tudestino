import express from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import * as favoritesController from './favorites.controller.js';

const router = express.Router();

router.get('/', authenticate, favoritesController.getMyFavorites);
router.get('/:propertyId', authenticate, favoritesController.getFavoriteStatus);
router.post('/:propertyId/toggle', authenticate, favoritesController.toggleFavorite);

export default router;
