import express from 'express';
import * as socialController from './social.controller.js';
import { authenticate, optionalAuthenticate } from '../../middleware/auth.middleware.js';
import { uploadSocial } from '../../middleware/upload.js';

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

// ==================== POST & REEL ROUTES ====================

// Crear post (múltiples archivos)
router.post('/posts', authenticate, uploadSocial.array('media', 10), socialController.createPost);

// Crear reel (un video)
router.post('/reels', authenticate, uploadSocial.single('video'), socialController.createReel);

// Obtener posts de un usuario
router.get('/users/:userId/posts', socialController.getUserPosts);

// Obtener reels de un usuario
router.get('/users/:userId/reels', socialController.getUserReels);

// Obtener feed de posts
router.get('/feed', authenticate, socialController.getFeed);

// Obtener feed de reels
router.get('/reels/feed', authenticate, socialController.getReelsFeed);

// Toggle like
router.post('/like', authenticate, socialController.toggleLike);

// Agregar comentario
router.post('/comments', authenticate, socialController.addComment);

// Obtener comentarios
router.get('/comments/:contentType/:contentId', socialController.getComments);

// Eliminar post
router.delete('/posts/:postId', authenticate, socialController.deletePost);

// Eliminar reel
router.delete('/reels/:reelId', authenticate, socialController.deleteReel);

export default router;
