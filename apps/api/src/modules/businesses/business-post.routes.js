import express from 'express';
import businessPostController from './business-post.controller.js';
// TODO: Importar middleware de autenticación cuando esté disponible
// import { authenticate } from '../../middlewares/auth.js';

const router = express.Router();

/**
 * Rutas públicas
 */

// Obtener un post específico
router.get('/posts/:postId', businessPostController.getPostById);

// Obtener posts de un negocio
router.get('/:businessId/posts', businessPostController.getPostsByBusiness);

/**
 * Rutas protegidas (requieren autenticación)
 */

// TODO: Descomentar cuando el middleware de autenticación esté disponible
// router.use(authenticate);

// Obtener feed de posts de negocios seguidos
router.get('/posts/feed', businessPostController.getFeedPosts);

// Crear post para un negocio
router.post('/:businessId/posts', businessPostController.createPost);

// Actualizar post
router.put('/posts/:postId', businessPostController.updatePost);

// Eliminar post
router.delete('/posts/:postId', businessPostController.deletePost);

// Like/Unlike post
router.post('/posts/:postId/like', businessPostController.toggleLike);

export default router;
