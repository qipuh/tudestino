import express from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { uploadAvatar } from '../../middleware/upload.js';
import {
  getProfile,
  updateProfile,
  getUserById,
  getBookingHistory,
  uploadAvatarImage,
  setFcmToken,
  clearFcmToken,
} from './users.controller.js';

const router = express.Router();

router.use(authenticate); // Todas las rutas requieren autenticación

router.get('/me', getProfile);
router.patch('/me', updateProfile); // Actualizar perfil del usuario actual
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/bookings', getBookingHistory);
router.post('/upload-avatar', uploadAvatar.single('avatar'), uploadAvatarImage);
router.post('/fcm-token', setFcmToken);
router.delete('/fcm-token', clearFcmToken);
router.get('/:id', getUserById);

export default router;
