import express from 'express';
import { authenticate, authorize } from '../../middleware/auth.middleware.js';
import {
  getStats,
  getRecentUsers,
  getAllUsers,
  updateUserStatus,
  deleteUser
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
router.patch('/users/:userId/status', updateUserStatus);
router.delete('/users/:userId', deleteUser);

export default router;
