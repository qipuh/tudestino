import express from 'express';
import businessFollowController from './business-follow.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = express.Router();

/**
 * Todas las rutas de seguimiento requieren autenticación
 */

// Aplicar autenticación a todas las rutas
router.use(authenticate);

// Obtener mis negocios seguidos
router.get('/following/my-followed', businessFollowController.getMyFollowedBusinesses);

// Seguir un negocio
router.post('/:businessId/follow', businessFollowController.followBusiness);

// Dejar de seguir un negocio
router.delete('/:businessId/follow', businessFollowController.unfollowBusiness);

// Verificar si sigo un negocio
router.get('/:businessId/following', businessFollowController.checkFollowing);

// Obtener seguidores de un negocio
router.get('/:businessId/followers', businessFollowController.getBusinessFollowers);

// Actualizar configuración de notificaciones
router.patch('/:businessId/follow/notifications', businessFollowController.updateNotifications);

// Bloquear/Desbloquear negocio
router.patch('/:businessId/follow/block', businessFollowController.toggleBlock);

export default router;
