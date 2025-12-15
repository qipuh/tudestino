import express from 'express';
import businessController from './business.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = express.Router();

/**
 * Rutas públicas
 */

// Buscar negocios
router.get('/search', businessController.searchBusinesses);

// Obtener negocio por slug
router.get('/slug/:slug', businessController.getBusinessBySlug);

// Obtener negocios de un usuario
router.get('/user/:userId', businessController.getBusinessesByUser);

/**
 * Rutas protegidas (requieren autenticación)
 */

// Aplicar middleware de autenticación a las rutas protegidas
router.use(authenticate);

// Obtener mis negocios (DEBE IR ANTES de /:id)
router.get('/my-businesses', businessController.getMyBusinesses);

// Rutas de propiedades (ANTES de /:id para evitar conflictos)
router.post('/:businessId/properties', businessController.createPropertyWithRooms);
router.get('/:businessId/properties', businessController.getBusinessProperty);

// Obtener negocio por ID (ruta genérica, debe ir al final)
router.get('/:id', businessController.getBusinessById);

// Crear negocio
router.post('/', businessController.createBusiness);

// Actualizar negocio
router.put('/:id', businessController.updateBusiness);

// Eliminar negocio
router.delete('/:id', businessController.deleteBusiness);

// Verificar negocio (solo admin)
router.post('/:id/verify', businessController.verifyBusiness);

export default router;
