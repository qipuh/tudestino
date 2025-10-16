import express from 'express';
import {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBookingStatus,
  checkAvailability,
  updatePayment,
} from './bookings.controller.js';
import { authenticate, authorize } from '../../middleware/auth.middleware.js';

const router = express.Router();

// Verificar disponibilidad (público)
router.get('/check-availability', checkAvailability);

// Rutas protegidas
router.use(authenticate);

// Crear una reserva (solo guests y hosts)
router.post('/', authorize('guest', 'host', 'admin'), createBooking);

// Obtener mis reservas
router.get('/my-bookings', getMyBookings);

// Obtener una reserva específica
router.get('/:id', getBookingById);

// Actualizar estado de una reserva
router.patch('/:id/status', updateBookingStatus);

// Actualizar pago (webhook)
router.post('/payment/update', updatePayment);

export default router;
