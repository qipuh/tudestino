import express from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import {
  getProfile,
  updateProfile,
  getUserById,
  getBookingHistory,
} from './users.controller.js';

const router = express.Router();

router.use(authenticate); // Todas las rutas requieren autenticación

router.get('/me', getProfile);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/bookings', getBookingHistory);
router.get('/:id', getUserById);

export default router;
