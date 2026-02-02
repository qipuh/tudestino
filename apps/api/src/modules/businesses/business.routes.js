import express from 'express';
import multer from 'multer';
import path from 'path';
import businessController from './business.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

// Configurar multer para subir imágenes de menú
const menuStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/menu/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'menu-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const menuUpload = multer({
  storage: menuStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, webp)'));
    }
  }
});

// Configurar multer para subir fotos de la galería del negocio
const businessStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/business/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const businessUpload = multer({
  storage: businessStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, webp)'));
    }
  }
});

// Configurar multer para subir imágenes de servicios de spa
const spaServiceStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/spa-services/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const spaServiceUpload = multer({
  storage: spaServiceStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, webp)'));
    }
  }
});

const router = express.Router();

/**
 * Rutas públicas (sin autenticación)
 */

// Buscar negocios
router.get('/search', businessController.searchBusinesses);

// Obtener negocio por slug
router.get('/slug/:slug', businessController.getBusinessBySlug);

// Obtener negocios de un usuario
router.get('/user/:userId', businessController.getBusinessesByUser);

/**
 * Rutas protegidas (requieren autenticación)
 * Las rutas específicas deben ir ANTES de las rutas con parámetros dinámicos
 */

// Obtener mis negocios
router.get('/my-businesses', authenticate, businessController.getMyBusinesses);

// Rutas de reservaciones
router.get('/reservations/my-reservations', authenticate, businessController.getMyReservations);
router.put('/reservations/:reservationId/cancel', authenticate, businessController.cancelReservation);

// Rutas de propiedades
router.post('/:businessId/properties', authenticate, businessController.createPropertyWithRooms);
router.get('/:businessId/properties', businessController.getBusinessProperty); // Público para que /hotel-slug funcione

// Rutas de reservaciones de negocio específico
router.post('/:businessId/reservations', authenticate, businessController.createReservation);
router.get('/:businessId/reservations', authenticate, businessController.getBusinessReservations);
router.put('/:businessId/reservations/:reservationId/status', authenticate, businessController.updateReservationStatus);

// Crear negocio
router.post('/', authenticate, businessController.createBusiness);

// Actualizar negocio
router.put('/:id', authenticate, businessController.updateBusiness);

// Eliminar negocio
router.delete('/:id', authenticate, businessController.deleteBusiness);

// Verificar negocio (solo admin)
router.post('/:id/verify', authenticate, businessController.verifyBusiness);

/**
 * Rutas de menú (para restaurantes)
 */

// Obtener menú de un restaurante (público)
router.get('/:businessId/menu', businessController.getMenu);

// Crear item del menú
router.post('/:businessId/menu', authenticate, menuUpload.single('image'), businessController.createMenuItem);

// Actualizar item del menú
router.put('/:businessId/menu/:itemId', authenticate, menuUpload.single('image'), businessController.updateMenuItem);

// Eliminar item del menú
router.delete('/:businessId/menu/:itemId', authenticate, businessController.deleteMenuItem);

/**
 * Rutas de fotos del negocio
 */

// Obtener fotos de un negocio (público)
router.get('/:businessId/photos', businessController.getPhotos);

// Subir foto de un negocio
router.post('/:businessId/photos', authenticate, businessUpload.single('photo'), businessController.uploadPhoto);

// Eliminar foto de un negocio
router.delete('/:businessId/photos/:photoId', authenticate, businessController.deletePhoto);

/**
 * Rutas de temporadas del negocio
 */

// Obtener temporadas de un negocio (público)
router.get('/:businessId/seasons', businessController.getSeasons);

// Crear temporada para un negocio
router.post('/:businessId/seasons', authenticate, businessController.createSeason);

// Eliminar temporada de un negocio
router.delete('/:businessId/seasons/:seasonId', authenticate, businessController.deleteSeason);

/**
 * Rutas de servicios de spa/wellness
 */

// Obtener servicios de un spa (público)
router.get('/:businessId/spa-services', businessController.getSpaServices);

// Crear servicio de spa
router.post('/:businessId/spa-services', authenticate, spaServiceUpload.single('image'), businessController.createSpaService);

// Actualizar servicio de spa
router.put('/:businessId/spa-services/:serviceId', authenticate, spaServiceUpload.single('image'), businessController.updateSpaService);

// Eliminar servicio de spa
router.delete('/:businessId/spa-services/:serviceId', authenticate, businessController.deleteSpaService);

// Obtener fotos de un servicio de spa (público)
router.get('/:businessId/spa-services/:serviceId/photos', businessController.getSpaServicePhotos);

// Subir foto de un servicio de spa
router.post('/:businessId/spa-services/:serviceId/photos', authenticate, spaServiceUpload.single('photo'), businessController.uploadSpaServicePhoto);

// Eliminar foto de un servicio de spa
router.delete('/:businessId/spa-services/:serviceId/photos/:photoId', authenticate, businessController.deleteSpaServicePhoto);

/**
 * Rutas de tours/excursiones
 */
import tourController from '../tours/tour.controller.js';

// Obtener tours de un negocio (público)
router.get('/:businessId/tours', tourController.getToursByBusiness);

// Crear tour de un negocio
router.post('/:businessId/tours', authenticate, tourController.createTour);

/**
 * Ruta con parámetro dinámico (:id)
 * DEBE IR AL FINAL para no capturar rutas específicas como /my-businesses
 */

// Obtener negocio por ID (pública)
router.get('/:id', businessController.getBusinessById);

export default router;
