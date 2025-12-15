import express from 'express';
import businessRoutes from './business.routes.js';
import businessServiceRoutes from './business-service.routes.js';
import businessPostRoutes from './business-post.routes.js';
import businessFollowRoutes from './business-follow.routes.js';

const router = express.Router();

/**
 * Rutas del módulo de Businesses
 *
 * /api/businesses - Gestión de negocios
 * /api/businesses/:id/services - Servicios de un negocio
 * /api/businesses/:id/posts - Posts de un negocio
 * /api/businesses/:id/follow - Seguimiento de negocios
 */

// Rutas principales de negocios
router.use('/', businessRoutes);

// Rutas de servicios (ya incluidas en businessServiceRoutes)
router.use('/', businessServiceRoutes);

// Rutas de posts de negocios
router.use('/', businessPostRoutes);

// Rutas de seguimiento
router.use('/', businessFollowRoutes);

export default router;
