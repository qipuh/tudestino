import express from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from './notification.controller.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// GET /api/notifications - Obtener todas las notificaciones
router.get('/', getNotifications);

// GET /api/notifications/unread-count - Obtener conteo de no leídas
router.get('/unread-count', getUnreadCount);

// PUT /api/notifications/:id/read - Marcar como leída
router.put('/:id/read', markAsRead);

// PUT /api/notifications/mark-all-read - Marcar todas como leídas
router.put('/mark-all-read', markAllAsRead);

// DELETE /api/notifications/:id - Eliminar notificación
router.delete('/:id', deleteNotification);

export default router;
