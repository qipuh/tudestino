import express from 'express';
import { authenticate, authorize } from '../../middleware/auth.middleware.js';
import {
  getStats,
  getRecentUsers,
  getAllUsers,
  getAllBusinesses,
  getAllBookings,
  updateUserStatus,
  deleteUser,
  getWhatsAppConfig,
  setWhatsAppConfig,
  getPendingVerifications,
  approveVerification,
  rejectVerification
} from './admin.controller.js';

const router = express.Router();

// Todas las rutas de admin requieren autenticación y rol de admin
router.use(authenticate);
router.use(authorize('admin'));

// Dashboard stats
router.get('/stats', getStats);

// Users management
router.get('/users', getAllUsers);
router.get('/users/recent', getRecentUsers);
router.get('/businesses', getAllBusinesses);
router.get('/bookings', getAllBookings);
router.patch('/users/:userId/status', updateUserStatus);
router.delete('/users/:userId', deleteUser);

// Configuration management
router.get('/config/whatsapp', getWhatsAppConfig);
router.post('/config/whatsapp', setWhatsAppConfig);

// Identity verification management
router.get('/verifications/pending', getPendingVerifications);
router.post('/verifications/:userId/approve', approveVerification);
router.post('/verifications/:userId/reject', rejectVerification);

export default router;
