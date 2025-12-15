import express from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import entertainmentController from './entertainment.controller.js';

const router = express.Router();

// RUTAS PÚBLICAS (sin autenticación)
router.get('/search', entertainmentController.searchEntertainment);
router.get('/:id', entertainmentController.getEntertainment);

// RUTAS PROTEGIDAS - GESTIÓN DE ESTABLECIMIENTOS
router.post('/', authenticate, entertainmentController.createEntertainment);
router.get('/owner/my-venues', authenticate, entertainmentController.getMyEntertainment);
router.put('/:id', authenticate, entertainmentController.updateEntertainment);
router.delete('/:id', authenticate, entertainmentController.deleteEntertainment);

// RUTAS PROTEGIDAS - RESERVAS
// Crear y gestionar reservas por usuario
router.post(
  '/:entertainmentId/reservations',
  authenticate,
  entertainmentController.createReservation
);
router.get(
  '/user/reservations',
  authenticate,
  entertainmentController.getMyReservations
);
router.put(
  '/reservations/:reservationId',
  authenticate,
  entertainmentController.updateReservation
);
router.post(
  '/reservations/:reservationId/cancel',
  authenticate,
  entertainmentController.cancelReservation
);

// Gestión de reservas por establecimiento
router.get(
  '/:entertainmentId/reservations',
  authenticate,
  entertainmentController.getVenueReservations
);
router.put(
  '/:entertainmentId/reservations/:reservationId/status',
  authenticate,
  entertainmentController.updateReservationStatus
);

// RUTAS PROTEGIDAS - IMÁGENES
router.post(
  '/:entertainmentId/images',
  authenticate,
  entertainmentController.addImage
);
router.delete(
  '/:entertainmentId/images/:imageId',
  authenticate,
  entertainmentController.deleteImage
);
router.put(
  '/:entertainmentId/images/:imageId/set-main',
  authenticate,
  entertainmentController.setMainImage
);

export default router;
