import express from 'express';
import * as socialController from './social.controller.js';
import { authenticate, optionalAuthenticate } from '../../middleware/auth.middleware.js';

const router = express.Router();

// ==================== PROFILE ROUTES ====================

// Obtener perfil propio
router.get('/profile', authenticate, socialController.getMyProfile);

// Obtener perfil de un usuario (autenticación opcional para saber si lo sigue)
router.get('/profile/:userId', optionalAuthenticate, socialController.getUserProfile);

// Actualizar perfil social
router.patch('/profile', authenticate, socialController.updateProfile);

// Obtener estadísticas de perfil
router.get('/profile/:userId/stats', socialController.getProfileStats);

// ==================== FOLLOW ROUTES ====================

// Seguir a un usuario
router.post('/follow/:userId', authenticate, socialController.followUser);

// Dejar de seguir a un usuario
router.delete('/follow/:userId', authenticate, socialController.unfollowUser);

// Obtener seguidores de un usuario
router.get('/followers/:userId', socialController.getFollowers);

// Obtener usuarios seguidos
router.get('/following/:userId', socialController.getFollowing);

// Verificar estado de seguimiento
router.get('/follow/status/:userId', authenticate, socialController.checkFollowStatus);

// Buscar usuarios
router.get('/search/users', authenticate, socialController.searchUsers);

// ==================== USERNAME ROUTES ====================

// Verificar disponibilidad de username
router.get('/username/check/:username', optionalAuthenticate, socialController.checkUsernameAvailability);

// Obtener perfil por username
router.get('/profile/by-username/:username', optionalAuthenticate, socialController.getProfileByUsername);

export default router;
