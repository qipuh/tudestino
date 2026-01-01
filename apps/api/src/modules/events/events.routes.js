import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { authenticate } from '../../middleware/auth.middleware.js';
import eventsController from './events.controller.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurar almacenamiento de imágenes de eventos
const uploadsDir = path.join(__dirname, '../../../uploads/events');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido. Solo se permiten imágenes'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

const router = express.Router();

// RUTAS PÚBLICAS (sin autenticación) - Específicas primero
router.get('/search', eventsController.searchEvents);
router.get('/upcoming', eventsController.getUpcomingEvents);
router.get('/featured', eventsController.getFeaturedEvents);
router.get('/slug/:slug', eventsController.getEvent);

// RUTAS PROTEGIDAS - GESTIÓN DE EVENTOS (específicas antes de parámetros)
router.get('/organizer/my-events', authenticate, eventsController.getMyEvents);
router.post('/', authenticate, eventsController.createEvent);

// RUTAS PÚBLICAS CON PARÁMETROS (después de específicas)
router.get('/:eventId/tickets', eventsController.getEventTickets);
router.get('/:id', eventsController.getEvent);

// RUTAS PROTEGIDAS - GESTIÓN DE EVENTOS CON PARÁMETROS
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

// RUTAS PROTEGIDAS - GESTIÓN DE FASES DE TICKETS
router.get(
  '/tickets/:ticketId/phases',
  eventsController.getTicketPhases
);
router.get(
  '/tickets/:ticketId/phases/active',
  eventsController.getActivePhase
);
router.post(
  '/tickets/:ticketId/phases',
  authenticate,
  eventsController.createTicketPhase
);
router.put(
  '/tickets/:ticketId/phases/:phaseId',
  authenticate,
  eventsController.updateTicketPhase
);
router.delete(
  '/tickets/:ticketId/phases/:phaseId',
  authenticate,
  eventsController.deleteTicketPhase
);

// RUTAS PROTEGIDAS - REGISTRACIONES (específicas primero)
router.get(
  '/user/registrations',
  authenticate,
  eventsController.getMyRegistrations
);
router.post(
  '/check-in',
  authenticate,
  eventsController.checkIn
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
router.post(
  '/:eventId/register',
  authenticate,
  eventsController.createRegistration
);
router.get(
  '/:eventId/registrations',
  authenticate,
  eventsController.getEventRegistrations
);

// RUTAS PROTEGIDAS - IMÁGENES
router.post(
  '/:eventId/images',
  authenticate,
  upload.array('images', 10), // Máximo 10 imágenes
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
