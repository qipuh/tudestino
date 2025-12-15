import express from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import eventsController from './events.controller.js';

const router = express.Router();

// RUTAS PÚBLICAS (sin autenticación)
router.get('/search', eventsController.searchEvents);
router.get('/upcoming', eventsController.getUpcomingEvents);
router.get('/featured', eventsController.getFeaturedEvents);
router.get('/:id', eventsController.getEvent);
router.get('/slug/:slug', eventsController.getEvent);
router.get('/:eventId/tickets', eventsController.getEventTickets);

// RUTAS PROTEGIDAS - GESTIÓN DE EVENTOS
router.post('/', authenticate, eventsController.createEvent);
router.get('/organizer/my-events', authenticate, eventsController.getMyEvents);
router.put('/:id', authenticate, eventsController.updateEvent);
router.delete('/:id', authenticate, eventsController.deleteEvent);

// RUTAS PROTEGIDAS - GESTIÓN DE TICKETS
router.post(
  '/:eventId/tickets',
  authenticate,
  eventsController.createTicket
);
router.put(
  '/:eventId/tickets/:ticketId',
  authenticate,
  eventsController.updateTicket
);
router.delete(
  '/:eventId/tickets/:ticketId',
  authenticate,
  eventsController.deleteTicket
);

// RUTAS PROTEGIDAS - REGISTRACIONES
router.post(
  '/:eventId/register',
  authenticate,
  eventsController.createRegistration
);
router.get(
  '/user/registrations',
  authenticate,
  eventsController.getMyRegistrations
);
router.put(
  '/registrations/:registrationId',
  authenticate,
  eventsController.updateRegistration
);
router.post(
  '/registrations/:registrationId/cancel',
  authenticate,
  eventsController.cancelRegistration
);

// Gestión de registraciones por organizador
router.get(
  '/:eventId/registrations',
  authenticate,
  eventsController.getEventRegistrations
);

// Check-in
router.post(
  '/check-in',
  authenticate,
  eventsController.checkIn
);

// RUTAS PROTEGIDAS - IMÁGENES
router.post(
  '/:eventId/images',
  authenticate,
  eventsController.addImage
);
router.delete(
  '/:eventId/images/:imageId',
  authenticate,
  eventsController.deleteImage
);
router.put(
  '/:eventId/images/:imageId/set-cover',
  authenticate,
  eventsController.setCoverImage
);

export default router;
