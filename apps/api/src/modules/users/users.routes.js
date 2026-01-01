import express from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { uploadAvatar } from '../../middleware/upload.js';
import {
  getProfile,
  updateProfile,
  getUserById,
  getBookingHistory,
  uploadAvatarImage,
} from './users.controller.js';

const router = express.Router();

router.use(authenticate); // Todas las rutas requieren autenticación

router.get('/me', getProfile);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/bookings', getBookingHistory);
router.post('/upload-avatar', uploadAvatar.single('avatar'), uploadAvatarImage);
router.get('/:id', getUserById);

export default router;
