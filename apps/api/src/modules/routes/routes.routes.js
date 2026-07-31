import express from 'express';
import * as routesController from './routes.controller.js';
import { authenticate, optionalAuthenticate } from '../../middleware/auth.middleware.js';
import { uploadRouteCover } from '../../middleware/upload.js';
import milestoneRoutes from './route-milestone.routes.js';

const router = express.Router();

// Crear ruta (autenticado), foto de portada opcional
router.post('/', authenticate, uploadRouteCover.single('coverImage'), routesController.createRoute);

// Hitos (foto + comentario pinchados en el recorrido) de una ruta
router.use('/:routeId/milestones', milestoneRoutes);

// Feed de rutas (público, autenticación opcional para isLiked)
router.get('/feed', optionalAuthenticate, routesController.getRoutesFeed);

// Rutas de un usuario ("Mis rutas")
router.get('/users/:userId', optionalAuthenticate, routesController.getUserRoutes);

// Detalle de una ruta (incluye trackPoints completo)
router.get('/:routeId', optionalAuthenticate, routesController.getRouteById);

// Editar ruta (autenticado, solo dueño), foto de portada opcional
router.put('/:routeId', authenticate, uploadRouteCover.single('coverImage'), routesController.updateRoute);

// Eliminar ruta (autenticado, solo dueño)
router.delete('/:routeId', authenticate, routesController.deleteRoute);

export default router;
